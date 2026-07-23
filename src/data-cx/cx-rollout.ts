/**
 * Codex Rollout — shared JSONL parsing helpers + first-user-prompt extraction.
 *
 * Single source of truth for rollout-file parsing, used by cx-history /
 * cx-stats / cx-plans / cx-overview to avoid duplicate reads and divergent
 * parsing. Helpers here were previously inlined in cx-history.ts.
 */
import { existsSync, openSync, readSync, closeSync } from 'node:fs'
import { basename, join, sep } from 'node:path'
import { homedir } from 'node:os'

// ── Constants ────────────────────────────────────────────────────────────────

/** Placeholder directory for sessions created without a selected project. */
export const CX_TEMP_PLACEHOLDER = '__codex_temp__'
/** Display name for the temp-sessions project bucket. */
export const CX_TEMP_PROJECT_NAME = '临时会话'
/** Max characters for a session title derived from the first user prompt. */
export const CX_TITLE_MAX_LEN = 80
/** Read at most this many bytes from the head of a rollout file when looking
 *  for the first user prompt — bounds I/O cost regardless of file size. */
const CX_FIRST_PROMPT_MAX_BYTES = 64 * 1024
/** Hard cap on lines scanned (defense in depth alongside the byte cap). */
const CX_FIRST_PROMPT_MAX_LINES = 200

const UNTITLED = '未命名会话'

/**
 * codex app 在未选项目时创建的临时会话工作目录根。每个临时会话会被分配到
 * `~/Documents/Codex/YYYY-MM-DD/<name>/` 下一个独立子目录（仅含空的 outputs/
 * 与 work/），因此每个会话的 basename 都不同，前端会显示成一堆不同项目。
 * 这棵目录树下的会话统一归入"临时会话"项目。
 */
const CODEX_TEMP_ROOT = join(homedir(), 'Documents', 'Codex')

// ── Temp-session classification ──────────────────────────────────────────────

/**
 * A session counts as "temp" (created without a selected project in the codex
 * app) when:
 *   - cwd is empty/null, the filesystem root, or the user's home dir, OR
 *   - cwd lives under codex's temp-session tree `~/Documents/Codex/...`
 * In all these cases basename(cwd) is empty or meaningless as a project name.
 */
export function isTempCwd(cwd: string | null | undefined): boolean {
  if (!cwd) return true
  if (cwd === '/') return true
  if (cwd === homedir()) return true
  if (cwd === CODEX_TEMP_ROOT || cwd.startsWith(CODEX_TEMP_ROOT + sep)) return true
  return false
}

export interface ResolvedProject {
  directory: string
  name: string
  isTemp: boolean
}

/**
 * Resolve a thread's cwd into the project fields used across history/stats/
 * plans. Temp sessions collapse to a single shared placeholder directory so
 * the frontend's `s.cwd === project.directory` filter stays consistent.
 */
export function resolveProject(cwd: string | null | undefined): ResolvedProject {
  if (isTempCwd(cwd)) {
    return { directory: CX_TEMP_PLACEHOLDER, name: CX_TEMP_PROJECT_NAME, isTemp: true }
  }
  // isTempCwd 已排除 null/undefined/''/'/'/homedir()，此处 cwd 必为真实非空路径
  const real = cwd as string
  return { directory: real, name: basename(real), isTemp: false }
}

// ── Title helpers ────────────────────────────────────────────────────────────

/** Collapse whitespace (incl. newlines) to single spaces and trim. */
function normalizeSingleLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Truncate to maxLen characters with an ellipsis when exceeded. */
export function truncateTitle(text: string, maxLen = CX_TITLE_MAX_LEN): string {
  const single = normalizeSingleLine(text)
  if (single.length <= maxLen) return single
  return single.slice(0, maxLen) + '…'
}

// ── Plan-handoff / internal-text filters ─────────────────────────────────────

export function isPlanHandoffTitle(text: string): boolean {
  return text.startsWith('A previous agent produced the plan below to accomplish the user')
    && text.includes('Treat the plan as the source of user intent')
}

export function isPlanHandoffText(text: string): boolean {
  return isPlanHandoffTitle(text)
}

export function isInternalAssistantText(text: string): boolean {
  return text.startsWith('<proposed_plan>')
}

export function isInternalUserText(text: string): boolean {
  return isPlanHandoffText(text)
    || text.startsWith('<permissions instructions>')
    || text.startsWith('<collaboration_mode>')
    || text.startsWith('<skills_instructions>')
    || text.startsWith('<environment_context>')
    || text.startsWith('# AGENTS.md instructions')
}

// ── JSONL payload parsing ────────────────────────────────────────────────────

export interface JsonLine {
  type?: string
  timestamp?: string
  payload?: Record<string, unknown> | string
}

/** Normalize a Python dict string to valid JSON (None→null, True/False→true/false). */
export function normalizePythonDict(raw: string): string {
  let s = raw.replace(/\bNone\b/g, 'null')
  s = s.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false')
  return s
}

export function tryParsePythonJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    try {
      return JSON.parse(normalizePythonDict(raw)) as Record<string, unknown>
    } catch {
      return null
    }
  }
}

export function parsePayload(payload: JsonLine['payload']): Record<string, unknown> | null {
  if (!payload) return null
  if (typeof payload === 'object') return payload
  return tryParsePythonJson(payload)
}

export function textFromContent(content: unknown, textType: string): string {
  if (!Array.isArray(content)) return ''
  const parts: string[] = []
  for (const c of content as Array<Record<string, unknown>>) {
    if (c.type === textType && typeof c.text === 'string') {
      parts.push(c.text)
    }
  }
  return parts.join('\n').trim()
}

// ── First user prompt extraction ─────────────────────────────────────────────

/**
 * Module-level cache: rolloutPath → first user prompt (raw, untruncated) or
 * null. Safe to cache indefinitely — rollout files are append-only, so the
 * first user message never moves once written. Also de-duplicates the double
 * read that happens when loadCxOverview calls both loadCxStats and loadCxHistory.
 */
const firstPromptCache = new Map<string, string | null>()

/**
 * Extract the text of the first non-internal user message from a rollout
 * JSONL file, reading only the head of the file. Returns null when the file
 * is missing, unreadable, or contains no qualifying user message within the
 * first CX_FIRST_PROMPT_MAX_BYTES.
 */
export function extractFirstUserPrompt(rolloutPath: string | null | undefined): string | null {
  if (!rolloutPath) return null

  const cached = firstPromptCache.get(rolloutPath)
  if (cached !== undefined) return cached

  const result = readFirstUserPrompt(rolloutPath)
  firstPromptCache.set(rolloutPath, result)
  return result
}

function readFirstUserPrompt(rolloutPath: string): string | null {
  if (!existsSync(rolloutPath)) return null

  let fd: number | undefined
  try {
    fd = openSync(rolloutPath, 'r')
    const buf = Buffer.alloc(CX_FIRST_PROMPT_MAX_BYTES)
    const bytesRead = readSync(fd, buf, 0, CX_FIRST_PROMPT_MAX_BYTES, 0)
    if (bytesRead <= 0) return null

    let text = buf.toString('utf-8', 0, bytesRead)
    // If the buffer was filled completely the file continues beyond what we
    // read, so the last line is likely truncated — drop it.
    if (bytesRead === CX_FIRST_PROMPT_MAX_BYTES) {
      const lastNewline = text.lastIndexOf('\n')
      if (lastNewline >= 0) text = text.slice(0, lastNewline)
    }

    const lines = text.split('\n')
    for (let i = 0; i < lines.length && i < CX_FIRST_PROMPT_MAX_LINES; i++) {
      const trimmed = lines[i].trim()
      if (!trimmed) continue

      let obj: JsonLine
      try {
        obj = JSON.parse(trimmed) as JsonLine
      } catch {
        continue
      }

      const candidate = firstUserTextFromLine(obj)
      if (candidate === null) continue        // not a user-message line
      const clean = candidate.trim()
      if (!clean) continue
      if (isInternalUserText(clean)) continue
      return clean
    }
    return null
  } catch {
    return null
  } finally {
    if (fd !== undefined) {
      try { closeSync(fd) } catch { /* ignore */ }
    }
  }
}

/** Return the user message text carried by a JSONL line, or null if the line
 *  is not a user-message line. Mirrors the parsing in loadCxConversation. */
function firstUserTextFromLine(obj: JsonLine): string | null {
  const lineType = obj.type
  const payload = parsePayload(obj.payload)
  if (!payload) return null

  if (lineType === 'event_msg') {
    if (payload.type === 'user_message' && typeof payload.message === 'string') {
      return payload.message
    }
    return null
  }
  if (lineType === 'response_item') {
    if (payload.type !== 'message') return null
    if (payload.role === 'user') {
      return textFromContent(payload.content, 'input_text')
    }
    return null
  }
  return null
}

// ── Session title resolution ─────────────────────────────────────────────────

/**
 * Three-tier title fallback:
 *   1. first user prompt from the rollout file (truncated)
 *   2. the DB-stored thread title
 *   3. '未命名会话'
 */
export function resolveSessionTitle(
  rolloutPath: string | null | undefined,
  dbTitle: string | null | undefined,
): string {
  const prompt = extractFirstUserPrompt(rolloutPath)
  if (prompt) return truncateTitle(prompt)
  if (dbTitle && dbTitle.trim()) return dbTitle.trim()
  return UNTITLED
}

/**
 * Ignore threads that were created but never became a user-visible session.
 * Codex writes these when a TUI/app session is opened then abandoned, or when
 * only runtime context is recorded. Keep any thread that has a stored title,
 * a real user prompt, or token usage, since it may still be useful to inspect.
 */
export function isEmptySession(
  rolloutPath: string | null | undefined,
  dbTitle: string | null | undefined,
  tokensUsed: number | null | undefined,
): boolean {
  if ((tokensUsed ?? 0) > 0) return false
  if (dbTitle?.trim()) return false
  return extractFirstUserPrompt(rolloutPath) === null
}

/**
 * Codex History — reads session list from state_5.sqlite threads table
 * and conversation detail from sessions/YYYY/MM/DD/rollout-*.jsonl files.
 */
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite'
import { existsSync, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { CX_DB_PATH } from './cx-stats.js'

const _sqliteMod = 'node:sqlite'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require(_sqliteMod) as { DatabaseSync: typeof DatabaseSyncType }

type DbInstance = InstanceType<typeof DatabaseSyncType>

// ── Types ────────────────────────────────────────────────────────────────────

export interface CxSession {
  id: string
  title: string
  cwd: string
  projectName: string
  model: string
  tokensUsed: number
  msgCount: number
  timeCreated: number  // unix seconds
  timeUpdated: number  // unix seconds
}

export interface CxProject {
  directory: string
  name: string
  sessionCount: number
  lastActive: number    // unix seconds
}

export interface CxHistoryData {
  projects: CxProject[]
  sessions: CxSession[]
  stats: {
    totalSessions: number
    totalProjects: number
    totalTokens: number
  }
}

export interface CxConversationMessage {
  role: 'user' | 'assistant'
  text: string
  timestamp: string    // ISO string
}

export interface CxConversationResult {
  messages: CxConversationMessage[]
  path: string
}

// ── SQL row types ─────────────────────────────────────────────────────────────

interface ThreadRow {
  id: string
  rollout_path: string
  cwd: string
  title: string
  tokens_used: number
  model: string | null
  created_at: number
  updated_at: number
  archived: number
}

export function isPlanHandoffTitle(text: string): boolean {
  return text.startsWith('A previous agent produced the plan below to accomplish the user')
    && text.includes('Treat the plan as the source of user intent')
}

function isPlanHandoffText(text: string): boolean {
  return isPlanHandoffTitle(text)
}

function isInternalAssistantText(text: string): boolean {
  return text.startsWith('<proposed_plan>')
}

// ── DB helper ─────────────────────────────────────────────────────────────────

function withDb<T>(fn: (db: DbInstance) => T): T {
  const db = new DatabaseSync(CX_DB_PATH, { open: true })
  try {
    return fn(db)
  } finally {
    db.close()
  }
}

// ── History list ──────────────────────────────────────────────────────────────

export function loadCxHistory(): CxHistoryData {
  const empty: CxHistoryData = {
    projects: [],
    sessions: [],
    stats: { totalSessions: 0, totalProjects: 0, totalTokens: 0 },
  }

  if (!existsSync(CX_DB_PATH)) return empty

  try {
    return withDb(db => {
      const threads = db.prepare(`
        SELECT id, rollout_path, cwd, title, tokens_used, model,
               created_at, updated_at, archived
        FROM threads
        WHERE archived = 0
        ORDER BY updated_at DESC
      `).all() as unknown as ThreadRow[]

      const visibleThreads = threads.filter(t => !isPlanHandoffText((t.title || '').trim()))

      if (visibleThreads.length === 0) return empty

      const sessions: CxSession[] = visibleThreads.map(t => ({
        id:           t.id,
        title:        t.title || '未命名会话',
        cwd:          t.cwd,
        projectName:  basename(t.cwd),
        model:        t.model || 'unknown',
        tokensUsed:   t.tokens_used ?? 0,
        msgCount:     Math.max(1, Math.round((t.tokens_used ?? 0) / 500)),
        timeCreated:  t.created_at,
        timeUpdated:  t.updated_at,
      }))

      // Group by cwd → project list
      const projectMap = new Map<string, { count: number; lastActive: number }>()
      for (const t of visibleThreads) {
        if (!projectMap.has(t.cwd)) {
          projectMap.set(t.cwd, { count: 0, lastActive: 0 })
        }
        const p = projectMap.get(t.cwd)!
        p.count += 1
        if (t.updated_at > p.lastActive) p.lastActive = t.updated_at
      }

      const projects: CxProject[] = [...projectMap.entries()]
        .map(([directory, { count, lastActive }]) => ({
          directory,
          name: basename(directory),
          sessionCount: count,
          lastActive,
        }))
        .sort((a, b) => b.lastActive - a.lastActive)

      return {
        projects,
        sessions,
        stats: {
          totalSessions: sessions.length,
          totalProjects: projects.length,
          totalTokens: sessions.reduce((s, c) => s + c.tokensUsed, 0),
        },
      }
    })
  } catch {
    return empty
  }
}

// ── Conversation detail ───────────────────────────────────────────────────────

/** Normalize a Python dict string to valid JSON (single→double quotes, None→null) */
function normalizePythonDict(raw: string): string {
  let s = raw.replace(/\bNone\b/g, 'null')
  s = s.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false')
  return s
}

function tryParsePythonJson(raw: string): Record<string, unknown> | null {
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

interface JsonLine {
  type?: string
  timestamp?: string
  payload?: Record<string, unknown> | string
}

function parsePayload(payload: JsonLine['payload']): Record<string, unknown> | null {
  if (!payload) return null
  if (typeof payload === 'object') return payload
  return tryParsePythonJson(payload)
}

function textFromContent(content: unknown, textType: string): string {
  if (!Array.isArray(content)) return ''
  const parts: string[] = []
  for (const c of content as Array<Record<string, unknown>>) {
    if (c.type === textType && typeof c.text === 'string') {
      parts.push(c.text)
    }
  }
  return parts.join('\n').trim()
}

function isInternalUserText(text: string): boolean {
  return isPlanHandoffText(text)
    || text.startsWith('<permissions instructions>')
    || text.startsWith('<collaboration_mode>')
    || text.startsWith('<skills_instructions>')
    || text.startsWith('<environment_context>')
    || text.startsWith('# AGENTS.md instructions')
}

export function loadCxConversation(sessionId: string): CxConversationResult {
  if (!sessionId) return { messages: [], path: '' }

  // Find the rollout_path for this session from the DB
  let rolloutPath: string | null = null
  try {
    rolloutPath = withDb(db => {
      const row = db.prepare(
        'SELECT rollout_path, title FROM threads WHERE id = ?'
      ).get(sessionId) as { rollout_path: string; title: string } | undefined
      if (row?.title && isPlanHandoffText(row.title.trim())) return null
      return row?.rollout_path ?? null
    })
  } catch {
    return { messages: [], path: '' }
  }

  if (!rolloutPath || !existsSync(rolloutPath)) return { messages: [], path: rolloutPath || '' }

  let content: string
  try {
    content = readFileSync(rolloutPath, 'utf-8')
  } catch {
    return { messages: [], path: rolloutPath || '' }
  }

  const messages: CxConversationMessage[] = []
  const pushMessage = (role: 'user' | 'assistant', text: string, timestamp: string) => {
    const clean = text.trim()
    if (!clean) return
    if (role === 'user' && isInternalUserText(clean)) return
    if (role === 'assistant' && isInternalAssistantText(clean)) return
    if (clean.startsWith('<local-command-caveat>') || clean.startsWith('<command-name>')) return

    const last = messages[messages.length - 1]
    if (last?.role === role && last.text === clean) return

    messages.push({ role, text: clean, timestamp })
  }

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    let obj: JsonLine
    try {
      obj = JSON.parse(trimmed) as JsonLine
    } catch {
      continue
    }

    const lineType = obj.type
    const ts = obj.timestamp ?? ''
    const payload = parsePayload(obj.payload)

    // ── User messages from event_msg ───────────────────────────────────────
    if (lineType === 'event_msg' && payload) {
      if (payload.type === 'user_message' && typeof payload.message === 'string') {
        pushMessage('user', payload.message, ts)
      }
      continue
    }

    // ── Chat messages from response_item ───────────────────────────────────
    if (lineType === 'response_item' && payload) {
      const p = payload
      if (p.type !== 'message') continue
      if (p.role === 'user') {
        pushMessage('user', textFromContent(p.content, 'input_text'), ts)
      } else if (p.role === 'assistant') {
        pushMessage('assistant', textFromContent(p.content, 'output_text'), ts)
      }
      continue
    }
  }

  return { messages, path: rolloutPath }
}

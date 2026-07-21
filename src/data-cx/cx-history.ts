/**
 * Codex History — reads session list from state_5.sqlite threads table
 * and conversation detail from sessions/YYYY/MM/DD/rollout-*.jsonl files.
 */
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite'
import { existsSync, readFileSync } from 'node:fs'
import { getCxDataSource, getCxDataSources, type CxDataSource, type CxDataSourceId } from './cx-data-sources.js'
import {
  isInternalAssistantText,
  isInternalUserText,
  isPlanHandoffText,
  parsePayload,
  resolveProject,
  resolveSessionTitle,
  textFromContent,
  type JsonLine,
} from './cx-rollout.js'

const _sqliteMod = 'node:sqlite'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require(_sqliteMod) as { DatabaseSync: typeof DatabaseSyncType }

type DbInstance = InstanceType<typeof DatabaseSyncType>

// ── Types ────────────────────────────────────────────────────────────────────

export interface CxSession {
  id: string
  source: CxDataSourceId
  sourceLabel: string
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
  isTemp: boolean
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

// ── DB helper ─────────────────────────────────────────────────────────────────

function withDb<T>(source: CxDataSource, fn: (db: DbInstance) => T): T {
  const db = new DatabaseSync(source.dbPath, { open: true })
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

  const sources = getCxDataSources().filter(source => existsSync(source.dbPath))
  if (sources.length === 0) return empty

  try {
    const sessions: CxSession[] = []
    const projectMap = new Map<string, { count: number; lastActive: number; name: string; isTemp: boolean }>()

    for (const source of sources) {
      const sourceData = withDb(source, db => {
        const threads = db.prepare(`
          SELECT id, rollout_path, cwd, title, tokens_used, model,
                 created_at, updated_at, archived
          FROM threads
          WHERE archived = 0
          ORDER BY updated_at DESC
        `).all() as unknown as ThreadRow[]

        const visibleThreads = threads.filter(t => !isPlanHandoffText((t.title || '').trim()))

        const sourceSessions: CxSession[] = visibleThreads.map(t => {
          const rp = resolveProject(t.cwd)
          return {
            id:           t.id,
            source:       source.id,
            sourceLabel:  source.label,
            title:        resolveSessionTitle(t.rollout_path, t.title),
            cwd:          rp.directory,
            projectName:  rp.name,
            model:        t.model || 'unknown',
            tokensUsed:   t.tokens_used ?? 0,
            msgCount:     Math.max(1, Math.round((t.tokens_used ?? 0) / 500)),
            timeCreated:  t.created_at,
            timeUpdated:  t.updated_at,
          }
        })

        return { sourceSessions, visibleThreads }
      })

      sessions.push(...sourceData.sourceSessions)
      for (const t of sourceData.visibleThreads) {
        const rp = resolveProject(t.cwd)
        let p = projectMap.get(rp.directory)
        if (!p) {
          p = { count: 0, lastActive: 0, name: rp.name, isTemp: rp.isTemp }
          projectMap.set(rp.directory, p)
        }
        p.count += 1
        if (t.updated_at > p.lastActive) p.lastActive = t.updated_at
      }
    }

    if (sessions.length === 0) return empty

    const projects: CxProject[] = [...projectMap.entries()]
        .map(([directory, { count, lastActive, name, isTemp }]) => ({
          directory,
          name,
          sessionCount: count,
          lastActive,
          isTemp,
        }))
        .sort((a, b) => b.lastActive - a.lastActive)

    sessions.sort((a, b) => b.timeUpdated - a.timeUpdated)
    return {
      projects,
      sessions,
      stats: {
        totalSessions: sessions.length,
        totalProjects: projects.length,
        totalTokens: sessions.reduce((s, c) => s + c.tokensUsed, 0),
      },
    }
  } catch {
    return empty
  }
}

// ── Conversation detail ───────────────────────────────────────────────────────

export function loadCxConversation(sessionId: string, sourceId?: string): CxConversationResult {
  if (!sessionId) return { messages: [], path: '' }

  const source = getCxDataSource(sourceId)
  if (!source || !existsSync(source.dbPath)) return { messages: [], path: '' }

  // Find the rollout_path for this session from the DB
  let rolloutPath: string | null = null
  try {
    rolloutPath = withDb(source, db => {
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

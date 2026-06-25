/**
 * Codemaker History — reads sessions and conversation content from opencode.db.
 *
 * Tables used:
 *   session  → id, title, slug, directory, time_created, time_updated
 *   message  → id, session_id, time_created, data (JSON: role, cost, tokens)
 *   part     → message_id, session_id, time_created, data (JSON: type, text, …)
 *
 * Conversation is reconstructed from parts of type 'text', grouped by message.
 */
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { basename } from 'node:path'
import { CM_DB_PATH } from './cm-stats.js'

// Use an indirect variable so esbuild cannot statically rewrite the module name
const _sqliteMod = 'node:sqlite'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require(_sqliteMod) as { DatabaseSync: typeof DatabaseSyncType }
type DbInstance = InstanceType<typeof DatabaseSyncType>

// ── Types ────────────────────────────────────────────────────────────────────

export interface CmSession {
  id: string
  title: string
  slug: string
  directory: string
  projectName: string
  timeCreated: number   // ms
  timeUpdated: number   // ms
  msgCount: number      // assistant message count
  totalCostUsd: number
}

export interface CmProject {
  directory: string
  name: string
  sessionCount: number
  lastActive: number    // ms
}

export interface CmHistoryData {
  projects: CmProject[]
  sessions: CmSession[]
  stats: {
    totalSessions: number
    totalProjects: number
    totalCostUsd: number
  }
}

export interface CmConversationMessage {
  role: 'user' | 'assistant'
  text: string
  timeCreated: number   // ms
  agent?: string        // plan | explore | undefined
  costUsd?: number      // only for assistant
}

// ── SQL row types ─────────────────────────────────────────────────────────────

interface SessionRow {
  id: string
  title: string
  slug: string
  directory: string
  time_created: number
  time_updated: number
}

interface MsgSummaryRow {
  session_id: string
  msg_count: number
  total_cost: number
}

interface PartRow {
  message_id: string
  msg_time_created: number
  msg_role: string
  msg_agent: string | null
  msg_cost: number | null
  part_type: string
  part_text: string | null
  part_time_created: number
}

// ── DB helper ─────────────────────────────────────────────────────────────────

function withDb<T>(fn: (db: DbInstance) => T): T {
  const db = new DatabaseSync(CM_DB_PATH, { open: true })
  try {
    return fn(db)
  } finally {
    db.close()
  }
}

// ── History list ──────────────────────────────────────────────────────────────

export function loadCmHistory(): CmHistoryData {
  const empty: CmHistoryData = {
    projects: [],
    sessions: [],
    stats: { totalSessions: 0, totalProjects: 0, totalCostUsd: 0 },
  }

  if (!existsSync(CM_DB_PATH)) return empty

  try {
    return withDb(db => {
      // All sessions
      const sessions = db.prepare(`
        SELECT id, title, slug, directory, time_created, time_updated
        FROM session
        ORDER BY time_updated DESC
      `).all() as unknown as SessionRow[]

      if (sessions.length === 0) return empty

      // Aggregate cost + message count per session
      const msgSummary = db.prepare(`
        SELECT
          session_id,
          COUNT(*) AS msg_count,
          SUM(CAST(json_extract(data, '$.cost') AS REAL)) AS total_cost
        FROM message
        WHERE json_extract(data, '$.role') = 'assistant'
        GROUP BY session_id
      `).all() as unknown as MsgSummaryRow[]

      const msgMap = new Map<string, MsgSummaryRow>()
      for (const m of msgSummary) msgMap.set(m.session_id, m)

      // Build session list
      const cmSessions: CmSession[] = sessions.map(s => {
        const m = msgMap.get(s.id)
        return {
          id:           s.id,
          title:        s.title,
          slug:         s.slug,
          directory:    s.directory,
          projectName:  basename(s.directory),
          timeCreated:  s.time_created,
          timeUpdated:  s.time_updated,
          msgCount:     m?.msg_count ?? 0,
          totalCostUsd: m?.total_cost ?? 0,
        }
      })

      // Build project list (group by directory)
      const projectMap = new Map<string, { count: number; lastActive: number }>()
      for (const s of sessions) {
        if (!projectMap.has(s.directory)) {
          projectMap.set(s.directory, { count: 0, lastActive: 0 })
        }
        const p = projectMap.get(s.directory)!
        p.count += 1
        if (s.time_updated > p.lastActive) p.lastActive = s.time_updated
      }

      const projects: CmProject[] = [...projectMap.entries()]
        .map(([directory, { count, lastActive }]) => ({
          directory,
          name: basename(directory),
          sessionCount: count,
          lastActive,
        }))
        .sort((a, b) => b.lastActive - a.lastActive)

      const totalCostUsd = cmSessions.reduce((s, c) => s + c.totalCostUsd, 0)

      return {
        projects,
        sessions: cmSessions,
        stats: {
          totalSessions: cmSessions.length,
          totalProjects:  projects.length,
          totalCostUsd,
        },
      }
    })
  } catch {
    return empty
  }
}

// ── Conversation detail ───────────────────────────────────────────────────────

export function loadCmConversation(sessionId: string): CmConversationMessage[] {
  if (!existsSync(CM_DB_PATH) || !sessionId) return []

  try {
    return withDb(db => {
      // Fetch parts joined with their parent message metadata, ordered by message time
      const parts = db.prepare(`
        SELECT
          p.message_id,
          m.time_created          AS msg_time_created,
          json_extract(m.data, '$.role')        AS msg_role,
          json_extract(m.data, '$.agent')       AS msg_agent,
          json_extract(m.data, '$.cost')        AS msg_cost,
          json_extract(p.data, '$.type')        AS part_type,
          json_extract(p.data, '$.text')        AS part_text,
          p.time_created          AS part_time_created
        FROM part p
        JOIN message m ON m.id = p.message_id
        WHERE p.session_id = ?
          AND json_extract(m.data, '$.role') IN ('user', 'assistant')
          AND json_extract(p.data, '$.type') = 'text'
          AND json_extract(p.data, '$.text') IS NOT NULL
          AND json_extract(p.data, '$.text') != ''
        ORDER BY m.time_created ASC, p.time_created ASC
      `).all(sessionId) as unknown as PartRow[]

      if (parts.length === 0) return []

      // Merge consecutive parts from the same message into one turn
      const messages: CmConversationMessage[] = []
      let lastMsgId = ''
      let currentText = ''
      let currentRole: 'user' | 'assistant' = 'user'
      let currentTime = 0
      let currentAgent: string | undefined
      let currentCost: number | undefined

      const flush = () => {
        const trimmed = currentText.trim()
        if (!trimmed) return
        // Skip internal system noise
        if (trimmed.startsWith('<local-command') || trimmed.startsWith('<command-name')) return
        messages.push({
          role:        currentRole,
          text:        trimmed,
          timeCreated: currentTime,
          agent:       currentAgent,
          costUsd:     currentCost,
        })
      }

      for (const p of parts) {
        if (p.message_id !== lastMsgId) {
          if (lastMsgId) flush()
          lastMsgId   = p.message_id
          currentText = ''
          currentRole = (p.msg_role === 'assistant' ? 'assistant' : 'user')
          currentTime = p.msg_time_created
          currentAgent = p.msg_agent ?? undefined
          currentCost  = p.msg_role === 'assistant' && p.msg_cost != null
            ? (p.msg_cost as number)
            : undefined
        }
        currentText += (currentText ? '\n' : '') + (p.part_text ?? '')
      }
      flush()

      return messages
    })
  } catch {
    return []
  }
}

/**
 * Codemaker Stats — reads directly from opencode.db (SQLite).
 *
 * Data source: ~/.local/share/codemaker/opencode.db
 *   session  → id, title, directory, time_created, time_updated
 *   message  → role, data (JSON with tokens + cost for assistant messages)
 *
 * Node v22+ built-in `node:sqlite` — zero extra dependencies.
 */
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite'

// Use an indirect variable so esbuild cannot statically rewrite the module name
const _sqliteMod = 'node:sqlite'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require(_sqliteMod) as { DatabaseSync: typeof DatabaseSyncType }

type DbInstance = InstanceType<typeof DatabaseSyncType>
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, basename } from 'node:path'

// ── DB path ──────────────────────────────────────────────────────────────────
export const CM_DB_PATH = join(
  homedir(),
  '.local', 'share', 'codemaker', 'opencode.db',
)

// ── Types ────────────────────────────────────────────────────────────────────

export interface CmSessionStat {
  id: string
  title: string
  slug: string
  costUsd: number
  inputTokens: number
  outputTokens: number
  cacheRead: number
  cacheWrite: number
  date: string        // YYYY-MM-DD
  lastTime: string    // YYYY-MM-DD HH:MM
}

export interface CmDailyStat {
  date: string
  costUsd: number
  outputTokens: number
  sessions: number
}

export interface CmProjectStat {
  directory: string
  name: string
  sessionCount: number
  totalCostUsd: number
  inputTokens: number
  outputTokens: number
  cacheRead: number
  cacheWrite: number
  lastActive: string   // YYYY-MM-DD HH:MM
  sessions: CmSessionStat[]
  daily: CmDailyStat[]
}

export interface CmStatsSummary {
  totalProjects: number
  totalSessions: number
  totalCostUsd: number
  totalOutputTokens: number
  totalCacheRead: number
}

export interface CmStatsData {
  summary: CmStatsSummary
  projects: CmProjectStat[]   // sorted by totalCostUsd desc
  computedAt: string
  noData: boolean
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

// ── SQL row types ─────────────────────────────────────────────────────────────

interface SessionRow {
  id: string
  title: string
  slug: string
  directory: string
  time_created: number
  time_updated: number
}

interface MsgAggRow {
  session_id: string
  cost: number
  input_tokens: number
  output_tokens: number
  cache_read: number
  cache_write: number
}

// ── Main export ───────────────────────────────────────────────────────────────

export function loadCmStats(): CmStatsData {
  const empty: CmStatsData = {
    summary: { totalProjects: 0, totalSessions: 0, totalCostUsd: 0, totalOutputTokens: 0, totalCacheRead: 0 },
    projects: [],
    computedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    noData: true,
  }

  if (!existsSync(CM_DB_PATH)) return empty

  try {
    return withDb(db => {
      // 1. Load all sessions
      const sessions = db.prepare(`
        SELECT id, title, slug, directory, time_created, time_updated
        FROM session
        ORDER BY time_created DESC
      `).all() as unknown as SessionRow[]

      if (sessions.length === 0) return empty

      // 2. Aggregate tokens + cost per session from assistant messages
      const msgAgg = db.prepare(`
        SELECT
          session_id,
          SUM(CAST(json_extract(data, '$.cost') AS REAL))               AS cost,
          SUM(CAST(json_extract(data, '$.tokens.input') AS INTEGER))    AS input_tokens,
          SUM(CAST(json_extract(data, '$.tokens.output') AS INTEGER))   AS output_tokens,
          SUM(CAST(json_extract(data, '$.tokens.cache.read') AS INTEGER))  AS cache_read,
          SUM(CAST(json_extract(data, '$.tokens.cache.write') AS INTEGER)) AS cache_write
        FROM message
        WHERE json_extract(data, '$.role') = 'assistant'
        GROUP BY session_id
      `).all() as unknown as MsgAggRow[]

      const aggMap = new Map<string, MsgAggRow>()
      for (const row of msgAgg) aggMap.set(row.session_id, row)

      // 3. Group sessions by directory → project
      const projectMap = new Map<string, {
        sessions: SessionRow[]
        agg: MsgAggRow[]
        lastUpdated: number
      }>()

      for (const s of sessions) {
        const dir = s.directory
        if (!projectMap.has(dir)) {
          projectMap.set(dir, { sessions: [], agg: [], lastUpdated: 0 })
        }
        const p = projectMap.get(dir)!
        p.sessions.push(s)
        const a = aggMap.get(s.id)
        if (a) p.agg.push(a)
        if (s.time_updated > p.lastUpdated) p.lastUpdated = s.time_updated
      }

      // 4. Build project stats
      const projects: CmProjectStat[] = []

      for (const [dir, { sessions: pSessions, agg, lastUpdated }] of projectMap) {
        let totalCost = 0, totalIn = 0, totalOut = 0, totalCR = 0, totalCW = 0
        for (const a of agg) {
          totalCost += a.cost ?? 0
          totalIn   += a.input_tokens ?? 0
          totalOut  += a.output_tokens ?? 0
          totalCR   += a.cache_read ?? 0
          totalCW   += a.cache_write ?? 0
        }

        // Per-session stats
        const sessionStats: CmSessionStat[] = pSessions.map(s => {
          const a = aggMap.get(s.id)
          const created = new Date(s.time_created)
          const updated = new Date(s.time_updated)
          return {
            id:           s.id,
            title:        s.title,
            slug:         s.slug,
            costUsd:      a?.cost ?? 0,
            inputTokens:  a?.input_tokens ?? 0,
            outputTokens: a?.output_tokens ?? 0,
            cacheRead:    a?.cache_read ?? 0,
            cacheWrite:   a?.cache_write ?? 0,
            date:         created.toISOString().slice(0, 10),
            lastTime:     fmtDatetime(updated),
          }
        })

        // Daily breakdown (aggregate across sessions)
        const dailyMap = new Map<string, { costUsd: number; outputTokens: number; sessions: number }>()
        for (const s of pSessions) {
          const day = new Date(s.time_created).toISOString().slice(0, 10)
          if (!dailyMap.has(day)) dailyMap.set(day, { costUsd: 0, outputTokens: 0, sessions: 0 })
          const d = dailyMap.get(day)!
          d.sessions += 1
          const a = aggMap.get(s.id)
          if (a) {
            d.costUsd      += a.cost ?? 0
            d.outputTokens += a.output_tokens ?? 0
          }
        }
        const daily: CmDailyStat[] = [...dailyMap.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, d]) => ({ date, ...d }))

        projects.push({
          directory:    dir,
          name:         basename(dir),
          sessionCount: pSessions.length,
          totalCostUsd: totalCost,
          inputTokens:  totalIn,
          outputTokens: totalOut,
          cacheRead:    totalCR,
          cacheWrite:   totalCW,
          lastActive:   fmtDatetime(new Date(lastUpdated)),
          sessions:     sessionStats,
          daily,
        })
      }

      // Sort projects by cost descending
      projects.sort((a, b) => b.totalCostUsd - a.totalCostUsd)

      // 5. Summary
      const summary: CmStatsSummary = {
        totalProjects:     projects.length,
        totalSessions:     sessions.length,
        totalCostUsd:      projects.reduce((s, p) => s + p.totalCostUsd, 0),
        totalOutputTokens: projects.reduce((s, p) => s + p.outputTokens, 0),
        totalCacheRead:    projects.reduce((s, p) => s + p.cacheRead, 0),
      }

      return {
        summary,
        projects,
        computedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        noData: false,
      }
    })
  } catch {
    return empty
  }
}

function fmtDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

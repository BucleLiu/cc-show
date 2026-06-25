/**
 * Codex Stats — reads thread metadata from state_5.sqlite.
 *
 * Data source: ~/.codex/state_5.sqlite → threads table
 *   id, rollout_path, cwd, title, tokens_used, model, model_provider,
 *   created_at, updated_at, archived
 */
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite'

const _sqliteMod = 'node:sqlite'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require(_sqliteMod) as { DatabaseSync: typeof DatabaseSyncType }

type DbInstance = InstanceType<typeof DatabaseSyncType>
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, basename } from 'node:path'

// ── DB path ──────────────────────────────────────────────────────────────────
export const CX_DB_PATH = join(homedir(), '.codex', 'state_5.sqlite')
export const CX_SESSIONS_DIR = join(homedir(), '.codex', 'sessions')
export const CX_HISTORY_PATH = join(homedir(), '.codex', 'history.jsonl')

// ── Types ────────────────────────────────────────────────────────────────────

export interface CxSessionStat {
  id: string
  title: string
  tokensUsed: number
  model: string
  date: string        // YYYY-MM-DD
  lastTime: string    // YYYY-MM-DD HH:MM
}

export interface CxDailyStat {
  date: string
  tokensUsed: number
  sessions: number
}

export interface CxProjectStat {
  directory: string
  name: string
  sessionCount: number
  totalTokens: number
  lastActive: string   // YYYY-MM-DD HH:MM
  sessions: CxSessionStat[]
  daily: CxDailyStat[]
}

export interface CxStatsSummary {
  totalProjects: number
  totalSessions: number
  totalTokens: number
}

export interface CxStatsData {
  summary: CxStatsSummary
  projects: CxProjectStat[]   // sorted by totalTokens desc
  computedAt: string
  noData: boolean
}

// ── SQL row types ─────────────────────────────────────────────────────────────

interface ThreadRow {
  id: string
  rollout_path: string
  cwd: string
  title: string
  tokens_used: number
  model: string | null
  model_provider: string
  created_at: number    // unix seconds
  updated_at: number    // unix seconds
  archived: number      // 0 or 1
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

// ── Main export ───────────────────────────────────────────────────────────────

export function loadCxStats(): CxStatsData {
  const empty: CxStatsData = {
    summary: { totalProjects: 0, totalSessions: 0, totalTokens: 0 },
    projects: [],
    computedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    noData: true,
  }

  if (!existsSync(CX_DB_PATH)) return empty

  try {
    return withDb(db => {
      // 1. Load all non-archived threads
      const threads = db.prepare(`
        SELECT id, rollout_path, cwd, title, tokens_used, model,
               model_provider, created_at, updated_at, archived
        FROM threads
        WHERE archived = 0
        ORDER BY updated_at DESC
      `).all() as unknown as ThreadRow[]

      if (threads.length === 0) return empty

      // 2. Group by cwd → project
      const projectMap = new Map<string, {
        threads: ThreadRow[]
        lastUpdated: number
      }>()

      for (const t of threads) {
        const dir = t.cwd
        if (!projectMap.has(dir)) {
          projectMap.set(dir, { threads: [], lastUpdated: 0 })
        }
        const p = projectMap.get(dir)!
        p.threads.push(t)
        if (t.updated_at > p.lastUpdated) p.lastUpdated = t.updated_at
      }

      // 3. Build project stats
      const projects: CxProjectStat[] = []

      for (const [dir, { threads: pThreads, lastUpdated }] of projectMap) {
        let totalTokens = 0
        for (const t of pThreads) totalTokens += t.tokens_used ?? 0

        const sessionStats: CxSessionStat[] = pThreads.map(t => {
          const created = new Date(t.created_at * 1000)
          const updated = new Date(t.updated_at * 1000)
          return {
            id:         t.id,
            title:      t.title || '未命名会话',
            tokensUsed: t.tokens_used ?? 0,
            model:      t.model || 'unknown',
            date:       created.toISOString().slice(0, 10),
            lastTime:   fmtDatetime(updated),
          }
        })

        // Daily breakdown
        const dailyMap = new Map<string, { tokensUsed: number; sessions: number }>()
        for (const t of pThreads) {
          const day = new Date(t.created_at * 1000).toISOString().slice(0, 10)
          if (!dailyMap.has(day)) dailyMap.set(day, { tokensUsed: 0, sessions: 0 })
          const d = dailyMap.get(day)!
          d.tokensUsed += t.tokens_used ?? 0
          d.sessions += 1
        }
        const daily: CxDailyStat[] = [...dailyMap.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, d]) => ({ date, ...d }))

        projects.push({
          directory:    dir,
          name:         basename(dir),
          sessionCount: pThreads.length,
          totalTokens,
          lastActive:   fmtDatetime(new Date(lastUpdated * 1000)),
          sessions:     sessionStats,
          daily,
        })
      }

      projects.sort((a, b) => b.totalTokens - a.totalTokens)

      const summary: CxStatsSummary = {
        totalProjects: projects.length,
        totalSessions: threads.length,
        totalTokens:   projects.reduce((s, p) => s + p.totalTokens, 0),
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

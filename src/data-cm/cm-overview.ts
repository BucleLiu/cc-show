/**
 * Codemaker Overview — aggregates KPI, trends, and rankings from opencode.db.
 *
 * Combines loadCmStats() + loadCmHistory() data to produce a single
 * dashboard summary object for the /api/cm/overview endpoint.
 */
import { loadCmStats } from './cm-stats.js'
import { loadCmHistory } from './cm-history.js'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CmOverviewKpi {
  totalCostUsd: number
  todayCostUsd: number
  weekCostUsd: number
  totalProjects: number
  activeProjects7d: number
  totalSessions: number
  monthSessions: number
  totalOutputTokens: number
  totalCacheRead: number
}

export interface CmTrendDay {
  date: string         // YYYY-MM-DD
  costUsd: number
  sessions: number
  outputTokens: number
}

export interface CmOverviewSession {
  id: string
  title: string
  projectName: string
  timeUpdated: number  // ms
  totalCostUsd: number
  msgCount: number
}

export interface CmOverviewProject {
  name: string
  directory: string
  totalCostUsd: number
  sessionCount: number
  lastActive: string   // YYYY-MM-DD HH:MM
}

export interface CmTokenBreakdown {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export interface CmOverviewData {
  kpi: CmOverviewKpi
  trend7Days: CmTrendDay[]      // oldest → newest (up to 7 entries)
  recentSessions: CmOverviewSession[]  // top 5 by timeUpdated
  topProjects: CmOverviewProject[]     // top 5 by totalCostUsd
  tokenBreakdown: CmTokenBreakdown
  computedAt: string
  noData: boolean
}

// ── Helper ────────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function nDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function currentMonthPrefix(): string {
  const d = new Date()
  return d.toISOString().slice(0, 7) // YYYY-MM
}

// ── Main export ───────────────────────────────────────────────────────────────

export function loadCmOverview(): CmOverviewData {
  const empty: CmOverviewData = {
    kpi: {
      totalCostUsd: 0, todayCostUsd: 0, weekCostUsd: 0,
      totalProjects: 0, activeProjects7d: 0,
      totalSessions: 0, monthSessions: 0,
      totalOutputTokens: 0, totalCacheRead: 0,
    },
    trend7Days: [],
    recentSessions: [],
    topProjects: [],
    tokenBreakdown: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    computedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    noData: true,
  }

  const stats   = loadCmStats()
  const history = loadCmHistory()

  if (stats.noData) return empty

  const today     = todayStr()
  const weekStart = nDaysAgo(6)   // 7 days including today
  const monthPfx  = currentMonthPrefix()

  // ── Global daily aggregate (across all projects) ───────────────────────────
  const globalDailyMap = new Map<string, { costUsd: number; sessions: number; outputTokens: number }>()

  for (const proj of stats.projects) {
    for (const d of proj.daily) {
      if (!globalDailyMap.has(d.date)) {
        globalDailyMap.set(d.date, { costUsd: 0, sessions: 0, outputTokens: 0 })
      }
      const entry = globalDailyMap.get(d.date)!
      entry.costUsd      += d.costUsd
      entry.sessions     += d.sessions
      entry.outputTokens += d.outputTokens
    }
  }

  // ── KPI ───────────────────────────────────────────────────────────────────
  const todayEntry = globalDailyMap.get(today)
  const todayCostUsd = todayEntry?.costUsd ?? 0

  let weekCostUsd = 0
  let monthSessions = 0
  let activeProjects7d = 0

  for (const proj of stats.projects) {
    let projActiveThisWeek = false
    for (const d of proj.daily) {
      if (d.date >= weekStart) {
        weekCostUsd += d.costUsd
        projActiveThisWeek = true
      }
      if (d.date.startsWith(monthPfx)) {
        monthSessions += d.sessions
      }
    }
    if (projActiveThisWeek) activeProjects7d++
  }

  const kpi: CmOverviewKpi = {
    totalCostUsd:     stats.summary.totalCostUsd,
    todayCostUsd,
    weekCostUsd,
    totalProjects:    stats.summary.totalProjects,
    activeProjects7d,
    totalSessions:    stats.summary.totalSessions,
    monthSessions,
    totalOutputTokens: stats.summary.totalOutputTokens,
    totalCacheRead:   stats.summary.totalCacheRead,
  }

  // ── 7-Day trend ───────────────────────────────────────────────────────────
  const trend7Days: CmTrendDay[] = []
  for (let i = 6; i >= 0; i--) {
    const date = nDaysAgo(i)
    const entry = globalDailyMap.get(date)
    trend7Days.push({
      date,
      costUsd:      entry?.costUsd      ?? 0,
      sessions:     entry?.sessions     ?? 0,
      outputTokens: entry?.outputTokens ?? 0,
    })
  }

  // ── Recent sessions (top 5 by timeUpdated) ────────────────────────────────
  const recentSessions: CmOverviewSession[] = history.sessions
    .slice(0, 5)
    .map(s => ({
      id:           s.id,
      title:        s.title || s.slug || '未命名会话',
      projectName:  s.projectName,
      timeUpdated:  s.timeUpdated,
      totalCostUsd: s.totalCostUsd,
      msgCount:     s.msgCount,
    }))

  // ── Top projects (top 5 by cost) ──────────────────────────────────────────
  const topProjects: CmOverviewProject[] = stats.projects
    .slice(0, 5)
    .map(p => ({
      name:         p.name,
      directory:    p.directory,
      totalCostUsd: p.totalCostUsd,
      sessionCount: p.sessionCount,
      lastActive:   p.lastActive,
    }))

  // ── Token breakdown ────────────────────────────────────────────────────────
  const tokenBreakdown: CmTokenBreakdown = {
    input:    stats.projects.reduce((s, p) => s + p.inputTokens,  0),
    output:   stats.projects.reduce((s, p) => s + p.outputTokens, 0),
    cacheRead:  stats.projects.reduce((s, p) => s + p.cacheRead,  0),
    cacheWrite: stats.projects.reduce((s, p) => s + p.cacheWrite, 0),
  }

  return {
    kpi,
    trend7Days,
    recentSessions,
    topProjects,
    tokenBreakdown,
    computedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    noData: false,
  }
}

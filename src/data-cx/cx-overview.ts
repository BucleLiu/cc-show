/**
 * Codex Overview — aggregates KPI, trends, and rankings from
 * state_5.sqlite stats + history data.
 */
import { loadCxStats } from './cx-stats.js'
import { loadCxHistory } from './cx-history.js'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CxOverviewKpi {
  totalTokens: number
  todayTokens: number
  weekTokens: number
  totalProjects: number
  activeProjects7d: number
  totalSessions: number
  monthSessions: number
}

export interface CxTrendDay {
  date: string         // YYYY-MM-DD
  tokensUsed: number
  sessions: number
}

export interface CxOverviewSession {
  id: string
  title: string
  projectName: string
  timeUpdated: number  // unix seconds
  tokensUsed: number
}

export interface CxOverviewProject {
  name: string
  directory: string
  totalTokens: number
  sessionCount: number
  lastActive: string   // YYYY-MM-DD HH:MM
}

export interface CxOverviewData {
  kpi: CxOverviewKpi
  trend7Days: CxTrendDay[]           // oldest → newest
  recentSessions: CxOverviewSession[]  // top 5 by timeUpdated
  topProjects: CxOverviewProject[]     // top 5 by totalTokens
  computedAt: string
  noData: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function nDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function currentMonthPrefix(): string {
  return new Date().toISOString().slice(0, 7)
}

// ── Main export ───────────────────────────────────────────────────────────────

export function loadCxOverview(): CxOverviewData {
  const empty: CxOverviewData = {
    kpi: {
      totalTokens: 0, todayTokens: 0, weekTokens: 0,
      totalProjects: 0, activeProjects7d: 0,
      totalSessions: 0, monthSessions: 0,
    },
    trend7Days: [],
    recentSessions: [],
    topProjects: [],
    computedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    noData: true,
  }

  const stats   = loadCxStats()
  const history = loadCxHistory()

  if (stats.noData) return empty

  const today     = todayStr()
  const weekStart = nDaysAgo(6)
  const monthPfx  = currentMonthPrefix()

  // ── Global daily aggregate ─────────────────────────────────────────────────
  const globalDailyMap = new Map<string, { tokensUsed: number; sessions: number }>()

  for (const proj of stats.projects) {
    for (const d of proj.daily) {
      if (!globalDailyMap.has(d.date)) {
        globalDailyMap.set(d.date, { tokensUsed: 0, sessions: 0 })
      }
      const entry = globalDailyMap.get(d.date)!
      entry.tokensUsed += d.tokensUsed
      entry.sessions   += d.sessions
    }
  }

  // ── KPI ─────────────────────────────────────────────────────────────────────
  const todayEntry = globalDailyMap.get(today)
  const todayTokens = todayEntry?.tokensUsed ?? 0

  let weekTokens = 0
  let monthSessions = 0
  let activeProjects7d = 0

  for (const proj of stats.projects) {
    let projActiveThisWeek = false
    for (const d of proj.daily) {
      if (d.date >= weekStart) {
        weekTokens += d.tokensUsed
        projActiveThisWeek = true
      }
      if (d.date.startsWith(monthPfx)) {
        monthSessions += d.sessions
      }
    }
    if (projActiveThisWeek) activeProjects7d++
  }

  const kpi: CxOverviewKpi = {
    totalTokens:       stats.summary.totalTokens,
    todayTokens,
    weekTokens,
    totalProjects:     stats.summary.totalProjects,
    activeProjects7d,
    totalSessions:     stats.summary.totalSessions,
    monthSessions,
  }

  // ── 7-Day trend ─────────────────────────────────────────────────────────────
  const trend7Days: CxTrendDay[] = []
  for (let i = 6; i >= 0; i--) {
    const date = nDaysAgo(i)
    const entry = globalDailyMap.get(date)
    trend7Days.push({
      date,
      tokensUsed: entry?.tokensUsed ?? 0,
      sessions:   entry?.sessions   ?? 0,
    })
  }

  // ── Recent sessions (top 5) ─────────────────────────────────────────────────
  const recentSessions: CxOverviewSession[] = history.sessions
    .slice(0, 5)
    .map(s => ({
      id:          s.id,
      title:       s.title,
      projectName: s.projectName,
      timeUpdated: s.timeUpdated,
      tokensUsed:  s.tokensUsed,
    }))

  // ── Top projects (top 5) ────────────────────────────────────────────────────
  const topProjects: CxOverviewProject[] = stats.projects
    .slice(0, 5)
    .map(p => ({
      name:         p.name,
      directory:    p.directory,
      totalTokens:  p.totalTokens,
      sessionCount: p.sessionCount,
      lastActive:   p.lastActive,
    }))

  return {
    kpi,
    trend7Days,
    recentSessions,
    topProjects,
    computedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    noData: false,
  }
}

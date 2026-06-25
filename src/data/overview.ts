import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, basename, sep } from 'node:path'
import { loadLatestStats, computeStats } from './stats.js'
import { loadHistory } from './history.js'
import { loadPlans } from './plans.js'

export interface OverviewKpi {
  totalTokens: number
  totalProjects: number
  totalSessions: number
  totalPlans: number
  todayTokens: number
  activeProjectsLast7Days: number
  sessionsThisMonth: number
}

export interface DailyTrend {
  date: string       // YYYY-MM-DD
  total: number
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export interface RecentSession {
  id: string
  project: string
  projectName: string
  summary: string
  lastTime: number   // ms
  relativeTime: string
}

export interface TopProject {
  name: string
  path: string
  tokens: number
  sessions: number
  lastActive: string
}

export interface ModelShare {
  model: string
  tokens: number
  percent: number
}

export interface RecentPlan {
  filename: string
  title: string
  modified: number   // unix timestamp (seconds)
  preview: string
}

export interface MemoryEntry {
  project: string
  projectName: string
  snippet: string    // first meaningful line from MEMORY.md
  modified: number   // unix timestamp (seconds)
}

export interface OverviewData {
  kpi: OverviewKpi
  trend7Days: DailyTrend[]   // last 7 days (oldest → newest)
  recentSessions: RecentSession[]
  topProjects: TopProject[]  // top 5 by tokens
  modelShares: ModelShare[]
  recentPlans: RecentPlan[]
  memoryEntries: MemoryEntry[]
  computedAt: string
}

// ── helpers ──────────────────────────────────────────────────────────────────

function relativeTime(ms: number): string {
  const diff = Date.now() - ms
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return '刚刚'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小时前`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} 天前`
  const mo = Math.floor(day / 30)
  return `${mo} 个月前`
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function last7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function thisMonthPrefix(): string {
  return new Date().toISOString().slice(0, 7) // "YYYY-MM"
}

// ── memory reader ─────────────────────────────────────────────────────────────

function readMemoryEntries(dataDir: string): MemoryEntry[] {
  const projectsPath = join(dataDir, 'projects')
  if (!existsSync(projectsPath)) return []

  const entries: MemoryEntry[] = []

  let dirs: string[] = []
  try { dirs = readdirSync(projectsPath) } catch { return [] }

  for (const dir of dirs) {
    const memPath = join(projectsPath, dir, 'memory', 'MEMORY.md')
    if (!existsSync(memPath)) continue

    let mtime = 0
    try { mtime = statSync(memPath).mtimeMs / 1000 } catch { continue }

    let content = ''
    try { content = readFileSync(memPath, 'utf-8') } catch { continue }

    // Extract first meaningful non-heading, non-separator line
    let snippet = ''
    for (const line of content.split('\n')) {
      const t = line.trim()
      if (t && !t.startsWith('#') && t !== '---' && !t.startsWith('<!--')) {
        // strip markdown list/bold markers for display
        snippet = t.replace(/^\s*[-*+]\s*/, '').replace(/\*\*/g, '').slice(0, 120)
        break
      }
    }
    if (!snippet) continue

    // Decode project path from dir name (dashes → platform separators, leading dash stripped)
    const projectPath = sep + dir.replace(/^-/, '').replace(/-/g, sep)
    entries.push({
      project: projectPath,
      projectName: basename(projectPath),
      snippet,
      modified: mtime,
    })
  }

  // Sort newest first, return top 5
  entries.sort((a, b) => b.modified - a.modified)
  return entries.slice(0, 5)
}

// ── main export ───────────────────────────────────────────────────────────────

/** Auto-recompute if snapshot is missing or older than 23 hours */
function isSnapshotStale(stats: { noData: boolean; computedAt: string }): boolean {
  if (stats.noData || !stats.computedAt) return true
  const computedAt = new Date(stats.computedAt.replace(' ', 'T') + 'Z').getTime()
  return Date.now() - computedAt > 23 * 3600_000
}

export function loadOverview(dataDir?: string): OverviewData {
  const base = dataDir ?? join(homedir(), '.claude')

  let stats = loadLatestStats(base)
  if (isSnapshotStale(stats)) {
    try { stats = computeStats(base) } catch { /* keep stale data on error */ }
  }

  const history = loadHistory(base)
  const plansData = loadPlans(base)

  // ── KPI ──────────────────────────────────────────────────────────────────
  const today = todayStr()
  const monthPfx = thisMonthPrefix()

  // today's tokens: sum all projects' daily entry for today
  let todayTokens = 0
  for (const p of stats.projects) {
    const d = p.daily.find(x => x.date === today)
    if (d) todayTokens += d.total
  }

  // active projects in last 7 days
  const sevenDaysAgo = Date.now() - 7 * 86400_000
  const activeProjectsLast7Days = history.projects.filter(
    p => p.lastActive > sevenDaysAgo,
  ).length

  // sessions this month
  const sessionsThisMonth = history.sessions.filter(s => {
    const d = new Date(s.lastTime).toISOString().slice(0, 7)
    return d === monthPfx
  }).length

  const kpi: OverviewKpi = {
    totalTokens:          stats.summary.totalTokens,
    totalProjects:        stats.summary.totalProjects,
    totalSessions:        stats.summary.totalSessions,
    totalPlans:           plansData.stats.total,
    todayTokens,
    activeProjectsLast7Days,
    sessionsThisMonth,
  }

  // ── 7-day trend ───────────────────────────────────────────────────────────
  const days = last7Days()
  // Build a map date → aggregated DailyStat
  const trendMap = new Map<string, DailyTrend>(
    days.map(d => [d, { date: d, total: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }]),
  )
  for (const p of stats.projects) {
    for (const day of p.daily) {
      if (trendMap.has(day.date)) {
        const t = trendMap.get(day.date)!
        t.total     += day.total
        t.input     += day.input
        t.output    += day.output
        t.cacheRead += day.cacheRead
        t.cacheWrite += day.cacheWrite
      }
    }
  }
  const trend7Days = days.map(d => trendMap.get(d)!)

  // ── Recent sessions (top 5) ───────────────────────────────────────────────
  const recentSessions: RecentSession[] = history.sessions.slice(0, 5).map(s => ({
    id:           s.id,
    project:      s.project,
    projectName:  s.projectName,
    summary:      s.summary || '无摘要',
    lastTime:     s.lastTime,
    relativeTime: relativeTime(s.lastTime),
  }))

  // ── Top projects by tokens (top 5) ────────────────────────────────────────
  const topProjects: TopProject[] = stats.projects.slice(0, 5).map(p => ({
    name:       p.name,
    path:       p.path,
    tokens:     p.totalTokens,
    sessions:   p.sessionCount,
    lastActive: p.lastActive,
  }))

  // ── Model share ───────────────────────────────────────────────────────────
  const modelMap = new Map<string, number>()
  for (const p of stats.projects) {
    for (const [m, t] of Object.entries(p.models)) {
      modelMap.set(m, (modelMap.get(m) ?? 0) + t)
    }
  }
  const totalModelTokens = [...modelMap.values()].reduce((a, b) => a + b, 0)
  const modelShares: ModelShare[] = [...modelMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([model, tokens]) => ({
      model,
      tokens,
      percent: totalModelTokens > 0 ? Math.round((tokens / totalModelTokens) * 100) : 0,
    }))

  // ── Recent plans (top 5) ─────────────────────────────────────────────────
  const recentPlans: RecentPlan[] = plansData.plans.slice(0, 5).map(p => ({
    filename: p.filename,
    title:    p.title,
    modified: p.modified,
    preview:  p.preview,
  }))

  // ── Memory entries ────────────────────────────────────────────────────────
  const memoryEntries = readMemoryEntries(base)

  return {
    kpi,
    trend7Days,
    recentSessions,
    topProjects,
    modelShares,
    recentPlans,
    memoryEntries,
    computedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  }
}

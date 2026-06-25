import {
  readdirSync, readFileSync, writeFileSync,
  mkdirSync, statSync, existsSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { join, basename, sep } from 'node:path'

export interface SessionStat {
  id: string
  totalTokens: number
  inputTokens: number
  outputTokens: number
  cacheRead: number
  cacheWrite: number
  /** Primary model: the one with the most tokens in this session */
  model: string
  /** Per-model token breakdown within the session */
  models: Record<string, number>
  date: string
  lastTime: string
}

export interface DailyStat {
  date: string
  total: number
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export interface ProjectStat {
  name: string
  path: string
  totalTokens: number
  inputTokens: number
  outputTokens: number
  cacheRead: number
  cacheWrite: number
  sessionCount: number
  lastActive: string
  models: Record<string, number>
  sessions: SessionStat[]
  daily: DailyStat[]
}

export interface StatsSummary {
  totalProjects: number
  totalTokens: number
  totalSessions: number
  totalInputTokens: number
  totalOutputTokens: number
}

export interface StatsData {
  computedAt: string
  version: number
  summary: StatsSummary
  projects: ProjectStat[]
  noData: boolean
  snapshotFile?: string
}

interface RawRecord {
  type?: string
  timestamp?: string
  cwd?: string
  message?: {
    usage?: {
      input_tokens?: number
      output_tokens?: number
      cache_read_input_tokens?: number
      cache_creation_input_tokens?: number
    }
    model?: string
  }
}

export function computeStats(dataDir?: string): StatsData {
  const base = dataDir ?? join(homedir(), '.claude')
  const projectsPath = join(base, 'projects')
  const statLogDir = join(base, 'stat-log')

  mkdirSync(statLogDir, { recursive: true })

  const allProjects: ProjectStat[] = []

  if (existsSync(projectsPath)) {
    let projectDirs: Array<{ path: string; mtime: number }> = []
    try {
      for (const entry of readdirSync(projectsPath)) {
        const fullPath = join(projectsPath, entry)
        try {
          const st = statSync(fullPath)
          if (st.isDirectory()) {
            projectDirs.push({ path: fullPath, mtime: st.mtimeMs })
          }
        } catch { /* skip */ }
      }
    } catch { /* skip */ }

    projectDirs.sort((a, b) => b.mtime - a.mtime)

    for (const { path: projectDir } of projectDirs) {
      let projectCwd: string | null = null
      const sessions: SessionStat[] = []

      let jsonlFiles: Array<{ path: string; mtime: number }> = []
      try {
        for (const entry of readdirSync(projectDir)) {
          if (!entry.endsWith('.jsonl')) continue
          const fullPath = join(projectDir, entry)
          try {
            const st = statSync(fullPath)
            jsonlFiles.push({ path: fullPath, mtime: st.mtimeMs })
          } catch { /* skip */ }
        }
      } catch { /* skip */ }

      jsonlFiles.sort((a, b) => b.mtime - a.mtime)

      for (const { path: jsonlFile } of jsonlFiles) {
        let inT = 0, outT = 0, cacheR = 0, cacheW = 0
        let cwd: string | null = null
        const modelTokens = new Map<string, number>()
        let firstTs: string | null = null
        let lastTs: string | null = null

        try {
          const content = readFileSync(jsonlFile, 'utf-8')
          for (const line of content.split('\n')) {
            const trimmed = line.trim()
            if (!trimmed) continue
            let obj: RawRecord
            try { obj = JSON.parse(trimmed) as RawRecord } catch { continue }

            const ts = obj.timestamp
            if (ts) {
              if (!firstTs) firstTs = ts
              lastTs = ts
            }
            if (obj.type === 'user' && cwd === null) {
              cwd = obj.cwd ?? null
            } else if (obj.type === 'assistant') {
              const usage = obj.message?.usage ?? {}
              const recordModel = obj.message?.model ?? 'unknown'
              const lineTokens =
                (usage.input_tokens ?? 0) +
                (usage.output_tokens ?? 0) +
                (usage.cache_read_input_tokens ?? 0) +
                (usage.cache_creation_input_tokens ?? 0)
              inT    += usage.input_tokens ?? 0
              outT   += usage.output_tokens ?? 0
              cacheR += usage.cache_read_input_tokens ?? 0
              cacheW += usage.cache_creation_input_tokens ?? 0
              // Only track model if there are actual tokens (skip <synthetic>/error records)
              if (lineTokens > 0) {
                modelTokens.set(recordModel, (modelTokens.get(recordModel) ?? 0) + lineTokens)
              }
            }
          }
        } catch { continue }

        const total = inT + outT + cacheR + cacheW
        if (total === 0) continue

        if (projectCwd === null && cwd) projectCwd = cwd

        // Determine primary model: the one with the most tokens in this session
        let model = 'unknown'
        let maxTok = 0
        for (const [m, t] of modelTokens) {
          if (t > maxTok) { maxTok = t; model = m }
        }
        const modelsObj: Record<string, number> = modelTokens.size > 0
          ? Object.fromEntries(modelTokens)
          : { unknown: total }

        const stem = basename(jsonlFile, '.jsonl')
        sessions.push({
          id: stem,
          totalTokens: total,
          inputTokens: inT,
          outputTokens: outT,
          cacheRead: cacheR,
          cacheWrite: cacheW,
          model,
          models: modelsObj,
          date: lastTs ? lastTs.slice(0, 10) : '',
          lastTime: lastTs ? lastTs.slice(0, 16).replace('T', ' ') : '',
        })
      }

      if (sessions.length === 0) continue

      if (projectCwd === null) {
        const dirName = basename(projectDir)
        projectCwd = sep + dirName.replace(/^-/, '').replace(/-/g, sep)
      }
      const projectName = basename(projectCwd)

      // Models map: aggregate per-model tokens across all sessions
      const modelsMap = new Map<string, number>()
      for (const s of sessions) {
        for (const [m, t] of Object.entries(s.models)) {
          modelsMap.set(m, (modelsMap.get(m) ?? 0) + t)
        }
      }

      // Daily map
      const dailyMap = new Map<string, DailyStat>()
      for (const s of sessions) {
        const d = s.date || 'unknown'
        if (!dailyMap.has(d)) {
          dailyMap.set(d, { date: d, total: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 })
        }
        const day = dailyMap.get(d)!
        day.total     += s.totalTokens
        day.input     += s.inputTokens
        day.output    += s.outputTokens
        day.cacheRead += s.cacheRead
        day.cacheWrite += s.cacheWrite
      }
      const daily = [...dailyMap.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([, v]) => v)

      allProjects.push({
        name: projectName,
        path: projectCwd,
        totalTokens: sessions.reduce((s, x) => s + x.totalTokens, 0),
        inputTokens: sessions.reduce((s, x) => s + x.inputTokens, 0),
        outputTokens: sessions.reduce((s, x) => s + x.outputTokens, 0),
        cacheRead: sessions.reduce((s, x) => s + x.cacheRead, 0),
        cacheWrite: sessions.reduce((s, x) => s + x.cacheWrite, 0),
        sessionCount: sessions.length,
        lastActive: sessions[0].lastTime,
        models: Object.fromEntries(modelsMap),
        sessions,
        daily,
      })
    }
  }

  allProjects.sort((a, b) => b.totalTokens - a.totalTokens)

  const now = new Date()
  const computedAt = now.toISOString().slice(0, 19).replace('T', ' ')
  const tsTag = now.toISOString().slice(0, 19).replace(/[-T:]/g, '').replace(' ', '-').slice(0, 15)

  const result: StatsData = {
    computedAt,
    version: 1,
    noData: allProjects.length === 0,
    summary: {
      totalProjects: allProjects.length,
      totalTokens: allProjects.reduce((s, p) => s + p.totalTokens, 0),
      totalSessions: allProjects.reduce((s, p) => s + p.sessionCount, 0),
      totalInputTokens: allProjects.reduce((s, p) => s + p.inputTokens, 0),
      totalOutputTokens: allProjects.reduce((s, p) => s + p.outputTokens, 0),
    },
    projects: allProjects,
  }

  const outFile = join(statLogDir, `stats-${tsTag}.json`)
  writeFileSync(outFile, JSON.stringify(result, null, 0), 'utf-8')

  return result
}

export function loadLatestStats(dataDir?: string): StatsData {
  const base = dataDir ?? join(homedir(), '.claude')
  const statLogDir = join(base, 'stat-log')

  const empty: StatsData = {
    noData: true,
    projects: [],
    summary: { totalProjects: 0, totalTokens: 0, totalSessions: 0, totalInputTokens: 0, totalOutputTokens: 0 },
    computedAt: '',
    version: 1,
  }

  if (!existsSync(statLogDir)) return empty

  let files: Array<{ path: string; mtime: number }> = []
  try {
    for (const entry of readdirSync(statLogDir)) {
      if (!entry.startsWith('stats-') || !entry.endsWith('.json')) continue
      const fullPath = join(statLogDir, entry)
      try {
        const st = statSync(fullPath)
        files.push({ path: fullPath, mtime: st.mtimeMs })
      } catch { /* skip */ }
    }
  } catch { return empty }

  if (files.length === 0) return empty
  files.sort((a, b) => b.mtime - a.mtime)

  try {
    const content = readFileSync(files[0].path, 'utf-8')
    const data = JSON.parse(content) as StatsData
    data.noData = false
    data.snapshotFile = basename(files[0].path)
    return data
  } catch {
    return empty
  }
}

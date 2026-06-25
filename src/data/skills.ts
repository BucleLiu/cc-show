import {
  readdirSync, readFileSync, writeFileSync,
  mkdirSync, statSync, existsSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { join, basename } from 'node:path'

export interface SkillCall {
  skill: string
  args?: string
  timestamp: string
}

export interface SessionSkillsResult {
  sessionId: string
  skills: SkillCall[]
  uniqueNames: string[]
}

export interface SkillProjectStat {
  path: string
  displayName: string
  calls: number
}

export interface SkillAggregate {
  name: string
  totalCalls: number
  projects: SkillProjectStat[]
  firstUsed: string
  lastUsed: string
  dailyCounts: Record<string, number>
}

export interface SkillStatsSummary {
  totalCalls: number
  uniqueSkills: number
  projectCount: number
  topSkill: string | null
}

export interface SkillStatsData {
  skills: SkillAggregate[]
  summary: SkillStatsSummary
  computedAt: string
  noData: boolean
  snapshotFile?: string
}

interface ContentBlock {
  type: string
  name?: string
  input?: {
    skill?: string
    args?: string
  }
}

interface RawRecord {
  type?: string
  timestamp?: string
  cwd?: string
  message?: {
    content?: ContentBlock[]
  }
}

export function loadSessionSkills(
  sessionId: string,
  projectPath: string,
  dataDir?: string,
): SessionSkillsResult {
  const base = dataDir ?? join(homedir(), '.claude')
  const encoded = projectPath.replace(/[/\\:]/g, '-')
  const jsonlPath = join(base, 'projects', encoded, `${sessionId}.jsonl`)

  const empty: SessionSkillsResult = { sessionId, skills: [], uniqueNames: [] }
  if (!existsSync(jsonlPath)) return empty

  const raw = readFileSync(jsonlPath, 'utf-8')
  const skills: SkillCall[] = []

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let obj: RawRecord
    try {
      obj = JSON.parse(trimmed) as RawRecord
    } catch {
      continue
    }
    if (obj.type !== 'assistant') continue
    const content = obj.message?.content
    if (!Array.isArray(content)) continue
    for (const block of content) {
      if (block.type === 'tool_use' && block.name === 'Skill') {
        const skillName = block.input?.skill
        if (skillName) {
          skills.push({
            skill: skillName,
            args: block.input?.args,
            timestamp: obj.timestamp ?? '',
          })
        }
      }
    }
  }

  const namesSet = new Set(skills.map(s => s.skill))
  return { sessionId, skills, uniqueNames: [...namesSet] }
}

export function computeSkillStats(dataDir?: string): SkillStatsData {
  const base = dataDir ?? join(homedir(), '.claude')
  const projectsPath = join(base, 'projects')
  const statLogDir = join(base, 'stat-log')

  mkdirSync(statLogDir, { recursive: true })

  // skill name → aggregate data
  const skillMap = new Map<string, {
    totalCalls: number
    // project dir path → stat
    projectDirs: Map<string, { calls: number; cwd: string | null }>
    firstUsed: string
    lastUsed: string
    dailyCounts: Map<string, number>
  }>()

  const allProjectCwds = new Set<string>()

  if (existsSync(projectsPath)) {
    let projectDirs: Array<{ path: string }> = []
    try {
      for (const entry of readdirSync(projectsPath)) {
        const fullPath = join(projectsPath, entry)
        try {
          if (statSync(fullPath).isDirectory()) {
            projectDirs.push({ path: fullPath })
          }
        } catch { /* skip */ }
      }
    } catch { /* skip */ }

    for (const { path: projectDir } of projectDirs) {
      let projectCwd: string | null = null
      let jsonlFiles: string[] = []
      try {
        for (const entry of readdirSync(projectDir)) {
          if (entry.endsWith('.jsonl')) {
            jsonlFiles.push(join(projectDir, entry))
          }
        }
      } catch { /* skip */ }

      for (const jsonlFile of jsonlFiles) {
        try {
          const content = readFileSync(jsonlFile, 'utf-8')
          for (const line of content.split('\n')) {
            const trimmed = line.trim()
            if (!trimmed) continue
            let obj: RawRecord
            try { obj = JSON.parse(trimmed) as RawRecord } catch { continue }

            // Discover project cwd from first user record
            if (obj.type === 'user' && projectCwd === null && obj.cwd) {
              projectCwd = obj.cwd
            }

            if (obj.type !== 'assistant') continue
            const blocks = obj.message?.content
            if (!Array.isArray(blocks)) continue

            for (const block of blocks) {
              if (block.type === 'tool_use' && block.name === 'Skill') {
                const skillName = block.input?.skill
                if (!skillName) continue

                const ts = obj.timestamp ?? ''
                const dateKey = ts.slice(0, 10) || 'unknown'

                if (!skillMap.has(skillName)) {
                  skillMap.set(skillName, {
                    totalCalls: 0,
                    projectDirs: new Map(),
                    firstUsed: ts,
                    lastUsed: ts,
                    dailyCounts: new Map(),
                  })
                }
                const agg = skillMap.get(skillName)!
                agg.totalCalls++
                if (ts && agg.firstUsed && ts < agg.firstUsed) agg.firstUsed = ts
                if (ts && ts > agg.lastUsed) agg.lastUsed = ts
                agg.dailyCounts.set(dateKey, (agg.dailyCounts.get(dateKey) ?? 0) + 1)

                if (!agg.projectDirs.has(projectDir)) {
                  agg.projectDirs.set(projectDir, { calls: 0, cwd: null })
                }
                agg.projectDirs.get(projectDir)!.calls++
              }
            }
          }
        } catch { continue }
      }

      // Resolve project cwd: use discovered cwd or fall back to dir name heuristic
      if (projectCwd === null) {
        const dirName = basename(projectDir)
        projectCwd = '/' + dirName.replace(/^-/, '').replace(/-/g, '/')
      }
      allProjectCwds.add(projectCwd)

      // Update cwd for all skills that used this project dir
      for (const [, agg] of skillMap) {
        const proj = agg.projectDirs.get(projectDir)
        if (proj) proj.cwd = projectCwd
      }
    }
  }

  // Build final SkillAggregate list
  const skills: SkillAggregate[] = []
  for (const [name, agg] of skillMap) {
    const projects: SkillProjectStat[] = []
    for (const [projectDir, proj] of agg.projectDirs) {
      const cwd = proj.cwd ?? projectDir
      projects.push({
        path: cwd,
        displayName: basename(cwd),
        calls: proj.calls,
      })
    }
    projects.sort((a, b) => b.calls - a.calls)

    const dailyCounts: Record<string, number> = {}
    for (const [d, c] of agg.dailyCounts) {
      dailyCounts[d] = c
    }

    skills.push({
      name,
      totalCalls: agg.totalCalls,
      projects,
      firstUsed: agg.firstUsed.slice(0, 10),
      lastUsed: agg.lastUsed.slice(0, 10),
      dailyCounts,
    })
  }
  skills.sort((a, b) => b.totalCalls - a.totalCalls)

  const now = new Date()
  const computedAt = now.toISOString().slice(0, 19).replace('T', ' ')
  const tsTag = now.toISOString().slice(0, 19).replace(/[-T:]/g, '').slice(0, 15)

  // Count projects that actually had skill usage
  const projectsWithSkills = new Set<string>()
  for (const s of skills) {
    for (const p of s.projects) projectsWithSkills.add(p.path)
  }

  const result: SkillStatsData = {
    skills,
    summary: {
      totalCalls: skills.reduce((s, x) => s + x.totalCalls, 0),
      uniqueSkills: skills.length,
      projectCount: projectsWithSkills.size,
      topSkill: skills[0]?.name ?? null,
    },
    computedAt,
    noData: skills.length === 0,
  }

  const outFile = join(statLogDir, `skills-${tsTag}.json`)
  writeFileSync(outFile, JSON.stringify(result, null, 0), 'utf-8')
  return result
}

export function loadLatestSkillStats(dataDir?: string): SkillStatsData {
  const base = dataDir ?? join(homedir(), '.claude')
  const statLogDir = join(base, 'stat-log')

  const empty: SkillStatsData = {
    noData: true,
    skills: [],
    summary: { totalCalls: 0, uniqueSkills: 0, projectCount: 0, topSkill: null },
    computedAt: '',
  }

  if (!existsSync(statLogDir)) return empty

  let files: Array<{ path: string; mtime: number }> = []
  try {
    for (const entry of readdirSync(statLogDir)) {
      if (!entry.startsWith('skills-') || !entry.endsWith('.json')) continue
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
    const data = JSON.parse(content) as SkillStatsData
    data.noData = false
    data.snapshotFile = basename(files[0].path)
    return data
  } catch {
    return empty
  }
}

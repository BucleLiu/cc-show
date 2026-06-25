import { readFileSync, existsSync } from 'node:fs'
import { execFile, execFileSync } from 'node:child_process'
import { homedir } from 'node:os'
import { join, basename } from 'node:path'

export interface HistoryMessage {
  display: string
  timestamp: number
  isSlash: boolean
  hasPaste: boolean
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

export interface HistorySession {
  id: string
  project: string
  projectName: string
  messageCount: number
  firstTime: number
  lastTime: number
  summary: string
  messages: HistoryMessage[]
}

export interface HistoryProject {
  path: string
  name: string
  messageCount: number
  sessionCount: number
  lastActive: number
  activityLevel: 'active' | 'recent' | 'old'
}

export interface HistoryData {
  projects: HistoryProject[]
  sessions: HistorySession[]
  stats: {
    totalMessages: number
    totalSessions: number
    totalProjects: number
  }
}

interface RawRecord {
  sessionId?: string
  project?: string
  timestamp?: number
  display?: string
  pastedContents?: unknown
}

export interface ConversationResult {
  messages: ConversationMessage[]
  path: string
}

export interface HistorySearchResult {
  fallback: boolean
  sessionIds: string[]
}

type ContentBlock = { type: string; text?: string; thinking?: string; input?: unknown }

export function loadSessionConversation(
  sessionId: string,
  projectPath: string,
  dataDir?: string,
): ConversationResult {
  const base = dataDir ?? join(homedir(), '.claude')
  // Claude encodes project path by replacing path separators and colons with '-'
  const encoded = projectPath.replace(/[/\\:]/g, '-')
  const jsonlPath = join(base, 'projects', encoded, `${sessionId}.jsonl`)

  if (!existsSync(jsonlPath)) return { messages: [], path: jsonlPath }

  const raw = readFileSync(jsonlPath, 'utf-8')
  const messages: ConversationMessage[] = []

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let obj: Record<string, unknown>
    try {
      obj = JSON.parse(trimmed) as Record<string, unknown>
    } catch {
      continue
    }

    const type = obj.type as string | undefined
    const msg = obj.message as Record<string, unknown> | undefined
    const ts = (obj.timestamp as string | undefined) ?? ''

    if (type === 'user' && msg) {
      const content = msg.content
      let text = ''
      if (typeof content === 'string') {
        text = content
      } else if (Array.isArray(content)) {
        // Pick text blocks only; skip tool_result
        const parts: string[] = []
        for (const c of content as ContentBlock[]) {
          if (c.type === 'text' && typeof c.text === 'string') {
            parts.push(c.text)
          }
        }
        text = parts.join('\n').trim()
      }
      // Skip system/internal messages
      if (
        text &&
        !text.startsWith('<local-command-caveat>') &&
        !text.startsWith('<command-name>') &&
        !text.startsWith('<local-command-stdout>')
      ) {
        messages.push({ role: 'user', text, timestamp: ts })
      }
    } else if (type === 'assistant' && msg) {
      const content = msg.content
      if (Array.isArray(content)) {
        const parts: string[] = []
        for (const c of content as ContentBlock[]) {
          if (c.type === 'text' && typeof c.text === 'string') {
            parts.push(c.text)
          }
        }
        const text = parts.join('\n').trim()
        if (text) {
          messages.push({ role: 'assistant', text, timestamp: ts })
        }
      }
    }
  }

  return { messages, path: jsonlPath }
}

export function loadHistory(dataDir?: string): HistoryData {
  const base = dataDir ?? join(homedir(), '.claude')
  const historyPath = join(base, 'history.jsonl')

  const empty: HistoryData = {
    projects: [],
    sessions: [],
    stats: { totalMessages: 0, totalSessions: 0, totalProjects: 0 },
  }

  if (!existsSync(historyPath)) return empty

  const records: RawRecord[] = []
  const raw = readFileSync(historyPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      records.push(JSON.parse(trimmed) as RawRecord)
    } catch {
      // skip malformed lines
    }
  }

  const nowMs = Date.now()
  const sevenDaysMs = 7 * 24 * 3600 * 1000
  const thirtyDaysMs = 30 * 24 * 3600 * 1000

  // Group by sessionId
  const sessionsMap = new Map<string, RawRecord[]>()
  for (const r of records) {
    const sid = r.sessionId ?? 'unknown'
    if (!sessionsMap.has(sid)) sessionsMap.set(sid, [])
    sessionsMap.get(sid)!.push(r)
  }

  // Filter out sessions that contain only "exit" user input
  for (const [sid, msgs] of sessionsMap) {
    const allTrivial = msgs.every(m => {
      const d = (m.display ?? '').trim()
      return d === '' || d === 'exit'
    })
    if (allTrivial) {
      sessionsMap.delete(sid)
    }
  }

  // Build projects map
  const projectsMap = new Map<string, { messages: number; sessions: Set<string>; lastActive: number }>()
  for (const [sid, msgs] of sessionsMap) {
    const proj = msgs[0]?.project ?? 'unknown'
    if (!projectsMap.has(proj)) {
      projectsMap.set(proj, { messages: 0, sessions: new Set(), lastActive: 0 })
    }
    const pd = projectsMap.get(proj)!
    pd.messages += msgs.length
    pd.sessions.add(sid)
    const maxTs = Math.max(...msgs.map(m => m.timestamp ?? 0))
    if (maxTs > pd.lastActive) pd.lastActive = maxTs
  }

  const projects: HistoryProject[] = []
  for (const [path, data] of projectsMap) {
    const age = nowMs - data.lastActive
    const activityLevel: HistoryProject['activityLevel'] =
      age < sevenDaysMs ? 'active' : age < thirtyDaysMs ? 'recent' : 'old'
    projects.push({
      path,
      name: basename(path),
      messageCount: data.messages,
      sessionCount: data.sessions.size,
      lastActive: data.lastActive,
      activityLevel,
    })
  }
  projects.sort((a, b) => b.lastActive - a.lastActive)

  // Build sessions list
  const sessions: HistorySession[] = []
  for (const [sid, msgs] of sessionsMap) {
    const sorted = [...msgs].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    const proj = sorted[0]?.project ?? 'unknown'

    let summary = ''
    for (const m of sorted) {
      const d = (m.display ?? '').trim()
      if (d && !d.startsWith('/')) {
        summary = d.slice(0, 80)
        break
      }
    }
    if (!summary && sorted.length > 0) {
      summary = (sorted[0].display ?? '').slice(0, 80)
    }

    const messages: HistoryMessage[] = sorted.map(m => ({
      display: m.display ?? '',
      timestamp: m.timestamp ?? 0,
      isSlash: (m.display ?? '').trim().startsWith('/'),
      hasPaste: Boolean(m.pastedContents),
    }))

    sessions.push({
      id: sid,
      project: proj,
      projectName: basename(proj),
      messageCount: msgs.length,
      firstTime: sorted[0]?.timestamp ?? 0,
      lastTime: sorted[sorted.length - 1]?.timestamp ?? 0,
      summary,
      messages,
    })
  }
  sessions.sort((a, b) => b.lastTime - a.lastTime)

  return {
    projects,
    sessions,
    stats: {
      totalMessages: records.length,
      totalSessions: sessions.length,
      totalProjects: projects.length,
    },
  }
}

// rg 可用性探测结果缓存（进程级）
let rgAvailable: boolean | null = null

function isRgAvailable(): boolean {
  if (rgAvailable !== null) return rgAvailable
  try {
    execFileSync('rg', ['--version'], { stdio: ['ignore', 'pipe', 'ignore'] })
    rgAvailable = true
  } catch {
    rgAvailable = false
  }
  return rgAvailable
}

export async function searchSessionsByContent(
  kw: string,
  projectPath: string,
  dataDir?: string,
): Promise<HistorySearchResult> {
  const empty: HistorySearchResult = { fallback: false, sessionIds: [] }
  if (!kw) return empty

  if (!isRgAvailable()) {
    return { fallback: true, sessionIds: [] }
  }

  const base = dataDir ?? join(homedir(), '.claude')
  const dir = projectPath
    ? join(base, 'projects', projectPath.replace(/[/\\:]/g, '-'))
    : join(base, 'projects')

  return new Promise((resolve) => {
    // -l 只输出命中文件路径；-i 忽略大小写；-F 字面匹配（非正则）；-- 分隔符防关键词被当选项
    execFile('rg', ['-l', '-i', '-F', '--', kw, dir], { timeout: 10000 }, (err, stdout) => {
      if (err) {
        const code = (err as NodeJS.ErrnoException & { code?: number }).code
        // 退出码 1 = 无匹配，属正常；其他码/异常退回旧逻辑
        if (code === 1) {
          resolve({ fallback: false, sessionIds: [] })
          return
        }
        resolve({ fallback: true, sessionIds: [] })
        return
      }
      const sessionIds = stdout
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => basename(l).replace(/\.jsonl$/, ''))
      resolve({ fallback: false, sessionIds })
    })
  })
}

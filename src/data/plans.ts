import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, basename, extname } from 'node:path'

export interface Plan {
  filename: string
  title: string
  modified: number  // unix timestamp (seconds)
  size: number      // bytes
  preview: string
  content: string
  path: string      // 完整文件路径
  sessionId: string | null  // 从文件名提取的会话 ID，可能为空
}

export interface PlansData {
  plans: Plan[]
  stats: {
    total: number
    totalSize: number
    newest: string | null
    oldest: string | null
  }
}

/**
 * 从计划文件名中提取会话 ID。
 * 文件名模式: ...-agent-<hex_string>.md  → 返回 <hex_string>
 * 未匹配到时返回 null。
 */
function extractSessionId(filename: string): string | null {
  // 匹配 -agent-<hex_id>.md 模式，agent 的会话 ID 为至少 16 位 hex
  const m = filename.match(/-agent-([a-f0-9]{16,})\.md$/i)
  return m ? m[1] : null
}

export function loadPlans(dataDir?: string): PlansData {
  const base = dataDir ?? join(homedir(), '.claude')
  const plansPath = join(base, 'plans')

  if (!existsSync(plansPath)) {
    return { plans: [], stats: { total: 0, totalSize: 0, newest: null, oldest: null } }
  }

  const mdFiles: Array<{ path: string; mtime: number }> = []
  try {
    for (const entry of readdirSync(plansPath)) {
      if (extname(entry).toLowerCase() !== '.md') continue
      const fullPath = join(plansPath, entry)
      try {
        const st = statSync(fullPath)
        mdFiles.push({ path: fullPath, mtime: st.mtimeMs / 1000 })
      } catch {
        // skip unreadable
      }
    }
  } catch {
    return { plans: [], stats: { total: 0, totalSize: 0, newest: null, oldest: null } }
  }

  // Sort by mtime descending
  mdFiles.sort((a, b) => b.mtime - a.mtime)

  const plans: Plan[] = []
  let totalSize = 0

  for (const { path: filePath, mtime } of mdFiles) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const st = statSync(filePath)
      const size = st.size
      totalSize += size

      // Extract title from first H1
      let title: string | null = null
      for (const line of content.split('\n')) {
        const stripped = line.trim()
        if (stripped.startsWith('# ')) {
          title = stripped.slice(2).trim()
          break
        }
      }
      if (!title) {
        const stem = basename(filePath, '.md')
        title = stem
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
      }

      // Extract preview (first non-empty, non-heading, non-separator line outside code blocks)
      let preview = ''
      let inCode = false
      for (const line of content.split('\n')) {
        if (line.startsWith('```')) {
          inCode = !inCode
          continue
        }
        if (inCode) continue
        const stripped = line.trim()
        if (stripped && !stripped.startsWith('#') && stripped !== '---') {
          preview = stripped.slice(0, 120)
          break
        }
      }

      plans.push({
        filename: basename(filePath),
        title,
        modified: mtime,
        size,
        preview,
        content,
        path: filePath,
        sessionId: extractSessionId(basename(filePath)),
      })
    } catch {
      // skip unreadable files
    }
  }

  return {
    plans,
    stats: {
      total: plans.length,
      totalSize,
      newest: plans.length > 0 ? plans[0].filename : null,
      oldest: plans.length > 0 ? plans[plans.length - 1].filename : null,
    },
  }
}

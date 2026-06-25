import {
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { PROXY_LOGS_DIR, REQUESTS_JSONL_PATH, EXPORTS_DIR } from '../proxy/server.js'

// ── PID ──────────────────────────────────────────────────────────────────────

export const PROXY_PID_FILE = join(homedir(), '.ccs', 'proxy.pid')

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProxyRequestSummary {
  id:                     string
  timestamp:              string
  model:                  string
  stream:                 boolean
  system_tokens_estimate: number
  messages_count:         number
  tools_count:            number
}

export interface ProxyRequestDetail extends ProxyRequestSummary {
  method: string
  path:   string
  body:   Record<string, unknown>
}

export interface ProxyRequestList {
  requests: ProxyRequestSummary[]
  total:    number
}

export interface ProxyStatus {
  running:      boolean
  port:         number | null
  pid:          number | null
  requestCount: number
  logSize:      number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseJsonlLines(): ProxyRequestDetail[] {
  if (!existsSync(REQUESTS_JSONL_PATH)) return []
  const raw = readFileSync(REQUESTS_JSONL_PATH, 'utf-8')
  const records: ProxyRequestDetail[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      records.push(JSON.parse(trimmed) as ProxyRequestDetail)
    } catch {
      // skip malformed lines
    }
  }
  return records
}

function readProxyPid(): number | undefined {
  if (!existsSync(PROXY_PID_FILE)) return undefined
  try {
    const pid = parseInt(readFileSync(PROXY_PID_FILE, 'utf-8').trim(), 10)
    if (isNaN(pid)) return undefined
    process.kill(pid, 0)
    return pid
  } catch {
    return undefined
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export function loadProxyRequests(opts?: {
  limit?: number
  offset?: number
  model?: string
}): ProxyRequestList {
  const limit = Math.min(opts?.limit ?? 200, 1000)
  const offset = opts?.offset ?? 0
  const modelFilter = opts?.model?.toLowerCase()

  let records = parseJsonlLines()

  // Filter by model
  if (modelFilter) {
    records = records.filter((r) => r.model.toLowerCase().includes(modelFilter))
  }

  const total = records.length

  // Sort by timestamp descending (newest first)
  records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Paginate
  const sliced = records.slice(offset, offset + limit)

  // Strip body for summary
  const requests: ProxyRequestSummary[] = sliced.map(
    ({ id, timestamp, model, stream, system_tokens_estimate, messages_count, tools_count }) => ({
      id,
      timestamp,
      model,
      stream,
      system_tokens_estimate,
      messages_count,
      tools_count,
    }),
  )

  return { requests, total }
}

export function loadProxyRequestById(id: string): ProxyRequestDetail | null {
  const records = parseJsonlLines()
  return records.find((r) => r.id === id) ?? null
}

export function exportProxyRequest(id: string): string {
  const record = loadProxyRequestById(id)
  if (!record) throw new Error(`Request not found: ${id}`)

  mkdirSync(EXPORTS_DIR, { recursive: true })
  const filePath = join(EXPORTS_DIR, `${id}.json`)
  writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8')
  return filePath
}

export function getProxyStatus(): ProxyStatus {
  const pid = readProxyPid()
  let requestCount = 0
  let logSize = 0

  if (existsSync(REQUESTS_JSONL_PATH)) {
    const stat = statSync(REQUESTS_JSONL_PATH)
    logSize = stat.size
    // Count lines efficiently
    const raw = readFileSync(REQUESTS_JSONL_PATH, 'utf-8')
    requestCount = raw.split('\n').filter((l) => l.trim()).length
  }

  // Read port from config
  let port: number | null = null
  if (pid !== undefined) {
    try {
      const { loadConfig } = require('../config.js') as typeof import('../config.js')
      port = loadConfig().proxy.port
    } catch {
      port = null
    }
  }

  return {
    running: pid !== undefined,
    port,
    pid: pid ?? null,
    requestCount,
    logSize,
  }
}

export function clearProxyLogs(): { requestsCleared: number; exportsCleared: number } {
  let requestsCleared = 0
  let exportsCleared = 0

  // Truncate JSONL (don't delete — avoids race with running proxy)
  if (existsSync(REQUESTS_JSONL_PATH)) {
    const raw = readFileSync(REQUESTS_JSONL_PATH, 'utf-8')
    requestsCleared = raw.split('\n').filter((l) => l.trim()).length
    writeFileSync(REQUESTS_JSONL_PATH, '', 'utf-8')
  }

  // Delete all exports
  if (existsSync(EXPORTS_DIR)) {
    const files = readdirSync(EXPORTS_DIR)
    for (const f of files) {
      try {
        unlinkSync(join(EXPORTS_DIR, f))
        exportsCleared++
      } catch {
        // skip
      }
    }
  }

  return { requestsCleared, exportsCleared }
}

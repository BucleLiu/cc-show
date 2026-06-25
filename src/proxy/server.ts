import * as http from 'node:http'
import * as https from 'node:https'
import { URL } from 'node:url'
import { appendFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

// ── Paths ────────────────────────────────────────────────────────────────────

export const PROXY_LOGS_DIR = join(homedir(), '.ccs', 'proxy-logs')
export const REQUESTS_JSONL_PATH = join(PROXY_LOGS_DIR, 'requests.jsonl')
export const EXPORTS_DIR = join(PROXY_LOGS_DIR, 'exports')

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProxyServerOptions {
  port: number
  upstream: string
}

// ── ID generation ────────────────────────────────────────────────────────────

let lastTimestamp = 0
let counter = 0

function generateRequestId(): string {
  const now = Date.now()
  if (now === lastTimestamp) {
    counter++
    return `req_${now}-${counter}`
  }
  lastTimestamp = now
  counter = 0
  return `req_${now}`
}

// ── System text extraction ───────────────────────────────────────────────────

function extractSystemText(system: unknown): string {
  if (typeof system === 'string') return system
  if (Array.isArray(system)) {
    return system
      .filter((b: Record<string, unknown>) => b.type === 'text' && typeof b.text === 'string')
      .map((b: Record<string, unknown>) => b.text as string)
      .join('\n')
  }
  return ''
}

// ── Request logging ──────────────────────────────────────────────────────────

export function logRequest(bodyBuffer: Buffer): void {
  try {
    const parsed = JSON.parse(bodyBuffer.toString('utf-8')) as Record<string, unknown>
    const systemText = extractSystemText(parsed.system)

    const record = {
      id: generateRequestId(),
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/v1/messages',
      model: (parsed.model as string) ?? 'unknown',
      stream: (parsed.stream as boolean) ?? false,
      system_tokens_estimate: Math.ceil(systemText.length / 4),
      messages_count: Array.isArray(parsed.messages) ? parsed.messages.length : 0,
      tools_count: Array.isArray(parsed.tools) ? parsed.tools.length : 0,
      body: parsed,
    }

    mkdirSync(PROXY_LOGS_DIR, { recursive: true })
    appendFileSync(REQUESTS_JSONL_PATH, JSON.stringify(record) + '\n')
  } catch {
    // Silently skip malformed requests — don't break the proxy
  }
}

// ── Proxy request handler ────────────────────────────────────────────────────

function handleProxyRequest(
  clientReq: http.IncomingMessage,
  clientRes: http.ServerResponse,
  upstream: string,
): void {
  const bodyChunks: Buffer[] = []

  clientReq.on('data', (chunk: Buffer) => {
    bodyChunks.push(chunk)
  })

  clientReq.on('end', () => {
    const bodyBuffer = Buffer.concat(bodyChunks)

    // Log only POST /v1/messages
    if (clientReq.method === 'POST' && clientReq.url === '/v1/messages') {
      logRequest(bodyBuffer)
    }

    // Forward to upstream
    const upstreamUrl = new URL(upstream)
    const isHttps = upstreamUrl.protocol === 'https:'
    const transport = isHttps ? https : http

    const fwdHeaders: Record<string, string | string[] | undefined> = { ...clientReq.headers }
    fwdHeaders['host'] = upstreamUrl.host
    delete fwdHeaders['connection']
    delete fwdHeaders['keep-alive']

    const proxyReq = transport.request(
      {
        hostname: upstreamUrl.hostname,
        port: upstreamUrl.port || (isHttps ? 443 : 80),
        path: clientReq.url,
        method: clientReq.method,
        headers: fwdHeaders,
      },
      (proxyRes) => {
        // Pass status + headers through verbatim
        clientRes.writeHead(proxyRes.statusCode!, proxyRes.headers)
        // Pipe the response (handles SSE streaming, chunked transfer, backpressure)
        proxyRes.pipe(clientRes)
      },
    )

    proxyReq.on('error', (err) => {
      if (!clientRes.headersSent) {
        clientRes.writeHead(502, { 'content-type': 'application/json' })
      }
      clientRes.end(JSON.stringify({ error: 'Bad Gateway', message: err.message }))
    })

    // Send buffered request body to upstream
    proxyReq.end(bodyBuffer)
  })

  clientReq.on('error', () => {
    // Client disconnected — nothing to do
  })
}

// ── Server lifecycle ─────────────────────────────────────────────────────────

export function startProxyServer(opts: ProxyServerOptions): Promise<number> {
  return new Promise((resolve, reject) => {
    const { port, upstream } = opts

    // Ensure logs directory exists
    mkdirSync(PROXY_LOGS_DIR, { recursive: true })

    const server = http.createServer((req, res) => {
      // CORS for dev convenience
      res.setHeader('Access-Control-Allow-Origin', '*')
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', '*')
        res.writeHead(204)
        res.end()
        return
      }
      handleProxyRequest(req, res, upstream)
    })

    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address()
      const actualPort = typeof addr === 'object' && addr ? addr.port : port
      resolve(actualPort)
    })

    const shutdown = () => {
      server.close(() => process.exit(0))
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  })
}

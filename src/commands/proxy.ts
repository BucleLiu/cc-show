import { spawn } from 'node:child_process'
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs'
import pc from 'picocolors'
import { findFreePort } from '../server/index.js'
import { loadConfig, CCS_DIR } from '../config.js'
import { PROXY_PID_FILE, getProxyStatus, clearProxyLogs } from '../data/proxy.js'

// ── PID helpers ──────────────────────────────────────────────────────────────

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

// ── Proxy Start Options ──────────────────────────────────────────────────────

export interface ProxyStartOptions {
  port?:     number
  upstream?: string
  foreground?: boolean
}

// ── ccs proxy start ──────────────────────────────────────────────────────────

export async function runProxyStart(opts: ProxyStartOptions = {}): Promise<void> {
  // Foreground mode: actual proxy logic (spawned as daemon)
  if (opts.foreground) {
    await runProxyForeground(opts)
    return
  }

  const cfg = loadConfig()
  const desiredPort = opts.port ?? cfg.proxy.port
  const upstream = opts.upstream ?? cfg.proxy.upstream

  // Check if already running
  const existingPid = readProxyPid()
  if (existingPid !== undefined) {
    console.log(pc.yellow(`Proxy is already running (PID ${existingPid})`))
    console.log(pc.dim(`  Stop it first with: ccs proxy stop`))
    process.exit(1)
  }

  // Find a free port
  let port: number
  try {
    port = await findFreePort(desiredPort)
  } catch {
    port = desiredPort
  }

  if (port !== desiredPort) {
    console.log(pc.yellow(`Port ${desiredPort} is in use, using ${port} instead`))
  }

  // Spawn detached daemon
  const script = process.argv[1]
  const args = [
    'proxy', 'start',
    '--foreground',
    '--port', String(port),
    '--upstream', upstream,
  ]

  const child = spawn(process.execPath, [script, ...args], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  })

  child.unref()

  const pid = child.pid!
  writeFileSync(PROXY_PID_FILE, String(pid), 'utf-8')

  const url = `http://localhost:${port}`
  console.log()
  console.log(`  ${pc.bold(pc.cyan('cc-show proxy'))}  ${pc.dim('▸')}  ${pc.bold(pc.underline(url))}`)
  console.log()
  console.log(`  ${pc.dim('Upstream:')}     ${pc.dim(upstream)}`)
  console.log(`  ${pc.dim('Log:')}          ${pc.dim('~/.ccs/proxy-logs/requests.jsonl')}`)
  console.log(`  ${pc.dim('PID:')} ${pc.dim(String(pid))}  ${pc.dim('|')}  ${pc.dim('Stop with:')} ${pc.bold('ccs proxy stop')}`)
  console.log()
  console.log(pc.dim('  To use with Claude Code, add to ~/.claude/settings.json env:'))
  console.log(`  ${pc.cyan(`"ANTHROPIC_BASE_URL": "${url}"`)}`)
  console.log()
}

async function runProxyForeground(opts: ProxyStartOptions): Promise<void> {
  const cfg = loadConfig()
  const port = opts.port ?? cfg.proxy.port
  const upstream = opts.upstream ?? cfg.proxy.upstream

  writeFileSync(PROXY_PID_FILE, String(process.pid), 'utf-8')

  const cleanup = () => {
    try {
      if (existsSync(PROXY_PID_FILE)) {
        const stored = parseInt(readFileSync(PROXY_PID_FILE, 'utf-8').trim(), 10)
        if (stored === process.pid) unlinkSync(PROXY_PID_FILE)
      }
    } catch { /* ignore */ }
  }
  process.on('SIGINT', () => { cleanup(); process.exit(0) })
  process.on('SIGTERM', () => { cleanup(); process.exit(0) })

  try {
    const { startProxyServer } = await import('../proxy/server.js')
    await startProxyServer({ port, upstream })
    // Keep alive
    await new Promise<void>(() => {})
  } catch (err) {
    cleanup()
    console.error(pc.red(`Proxy failed to start: ${String(err)}`))
    process.exit(1)
  }
}

// ── ccs proxy stop ───────────────────────────────────────────────────────────

export function runProxyStop(): void {
  const pid = readProxyPid()

  if (pid === undefined) {
    if (existsSync(PROXY_PID_FILE)) {
      unlinkSync(PROXY_PID_FILE)
      console.log(pc.yellow('No running proxy found (stale PID file removed)'))
    } else {
      console.log(pc.yellow('No running proxy found'))
    }
    process.exit(0)
  }

  try {
    process.kill(pid, 'SIGTERM')
    if (existsSync(PROXY_PID_FILE)) unlinkSync(PROXY_PID_FILE)
    console.log(`${pc.green('Stopped')} proxy ${pc.dim(`(PID ${pid})`)}`)
  } catch (err) {
    console.error(pc.red(`Failed to stop proxy ${pid}: ${String(err)}`))
    process.exit(1)
  }
}

// ── ccs proxy status ─────────────────────────────────────────────────────────

export function runProxyStatus(): void {
  const status = getProxyStatus()

  console.log()
  if (status.running) {
    console.log(`  ${pc.bold('Proxy status:')}  ${pc.green('● Running')}`)
    console.log(`  ${pc.bold('Port:')}          ${pc.cyan(String(status.port))}`)
    console.log(`  ${pc.bold('PID:')}           ${pc.dim(String(status.pid))}`)
    const cfg = loadConfig()
    console.log(`  ${pc.bold('Upstream:')}      ${pc.dim(cfg.proxy.upstream)}`)
  } else {
    console.log(`  ${pc.bold('Proxy status:')}  ${pc.dim('○ Not running')}`)
  }
  console.log(`  ${pc.bold('Requests:')}      ${pc.cyan(String(status.requestCount))}`)
  const sizeMb = (status.logSize / (1024 * 1024)).toFixed(1)
  console.log(`  ${pc.bold('Log size:')}      ${pc.dim(`${sizeMb} MB`)}`)
  console.log()

  if (!status.running) {
    console.log(pc.dim('  Start with: ccs proxy start'))
    console.log()
  }
}

// ── ccs proxy clear ──────────────────────────────────────────────────────────

export function runProxyClear(): void {
  const result = clearProxyLogs()
  console.log(`${pc.green('Cleared')} ${result.requestsCleared} requests, ${result.exportsCleared} exports`)
}

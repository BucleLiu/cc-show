import { spawn } from 'node:child_process'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import pc from 'picocolors'
import { findFreePort, startServer } from '../server/index.js'
import { loadConfig, CCS_DIR } from '../config.js'

export const PID_FILE = join(CCS_DIR, 'server.pid')

export interface StartOptions {
  port?: number
  dataDir?: string
  /** Internal flag: run in foreground (daemon child process) */
  foreground?: boolean
}

/** Read the PID stored in the PID file, or undefined if none / stale. */
export function readPid(): number | undefined {
  if (!existsSync(PID_FILE)) return undefined
  try {
    const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10)
    if (isNaN(pid)) return undefined
    // Check if process is still alive
    process.kill(pid, 0)
    return pid
  } catch {
    return undefined
  }
}

export async function runStart(opts: StartOptions = {}): Promise<void> {
  // ── Foreground mode: actual server logic (spawned as daemon) ──────────────
  if (opts.foreground) {
    await runForeground(opts)
    return
  }

  // ── Background mode: spawn detached child and exit ────────────────────────
  const cfg = loadConfig()
  const desiredPort = opts.port ?? cfg.port
  const dataDir = opts.dataDir ?? cfg.dataDir

  // Check if already running
  const existingPid = readPid()
  if (existingPid !== undefined) {
    console.log(pc.yellow(`ccs is already running (PID ${existingPid})`))
    console.log(pc.dim(`  Stop it first with: ccs stop`))
    process.exit(1)
  }

  // Find a free port before spawning so we can print the URL immediately
  let port: number
  try {
    port = await findFreePort(desiredPort)
  } catch {
    port = desiredPort
  }

  if (port !== desiredPort) {
    console.log(pc.yellow(`Port ${desiredPort} is in use, using ${port} instead`))
  }

  // Resolve the entry point of the current process
  const script = process.argv[1]

  const args = ['--foreground', '--port', String(port), '--data-dir', dataDir]

  const child = spawn(process.execPath, [script, 'start', ...args], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  })

  child.unref()

  const pid = child.pid!
  writeFileSync(PID_FILE, String(pid), 'utf-8')

  const url = `http://localhost:${port}`
  console.log()
  console.log(`  ${pc.bold(pc.cyan('cc-show'))}  ${pc.dim('▸')}  ${pc.bold(pc.underline(url))}`)
  console.log()
  console.log(`  ${pc.dim('Data directory:')} ${pc.dim(dataDir)}`)
  console.log(`  ${pc.dim('PID:')} ${pc.dim(String(pid))}  ${pc.dim('|')}  ${pc.dim('Stop with:')} ${pc.bold('ccs stop')}`)
  console.log()
}

async function runForeground(opts: StartOptions): Promise<void> {
  const cfg = loadConfig()
  const port = opts.port ?? cfg.port
  const dataDir = opts.dataDir ?? cfg.dataDir

  // Write PID (overwrite to ensure it matches)
  writeFileSync(PID_FILE, String(process.pid), 'utf-8')

  // Clean up PID file on exit
  const cleanup = () => {
    try {
      if (existsSync(PID_FILE)) {
        const stored = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10)
        if (stored === process.pid) {
          const { unlinkSync } = require('node:fs') as typeof import('node:fs')
          unlinkSync(PID_FILE)
        }
      }
    } catch { /* ignore */ }
  }
  process.on('SIGINT', () => { cleanup(); process.exit(0) })
  process.on('SIGTERM', () => { cleanup(); process.exit(0) })

  try {
    await startServer({ port, dataDir })
    // Keep process alive
    await new Promise<void>(() => {})
  } catch (err) {
    cleanup()
    process.exit(1)
  }
}

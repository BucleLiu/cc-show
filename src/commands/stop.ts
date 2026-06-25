import { unlinkSync, existsSync } from 'node:fs'
import pc from 'picocolors'
import { PID_FILE, readPid } from './start.js'

export function runStop(): void {
  const pid = readPid()

  if (pid === undefined) {
    // Check if PID file exists but process is gone (stale)
    if (existsSync(PID_FILE)) {
      unlinkSync(PID_FILE)
      console.log(pc.yellow('No running ccs process found (stale PID file removed)'))
    } else {
      console.log(pc.yellow('No running ccs process found'))
    }
    process.exit(0)
  }

  try {
    process.kill(pid, 'SIGTERM')
    // Remove PID file
    if (existsSync(PID_FILE)) unlinkSync(PID_FILE)
    console.log(`${pc.green('Stopped')} ccs server ${pc.dim(`(PID ${pid})`)}`)
  } catch (err) {
    console.error(pc.red(`Failed to stop process ${pid}: ${String(err)}`))
    process.exit(1)
  }
}

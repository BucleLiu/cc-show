import { Command } from 'commander'

// Injected at build time by tsup `define`, so the version is always baked into
// the bundle and never relies on reading package.json at runtime.
declare const __PACKAGE_VERSION__: string

const program = new Command()

program
  .name('ccs')
  .description('Local web dashboard for visualizing Claude Code data files')
  .version(__PACKAGE_VERSION__, '-v, --version', 'output the current version')

// ── ccs start ─────────────────────────────────────────────────────────────────
program
  .command('start', { isDefault: true })
  .description('Start the cc-show web server in the background')
  .option('-p, --port <number>', 'port to listen on (default: config port or 8765)')
  .option('--data-dir <path>', 'path to Claude data directory (default: ~/.claude)')
  .option('--foreground', '(internal) run server in foreground as daemon child')
  .action(async (opts: { port?: string; dataDir?: string; foreground?: boolean }) => {
    const { runStart } = await import('./commands/start.js')
    await runStart({
      port: opts.port ? parseInt(opts.port, 10) : undefined,
      dataDir: opts.dataDir,
      foreground: opts.foreground,
    })
  })

// ── ccs stop ──────────────────────────────────────────────────────────────────
program
  .command('stop')
  .description('Stop the running cc-show web server')
  .action(async () => {
    const { runStop } = await import('./commands/stop.js')
    runStop()
  })

// ── ccs stats ─────────────────────────────────────────────────────────────────
program
  .command('stats')
  .description('Print token usage statistics in the terminal')
  .option('-c, --compute', 'recompute stats by scanning ~/.claude/projects/')
  .option('--data-dir <path>', 'path to Claude data directory')
  .option('--json', 'output raw JSON')
  .action(async (opts: { compute?: boolean; dataDir?: string; json?: boolean }) => {
    const { runStats } = await import('./commands/stats.js')
    runStats(opts)
  })

// ── ccs config ────────────────────────────────────────────────────────────────
const config = program
  .command('config')
  .description('Manage ccs configuration (~/.ccs.json)')
  .action(async () => {
    const { runConfigList } = await import('./commands/config.js')
    runConfigList()
  })

config
  .command('get <key>')
  .description('Get a config value')
  .action(async (key: string) => {
    const { runConfigGet } = await import('./commands/config.js')
    runConfigGet(key)
  })

config
  .command('set <key> <value>')
  .description('Set a config value')
  .action(async (key: string, value: string) => {
    const { runConfigSet } = await import('./commands/config.js')
    runConfigSet(key, value)
  })

// ── ccs proxy ─────────────────────────────────────────────────────────────────
const proxy = program
  .command('proxy')
  .description('Manage the API request interception proxy')

proxy
  .command('start')
  .description('Start the proxy server in the background')
  .option('-p, --port <number>', 'port to listen on')
  .option('-u, --upstream <url>', 'upstream URL to forward requests to')
  .option('--foreground', '(internal) run proxy in foreground as daemon child')
  .action(async (opts: { port?: string; upstream?: string; foreground?: boolean }) => {
    const { runProxyStart } = await import('./commands/proxy.js')
    await runProxyStart({
      port: opts.port ? parseInt(opts.port, 10) : undefined,
      upstream: opts.upstream,
      foreground: opts.foreground,
    })
  })

proxy
  .command('stop')
  .description('Stop the running proxy server')
  .action(async () => {
    const { runProxyStop } = await import('./commands/proxy.js')
    runProxyStop()
  })

proxy
  .command('status')
  .description('Show proxy status')
  .action(async () => {
    const { runProxyStatus } = await import('./commands/proxy.js')
    runProxyStatus()
  })

proxy
  .command('clear')
  .description('Clear proxy logs')
  .action(async () => {
    const { runProxyClear } = await import('./commands/proxy.js')
    runProxyClear()
  })

program.parse(process.argv)

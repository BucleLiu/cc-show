import pc from 'picocolors'
import { loadLatestStats, computeStats } from '../data/stats.js'
import { loadConfig } from '../config.js'

export interface StatsOptions {
  compute?: boolean
  dataDir?: string
  json?: boolean
}

function fmtT(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

function bar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export function runStats(opts: StatsOptions = {}): void {
  const cfg = loadConfig()
  const dataDir = opts.dataDir ?? cfg.dataDir

  let data
  if (opts.compute) {
    console.log(pc.dim('Computing stats from ~/.claude/projects/...'))
    try {
      data = computeStats(dataDir)
    } catch (err) {
      console.error(pc.red(`Failed to compute stats: ${String(err)}`))
      process.exit(1)
    }
  } else {
    data = loadLatestStats(dataDir)
  }

  if (opts.json) {
    console.log(JSON.stringify(data, null, 2))
    return
  }

  if (data.noData) {
    console.log()
    console.log(pc.yellow('  No stats data found.'))
    console.log(pc.dim('  Run: ') + pc.bold('ccs stats --compute') + pc.dim(' to generate stats'))
    console.log()
    return
  }

  const { summary, projects, computedAt, snapshotFile } = data

  console.log()
  console.log(pc.bold(pc.cyan('  cc-show stats')))
  if (computedAt) {
    console.log(pc.dim(`  Computed at: ${computedAt}`) + (snapshotFile ? pc.dim(` (${snapshotFile})`) : ''))
  }
  console.log()

  // Summary
  console.log(pc.bold('  Summary'))
  console.log(pc.dim('  ─────────────────────────────────────────'))
  console.log(`  Total tokens   ${pc.bold(pc.cyan(fmtT(summary.totalTokens)))}`)
  console.log(`  Projects       ${pc.bold(String(summary.totalProjects))}`)
  console.log(`  Sessions       ${pc.bold(String(summary.totalSessions))}`)
  console.log(`  Input tokens   ${pc.dim(fmtT(summary.totalInputTokens))}`)
  console.log(`  Output tokens  ${pc.dim(fmtT(summary.totalOutputTokens))}`)
  console.log()

  if (!projects.length) return

  // Top projects
  const topN = Math.min(10, projects.length)
  console.log(pc.bold(`  Top ${topN} Projects by Token Usage`))
  console.log(pc.dim('  ─────────────────────────────────────────'))

  const maxTokens = projects[0].totalTokens
  for (let i = 0; i < topN; i++) {
    const p = projects[i]
    const pct = maxTokens > 0 ? (p.totalTokens / maxTokens) * 100 : 0
    const rank = i === 0 ? pc.yellow(` #${i + 1}`) : i === 1 ? pc.dim(` #${i + 1}`) : pc.dim(` #${i + 1}`)
    const nameStr = p.name.length > 24 ? p.name.slice(0, 23) + '…' : p.name.padEnd(24)
    const tokStr = fmtT(p.totalTokens).padStart(7)
    const barStr = pc.dim(bar(pct, 16))
    console.log(
      `  ${rank} ${pc.bold(nameStr)} ${pc.cyan(tokStr)} ${barStr}  ${pc.dim(`${p.sessionCount} sessions`)}`
    )
  }

  console.log()
  if (!opts.compute) {
    console.log(pc.dim('  Run ') + pc.bold('ccs stats --compute') + pc.dim(' to refresh data'))
  }
  console.log()
}

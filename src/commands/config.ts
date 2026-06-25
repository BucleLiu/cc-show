import pc from 'picocolors'
import { loadConfig, getConfigValue, setConfigValue, CONFIG_PATH, getEnabledModes } from '../config.js'

export function runConfigList(): void {
  const cfg = loadConfig()
  const enabledModes = getEnabledModes(cfg)
  console.log()
  console.log(pc.bold(pc.cyan('  ccs config')))
  console.log(pc.dim(`  Config file: ${CONFIG_PATH}`))
  console.log(pc.dim('  ──────────────────────────────────'))
  console.log(`  ${pc.bold('port')}             ${pc.cyan(String(cfg.port))}`)
  console.log(`  ${pc.bold('lang')}             ${pc.cyan(cfg.lang)}      ${pc.dim('(zh | en)')}`)
  console.log(`  ${pc.bold('dataDir')}          ${pc.dim(cfg.dataDir)}`)
  console.log(`  ${pc.bold('modes')}            ${pc.cyan(enabledModes.join(', '))}`)
  console.log(`  ${pc.bold('proxy.port')}       ${pc.cyan(String(cfg.proxy.port))}`)
  console.log(`  ${pc.bold('proxy.upstream')}   ${pc.dim(cfg.proxy.upstream)}`)
  console.log()
}

export function runConfigGet(key: string): void {
  const val = getConfigValue(key)
  if (val === undefined) {
    console.error(pc.red(`Unknown config key: ${key}`))
    process.exit(1)
  }
  console.log(String(val))
}

export function runConfigSet(key: string, value: string): void {
  try {
    setConfigValue(key, value)
    console.log(pc.green(`  Set ${pc.bold(key)} = ${pc.cyan(value)}`))
  } catch (err) {
    console.error(pc.red(`  Error: ${String(err)}`))
    process.exit(1)
  }
}

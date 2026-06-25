import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

// ── Working directory ────────────────────────────────────────────────────────
// 优先用 CCS_HOME 环境变量（测试用），否则 ~/.ccs
function ccsHome(): string {
  return process.env.CCS_HOME ?? join(homedir(), '.ccs')
}
export const CCS_DIR = ccsHome()
export const CONFIG_PATH = join(CCS_DIR, 'config.json')

// Legacy path — auto-migrated on first load
const LEGACY_CONFIG_PATH = join(homedir(), '.ccs.json')

// ── Mode config (extensible) ─────────────────────────────────────────────────
export interface ModeConfig {
  enabled: boolean
  // Each mode can carry mode-specific options alongside
  [key: string]: unknown
}

export interface CcsModes {
  claude:      ModeConfig
  codemaker?:  ModeConfig
  codex?:      ModeConfig
  // Future modes (cursor, windsurf, aider, …) can be added here without
  // changing the interface — they're all typed as optional ModeConfig entries.
  [mode: string]: ModeConfig | undefined
}

export interface ProxyConfig {
  port:     number
  upstream: string
}

// ── Top-level config ─────────────────────────────────────────────────────────
export interface CcsConfig {
  port:    number
  lang:    'zh' | 'en'
  dataDir: string
  modes:   CcsModes
  note?:   boolean
  prompts?: boolean
  proxy:   ProxyConfig
}

type CcsConfigRecord = Record<string, unknown>

const DEFAULTS: CcsConfig = {
  port:    8765,
  lang:    'zh',
  dataDir: join(homedir(), '.claude'),
  note:    false,
    prompts: false,
  modes: {
    claude: { enabled: true },
  },
  proxy: {
    port:     18888,
    upstream: 'https://api.anthropic.com',
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ensureCcsDir(): void {
  if (!existsSync(CCS_DIR)) {
    mkdirSync(CCS_DIR, { recursive: true })
  }
}

/** List of mode names that are currently enabled, in config order. */
export function getEnabledModes(cfg: CcsConfig): string[] {
  return Object.entries(cfg.modes)
    .filter(([, m]) => m?.enabled === true)
    .map(([name]) => name)
}

// ── Load / save ──────────────────────────────────────────────────────────────

export function loadConfig(): CcsConfig {
  ensureCcsDir()

  // 1. Try new path
  if (existsSync(CONFIG_PATH)) {
    try {
      const raw = readFileSync(CONFIG_PATH, 'utf-8')
      const parsed = JSON.parse(raw) as Partial<CcsConfig>
      return {
        ...DEFAULTS,
        ...parsed,
        modes: { ...DEFAULTS.modes, ...(parsed.modes ?? {}) },
        proxy: { ...DEFAULTS.proxy, ...((parsed as Record<string, unknown>).proxy as Partial<ProxyConfig> ?? {}) },
      }
    } catch {
      return { ...DEFAULTS }
    }
  }

  // 2. Migrate from legacy ~/.ccs.json
  if (existsSync(LEGACY_CONFIG_PATH)) {
    try {
      const raw = readFileSync(LEGACY_CONFIG_PATH, 'utf-8')
      const parsed = JSON.parse(raw) as Partial<CcsConfig>
      const migrated: CcsConfig = {
        ...DEFAULTS,
        ...parsed,
        modes: { ...DEFAULTS.modes, ...(parsed.modes ?? {}) },
        proxy: { ...DEFAULTS.proxy, ...((parsed as Record<string, unknown>).proxy as Partial<ProxyConfig> ?? {}) },
      }
      // Write to new location
      writeFileSync(CONFIG_PATH, JSON.stringify(migrated, null, 2), 'utf-8')
      return migrated
    } catch {
      return { ...DEFAULTS }
    }
  }

  // 3. Fresh install — write defaults
  writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULTS, null, 2), 'utf-8')
  return { ...DEFAULTS }
}

export function saveConfig(cfg: Partial<CcsConfig>): void {
  ensureCcsDir()
  const current = loadConfig()
  const updated: CcsConfig = {
    ...current,
    ...cfg,
    modes: { ...current.modes, ...(cfg.modes ?? {}) },
    proxy: { ...current.proxy, ...(cfg.proxy ?? {}) },
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8')
}

export function getConfigValue(key: string): unknown {
  const cfg = loadConfig()
  if (key.startsWith('proxy.')) {
    const subKey = key.slice('proxy.'.length)
    return (cfg.proxy as unknown as Record<string, unknown>)[subKey]
  }
  if (key.startsWith('modes.')) {
    const parts = key.split('.')
    if (parts.length === 3 && parts[2] === 'enabled') {
      const modeName = parts[1]
      return cfg.modes[modeName]?.enabled ?? false
    }
    return undefined
  }
  return (cfg as unknown as CcsConfigRecord)[key]
}

export function setConfigValue(key: string, value: string): void {
  // Flat keys
  const flatKeys: (keyof CcsConfig)[] = ['port', 'lang', 'dataDir', 'note', 'prompts']

  if (flatKeys.includes(key as keyof CcsConfig)) {
    let parsed: string | number | boolean = value
    if (key === 'port') {
      const n = parseInt(value, 10)
      if (isNaN(n) || n < 1 || n > 65535) {
        throw new Error(`Invalid port: ${value}. Must be 1-65535`)
      }
      parsed = n
    }
    if (key === 'lang' && value !== 'zh' && value !== 'en') {
      throw new Error(`Invalid lang: ${value}. Must be 'zh' or 'en'`)
    }
    if (key === 'note') {
      if (value !== 'true' && value !== 'false') {
        throw new Error(`Invalid note: ${value}. Must be 'true' or 'false'`)
      }
      parsed = value === 'true'
    }
    if (key === 'prompts') {
      if (value !== 'true' && value !== 'false') {
        throw new Error(`Invalid prompts: ${value}. Must be 'true' or 'false'`)
      }
      parsed = value === 'true'
    }
    saveConfig({ [key]: parsed } as Partial<CcsConfig>)
    return
  }

  // Dot-path keys (proxy.port, proxy.upstream)
  if (key.startsWith('proxy.')) {
    const subKey = key.slice('proxy.'.length)
    const cfg = loadConfig()
    const proxy = { ...cfg.proxy }

    if (subKey === 'port') {
      const n = parseInt(value, 10)
      if (isNaN(n) || n < 1 || n > 65535) {
        throw new Error(`Invalid proxy.port: ${value}. Must be 1-65535`)
      }
      proxy.port = n
    } else if (subKey === 'upstream') {
      try {
        new URL(value)
      } catch {
        throw new Error(`Invalid proxy.upstream: ${value}. Must be a valid URL`)
      }
      proxy.upstream = value
    } else {
      throw new Error(`Unknown config key: ${key}. Valid proxy keys: proxy.port, proxy.upstream`)
    }

    saveConfig({ proxy })
    return
  }

  // Dot-path keys (modes.<modeName>.enabled)
  if (key.startsWith('modes.')) {
    const parts = key.split('.')
    // Expected format: modes.<modeName>.enabled
    if (parts.length === 3 && parts[2] === 'enabled') {
      const modeName = parts[1]
      if (value !== 'true' && value !== 'false') {
        throw new Error(`Invalid modes.${modeName}.enabled: ${value}. Must be 'true' or 'false'`)
      }
      const cfg = loadConfig()
      const modes = { ...cfg.modes }
      modes[modeName] = { ...(modes[modeName] ?? {}), enabled: value === 'true' }
      saveConfig({ modes })
      return
    }
    throw new Error(`Unknown config key: ${key}. Valid modes keys: modes.<name>.enabled`)
  }

  throw new Error(`Unknown config key: ${key}. Valid keys: port, lang, dataDir, note, proxy.port, proxy.upstream, modes.<name>.enabled`)
}

export function listConfig(): CcsConfig {
  return loadConfig()
}

export { DEFAULTS }

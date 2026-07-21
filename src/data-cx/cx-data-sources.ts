import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export type CxDataSourceId = 'default' | 'orca'

export interface CxDataSource {
  id: CxDataSourceId
  label: string
  home: string
  dbPath: string
}

const defaultHome = join(homedir(), '.codex')
const orcaHome = join(homedir(), 'Library', 'Application Support', 'orca', 'codex-runtime-home', 'home')

function makeSource(id: CxDataSourceId, label: string, home: string): CxDataSource {
  return { id, label, home, dbPath: join(home, 'state_5.sqlite') }
}

/**
 * Returns Codex stores that are available on this machine.
 * Orca keeps a fully compatible Codex store under its own CODEX_HOME; only add
 * it when its state database exists so machines without Orca keep default behavior.
 */
export function getCxDataSources(): CxDataSource[] {
  const sources = [makeSource('default', '本机', defaultHome)]
  const orca = makeSource('orca', 'Orca', orcaHome)
  if (existsSync(orca.dbPath)) sources.push(orca)
  return sources
}

export function getCxDataSource(sourceId?: string): CxDataSource | undefined {
  const sources = getCxDataSources()
  return sources.find(source => source.id === sourceId) ?? sources.find(source => source.id === 'default')
}

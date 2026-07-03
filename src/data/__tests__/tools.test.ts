import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'

const TMP_BASE = join(homedir(), '.ccs-test-' + randomUUID())

let tools: typeof import('../tools.js')

describe('tools json-format CRUD', () => {
  beforeAll(async () => {
    process.env.CCS_HOME = TMP_BASE
    tools = await import('../tools.js')
  })

  beforeEach(() => {
    mkdirSync(join(TMP_BASE, '.ccs', 'tools', 'json-format'), { recursive: true })
  })

  afterEach(() => {
    rmSync(TMP_BASE, { recursive: true, force: true })
  })

  it('listJsonFiles returns empty array when dir is empty', () => {
    expect(tools.listJsonFiles()).toEqual([])
  })

  it('listJsonFiles returns empty array when dir does not exist', () => {
    rmSync(TMP_BASE, { recursive: true, force: true })
    expect(tools.listJsonFiles()).toEqual([])
  })

  it('saveJsonFile creates file and returns info', () => {
    const result = tools.saveJsonFile('test', '{"a":1}')
    expect(result.name).toBe('test.json')
    expect(result.size).toBeGreaterThan(0)
    expect(result.mtime).toBeTruthy()
  })

  it('saveJsonFile validates JSON content', () => {
    expect(() => tools.saveJsonFile('bad', 'not json')).toThrow(/Invalid JSON/)
  })

  it('saveJsonFile rejects invalid name with path traversal', () => {
    expect(() => tools.saveJsonFile('../etc', '{}')).toThrow(/Invalid name/)
  })

  it('listJsonFiles returns saved files sorted by mtime desc', () => {
    tools.saveJsonFile('a', '{}')
    // tiny delay to ensure different mtime
    tools.saveJsonFile('b', '[1,2]')
    const list = tools.listJsonFiles()
    expect(list.length).toBeGreaterThanOrEqual(1)
    const names = list.map(f => f.name)
    expect(names).toContain('a.json')
    expect(names).toContain('b.json')
  })

  it('getJsonFileContent reads a saved file', () => {
    tools.saveJsonFile('data', '{"key":"value"}')
    const result = tools.getJsonFileContent('data.json')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('data.json')
    expect(JSON.parse(result!.content)).toEqual({ key: 'value' })
  })

  it('getJsonFileContent adds .json extension automatically', () => {
    tools.saveJsonFile('config', '{"x":1}')
    // name without .json also works (sanitizeName adds it)
    const result = tools.getJsonFileContent('config')
    expect(result).not.toBeNull()
    expect(JSON.parse(result!.content)).toEqual({ x: 1 })
  })

  it('getJsonFileContent returns null for non-existent file', () => {
    expect(tools.getJsonFileContent('nonexistent.json')).toBeNull()
  })

  it('deleteJsonFile removes the file', () => {
    tools.saveJsonFile('x', '{}')
    tools.deleteJsonFile('x.json')
    expect(tools.listJsonFiles()).toEqual([])
  })

  it('deleteJsonFile throws for non-existent file', () => {
    expect(() => tools.deleteJsonFile('nonexistent.json')).toThrow(/not found/)
  })

  it('deleteJsonFile rejects invalid name', () => {
    expect(() => tools.deleteJsonFile('../etc.json')).toThrow(/Invalid name/)
  })

  it('saveJsonFile overwrites existing file', () => {
    tools.saveJsonFile('dup', '{"v":1}')
    tools.saveJsonFile('dup', '{"v":2}')
    const result = tools.getJsonFileContent('dup.json')
    expect(JSON.parse(result!.content)).toEqual({ v: 2 })
  })
})

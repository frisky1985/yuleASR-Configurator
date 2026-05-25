import fs from 'fs'
import path from 'path'

import { describe, it, expect } from 'vitest'

const GENERATED_DIR = path.resolve(__dirname, '../generated')

function getSchemaFiles(): string[] {
  return fs
    .readdirSync(GENERATED_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
}

describe('JSON Schema Validation', () => {
  const files = getSchemaFiles()

  it('should have exactly 37 schema files', () => {
    expect(files.length).toBe(37)
  })

  it.each(files)('should parse %s as valid JSON', (file) => {
    const content = fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8')
    expect(() => JSON.parse(content)).not.toThrow()
  })

  it.each(files)('should have valid schema structure in %s', (file) => {
    const content = fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8')
    const schema = JSON.parse(content)

    expect(schema).toHaveProperty('title')
    expect(typeof schema.title).toBe('string')
    expect(schema.title.length).toBeGreaterThan(0)

    expect(schema).toHaveProperty('type', 'object')
    expect(schema).toHaveProperty('properties')
    expect(typeof schema.properties).toBe('object')

    expect(schema).toHaveProperty('x-layer')
    expect(['MCAL', 'ECUAL', 'Service', 'RTE', 'OS', 'ASW']).toContain(schema['x-layer'])
  })

  it('should cover all expected BSW modules', () => {
    const names = files.map((f) => f.replace('.json', ''))
    const expected = [
      'adc', 'arti', 'ble', 'bswm', 'can', 'canif', 'cannm', 'cansm',
      'cantp', 'cantrcv', 'com', 'comm', 'crc', 'cryif', 'crypto', 'csm',
      'dcm', 'dem', 'det', 'dio', 'ecum', 'fee', 'fls', 'gpt', 'icu',
      'iohwab', 'mcl', 'mcu', 'memif', 'nm', 'nvm', 'os', 'pdur', 'port',
      'rte', 'sbc', 'spi',
    ]
    expect(names.sort()).toEqual(expected.sort())
  })
})

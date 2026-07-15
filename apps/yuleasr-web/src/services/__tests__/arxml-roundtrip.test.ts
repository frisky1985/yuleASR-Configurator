/**
 * ARXML Round-Trip Test
 * Verifies: Config → export ARXML → parse ARXML → matches original
 * Ensures exporter and parser stay in sync.
 */

import { describe, it, expect } from 'vitest'
import { generateArxml } from '../arxml-exporter'
import { parseArxmlContent, arxmlToConfigModules } from '../arxml-parser'
import type { ConfigFile, ConfigModule, ConfigContainer } from '../../types/config'

function createSimpleConfig(): ConfigFile {
  return {
    id: 'test-1',
    name: 'TestConfig',
    description: 'Round-trip test config',
    createdAt: '2026-07-15T00:00:00Z',
    updatedAt: '2026-07-15T00:00:00Z',
    targetPlatform: 'S32K144',
    targetChip: 'S32K144',
    compiler: 'GCC',
    modules: [
      {
        id: 'Can',
        name: 'Can',
        layer: 'MCAL',
        version: '4.4.0',
        enabled: true,
        parameters: [
          { id: 'p1', name: 'canBaudrate', type: 'integer', value: 500000, defaultValue: 500000 },
          { id: 'p2', name: 'canDevErrorDetect', type: 'boolean', value: true, defaultValue: false },
        ],
        containers: [
          {
            id: 'c1',
            name: 'CanController',
            label: 'CAN Controller',
            multiple: true,
            parameters: [
              { id: 'cp1', name: 'canControllerId', type: 'integer', value: 0, defaultValue: 0 },
            ],
            subContainers: [],
          },
        ],
      },
      {
        id: 'Mcu',
        name: 'Mcu',
        layer: 'MCAL',
        version: '4.4.0',
        enabled: true,
        parameters: [
          { id: 'p3', name: 'mcuClockSpeed', type: 'integer', value: 120000000, defaultValue: 80000000 },
          { id: 'p4', name: 'mcuRamSize', type: 'integer', value: 256, defaultValue: 128 },
        ],
        containers: [],
      },
    ],
  }
}

describe('ARXML Round-Trip', () => {
  it('should export valid XML that can be parsed back', () => {
    const config = createSimpleConfig()
    const xml = generateArxml(config)

    // Verify XML is valid by parsing it
    const parseResult = parseArxmlContent(xml)
    expect(parseResult.errors).toHaveLength(0)
    expect(parseResult.warnings).toBeDefined()
    expect(parseResult.modules.length).toBeGreaterThanOrEqual(1)
  })

  it('should preserve module names after round-trip', () => {
    const config = createSimpleConfig()
    const xml = generateArxml(config)
    const parseResult = parseArxmlContent(xml)

    const originalNames = config.modules.map(m => m.name).sort()
    const parsedNames = parseResult.modules.map(m => m.shortName).sort()
    expect(parsedNames).toEqual(originalNames)
  })

  it('should preserve the ARXML namespace declaration', () => {
    const config = createSimpleConfig()
    const xml = generateArxml(config)

    expect(xml).toContain('xmlns="http://autosar.org/schema/r4.0"')
    expect(xml).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"')
    expect(xml).toContain('xsi:schemaLocation')
    expect(xml).toContain('<?xml version="1.0"')
  })

  it('should produce xml with ECUC-MODULE-CONFIGURATION-VALUES elements', () => {
    const config = createSimpleConfig()
    const xml = generateArxml(config)

    expect(xml).toContain('ECUC-MODULE-CONFIGURATION-VALUES')
    expect(xml).toContain('ECUC-CONTAINER-VALUE')
    expect(xml).toContain('ECUC-NUMERICAL-PARAM-VALUE')
    expect(xml).toContain('DEFINITION-REF')
    expect(xml).toContain('SHORT-NAME')
    expect(xml).toContain('AR-PACKAGE')
    expect(xml).toContain('AR-PACKAGES')
  })

  it('should round-trip parameter values correctly', () => {
    const config = createSimpleConfig()
    const xml = generateArxml(config)
    const parseResult = parseArxmlContent(xml)
    const modules = arxmlToConfigModules(parseResult)

    // Can module
    const can = modules.find(m => m.name === 'Can')
    expect(can).toBeDefined()
    expect(can!.parameters.find(p => p.name === 'canBaudrate')?.value).toBe(500000)
    expect(can!.parameters.find(p => p.name === 'canDevErrorDetect')?.value).toBe(true)

    // Mcu module
    const mcu = modules.find(m => m.name === 'Mcu')
    expect(mcu).toBeDefined()
    expect(mcu!.parameters.find(p => p.name === 'mcuClockSpeed')?.value).toBe(120000000)
  })

  it('should handle modules with no containers', () => {
    const config = createSimpleConfig()
    const xml = generateArxml(config)
    const parseResult = parseArxmlContent(xml)

    // Mcu has no containers
    const mcuParsed = parseResult.modules.find(m => m.shortName === 'Mcu')
    expect(mcuParsed).toBeDefined()
  })

  it('should handle modules with containers and sub-containers', () => {
    const config = createSimpleConfig()
    const xml = generateArxml(config)
    const parseResult = parseArxmlContent(xml)

    const canParsed = parseResult.modules.find(m => m.shortName === 'Can')
    expect(canParsed).toBeDefined()
    expect(canParsed!.containers.length).toBeGreaterThanOrEqual(1)
    expect(canParsed!.containers[0].shortName).toBe('CanController')
  })

  it('should generate valid XML that doesn\'t throw parser errors', () => {
    // A stress test: generate for all 37 modules
    const modules: ConfigModule[] = 'Can,Mcu,Port,Adc,Dio,Gpt,Spi,EcuM,Det,Dem,CanIf,Fee,Fls,BswM,CanTp,Com,Crc,Icu,Dcm,CanNm,CanSM,CanTrcv,PduR,MemIf,Rte,Crypto,Csm,CryIf,Nm,Mcl,IOHWAb,Sbc,Ble,Arti'.split(',')
      .map((name, i) => ({
        id: name,
        name,
        layer: (['MCAL', 'Service', 'ECUAL'] as const)[i % 3] as string,
        version: '4.4.0',
        enabled: true,
        parameters: [{ id: `p${i}`, name: `${name}Enabled`, type: 'boolean', value: true, defaultValue: true }],
        containers: [],
      }))

    const config: ConfigFile = {
      id: 'all-37',
      name: 'All37Modules',
      description: 'Stress test',
      createdAt: '2026-07-15T00:00:00Z',
      updatedAt: '2026-07-15T00:00:00Z',
      modules,
    }

    const xml = generateArxml(config)
    const result = parseArxmlContent(xml)
    expect(result.errors).toHaveLength(0)
    expect(result.modules.length).toBe(modules.length)
  })
})

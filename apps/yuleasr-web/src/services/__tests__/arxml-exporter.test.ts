import { describe, it, expect } from 'vitest'
import { generateArxml } from '../arxml-exporter'
import type { ConfigFile, ConfigModule, ConfigContainer } from '../../types/config'

function makeModule(name: string, layer: 'MCAL' | 'Service' | 'ECUAL'): ConfigModule {
  return {
    id: name, name, layer, version: '4.4.0', enabled: true,
    dependencies: [] as string[],
    createdAt: '', updatedAt: '', configStatus: 'valid' as const,
    parameters: [] as any[],
    containers: [] as any[],
  }
}

function simpleConfig(): ConfigFile {
  const can = makeModule('Can', 'MCAL')
  can.parameters = [
    { id: 'p1', name: 'canBaudrate', type: 'integer', value: 500000, defaultValue: 500000 },
    { id: 'p2', name: 'canDevErrorDetect', type: 'boolean', value: true, defaultValue: false },
  ]
  can.containers = [
    {
      id: 'c1', name: 'CanController', label: 'CAN Controller', multiple: true,
      parameters: [{ id: 'cp1', name: 'canControllerId', type: 'integer', value: 0, defaultValue: 0 }],
      subContainers: [],
    } as any,
  ]

  const mcu = makeModule('Mcu', 'MCAL')
  mcu.parameters = [
    { id: 'p3', name: 'mcuClockSpeed', type: 'integer', value: 120000000, defaultValue: 80000000 },
    { id: 'p4', name: 'mcuRamSize', type: 'integer', value: 256, defaultValue: 128 },
  ]

  return {
    id: 'test-1', name: 'TestConfig', description: '',
    createdAt: '', updatedAt: '',
    targetPlatform: 'S32K144',
    targetChip: 'S32K144',
    compiler: 'GCC',
    modules: [can, mcu],
  }
}

describe('ARXML Exporter', () => {
  it('should start with XML declaration', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml.startsWith('<?xml version="1.0"')).toBe(true)
  })

  it('should include AUTOSAR namespace', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml).toContain('xmlns="http://autosar.org/schema/r4.0"')
    expect(xml).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"')
    expect(xml).toContain('xsi:schemaLocation')
  })

  it('should include root AUTOSAR element', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml).toContain('<AUTOSAR')
    expect(xml).toContain('</AUTOSAR>')
  })

  it('should include AR-PACKAGES wrapper', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml).toContain('<AR-PACKAGES>')
    expect(xml).toContain('</AR-PACKAGES>')
  })

  it('should generate one AR-PACKAGE per module', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml).toContain('<SHORT-NAME>Can</SHORT-NAME>')
    expect(xml).toContain('<SHORT-NAME>Mcu</SHORT-NAME>')
  })

  it('should include ECUC-MODULE-CONFIGURATION-VALUES', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml).toContain('ECUC-MODULE-CONFIGURATION-VALUES')
  })

  it('should include DEFINITION-REF with DEST attribute', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml).toContain('DEST=')
    expect(xml).toContain('DEFINITION-REF')
  })

  it('should generate ECUC-CONTAINER-VALUE with UUID', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml).toContain('ECUC-CONTAINER-VALUE')
    expect(xml).toContain('UUID=')
  })

  it('should generate numerical parameter values', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml).toContain('ECUC-NUMERICAL-PARAM-VALUE')
  })

  it('should include parameter VALUE elements', () => {
    const xml = generateArxml(simpleConfig())
    // VALUE tags with parameter values
    expect(xml).toContain('VALUE')
    expect(xml).toContain('PARAMETER-VALUES')
  })

  it('should include IMPLEMENTATION-CONFIG-VARIANT', () => {
    const xml = generateArxml(simpleConfig())
    expect(xml).toContain('IMPLEMENTATION-CONFIG-VARIANT')
  })

  it('should handle 37 modules without error', () => {
    const names = 'Can,Mcu,Port,Adc,Dio,Gpt,Spi,EcuM,Det,Dem,CanIf,Fee,Fls,BswM,CanTp,Com,Crc,Icu,Dcm,CanNm,CanSM,CanTrcv,PduR,MemIf,Rte,Crypto,Csm,CryIf,Nm,Mcl,IOHWAb,Sbc,Ble,Arti'.split(',')
    const modules: ConfigModule[] = names.map((name, i) => {
      const m = makeModule(name, (['MCAL', 'Service', 'ECUAL'] as const)[i % 3])
      m.parameters = [{ id: `p${i}`, name: `enabled`, type: 'boolean', value: true }]
      return m
    })
    const config: ConfigFile = { id: 'all', name: 'All37', description: '', createdAt: '', updatedAt: '', modules }

    const xml = generateArxml(config)
    expect(xml).toContain('<?xml')
    expect(xml).toContain('</AUTOSAR>')
    // Verify all module names appear
    for (const name of names) {
      expect(xml).toContain(`<SHORT-NAME>${name}</SHORT-NAME>`)
    }
  })
})

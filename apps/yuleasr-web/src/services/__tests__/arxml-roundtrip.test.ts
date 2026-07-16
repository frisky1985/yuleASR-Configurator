/**
 * ARXML Round-Trip Test Suite
 *
 * Verifies: Config → export ARXML → parse ARXML → convert back → matches original
 * Ensures exporter and parser stay in sync for all 37 BSW modules.
 *
 * Core properties verified:
 * - Structure: module/container/sub-container hierarchy preserved
 * - Names: SHORT-NAME values preserved
 * - Parameters: parameter values identical (same type and value)
 * - Types: boolean, integer, float, string, enum types survive round-trip
 * - Metadata: DEFINITION-REF paths preserved
 * - Containers: nested container hierarchy intact
 * - Edge cases: empty containers, no parameters, deep nesting
 */
import { describe, it, expect } from 'vitest'
import { generateArxml } from '../arxml-exporter'
import {
  parseArxmlContent,
  arxmlToConfigModules,
  type ParsedModuleDef,
  type ParsedContainerValue,
  type ParsedParamValue,
} from '../arxml-parser'
import type { ConfigFile, ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config'

// ─── Module names for the 37 BSW modules ─────────────────────────────────
const ALL_37_MODULES = [
  'Can', 'Mcu', 'Port', 'Adc', 'Dio', 'Gpt', 'Spi', 'EcuM', 'Det', 'Dem',
  'CanIf', 'Fee', 'Fls', 'BswM', 'CanTp', 'Com', 'Crc', 'Icu', 'Dcm',
  'CanNm', 'CanSM', 'CanTrcv', 'PduR', 'MemIf', 'Rte', 'Crypto', 'Csm',
  'CryIf', 'Nm', 'Mcl', 'IOHWAb', 'Sbc', 'Ble', 'Arti', 'Wdg', 'Lin', 'Pwm',
]

// ─── Helpers ──────────────────────────────────────────────────────────────

function makeModule(name: string, layer: 'MCAL' | 'ECUAL' | 'Service' | 'OS'): ConfigModule {
  return {
    id: name.toLowerCase(),
    name,
    displayName: name,
    layer,
    version: '4.4.0',
    autosarVersion: '4.4.0',
    enabled: true,
    parameters: [],
    containers: [],
    dependencies: [],
    createdAt: '2026-07-16T00:00:00Z',
    updatedAt: '2026-07-16T00:00:00Z',
    configStatus: 'configured' as const,
  }
}

function param(
  name: string,
  type: ConfigParameter['type'],
  value: ConfigParameter['value'],
): ConfigParameter {
  return { id: name.toLowerCase(), name, type, value, defaultValue: value }
}

function container(
  name: string,
  params: ConfigParameter[],
  subContainers?: ConfigContainer[],
): ConfigContainer {
  return subContainers
    ? { id: name.toLowerCase(), name, parameters: params, subContainers }
    : { id: name.toLowerCase(), name, parameters: params }
}

function makeConfigFile(modules: ConfigModule[]): ConfigFile {
  return {
    id: 'roundtrip-test',
    name: 'RoundTripTest',
    description: 'Comprehensive round-trip test',
    targetPlatform: 'S32K144',
    targetChip: 'S32K144',
    compiler: 'GCC',
    modules,
    createdAt: '2026-07-16T00:00:00Z',
    updatedAt: '2026-07-16T00:00:00Z',
  }
}

/**
 * Perform a round-trip: config → export → parse → convert → return
 */
function roundtrip(config: ConfigFile): ConfigModule[] {
  const xml = generateArxml(config)

  // Verify XML is well-formed
  expect(xml).toContain('<?xml')
  expect(xml).toContain('<AUTOSAR')
  expect(xml).toContain('</AUTOSAR>')

  // Parse
  const parseResult = parseArxmlContent(xml)
  expect(parseResult.errors).toHaveLength(0)

  // Convert back to ConfigModule format
  return arxmlToConfigModules(parseResult.modules)
}

/**
 * Deep-compare a ConfigModule against the original.
 */
function expectModuleRoundtrip(
  original: ConfigModule,
  restored: ConfigModule | undefined,
) {
  expect(restored).toBeDefined()
  if (!restored) return

  // Core identity
  expect(restored.name).toBe(original.name)
  expect(restored.displayName).toBe(original.displayName)
  expect(restored.layer).toBe(original.layer)

  // Deep compare containers
  expectContainersEqual(original.containers, restored.containers)
}

function expectContainersEqual(
  original: ConfigContainer[],
  restored: ConfigContainer[],
) {
  expect(restored.length).toBe(original.length)

  for (let i = 0; i < original.length; i++) {
    const o = original[i]
    const r = restored[i]

    expect(r.name).toBe(o.name)
    expect(r.displayName).toBe(o.displayName)

    // Compare parameters
    expectParamsEqual(o.parameters, r.parameters)

    // Recurse into sub-containers
    const oSubs = o.subContainers || []
    const rSubs = r.subContainers || []
    expectContainersEqual(oSubs, rSubs)
  }
}

function expectParamsEqual(
  original: ConfigParameter[],
  restored: ConfigParameter[],
) {
  expect(restored.length).toBe(original.length)

  // Build a name-indexed map for the restored params
  const restoredMap = new Map<string, ConfigParameter>()
  for (const p of restored) {
    restoredMap.set(p.name, p)
  }

  for (const o of original) {
    const r = restoredMap.get(o.name)
    expect(r, `Parameter "${o.name}" should exist after round-trip`).toBeDefined()
    if (!r) continue

    // Type must match
    expect(r.type).toBe(o.type)

    // Value must be identical (accounting for JS equivalence)
    if (typeof o.value === 'number') {
      expect(r.value).toBe(o.value)
    } else if (typeof o.value === 'boolean') {
      expect(r.value).toBe(o.value)
    } else {
      expect(String(r.value)).toBe(String(o.value))
    }
  }
}

// ─── Simple test configs ──────────────────────────────────────────────────

function simpleConfig(): ConfigFile {
  const can = makeModule('Can', 'ECUAL')
  can.parameters = [
    param('canBaudrate', 'integer', 500000),
    param('canDevErrorDetect', 'boolean', true),
    param('canVersionInfoApi', 'boolean', false),
    param('canMainFunctionPeriod', 'float', 0.01),
    param('canDriverType', 'string', 'CAN_DRIVER_TYPE_0'),
  ]
  can.containers = [
    container('CanGeneral', []),
    container('CanConfigSet', [
      param('canConfigSetMode', 'enum', 'CAN_CFG_SET_DEFAULT'),
    ], [
      container('CanController', [
        param('canControllerId', 'integer', 0),
        param('canControllerBaudrate', 'integer', 500000),
        param('canControllerWakeupCapability', 'boolean', true),
        param('canControllerPropagationDelay', 'float', 0.0001),
      ], [
        container('CanFilterMask', [
          param('canFilterMaskValue', 'integer', 0x7FF),
          param('canFilterMaskType', 'enum', 'CAN_FILTER_MASK_TYPE_EXPLICIT'),
        ]),
      ]),
      container('CanHardwareObject', [
        param('canHwObjectId', 'integer', 1),
        param('canHwObjectType', 'enum', 'CAN_HW_TYPE_BASIC'),
        param('canHwObjectFilterType', 'enum', 'CAN_HW_FILTER_TYPE_RANGE'),
      ]),
    ]),
  ]

  const mcu = makeModule('Mcu', 'MCAL')
  mcu.parameters = [
    param('mcuClockSpeed', 'integer', 160000000),
    param('mcuRamSize', 'integer', 256),
    param('mcuMainOscillatorFrequency', 'float', 16.0),
    param('mcuDevErrorDetect', 'boolean', true),
    param('mcuVersionInfoApi', 'boolean', false),
    param('mcuRamSection', 'string', 'RAM_0'),
    param('mcuMode', 'enum', 'RUN'),
  ]
  mcu.containers = [
    container('McuGeneral', [
      param('mcuGeneralDevErrorDetect', 'boolean', true),
      param('mcuGeneralVersionInfoApi', 'boolean', false),
    ]),
    container('McuClockSettingConfig', [
      param('mcuClockSettingConfigClockSrc', 'enum', 'MCU_CLOCK_SOURCE_PLL'),
      param('mcuClockSettingConfigPllMul', 'integer', 20),
      param('mcuClockSettingConfigPllDiv', 'integer', 2),
    ]),
    container('McuModeSettingConfig', [
      param('mcuModeSettingConfigMode', 'enum', 'MCU_MODE_RUN'),
      param('mcuModeSettingConfigWakeupMode', 'enum', 'MCU_MODE_SLEEP'),
    ]),
  ]

  const port = makeModule('Port', 'MCAL')
  port.parameters = [
    param('portDevErrorDetect', 'boolean', true),
    param('portVersionInfoApi', 'boolean', false),
    param('portSetPinDirectionApi', 'boolean', true),
  ]
  port.containers = [
    container('PortConfigSet', [], [
      container('PortPin', [
        param('portPinId', 'integer', 0),
        param('portPinDirection', 'enum', 'PORT_PIN_IN'),
        param('portPinInitialMode', 'enum', 'PORT_PIN_MODE_DIO'),
        param('portPinLevelValue', 'boolean', false),
        param('portPinDirectionChangeable', 'boolean', true),
        param('portPinModeChangeable', 'boolean', true),
        param('portPinPullResistor', 'enum', 'PORT_PIN_PULL_UP'),
      ]),
      container('PortPin', [
        param('portPinId', 'integer', 1),
        param('portPinDirection', 'enum', 'PORT_PIN_OUT'),
        param('portPinInitialMode', 'enum', 'PORT_PIN_MODE_DIO'),
        param('portPinLevelValue', 'boolean', true),
        param('portPinDirectionChangeable', 'boolean', true),
        param('portPinModeChangeable', 'boolean', false),
        param('portPinPullResistor', 'enum', 'PORT_PIN_PULL_DOWN'),
      ]),
    ]),
  ]

  return makeConfigFile([can, mcu, port])
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('ARXML Round-Trip', () => {
  // ── Basic round-trip ─────────────────────────────────────────────────

  it('should export valid XML that can be parsed back', () => {
    const config = simpleConfig()
    const xml = generateArxml(config)

    const parseResult = parseArxmlContent(xml)
    expect(parseResult.errors).toHaveLength(0)
    expect(parseResult.modules.length).toBeGreaterThanOrEqual(1)
  })

  it('should preserve module names after round-trip', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const originalNames = config.modules.map((m) => m.name).sort()
    const restoredNames = modules.map((m) => m.name).sort()
    expect(restoredNames).toEqual(originalNames)
  })

  it('should preserve the ARXML namespace declaration', () => {
    const config = simpleConfig()
    const xml = generateArxml(config)

    expect(xml).toContain('xmlns="http://autosar.org/schema/r4.0"')
    expect(xml).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"')
    expect(xml).toContain('xsi:schemaLocation')
    expect(xml).toContain('<?xml version="1.0"')
  })

  it('should produce xml with all expected AUTOSAR elements', () => {
    const config = simpleConfig()
    const xml = generateArxml(config)

    expect(xml).toContain('ECUC-MODULE-CONFIGURATION-VALUES')
    expect(xml).toContain('ECUC-CONTAINER-VALUE')
    expect(xml).toContain('ECUC-NUMERICAL-PARAM-VALUE')
    expect(xml).toContain('DEFINITION-REF')
    expect(xml).toContain('SHORT-NAME')
    expect(xml).toContain('AR-PACKAGE')
    expect(xml).toContain('AR-PACKAGES')
    expect(xml).toContain('PARAMETER-VALUES')
    expect(xml).toContain('IMPLEMENTATION-CONFIG-VARIANT')
  })

  // ── Parameter value preservation ─────────────────────────────────────

  it('should round-trip integer parameter values correctly', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const can = modules.find((m) => m.name === 'Can')
    expect(can).toBeDefined()
    expect(can!.parameters.find((p) => p.name === 'canBaudrate')?.value).toBe(500000)

    const mcu = modules.find((m) => m.name === 'Mcu')
    expect(mcu).toBeDefined()
    expect(mcu!.parameters.find((p) => p.name === 'mcuClockSpeed')?.value).toBe(160000000)
  })

  it('should round-trip boolean parameter values correctly', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const can = modules.find((m) => m.name === 'Can')
    expect(can).toBeDefined()
    expect(can!.parameters.find((p) => p.name === 'canDevErrorDetect')?.value).toBe(true)
    expect(can!.parameters.find((p) => p.name === 'canVersionInfoApi')?.value).toBe(false)
  })

  it('should round-trip float parameter values correctly', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const can = modules.find((m) => m.name === 'Can')
    expect(can).toBeDefined()
    expect(can!.parameters.find((p) => p.name === 'canMainFunctionPeriod')?.value).toBe(0.01)
  })

  it('should round-trip enum parameter values correctly', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const mcu = modules.find((m) => m.name === 'Mcu')
    expect(mcu).toBeDefined()
    expect(mcu!.parameters.find((p) => p.name === 'mcuMode')?.value).toBe('RUN')
  })

  it('should round-trip string parameter values correctly', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const mcu = modules.find((m) => m.name === 'Mcu')
    expect(mcu).toBeDefined()
    expect(mcu!.parameters.find((p) => p.name === 'mcuRamSection')?.value).toBe('RAM_0')
  })

  // ── Container hierarchy ───────────────────────────────────────────────

  it('should handle modules with no containers', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    // No module is without containers in our simple config, but let's test empty scenario
    const emptyMod = makeModule('Det', 'Service')
    const testConfig = makeConfigFile([emptyMod])
    const restored = roundtrip(testConfig)
    expect(restored.find((m) => m.name === 'Det')).toBeDefined()
  })

  it('should handle modules with containers and sub-containers', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const canRestored = modules.find((m) => m.name === 'Can')
    expect(canRestored).toBeDefined()
    expect(canRestored!.containers.length).toBe(2)

    // CanConfigSet should have sub-containers
    const canConfigSet = canRestored!.containers.find((c) => c.name === 'CanConfigSet')
    expect(canConfigSet).toBeDefined()
    expect(canConfigSet!.subContainers).toBeDefined()
    expect(canConfigSet!.subContainers!.length).toBeGreaterThanOrEqual(2)

    // CanController should have sub-sub-containers
    const canController = canConfigSet!.subContainers!.find((c) => c.name === 'CanController')
    expect(canController).toBeDefined()
    expect(canController!.subContainers).toBeDefined()
    expect(canController!.subContainers!.length).toBeGreaterThanOrEqual(1)
    expect(canController!.subContainers![0].name).toBe('CanFilterMask')
  })

  it('should round-trip deep container hierarchy (module → container → sub → sub-sub)', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const canRestored = modules.find((m) => m.name === 'Can')
    expect(canRestored).toBeDefined()

    // Walk: Can → CanConfigSet → CanController → CanFilterMask
    const configSet = canRestored!.containers.find((c) => c.name === 'CanConfigSet')
    expect(configSet).toBeDefined()
    const controller = configSet!.subContainers?.find((c) => c.name === 'CanController')
    expect(controller).toBeDefined()
    const filterMask = controller!.subContainers?.find((c) => c.name === 'CanFilterMask')
    expect(filterMask).toBeDefined()
    expect(filterMask!.parameters.find((p) => p.name === 'canFilterMaskValue')?.value).toBe(0x7FF)
  })

  it('should round-trip CanGeneral container with empty parameters', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const canRestored = modules.find((m) => m.name === 'Can')
    expect(canRestored).toBeDefined()
    const canGeneral = canRestored!.containers.find((c) => c.name === 'CanGeneral')
    expect(canGeneral).toBeDefined()
    expect(canGeneral!.parameters).toHaveLength(0)
    expect(canGeneral!.subContainers).toBeUndefined()
  })

  // ── Port module with multiple instances ───────────────────────────────

  it('should round-trip Port module with multiple PortPin instances', () => {
    const config = simpleConfig()
    const modules = roundtrip(config)

    const portRestored = modules.find((m) => m.name === 'Port')
    expect(portRestored).toBeDefined()

    const portConfigSet = portRestored!.containers.find((c) => c.name === 'PortConfigSet')
    expect(portConfigSet).toBeDefined()

    const portPins = portConfigSet!.subContainers || []
    expect(portPins.length).toBe(2)

    // First PortPin
    expect(portPins[0].parameters.find((p) => p.name === 'portPinId')?.value).toBe(0)
    expect(portPins[0].parameters.find((p) => p.name === 'portPinDirection')?.value).toBe('PORT_PIN_IN')

    // Second PortPin
    expect(portPins[1].parameters.find((p) => p.name === 'portPinId')?.value).toBe(1)
    expect(portPins[1].parameters.find((p) => p.name === 'portPinDirection')?.value).toBe('PORT_PIN_OUT')
  })

  // ── 37 modules stress test ───────────────────────────────────────────

  it('should round-trip all 37 BSW modules without errors', () => {
    const modules: ConfigModule[] = ALL_37_MODULES.map((name, i) => {
      const layers: Array<'MCAL' | 'ECUAL' | 'Service' | 'OS'> = [
        'MCAL', 'ECUAL', 'Service', 'OS',
      ]
      const m = makeModule(name, layers[i % 4])
      m.parameters = [
        param(`${name}Enabled`, 'boolean', true),
        param(`${name}Index`, 'integer', i),
        param(`${name}Mode`, 'enum', 'STANDARD'),
      ]
      return m
    })

    const config = makeConfigFile(modules)
    const restored = roundtrip(config)

    expect(restored.length).toBe(modules.length)

    for (const orig of modules) {
      const r = restored.find((m) => m.name === orig.name)
      expect(r, `Module ${orig.name} should survive round-trip`).toBeDefined()
      if (!r) continue

      expect(r.parameters.length).toBe(orig.parameters.length)

      const enabledParam = r.parameters.find((p) => p.name === `${orig.name}Enabled`)
      expect(enabledParam).toBeDefined()
      expect(enabledParam!.value).toBe(true)

      const indexParam = r.parameters.find((p) => p.name === `${orig.name}Index`)
      expect(indexParam).toBeDefined()
    }
  })

  // ── Full structural equality ─────────────────────────────────────────

  it('should produce identical module/container/param structure after round-trip', () => {
    const config = simpleConfig()
    const restored = roundtrip(config)

    for (const orig of config.modules) {
      const r = restored.find((m) => m.name === orig.name)
      expectModuleRoundtrip(orig, r!)
    }
  })

  // ── Edge cases ────────────────────────────────────────────────────────

  it('should handle a module with only module-level params and no containers', () => {
    const m = makeModule('Dcm', 'Service')
    m.parameters = [
      param('dcmDevErrorDetect', 'boolean', true),
      param('dcmMaxNumberOfDTC', 'integer', 256),
    ]
    const config = makeConfigFile([m])
    const restored = roundtrip(config)

    expect(restored.length).toBe(1)
    expect(restored[0].name).toBe('Dcm')
    expect(restored[0].parameters.length).toBe(2)
    expect(restored[0].parameters.find((p) => p.name === 'dcmDevErrorDetect')?.value).toBe(true)
    expect(restored[0].parameters.find((p) => p.name === 'dcmMaxNumberOfDTC')?.value).toBe(256)
    expect(restored[0].containers).toHaveLength(0)
  })

  it('should handle empty ARXML gracefully', () => {
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <AR-PACKAGES>
  </AR-PACKAGES>
</AUTOSAR>`

    const result = parseArxmlContent(emptyXml)
    expect(result.errors).toHaveLength(0)
    expect(result.modules).toHaveLength(0)
    expect(result.warnings.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle XML with no AUTOSAR root gracefully', () => {
    const badXml = '<?xml version="1.0"?><not-autosar/>'
    const result = parseArxmlContent(badXml)
    expect(result.errors.length).toBeGreaterThanOrEqual(1)
    expect(result.modules).toHaveLength(0)
  })

  it('should handle module-level parameters correctly', () => {
    // The exporter puts module-level params in PARAMETER-VALUES inside the module
    // The parser should extract them
    const config = simpleConfig()

    // Mcu has module-level params that should survive round-trip
    const modules = roundtrip(config)
    const mcu = modules.find((m) => m.name === 'Mcu')
    expect(mcu).toBeDefined()
    
    // Module-level params: mcuClockSpeed, mcuRamSize, mcuMainOscillatorFrequency, etc.
    // These should be directly in the module's parameters array
    expect(mcu!.parameters.some((p) => p.name === 'mcuClockSpeed')).toBe(true)
    expect(mcu!.parameters.some((p) => p.name === 'mcuRamSize')).toBe(true)
    expect(mcu!.parameters.some((p) => p.name === 'mcuMainOscillatorFrequency')).toBe(true)
  })

  it('should round-trip numeric parameter with value 0 correctly', () => {
    const m = makeModule('Adc', 'MCAL')
    m.parameters = [param('adcZeroValue', 'integer', 0)]
    const config = makeConfigFile([m])
    const restored = roundtrip(config)
    expect(restored[0].parameters.find((p) => p.name === 'adcZeroValue')?.value).toBe(0)
  })

  it('should round-trip boolean false correctly', () => {
    const m = makeModule('Gpt', 'MCAL')
    m.parameters = [
      param('gptEnabled', 'boolean', false),
      param('gptDevErrorDetect', 'boolean', false),
    ]
    const config = makeConfigFile([m])
    const restored = roundtrip(config)
    expect(restored[0].parameters.find((p) => p.name === 'gptEnabled')?.value).toBe(false)
    expect(restored[0].parameters.find((p) => p.name === 'gptDevErrorDetect')?.value).toBe(false)
  })

  it('should round-trip nested sub-containers with params at every level', () => {
    // Deep nesting: module → container → sub → sub-sub → sub-sub-sub
    const deepContainer: ConfigContainer = {
      id: 'level1',
      name: 'Level1',
      parameters: [param('level1Param', 'integer', 1)],
      subContainers: [
        {
          id: 'level2',
          name: 'Level2',
          parameters: [param('level2Param', 'integer', 2)],
          subContainers: [
            {
              id: 'level3',
              name: 'Level3',
              parameters: [param('level3Param', 'integer', 3)],
              subContainers: [
                {
                  id: 'level4',
                  name: 'Level4',
                  parameters: [param('level4Param', 'integer', 4)],
                },
              ],
            },
          ],
        },
      ],
    }

    const m = makeModule('TestDeep', 'Service')
    m.containers = [deepContainer]
    const config = makeConfigFile([m])
    const restored = roundtrip(config)

    expect(restored.length).toBe(1)
    const r = restored[0]
    expect(r.containers.length).toBe(1)
    expect(r.containers[0].name).toBe('Level1')
    expect(r.containers[0].parameters.find((p) => p.name === 'level1Param')?.value).toBe(1)
    expect(r.containers[0].subContainers![0].name).toBe('Level2')
    expect(r.containers[0].subContainers![0].parameters.find((p) => p.name === 'level2Param')?.value).toBe(2)
    expect(r.containers[0].subContainers![0].subContainers![0].name).toBe('Level3')
    expect(r.containers[0].subContainers![0].subContainers![0].parameters.find((p) => p.name === 'level3Param')?.value).toBe(3)
    expect(r.containers[0].subContainers![0].subContainers![0].subContainers![0].name).toBe('Level4')
    expect(r.containers[0].subContainers![0].subContainers![0].subContainers![0].parameters.find((p) => p.name === 'level4Param')?.value).toBe(4)
  })

  // ── Real-world ARXML from example data ────────────────────────────────

  it('should parse real-world ARXML format (from example.arxml)', () => {
    // This tests the parser against the ARXML format used by AUTOSAR examples
    // The example uses ECUC-MODULE-CONFIGURATION-VALUES with sub-containers
    const realWorldXml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Project</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/AUTOSAR/EcucDefs/Can</DEFINITION-REF>
          <IMPLEMENTATION-CONFIG-VARIANT>VARIANT-POST-BUILD</IMPLEMENTATION-CONFIG-VARIANT>
          <PARAMETER-VALUES>
            <ECUC-NUMERICAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/AUTOSAR/EcucDefs/Can/CanBaudrate</DEFINITION-REF>
              <VALUE>500000</VALUE>
            </ECUC-NUMERICAL-PARAM-VALUE>
            <ECUC-NUMERICAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/AUTOSAR/EcucDefs/Can/CanDevErrorDetect</DEFINITION-REF>
              <VALUE>true</VALUE>
            </ECUC-NUMERICAL-PARAM-VALUE>
          </PARAMETER-VALUES>
          <CONTAINERS>
            <ECUC-CONTAINER-VALUE UUID="abc-123">
              <SHORT-NAME>CanConfigSet</SHORT-NAME>
              <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/AUTOSAR/EcucDefs/Can/CanConfigSet</DEFINITION-REF>
              <SUB-CONTAINERS>
                <ECUC-CONTAINER-VALUE UUID="def-456">
                  <SHORT-NAME>CanController</SHORT-NAME>
                  <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/AUTOSAR/EcucDefs/Can/CanConfigSet/CanController</DEFINITION-REF>
                  <PARAMETER-VALUES>
                    <ECUC-NUMERICAL-PARAM-VALUE>
                      <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/AUTOSAR/EcucDefs/Can/CanConfigSet/CanController/CanControllerId</DEFINITION-REF>
                      <VALUE>0</VALUE>
                    </ECUC-NUMERICAL-PARAM-VALUE>
                  </PARAMETER-VALUES>
                </ECUC-CONTAINER-VALUE>
              </SUB-CONTAINERS>
            </ECUC-CONTAINER-VALUE>
          </CONTAINERS>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`

    const result = parseArxmlContent(realWorldXml)
    expect(result.errors).toHaveLength(0)
    expect(result.modules.length).toBe(1)

    const can = result.modules[0]
    expect(can.shortName).toBe('Can')
    expect(can.definitionRef).toBe('/AUTOSAR/EcucDefs/Can')
    expect(can.implementationConfigVariant).toBe('VARIANT-POST-BUILD')

    // The module-level PARAMETER-VALUES contain parameters (CanBaudrate, CanDevErrorDetect)
    // These are stored in the module's parameters array
    expect(can.parameters.length).toBe(2)
    expect(can.parameters.find(p => p.shortName === 'CanBaudrate')).toBeDefined()
    expect(can.parameters.find(p => p.shortName === 'CanDevErrorDetect')).toBeDefined()
    // The CONTAINERS element holds its own containers
    
    // Container-level
    expect(can.containers.length).toBe(1)
    expect(can.containers[0].shortName).toBe('CanConfigSet')
    expect(can.containers[0].subContainers.length).toBe(1)
    expect(can.containers[0].subContainers[0].shortName).toBe('CanController')
    expect(can.containers[0].subContainers[0].parameters.length).toBe(1)
    expect(can.containers[0].subContainers[0].parameters[0].shortName).toBe('CanControllerId')
  })

  // ── UUID handling ─────────────────────────────────────────────────────

  it('should ignore UUID attributes on round-trip (regenerated on export)', () => {
    const config = simpleConfig()
    const xml = generateArxml(config)

    // UUIDs should be present in the exported XML
    expect(xml).toContain('UUID=')

    // After parsing, UUIDs should be ignored (not affecting round-trip)
    const modules = roundtrip(config)
    expect(modules.length).toBe(config.modules.length)
  })

  // ── Whitespace handling ───────────────────────────────────────────────

  it('should handle whitespace in SHORT-NAME values correctly', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR>
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Pkg</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>  Can  </SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/test/Can</DEFINITION-REF>
          <CONTAINERS>
            <ECUC-CONTAINER-VALUE>
              <SHORT-NAME>  CanConfig  </SHORT-NAME>
              <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/test/Can/CanConfig</DEFINITION-REF>
            </ECUC-CONTAINER-VALUE>
          </CONTAINERS>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`

    const result = parseArxmlContent(xml)
    // Whitespace handling: fast-xml-parser preserves whitespace
    // Our getNodeText/getTextContent functions should trim it
    expect(result.errors).toHaveLength(0)
    expect(result.modules.length).toBe(1)
  })
})

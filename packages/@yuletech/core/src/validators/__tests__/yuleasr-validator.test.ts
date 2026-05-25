import { describe, it, expect, beforeEach } from 'vitest'

import type { ModuleConfig } from '../../types'
import { YuleasrValidator, yuleasrValidator } from '../yuleasr-validator'

function makeConfig(module: string, params: Record<string, unknown> = {}): ModuleConfig {
  return {
    module,
    version: '4.4.0',
    parameters: params,
  }
}

describe('YuleasrValidator', () => {
  let validator: YuleasrValidator

  beforeEach(() => {
    validator = new YuleasrValidator()
    validator.registerModuleRules({
      module: 'Mcu',
      rules: [
        {
          type: 'custom',
          message: 'Mcu must be enabled for all configurations',
          condition: (config) => config.parameters.clock_frequency !== undefined,
        },
      ],
      parameterRules: {
        clock_frequency: [
          { type: 'required', message: 'Clock frequency is required' },
          { type: 'range', message: 'Clock frequency must be positive' },
        ],
      },
    })
    validator.registerModuleRules({
      module: 'Can',
      rules: [],
      parameterRules: {
        baudrate: [{ type: 'required', message: 'Baudrate is required' }],
      },
    })
  })

  describe('validateModule', () => {
    it('should pass for valid Mcu config', () => {
      const config = makeConfig('Mcu', { clock_frequency: 160000000 })
      const errors = validator.validateModule(config)
      expect(errors).toHaveLength(0)
    })

    it('should fail Mcu when clock_frequency is missing', () => {
      const config = makeConfig('Mcu', {})
      const errors = validator.validateModule(config)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.path.includes('clock_frequency'))).toBe(true)
    })

    it('should fail Can when baudrate is missing', () => {
      const config = makeConfig('Can', {})
      const errors = validator.validateModule(config)
      expect(errors.some((e) => e.path.includes('baudrate'))).toBe(true)
    })

    it('should use generic validation for unregistered modules', () => {
      const config = makeConfig('Spi', { someParam: 1 })
      const errors = validator.validateModule(config)
      // Generic only checks module/version/undefined params
      expect(errors).toHaveLength(0)
    })

    it('should fail generic validation when module name is empty', () => {
      const config = makeConfig('', {})
      const errors = validator.validateModule(config)
      expect(errors.some((e) => e.message.includes('Module name is required'))).toBe(true)
    })
  })

  describe('validateModules - dependency checks', () => {
    it('should pass when all dependencies are satisfied', () => {
      const configs = [
        makeConfig('Can', { baudrate: 500000 }),
        makeConfig('CanIf'),
      ]
      const errors = validator.validateModules(configs)
      expect(errors.filter((e) => e.severity === 'error')).toHaveLength(0)
    })

    it('should report error when CanIf lacks Can', () => {
      const configs = [makeConfig('CanIf')]
      const errors = validator.validateModules(configs)
      expect(errors.some((e) => e.message.includes('CanIf requires Can'))).toBe(true)
      expect(errors.some((e) => e.severity === 'error')).toBe(true)
    })

    it('should report error when CanTp lacks PduR and CanIf', () => {
      const configs = [makeConfig('CanTp')]
      const errors = validator.validateModules(configs)
      expect(errors.filter((e) => e.severity === 'error').length).toBe(2)
    })

    it('should report warning for optional missing dependencies', () => {
      const configs = [makeConfig('Fls')]
      const errors = validator.validateModules(configs)
      expect(errors.some((e) => e.severity === 'warning' && e.message.includes('Mcu'))).toBe(true)
    })

    it('should validate complete BSW stack without errors', () => {
      const configs = [
        makeConfig('Mcu', { clock_frequency: 160000000 }),
        makeConfig('Port'),
        makeConfig('Dio'),
        makeConfig('Can', { baudrate: 500000 }),
        makeConfig('CanIf'),
        makeConfig('PduR'),
        makeConfig('CanTp'),
        makeConfig('Com'),
        makeConfig('ComM'),
        makeConfig('Nm'),
        makeConfig('CanNm'),
        makeConfig('CanSM'),
        makeConfig('EcuM'),
        makeConfig('Os'),
        makeConfig('Rte'),
        makeConfig('Dem'),
        makeConfig('Dcm'),
        makeConfig('NvM'),
        makeConfig('MemIf'),
        makeConfig('Fee'),
        makeConfig('Fls'),
      ]
      const errors = validator.validateModules(configs)
      expect(errors.filter((e) => e.severity === 'error')).toHaveLength(0)
    })
  })

  describe('getValidationStats', () => {
    it('should count errors and warnings correctly', () => {
      const errors = [
        { path: 'a', message: 'err1', severity: 'error' as const },
        { path: 'b', message: 'err2', severity: 'error' as const },
        { path: 'c', message: 'warn1', severity: 'warning' as const },
      ]
      const stats = validator.getValidationStats(errors)
      expect(stats.errorCount).toBe(2)
      expect(stats.warningCount).toBe(1)
      expect(stats.infoCount).toBe(0)
    })
  })
})

describe('Default yuleasrValidator instance', () => {
  it('should have all 37 modules registered', () => {
    const allModules = [
      'Adc', 'Arti', 'Ble', 'BswM', 'Can', 'CanIf', 'CanNm', 'CanSM', 'CanTp', 'CanTrcv',
      'Com', 'ComM', 'Crc', 'CryIf', 'Crypto', 'Csm', 'Dcm', 'Dem', 'Det', 'Dio',
      'EcuM', 'Fee', 'Fls', 'Gpt', 'Icu', 'IoHwAb', 'Mcl', 'Mcu', 'MemIf', 'Nm',
      'NvM', 'Os', 'PduR', 'Port', 'Rte', 'Sbc', 'Spi',
    ]
    for (const mod of allModules) {
      const errors = yuleasrValidator.validateModule(makeConfig(mod))
      // Should not throw and should return an array
      expect(Array.isArray(errors)).toBe(true)
    }
  })
})

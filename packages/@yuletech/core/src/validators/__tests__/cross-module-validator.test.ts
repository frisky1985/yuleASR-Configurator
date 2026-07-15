import { describe, it, expect } from 'vitest'
import { CrossModuleValidator, createCrossModuleValidator } from '../cross-module-validator'
import type { ModuleSchema, ModuleConfig } from '../../types'

function makeSchema(name: string, overrides: Partial<ModuleSchema> = {}): ModuleSchema {
  return {
    name,
    label: name,
    layer: 'MCAL',
    version: '4.4.0',
    parameters: [],
    ...overrides,
  }
}

function makeConfig(module: string, params: Record<string, unknown> = {}): ModuleConfig {
  return {
    module,
    version: '4.4.0',
    parameters: params,
    ...(params._containers ? { containers: params._containers as Record<string, any[]> } : {}),
  }
}

describe('CrossModuleValidator', () => {
  describe('equals relation', () => {
    it('should pass when values match', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'canBaudrate',
              type: 'integer',
              crossReferences: [
                { module: 'CanTrcv', param: 'trcvBaudrate', relation: 'equals', severity: 'error', description: 'Baudrate must match transceiver' },
              ],
            },
          ],
        }),
        makeSchema('CanTrcv', {
          parameters: [{ name: 'trcvBaudrate', type: 'integer' }],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { canBaudrate: 500000 }),
        makeConfig('CanTrcv', { trcvBaudrate: 500000 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(0)
    })

    it('should fail when values differ', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'canBaudrate',
              type: 'integer',
              crossReferences: [
                { module: 'CanTrcv', param: 'trcvBaudrate', relation: 'equals', severity: 'error', description: 'Baudrate must match transceiver' },
              ],
            },
          ],
        }),
        makeSchema('CanTrcv', {
          parameters: [{ name: 'trcvBaudrate', type: 'integer' }],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { canBaudrate: 500000 }),
        makeConfig('CanTrcv', { trcvBaudrate: 250000 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(1)
      expect(errors[0].severity).toBe('error')
      expect(errors[0].message).toContain('500000')
      expect(errors[0].message).toContain('250000')
    })

    it('should skip when source param has no value', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'canBaudrate',
              type: 'integer',
              crossReferences: [
                { module: 'CanTrcv', param: 'trcvBaudrate', relation: 'equals', severity: 'error', description: '' },
              ],
            },
          ],
        }),
        makeSchema('CanTrcv'),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', {}), // canBaudrate not set
        makeConfig('CanTrcv', { trcvBaudrate: 500000 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(0)
    })
  })

  describe('less_than / greater_than relations', () => {
    it('should pass CanTrcv wakeup delay < EcuM timeout', () => {
      const schemas = [
        makeSchema('CanTrcv', {
          parameters: [
            {
              name: 'wakeupDelay',
              type: 'integer',
              crossReferences: [
                { module: 'EcuM', param: 'wakeupTimeout', relation: 'less_than', severity: 'error', description: 'Transceiver wakeup delay must be less than EcuM timeout' },
              ],
            },
          ],
        }),
        makeSchema('EcuM', {
          parameters: [{ name: 'wakeupTimeout', type: 'integer' }],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('CanTrcv', { wakeupDelay: 50 }),
        makeConfig('EcuM', { wakeupTimeout: 100 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(0)
    })

    it('should fail when less_than is violated', () => {
      const schemas = [
        makeSchema('CanTrcv', {
          parameters: [
            {
              name: 'wakeupDelay',
              type: 'integer',
              crossReferences: [
                { module: 'EcuM', param: 'wakeupTimeout', relation: 'less_than', severity: 'error', description: '' },
              ],
            },
          ],
        }),
        makeSchema('EcuM', {
          parameters: [{ name: 'wakeupTimeout', type: 'integer' }],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('CanTrcv', { wakeupDelay: 200 }),
        makeConfig('EcuM', { wakeupTimeout: 100 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('200 < 100')
    })

    it('should pass Gpt tick frequency > 0 with greater_than', () => {
      const schemas = [
        makeSchema('Gpt', {
          parameters: [
            {
              name: 'tickFrequency',
              type: 'integer',
              crossReferences: [
                { module: 'Mcu', param: 'minTickRate', relation: 'greater_than', severity: 'error', description: 'GPT tick must exceed MCU minimum' },
              ],
            },
          ],
        }),
        makeSchema('Mcu', {
          parameters: [{ name: 'minTickRate', type: 'integer' }],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Gpt', { tickFrequency: 1000 }),
        makeConfig('Mcu', { minTickRate: 100 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      expect(validator.validate(configs)).toHaveLength(0)
    })
  })

  describe('in_range relation', () => {
    it('should validate against target schema min/max constraints', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'canBaudrate',
              type: 'integer',
              crossReferences: [
                { module: 'CanTrcv', param: 'supportedBaudrate', relation: 'in_range', severity: 'error', description: 'Baudrate must be in transceiver range' },
              ],
            },
          ],
        }),
        makeSchema('CanTrcv', {
          parameters: [
            {
              name: 'supportedBaudrate',
              type: 'integer',
              min: 125000,
              max: 1000000,
            },
          ],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { canBaudrate: 500000 }),
        makeConfig('CanTrcv', { supportedBaudrate: 0 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      // canBaudrate=500000 is within the schema's [125000, 1000000] range → pass
      expect(validator.validate(configs)).toHaveLength(0)
    })

    it('should fail when value exceeds target schema max', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'canBaudrate',
              type: 'integer',
              crossReferences: [
                { module: 'CanTrcv', param: 'supportedBaudrate', relation: 'in_range', severity: 'error', description: '' },
              ],
            },
          ],
        }),
        makeSchema('CanTrcv', {
          parameters: [
            {
              name: 'supportedBaudrate',
              type: 'integer',
              min: 125000,
              max: 1000000,
            },
          ],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { canBaudrate: 2000000 }), // > 1000000
        makeConfig('CanTrcv', { supportedBaudrate: 0 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('大于')
      expect(errors[0].message).toContain('1000000')
    })
  })

  describe('in_enum relation', () => {
    it('should pass when value is in target enum options', () => {
      const schemas = [
        makeSchema('CanTrcv', {
          parameters: [
            {
              name: 'trcvType',
              type: 'string',
              crossReferences: [
                { module: 'Can', param: 'hwSupport', relation: 'in_enum', severity: 'error', description: 'Transceiver type must be supported by CAN hardware' },
              ],
            },
          ],
        }),
        makeSchema('Can', {
          parameters: [
            {
              name: 'hwSupport',
              type: 'enum',
              options: [
                { value: 'CAN_HIGH_SPEED', label: 'High Speed CAN' },
                { value: 'CAN_FD', label: 'CAN FD' },
                { value: 'CAN_LOW_SPEED', label: 'Low Speed CAN' },
              ],
            },
          ],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('CanTrcv', { trcvType: 'CAN_HIGH_SPEED' }),
        makeConfig('Can', { hwSupport: 'CAN_HIGH_SPEED' }),
      ]
      const validator = createCrossModuleValidator(schemas)
      expect(validator.validate(configs)).toHaveLength(0)
    })

    it('should fail when value is not in target enum options', () => {
      const schemas = [
        makeSchema('CanTrcv', {
          parameters: [
            {
              name: 'trcvType',
              type: 'string',
              crossReferences: [
                { module: 'Can', param: 'hwSupport', relation: 'in_enum', severity: 'error', description: '' },
              ],
            },
          ],
        }),
        makeSchema('Can', {
          parameters: [
            {
              name: 'hwSupport',
              type: 'enum',
              options: [
                { value: 'CAN_HIGH_SPEED', label: '' },
                { value: 'CAN_FD', label: '' },
              ],
            },
          ],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('CanTrcv', { trcvType: 'CAN_LIN' }), // not in enum
        makeConfig('Can', { hwSupport: 'CAN_HIGH_SPEED' }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('CAN_LIN')
    })
  })

  describe('container parameter reference', () => {
    it('should resolve parameter from container instance', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'refBaudrate',
              type: 'integer',
              crossReferences: [
                { module: 'CanTrcv', container: 'TrcvConfig', param: 'maxBaudrate', relation: 'less_than', severity: 'error', description: 'CAN baudrate must be less than transceiver max' },
              ],
            },
          ],
        }),
        makeSchema('CanTrcv', {
          parameters: [{ name: 'maxBaudrate', type: 'integer' }],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { refBaudrate: 500000 }),
        { module: 'CanTrcv', version: '4.4.0', parameters: {}, containers: { TrcvConfig: [{ id: 't0', parameters: { maxBaudrate: 1000000 } }] } },
      ]
      const validator = createCrossModuleValidator(schemas)
      expect(validator.validate(configs)).toHaveLength(0)
    })

    it('should fail when container param violates relation', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'refBaudrate',
              type: 'integer',
              crossReferences: [
                { module: 'CanTrcv', container: 'TrcvConfig', param: 'maxBaudrate', relation: 'less_than', severity: 'error', description: '' },
              ],
            },
          ],
        }),
        makeSchema('CanTrcv', {
          parameters: [{ name: 'maxBaudrate', type: 'integer' }],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { refBaudrate: 2000000 }),
        { module: 'CanTrcv', version: '4.4.0', parameters: {}, containers: { TrcvConfig: [{ id: 't0', parameters: { maxBaudrate: 1000000 } }] } },
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('2000000 < 1000000')
    })
  })

  describe('edge cases', () => {
    it('should handle missing target module gracefully', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'baudrate',
              type: 'integer',
              crossReferences: [
                { module: 'NonExistent', param: 'someParam', relation: 'equals', severity: 'error', description: '' },
              ],
            },
          ],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 500000 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(0) // target module not in configs, skip
    })

    it('should handle non-comparable types for less_than', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'mode',
              type: 'string',
              crossReferences: [
                { module: 'CanTrcv', param: 'maxDelay', relation: 'less_than', severity: 'error', description: '' },
              ],
            },
          ],
        }),
        makeSchema('CanTrcv', { parameters: [{ name: 'maxDelay', type: 'integer' }] }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { mode: 'normal' }), // string, not number
        makeConfig('CanTrcv', { maxDelay: 100 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validate(configs)
      expect(errors).toHaveLength(0) // non-comparable should be skipped
    })

    it('should validate multiple crossReferences on one parameter', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            {
              name: 'baudrate',
              type: 'integer',
              crossReferences: [
                { module: 'CanTrcv', param: 'maxBaud', relation: 'less_than', severity: 'error', description: 'Must be under transceiver max' },
                { module: 'Mcu', param: 'minAllowedBaud', relation: 'greater_than', severity: 'warning', description: 'Should exceed MCU minimum' },
              ],
            },
          ],
        }),
        makeSchema('CanTrcv', { parameters: [{ name: 'maxBaud', type: 'integer' }] }),
        makeSchema('Mcu', { parameters: [{ name: 'minAllowedBaud', type: 'integer' }] }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 500000 }),
        makeConfig('CanTrcv', { maxBaud: 1000000 }),
        makeConfig('Mcu', { minAllowedBaud: 125000 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      expect(validator.validate(configs)).toHaveLength(0)
    })
  })

  describe('incremental validateAffectedBy', () => {
    it('should only check forward references from changed param', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [{
            name: 'baudrate', type: 'integer',
            crossReferences: [
              { module: 'CanTrcv', param: 'maxBaud', relation: 'less_than', severity: 'error', description: '' },
            ],
          }],
        }),
        makeSchema('CanTrcv', { parameters: [{ name: 'maxBaud', type: 'integer' }] }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 500000 }),
        makeConfig('CanTrcv', { maxBaud: 1000000 }),
      ]
      const validator = createCrossModuleValidator(schemas)

      // Changing baudrate to exceed maxBaud
      const newConfigs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 2000000 }),
        makeConfig('CanTrcv', { maxBaud: 1000000 }),
      ]
      const errors = validator.validateAffectedBy(
        [{ module: 'Can', param: 'baudrate' }],
        newConfigs
      )
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('2000000 < 1000000')
    })

    it('should also check reverse references (params that reference the changed one)', () => {
      const schemas = [
        makeSchema('CanTrcv', {
          parameters: [{
            name: 'trcvType', type: 'string',
            crossReferences: [
              { module: 'Can', param: 'hwSupport', relation: 'in_enum', severity: 'error', description: '' },
            ],
          }],
        }),
        makeSchema('Can', {
          parameters: [{
            name: 'hwSupport', type: 'enum',
            options: [{ value: 'CAN_HIGH_SPEED', label: '' }, { value: 'CAN_FD', label: '' }],
          }],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('CanTrcv', { trcvType: 'CAN_HIGH_SPEED' }),
        makeConfig('Can', { hwSupport: 'CAN_HIGH_SPEED' }),
      ]
      const validator = createCrossModuleValidator(schemas)

      // Change the target enum value → CanTrcv's reference should now fail
      const newConfigs: ModuleConfig[] = [
        makeConfig('CanTrcv', { trcvType: 'CAN_LIN' }),
        makeConfig('Can', { hwSupport: 'CAN_HIGH_SPEED' }),
      ]
      const errors = validator.validateAffectedBy(
        [{ module: 'CanTrcv', param: 'trcvType' }],
        newConfigs
      )
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('CAN_LIN')
    })

    it('should skip when changed param has no cross-references', () => {
      const schemas = [
        makeSchema('Mcu', {
          parameters: [
            { name: 'clock', type: 'integer' },
            { name: 'irrelevant', type: 'integer' },
          ],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Mcu', { clock: 80000000, irrelevant: 42 }),
      ]
      const validator = createCrossModuleValidator(schemas)
      const errors = validator.validateAffectedBy(
        [{ module: 'Mcu', param: 'irrelevant' }],
        configs
      )
      expect(errors).toHaveLength(0)
    })

    it('should report both forward and reverse hits', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [{
            name: 'baudrate', type: 'integer',
            crossReferences: [
              { module: 'CanTrcv', param: 'maxBaud', relation: 'less_than', severity: 'error', description: 'forward' },
            ],
          }],
        }),
        makeSchema('CanTrcv', {
          parameters: [
            { name: 'maxBaud', type: 'integer' },
            {
              name: 'trcvType', type: 'string',
              crossReferences: [
                { module: 'Can', param: 'baudrate', relation: 'equals', severity: 'warning', description: 'reverse' },
              ],
            },
          ],
        }),
      ]
      const configs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 500000 }),
        makeConfig('CanTrcv', { maxBaud: 1000000, trcvType: 'FAST' }),
      ]
      const validator = createCrossModuleValidator(schemas)

      // Change baudrate — should trigger both forward (Can.baudrate → CanTrcv.maxBaud) and reverse (CanTrcv.trcvType → Can.baudrate)
      const newConfigs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 999999 }),
        makeConfig('CanTrcv', { maxBaud: 500000, trcvType: 'FAST' }),
      ]
      const errors = validator.validateAffectedBy(
        [{ module: 'Can', param: 'baudrate' }],
        newConfigs
      )
      // forward: 999999 < 500000 fails → error
      // reverse: trcvType 'FAST' ≠ 999999 → warning (equals)
      expect(errors.length).toBeGreaterThanOrEqual(1)
      expect(errors.some(e => e.message.includes('forward'))).toBe(true)
    })
  })
})

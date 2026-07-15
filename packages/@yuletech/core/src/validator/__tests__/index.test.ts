import { describe, it, expect } from 'vitest'
import { ConfigValidator, createValidator } from '../index'
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
  }
}

describe('ConfigValidator', () => {
  describe('container instance count', () => {
    it('should pass when container has valid instance count', () => {
      const schema = makeSchema('Can', {
        containers: [{
          name: 'CanController',
          label: 'CAN Controller',
          multiple: true,
          minInstances: 1,
          maxInstances: 4,
        }],
      })
      const config: ModuleConfig = {
        ...makeConfig('Can', { canBaudrate: 500000 }),
        containers: {
          CanController: [
            { id: 'ctrl0', parameters: { canBaudrate: 500000 } },
            { id: 'ctrl1', parameters: { canBaudrate: 250000 } },
          ],
        },
      }
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail when container has fewer instances than minInstances', () => {
      const schema = makeSchema('Can', {
        containers: [{
          name: 'CanController',
          label: 'CAN Controller',
          multiple: true,
          minInstances: 2,
          maxInstances: 4,
        }],
      })
      const config: ModuleConfig = {
        ...makeConfig('Can', { canBaudrate: 500000 }),
        containers: {
          CanController: [
            { id: 'ctrl0', parameters: { canBaudrate: 500000 } },
          ],
        },
      }
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.message.includes('至少需要 2'))).toBe(true)
    })

    it('should fail when container has more instances than maxInstances', () => {
      const schema = makeSchema('Can', {
        containers: [{
          name: 'CanController',
          label: 'CAN Controller',
          multiple: true,
          maxInstances: 2,
        }],
      })
      const config: ModuleConfig = {
        ...makeConfig('Can', { canBaudrate: 500000 }),
        containers: {
          CanController: [
            { id: 'ctrl0', parameters: {} },
            { id: 'ctrl1', parameters: {} },
            { id: 'ctrl2', parameters: {} },
          ],
        },
      }
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.message.includes('最多允许 2'))).toBe(true)
    })

    it('should pass when container has no min/max constraints', () => {
      const schema = makeSchema('Can', {
        containers: [{
          name: 'CanController',
          label: 'CAN Controller',
          multiple: true,
        }],
      })
      const config: ModuleConfig = {
        ...makeConfig('Can', { canBaudrate: 500000 }),
        containers: {
          CanController: [
            { id: 'ctrl0', parameters: {} },
            { id: 'ctrl1', parameters: {} },
          ],
        },
      }
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.valid).toBe(true)
    })

    it('should handle empty containers gracefully', () => {
      const schema = makeSchema('Can', {
        containers: [{
          name: 'CanController',
          label: 'CAN Controller',
          multiple: true,
          minInstances: 0,
        }],
      })
      const config: ModuleConfig = {
        ...makeConfig('Can', { canBaudrate: 500000 }),
        containers: {},
      }
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.valid).toBe(true)
    })

    it('should check all containers in schema', () => {
      const schema = makeSchema('Can', {
        containers: [
          {
            name: 'CanController',
            label: 'CAN Controller',
            multiple: true,
            minInstances: 1,
          },
          {
            name: 'CanHardwareObject',
            label: 'CAN HOH',
            multiple: true,
            maxInstances: 3,
          },
        ],
      })
      const config: ModuleConfig = {
        ...makeConfig('Can', {}),
        containers: {
          CanController: [
            { id: 'ctrl0', parameters: {} },
          ],
          CanHardwareObject: [
            { id: 'hoh0', parameters: {} },
            { id: 'hoh1', parameters: {} },
            { id: 'hoh2', parameters: {} },
            { id: 'hoh3', parameters: {} }, // 4 > max 3
          ],
        },
      }
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(1) // only maxInstances violation
      expect(result.errors[0].message).toContain('最多允许 3')
    })
  })

  describe('reference target validation', () => {
    it('should pass when referenced module exists', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [{
            name: 'canTrcvRef',
            type: 'reference',
            description: 'CAN Transceiver reference',
            referenceTarget: 'CanTrcv',
          }],
        }),
        makeSchema('CanTrcv'),
      ]
      const config = makeConfig('Can', { canTrcvRef: 'CanTrcv_0' })
      const validator = createValidator(schemas)
      const result = validator.validate(config)
      expect(result.valid).toBe(true)
    })

    it('should warn when referenced module is not registered', () => {
      const schema = makeSchema('Can', {
        parameters: [{
          name: 'canTrcvRef',
          type: 'reference',
          description: 'CAN Transceiver reference',
          referenceTarget: 'CanTrcv',
        }],
      })
      // Only Can registered, not CanTrcv
      const config = makeConfig('Can', { canTrcvRef: 'TC0' })
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.valid).toBe(true) // warning severity doesn't make valid=false
      expect(result.warnings.some(e => e.severity === 'warning' && e.message.includes('CanTrcv'))).toBe(true)
    })

    it('should skip reference validation when value is empty', () => {
      const schema = makeSchema('Can', {
        parameters: [{
          name: 'canTrcvRef',
          type: 'reference',
          referenceTarget: 'NonExistent',
        }],
      })
      const config = makeConfig('Can', { canTrcvRef: '' })
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.errors.length).toBe(0)
    })

    it('should warn for multiple reference params with missing targets', () => {
      const schemas = [
        makeSchema('Can', {
          parameters: [
            { name: 'trcvRef', type: 'reference', referenceTarget: 'CanTrcv' },
            { name: 'nmRef', type: 'reference', referenceTarget: 'CanNm' },
          ],
        }),
      ]
      const config = makeConfig('Can', { trcvRef: 'TC0', nmRef: 'NM0' })
      const validator = createValidator(schemas)
      const result = validator.validate(config)
      expect(result.warnings.filter(e => e.severity === 'warning').length).toBe(2)
    })

    it('should not warn for non-reference type parameters', () => {
      const schema = makeSchema('Mcu', {
        parameters: [
          { name: 'clock_frequency', type: 'integer', min: 0, max: 1000000000 },
          { name: 'core_count', type: 'integer' },
        ],
      })
      const config = makeConfig('Mcu', { clock_frequency: 160000000, core_count: 4 })
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.errors.length).toBe(0)
    })
  })

  describe('basic validation', () => {
    it('should fail for unknown module', () => {
      const config = makeConfig('Unknown')
      const validator = createValidator([])
      const result = validator.validate(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.message.includes('未找到模块'))).toBe(true)
    })

    it('should pass for valid module with no parameters', () => {
      const schema = makeSchema('Port')
      const config = makeConfig('Port')
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.valid).toBe(true)
    })

    it('should warn for unknown parameters', () => {
      const schema = makeSchema('Port')
      const config = makeConfig('Port', { nonExistentParam: 'test' })
      const validator = createValidator([schema])
      const result = validator.validate(config)
      expect(result.warnings.some(w => w.message.includes('未知参数'))).toBe(true)
    })
  })
})

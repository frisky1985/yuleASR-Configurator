/**
 * yuleASR Adapter 测试
 * 测试与真实 yuleASR 配置文件的兼容性
 */

import { describe, it, expect } from 'vitest'
import { yuleasrAdapter } from '../yuleasr-adapter'
import type { YuleasrBswConfig } from '../yuleasr-adapter'

// 真实 yuleASR 配置样例
const realYuleasrConfig: YuleasrBswConfig = {
  version: '1.0.0',
  modules: {
    Mcu: {
      name: 'Mcu',
      enabled: true,
      version: '1.0.0',
      parameters: {},
      clock_frequency: 800000000,
      core_count: 4
    },
    Can: {
      name: 'Can',
      enabled: true,
      version: '1.0.0',
      parameters: {},
      baudrate: 500000,
      controller_count: 2
    }
  }
}

describe('YuleasrAdapter', () => {
  describe('importFromYuleasr', () => {
    it('should import real yuleASR config correctly', () => {
      const jsonStr = JSON.stringify(realYuleasrConfig, null, 2)
      const modules = yuleasrAdapter.importFromYuleasr(jsonStr)
      
      expect(modules).toHaveLength(2)
      expect(modules[0].module).toBe('Mcu')
      expect(modules[1].module).toBe('Can')
      
      // 验证 Mcu 参数
      const mcuModule = modules.find(m => m.module === 'Mcu')
      expect(mcuModule).toBeDefined()
      expect(mcuModule?.parameters.clock_frequency).toBe(800000000)
      expect(mcuModule?.parameters.core_count).toBe(4)
      
      // 验证 Can 参数
      const canModule = modules.find(m => m.module === 'Can')
      expect(canModule).toBeDefined()
      expect(canModule?.parameters.baudrate).toBe(500000)
      expect(canModule?.parameters.controller_count).toBe(2)
    })
    
    it('should validate yuleASR config format', () => {
      const result = yuleasrAdapter.validateYuleasrConfig(JSON.stringify(realYuleasrConfig))
      expect(result.valid).toBe(true)
    })
    
    it('should reject invalid config', () => {
      const result = yuleasrAdapter.validateYuleasrConfig('{"invalid": true}')
      expect(result.valid).toBe(false)
    })
  })
  
  describe('exportToYuleasr', () => {
    it('should export to yuleASR format', () => {
      const modules = [
        {
          module: 'Mcu',
          version: '1.0.0',
          parameters: {
            clock_frequency: 800000000,
            core_count: 4
          }
        }
      ]
      
      const jsonStr = yuleasrAdapter.exportToYuleasr(modules)
      const exported = JSON.parse(jsonStr)
      
      expect(exported.version).toBe('1.0.0')
      expect(exported.modules.Mcu).toBeDefined()
      expect(exported.modules.Mcu.clock_frequency).toBe(800000000)
    })
  })
})

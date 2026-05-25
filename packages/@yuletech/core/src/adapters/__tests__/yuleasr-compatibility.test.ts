/**
 * yuleASR 配置兼容性测试
 * 测试与真实 yuleASR 配置文件的导入导出兼容性
 */

import { describe, it, expect } from 'vitest'

import { yuleasrAdapter } from '../yuleasr-adapter'
import type { YuleasrBswConfig } from '../yuleasr-adapter'

describe('yuleASR Compatibility Tests', () => {
  // 真实的 yuleASR MCU 配置格式
  const realMcuConfig = {
    module_type: 'mcu',
    ecu: 'ECU0',
    description: 'S32K312 MCU Configuration',
    general: {
      dev_error_detect: true,
      init_clock: true,
      version_info_api: false
    },
    clock_settings: [
      {
        name: 'McuClockSettingConfig_0',
        cpu_clock: 80000000,
        peripheral_clock: 40000000,
        bus_clock: 40000000
      }
    ],
    modes: [
      {
        name: 'McuModeSettingConf_RUN',
        mode: 'RUN'
      },
      {
        name: 'McuModeSettingConf_SLEEP',
        mode: 'SLEEP'
      }
    ],
    ram_sections: [
      {
        name: 'McuRamSectorSettingConf_0',
        size: 65536,
        address: '0x20000000'
      }
    ]
  }

  // 真实的 yuleASR RTE 配置格式
  const realRteConfig = {
    softwareComponents: [
      {
        name: 'SwcEngineCtrl',
        description: 'Engine Control Software Component',
        ports: [
          {
            name: 'PpEngineSpeed',
            direction: 'Provided',
            interfaceType: 'SenderReceiver',
            dataElements: [
              {
                name: 'EngineSpeed',
                type: 'uint16',
                comSignalId: 100
              }
            ]
          }
        ]
      }
    ]
  }

  describe('MCU Configuration', () => {
    it('应该正确导入 yuleASR MCU 配置', () => {
      const bswConfig: YuleasrBswConfig = {
        version: '1.0.0',
        modules: {
          Mcu: {
            name: 'Mcu',
            enabled: true,
            version: '1.0.0',
            parameters: {},
            ...realMcuConfig
          }
        }
      }

      const jsonStr = JSON.stringify(bswConfig, null, 2)
      const modules = yuleasrAdapter.importFromYuleasr(jsonStr)

      expect(modules).toHaveLength(1)
      expect(modules[0].module).toBe('Mcu')
      // 适配器将原始参数直接复制到 parameters，保留原始键名
      expect(modules[0].parameters.clock_settings).toBeDefined()
      expect(modules[0].parameters.general).toBeDefined()
    })

    it('应该正确导出 yuleASR MCU 配置', () => {
      const modules = [
        {
          module: 'Mcu',
          version: '1.0.0',
          parameters: {
            MCU_CLOCK_FREQUENCY: 80000000,
            MCU_PERIPHERAL_CLOCK: 40000000,
            MCU_BUS_CLOCK: 40000000,
            MCU_DEV_ERROR_DETECT: true,
            MCU_INIT_CLOCK: true,
            MCU_VERSION_INFO_API: false
          }
        }
      ]

      const jsonStr = yuleasrAdapter.exportToYuleasr(modules)
      const exported = JSON.parse(jsonStr) as YuleasrBswConfig

      expect(exported.version).toBe('1.0.0')
      expect(exported.modules.Mcu).toBeDefined()
      expect(exported.modules.Mcu.parameters.MCU_CLOCK_FREQUENCY).toBe(80000000)
    })
  })

  describe('RTE Configuration', () => {
    it('应该正确处理 yuleASR RTE 配置', () => {
      const bswConfig: YuleasrBswConfig = {
        version: '1.0.0',
        modules: {
          Rte: {
            name: 'Rte',
            enabled: true,
            version: '1.0.0',
            parameters: {},
            softwareComponents: realRteConfig.softwareComponents
          }
        }
      }

      const jsonStr = JSON.stringify(bswConfig, null, 2)
      const modules = yuleasrAdapter.importFromYuleasr(jsonStr)

      expect(modules).toHaveLength(1)
      expect(modules[0].module).toBe('Rte')
      expect(modules[0].parameters.softwareComponents).toBeDefined()
      
      const swcs = modules[0].parameters.softwareComponents as Array<Record<string, unknown>>
      expect(swcs).toHaveLength(1)
      expect(swcs[0].name).toBe('SwcEngineCtrl')
    })
  })

  describe('Configuration Validation', () => {
    it('应该验证 MCU 时钟配置的有效性', () => {
      const result = yuleasrAdapter.validateYuleasrConfig(JSON.stringify({
        version: '1.0.0',
        modules: {
          Mcu: {
            name: 'Mcu',
            enabled: true,
            version: '1.0.0',
            parameters: {},
            ...realMcuConfig
          }
        }
      }))

      expect(result.valid).toBe(true)
    })

    it('应该检测无效的配置', () => {
      const result = yuleasrAdapter.validateYuleasrConfig(JSON.stringify({
        version: 'invalid',
        modules: {}
      }))

      expect(result.valid).toBe(false)
    })
  })
})

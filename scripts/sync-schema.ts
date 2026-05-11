#!/usr/bin/env tsx
/**
 * yuleASR Schema 导入脚本
 * 从 yuleASR 代码工程导入模块定义为 JSON Schema
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * yuleASR 模块定义 (基于 OpenSpec)
 */
interface YuleASRModule {
  name: string;
  layer: 'MCAL' | 'ECUAL' | 'Service' | 'RTE' | 'ASW';
  version: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description?: string;
    default?: unknown;
    required?: boolean;
    min?: number;
    max?: number;
    options?: Array<{ value: string | number; label: string }>;
  }>;
}

/**
 * 内置的 yuleASR MCAL 模块定义
 * 基于 yuleASR/openspec/specs/bsw/spec.md 解析
 */
const MCAL_MODULES: YuleASRModule[] = [
  {
    name: 'Mcu',
    layer: 'MCAL',
    version: '4.4.0',
    description: '微控制器驱动 - 时钟初始化与低功耗管理',
    parameters: [
      {
        name: 'McuClockSetting',
        type: 'reference',
        description: '时钟配置引用',
        required: true,
      },
      {
        name: 'McuRamSectorSetting',
        type: 'reference',
        description: 'RAM 区域配置',
      },
      {
        name: 'McuModeSetting',
        type: 'reference',
        description: '运行模式配置',
      },
    ],
  },
  {
    name: 'Port',
    layer: 'MCAL',
    version: '4.4.0',
    description: 'GPIO 端口驱动 - 引脚方向和复用功能配置',
    parameters: [
      {
        name: 'PortContainer',
        type: 'container',
        description: '端口容器配置',
        required: true,
      },
      {
        name: 'PortPinMode',
        type: 'enum',
        description: '引脚模式',
        options: [
          { value: 'PORT_PIN_MODE_DIO', label: 'Digital I/O' },
          { value: 'PORT_PIN_MODE_CAN', label: 'CAN' },
          { value: 'PORT_PIN_MODE_SPI', label: 'SPI' },
          { value: 'PORT_PIN_MODE_PWM', label: 'PWM' },
          { value: 'PORT_PIN_MODE_ADC', label: 'ADC' },
        ],
      },
    ],
  },
  {
    name: 'Can',
    layer: 'MCAL',
    version: '4.4.0',
    description: 'CAN 驱动 - 控制器区域网络',
    parameters: [
      {
        name: 'CanController',
        type: 'container',
        description: 'CAN 控制器配置',
        required: true,
      },
      {
        name: 'CanHardwareObject',
        type: 'container',
        description: '硬件对象配置',
      },
      {
        name: 'CanBaudrate',
        type: 'integer',
        description: '波特率 (kbps)',
        default: 500,
        min: 10,
        max: 1000,
      },
    ],
  },
  {
    name: 'Spi',
    layer: 'MCAL',
    version: '4.4.0',
    description: 'SPI 串行外设接口驱动',
    parameters: [
      {
        name: 'SpiChannel',
        type: 'container',
        description: 'SPI 通道配置',
      },
      {
        name: 'SpiJob',
        type: 'container',
        description: 'SPI 作业配置',
      },
      {
        name: 'SpiSequence',
        type: 'container',
        description: 'SPI 序列配置',
      },
    ],
  },
  {
    name: 'Adc',
    layer: 'MCAL',
    version: '4.4.0',
    description: '模拟/数字转换器驱动',
    parameters: [
      {
        name: 'AdcChannel',
        type: 'container',
        description: 'ADC 通道配置',
      },
      {
        name: 'AdcGroup',
        type: 'container',
        description: 'ADC 组配置',
      },
      {
        name: 'AdcResolution',
        type: 'enum',
        description: '分辨率',
        options: [
          { value: 'ADC_RESOLUTION_8_BIT', label: '8-bit' },
          { value: 'ADC_RESOLUTION_10_BIT', label: '10-bit' },
          { value: 'ADC_RESOLUTION_12_BIT', label: '12-bit' },
        ],
        default: 'ADC_RESOLUTION_12_BIT',
      },
    ],
  },
];

/**
 * ECUAL 模块定义
 */
const ECUAL_MODULES: YuleASRModule[] = [
  {
    name: 'CanIf',
    layer: 'ECUAL',
    version: '4.4.0',
    description: 'CAN 接口 - 提供统一的 CAN 通信接口',
    parameters: [
      {
        name: 'CanIfPduCfg',
        type: 'container',
        description: 'PDU 配置',
      },
      {
        name: 'CanIfHrhCfg',
        type: 'container',
        description: '硬件接收句柄配置',
      },
    ],
  },
  {
    name: 'IoHwAb',
    layer: 'ECUAL',
    version: '4.4.0',
    description: 'I/O 硬件抽象层',
    parameters: [
      {
        name: 'IoHwAbDio',
        type: 'container',
        description: '数字 I/O 配置',
      },
      {
        name: 'IoHwAbAdc',
        type: 'container',
        description: 'ADC 配置',
      },
    ],
  },
];

/**
 * Service 层模块定义
 */
const SERVICE_MODULES: YuleASRModule[] = [
  {
    name: 'Com',
    layer: 'Service',
    version: '4.4.0',
    description: '通信服务 - 信号的收发和网关',
    parameters: [
      {
        name: 'ComIPdu',
        type: 'container',
        description: 'IPDU 配置',
      },
      {
        name: 'ComSignal',
        type: 'container',
        description: '信号配置',
      },
      {
        name: 'ComGateway',
        type: 'boolean',
        description: '启用网关功能',
        default: false,
      },
    ],
  },
  {
    name: 'PduR',
    layer: 'Service',
    version: '4.4.0',
    description: 'PDU 路由服务',
    parameters: [
      {
        name: 'PduRRoutingPath',
        type: 'container',
        description: '路由路径配置',
      },
      {
        name: 'PduRBswModule',
        type: 'container',
        description: 'BSW 模块配置',
      },
    ],
  },
  {
    name: 'NvM',
    layer: 'Service',
    version: '4.4.0',
    description: '非易失性内存管理',
    parameters: [
      {
        name: 'NvMBlockDescriptor',
        type: 'container',
        description: 'NVM 块描述符',
      },
      {
        name: 'NvMSize',
        type: 'integer',
        description: 'NVM 大小 (bytes)',
        default: 1024,
        min: 64,
        max: 65536,
      },
    ],
  },
  {
    name: 'Dcm',
    layer: 'Service',
    version: '4.4.0',
    description: '诊断通信管理 - UDS 协议实现',
    parameters: [
      {
        name: 'DcmDsdServiceTable',
        type: 'container',
        description: '服务表配置',
      },
      {
        name: 'DcmDspData',
        type: 'container',
        description: '数据标识符配置',
      },
    ],
  },
  {
    name: 'Dem',
    layer: 'Service',
    version: '4.4.0',
    description: '诊断事件管理 - DTC 和故障处理',
    parameters: [
      {
        name: 'DemEventParameter',
        type: 'container',
        description: '事件参数',
      },
      {
        name: 'DemDTCClass',
        type: 'container',
        description: 'DTC 类别',
      },
    ],
  },
];

/**
 * 将模块转换为 JSON Schema
 */
function moduleToJsonSchema(module: YuleASRModule): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const param of module.parameters) {
    const prop: Record<string, unknown> = {
      description: param.description,
    };

    // 类型映射
    switch (param.type) {
      case 'boolean':
        prop.type = 'boolean';
        break;
      case 'integer':
        prop.type = 'integer';
        if (param.min !== undefined) prop.minimum = param.min;
        if (param.max !== undefined) prop.maximum = param.max;
        break;
      case 'float':
        prop.type = 'number';
        if (param.min !== undefined) prop.minimum = param.min;
        if (param.max !== undefined) prop.maximum = param.max;
        break;
      case 'string':
      case 'reference':
        prop.type = 'string';
        break;
      case 'enum':
        prop.type = 'string';
        if (param.options) {
          prop.enum = param.options.map(opt => opt.value);
        }
        break;
      case 'container':
        prop.type = 'object';
        prop.additionalProperties = true;
        break;
      default:
        prop.type = 'string';
    }

    if (param.default !== undefined) {
      prop.default = param.default;
    }

    properties[param.name] = prop;

    if (param.required) {
      required.push(param.name);
    }
  }

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://yuletech.io/schemas/modules/${module.name.toLowerCase()}.json`,
    title: `${module.name} Configuration`,
    description: module.description,
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: false,
    'x-layer': module.layer,
    'x-version': module.version,
  };
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  // 获取项目根目录
  const rootDir = process.cwd();
  const targetDir = path.join(rootDir, 'packages/@yuletech/core/src/schema/generated');
  
  console.log('🔄 开始从 yuleASR 导入 Schema...');
  
  // 确保目录存在
  await fs.mkdir(targetDir, { recursive: true });
  
  // 合并所有模块
  const allModules = [...MCAL_MODULES, ...ECUAL_MODULES, ...SERVICE_MODULES];
  
  // 生成每个模块的 Schema
  for (const module of allModules) {
    const schema = moduleToJsonSchema(module);
    const outputPath = path.join(targetDir, `${module.name.toLowerCase()}.json`);
    
    await fs.writeFile(outputPath, JSON.stringify(schema, null, 2));
    console.log(`  ✅ ${module.name} (${module.layer})`);
  }
  
  // 生成模块索引
  const indexContent = allModules
    .map(m => `export { default as ${m.name} } from './${m.name.toLowerCase()}.json';`)
    .join('\n');
  
  await fs.writeFile(path.join(targetDir, 'index.ts'), indexContent);
  console.log(`  ✅ 索引文件`);
  
  console.log(`\n✅ 完成！共导入 ${allModules.length} 个模块定义`);
  console.log(`📁 输出目录: ${targetDir}`);
}

main().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});

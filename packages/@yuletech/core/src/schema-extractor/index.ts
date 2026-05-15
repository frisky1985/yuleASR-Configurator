/**
 * Schema Extractor
 * 从 yuleASR 源码中提取配置 Schema 定义
 * 支持解析 C 头文件中的 Ecuc 配置参数
 */

import type { ModuleSchema, ModuleParameter, ModuleLayer } from '../types';

/**
 * 从 yuleASR 头文件内容提取 Schema
 * 支挎格式: #define MCU_PARAM_NAME (value)
 * 支挎格式: #define MCU_PARAM_NAME ((type)value)
 */
export function extractSchemaFromHeader(
  moduleName: string,
  headerContent: string
): Partial<ModuleSchema> {
  const schema: Partial<ModuleSchema> = {
    name: moduleName,
    version: '1.0.0',
    parameters: [],
  };

  // 解析 #define 宏定义
  const defineRegex = /#define\s+([A-Z][A-Z0-9_]+)\s+\(?\s*\(\s*([^)]+)\s*\)\s*([^\s;]+)\s*\)?/g;
  let match;

  while ((match = defineRegex.exec(headerContent)) !== null) {
    const paramName = match[1];
    const typeStr = match[2].trim();
    const valueStr = match[3].trim();

    const param: ModuleParameter = {
      name: paramName,
      type: inferTypeFromString(typeStr, valueStr),
      default: parseValue(valueStr),
      description: `Extracted from header: ${paramName}`,
    };

    // 添加数值范围限制
    if (param.type === 'integer' || param.type === 'float') {
      param.min = 0;
      param.max = inferMaxFromType(typeStr);
    }

    schema.parameters?.push(param);
  }

  // 也尝试简单的 #define NAME value 格式
  const simpleDefineRegex = /#define\s+([A-Z][A-Z0-9_]+)\s+(\d+|0x[0-9A-Fa-f]+|true|false|"[^"]*")/g;
  while ((match = simpleDefineRegex.exec(headerContent)) !== null) {
    const paramName = match[1];
    const valueStr = match[2];

    // 检查是否已存在
    if (schema.parameters?.some(p => p.name === paramName)) {
      continue;
    }

    const param: ModuleParameter = {
      name: paramName,
      type: inferTypeFromValue(valueStr),
      default: parseValue(valueStr),
      description: `Extracted from header: ${paramName}`,
    };

    schema.parameters?.push(param);
  }

  return schema;
}

/**
 * 从类型字符串推断参数类型
 */
function inferTypeFromString(typeStr: string, valueStr: string): ModuleParameter['type'] {
  const typeLower = typeStr.toLowerCase();
  
  if (typeLower.includes('bool')) return 'boolean';
  if (typeLower.includes('float') || typeLower.includes('double')) return 'float';
  if (typeLower.includes('uint') || typeLower.includes('int')) return 'integer';
  if (typeLower.includes('char') || typeLower.includes('string')) return 'string';
  
  // 根据值推断
  return inferTypeFromValue(valueStr);
}

/**
 * 从值推断类型
 */
function inferTypeFromValue(valueStr: string): ModuleParameter['type'] {
  if (valueStr === 'true' || valueStr === 'false') return 'boolean';
  if (valueStr.startsWith('"') && valueStr.endsWith('"')) return 'string';
  if (valueStr.startsWith('0x')) return 'integer';
  if (valueStr.includes('.')) return 'float';
  if (!isNaN(Number(valueStr))) return 'integer';
  return 'string';
}

/**
 * 解析值字符串
 */
function parseValue(valueStr: string): unknown {
  if (valueStr === 'true') return true;
  if (valueStr === 'false') return false;
  if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
    return valueStr.slice(1, -1);
  }
  if (valueStr.startsWith('0x')) {
    return parseInt(valueStr, 16);
  }
  if (!isNaN(Number(valueStr))) {
    return Number(valueStr);
  }
  return valueStr;
}

/**
 * 根据类型推断最大值
 */
function inferMaxFromType(typeStr: string): number {
  const typeLower = typeStr.toLowerCase();
  
  if (typeLower.includes('uint8')) return 255;
  if (typeLower.includes('uint16')) return 65535;
  if (typeLower.includes('uint32')) return 4294967295;
  if (typeLower.includes('int8')) return 127;
  if (typeLower.includes('int16')) return 32767;
  if (typeLower.includes('int32')) return 2147483647;
  
  return Number.MAX_SAFE_INTEGER;
}

/**
 * Schema 提取器类
 */
export class SchemaExtractor {
  private schemas: Map<string, ModuleSchema> = new Map();

  /**
   * 注册模块 Schema
   */
  registerSchema(schema: ModuleSchema): void {
    this.schemas.set(schema.name, schema);
  }

  /**
   * 获取模块 Schema
   */
  getSchema(moduleName: string): ModuleSchema | undefined {
    return this.schemas.get(moduleName);
  }

  /**
   * 获取所有模块的 Schema
   */
  getAllSchemas(): ModuleSchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * 从头文件内容提取并注册
   */
  extractAndRegister(moduleName: string, headerContent: string, layer: ModuleLayer = 'MCAL'): ModuleSchema {
    const extracted = extractSchemaFromHeader(moduleName, headerContent);
    const schema: ModuleSchema = {
      name: extracted.name || moduleName,
      version: extracted.version || '1.0.0',
      parameters: extracted.parameters || [],
      layer: layer,
    };
    this.registerSchema(schema);
    return schema;
  }

  /**
   * 导出所有 Schema 为 JSON
   */
  exportToJSON(): string {
    const exportData = {
      version: '1.0.0',
      modules: Object.fromEntries(
        Array.from(this.schemas.entries()).map(([name, schema]) => [
          name,
          {
            name: schema.name,
            version: schema.version,
            parameterCount: schema.parameters.length,
            parameters: schema.parameters,
          },
        ])
      ),
    };
    return JSON.stringify(exportData, null, 2);
  }
}

// 默认实例
export const schemaExtractor = new SchemaExtractor();

// 默认的 Mcu 模块 Schema
export const defaultMcuSchema: ModuleSchema = {
  name: 'Mcu',
  version: '1.0.0',
  layer: 'MCAL',
  parameters: [
    {
      name: 'MCU_CLOCK_FREQUENCY',
      type: 'integer',
      default: 800000000,
      description: '主时钟频率 (Hz)',
      min: 1000000,
      max: 10000000000,
    },
    {
      name: 'MCU_CORE_COUNT',
      type: 'integer',
      default: 4,
      description: 'CPU 核心数量',
      min: 1,
      max: 8,
    },
    {
      name: 'MCU_PLL_ENABLED',
      type: 'boolean',
      default: true,
      description: 'PLL 使能',
    },
  ],
};

// 默认的 Can 模块 Schema
export const defaultCanSchema: ModuleSchema = {
  name: 'Can',
  version: '1.0.0',
  layer: 'ECUAL',
  parameters: [
    {
      name: 'CAN_BAUDRATE',
      type: 'integer',
      default: 500000,
      description: 'CAN 波特率',
      options: [
        { value: 125000, label: '125 kbps' },
        { value: 250000, label: '250 kbps' },
        { value: 500000, label: '500 kbps' },
        { value: 1000000, label: '1 Mbps' },
      ],
    },
    {
      name: 'CAN_CONTROLLER_COUNT',
      type: 'integer',
      default: 2,
      description: 'CAN 控制器数量',
      min: 1,
      max: 8,
    },
    {
      name: 'CAN_FD_ENABLED',
      type: 'boolean',
      default: false,
      description: 'CAN FD 使能',
    },
  ],
};

// 默认的 Gpt 模块 Schema
export const defaultGptSchema: ModuleSchema = {
  name: 'Gpt',
  version: '1.0.0',
  layer: 'MCAL',
  parameters: [
    {
      name: 'GPT_CHANNEL_COUNT',
      type: 'integer',
      default: 4,
      description: 'GPT 通道数量',
      min: 1,
      max: 16,
    },
    {
      name: 'GPT_TICK_FREQUENCY',
      type: 'integer',
      default: 1000,
      description: 'GPT 时钟频率 (Hz)',
      min: 1,
      max: 1000000,
    },
  ],
};

// 初始化默认 Schemas
schemaExtractor.registerSchema(defaultMcuSchema);
schemaExtractor.registerSchema(defaultCanSchema);
schemaExtractor.registerSchema(defaultGptSchema);

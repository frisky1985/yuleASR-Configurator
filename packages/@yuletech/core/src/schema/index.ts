/**
 * @yuletech/core - Schema
 * JSON Schema 定义和构建工具
 */

export * from './generated';

import type { ModuleSchema, ModuleParameter, ParameterType } from '../types';

/**
 * JSON Schema 版本
 */
export const JSON_SCHEMA_VERSION = 'https://json-schema.org/draft/2020-12/schema';

/**
 * 将模块参数转换为 JSON Schema 属性
 */
function parameterToJsonSchema(param: ModuleParameter): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    type: jsonSchemaType(param.type),
    description: param.description,
  };

  if (param.default !== undefined) {
    schema.default = param.default;
  }

  switch (param.type) {
    case 'integer':
    case 'float':
      if (param.min !== undefined) schema.minimum = param.min;
      if (param.max !== undefined) schema.maximum = param.max;
      break;
    case 'string':
      if (param.minLength !== undefined) schema.minLength = param.minLength;
      if (param.maxLength !== undefined) schema.maxLength = param.maxLength;
      if (param.pattern) schema.pattern = param.pattern;
      break;
    case 'enum':
      if (param.options) {
        schema.enum = param.options.map(opt => opt.value);
      }
      break;
    case 'array':
      if (param.items) {
        schema.items = parameterToJsonSchema(param.items);
      }
      break;
    case 'object':
      if (param.properties) {
        schema.properties = Object.fromEntries(
          param.properties.map(p => [p.name, parameterToJsonSchema(p)])
        );
      }
      break;
    case 'reference':
      schema.type = 'string';
      if (param.referenceTarget) {
        schema.description = `${param.description} (Reference to: ${param.referenceTarget})`;
      }
      break;
  }

  return schema;
}

/**
 * 将内部类型转换为 JSON Schema 类型
 */
function jsonSchemaType(type: ParameterType): string {
  switch (type) {
    case 'boolean':
      return 'boolean';
    case 'integer':
      return 'integer';
    case 'float':
      return 'number';
    case 'string':
    case 'reference':
      return 'string';
    case 'enum':
      return 'string';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    default:
      return 'string';
  }
}

/**
 * 将模块 Schema 转换为 JSON Schema
 */
export function moduleToJsonSchema(module: ModuleSchema): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const param of module.parameters) {
    properties[param.name] = parameterToJsonSchema(param);
    if (param.required) {
      required.push(param.name);
    }
  }

  return {
    $schema: JSON_SCHEMA_VERSION,
    $id: `https://yuletech.io/schemas/modules/${module.name.toLowerCase()}.json`,
    title: `${module.label || module.name} Configuration`,
    description: module.description,
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: false,
  };
}

/**
 * Schema 缓存
 */
export class SchemaCache {
  private cache = new Map<string, Record<string, unknown>>();

  set(name: string, schema: Record<string, unknown>): void {
    this.cache.set(name.toLowerCase(), schema);
  }

  get(name: string): Record<string, unknown> | undefined {
    return this.cache.get(name.toLowerCase());
  }

  has(name: string): boolean {
    return this.cache.has(name.toLowerCase());
  }

  getAll(): Map<string, Record<string, unknown>> {
    return new Map(this.cache);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * 全局 Schema 缓存实例
 */
export const schemaCache = new SchemaCache();

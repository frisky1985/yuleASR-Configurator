/**
 * @yuletech/core - Generated Schema Loader
 *
 * 将 54 个 generated/*.json (ModuleJsonSchema 嵌套结构) 转换为
 * 扁平 ModuleSchema[] (parameters + containers + 模块级 crossReferences)，
 * 供 CrossModuleValidator / ValidationPipeline / UI 消费。
 *
 * 此前 54 个 JSON 从未被加载成扁平 ModuleSchema，导致 crossReferences
 * 标注存在但从未生效。本 loader 是 P2-2 链路打通的核心。
 */

import type {
  ModuleSchema,
  ModuleParameter,
  ContainerSchema,
  CrossModuleReference,
  ModuleLayer,
} from '../types';

import * as generated from './generated';

/** JSON Schema property (局部定义，避免依赖内部 JsonSchemaProperty) */
interface JsonProp {
  type?: string;
  description?: string;
  enum?: Array<string | number | boolean>;
  minimum?: number;
  maximum?: number;
  items?: JsonProp;
  properties?: Record<string, JsonProp>;
  required?: string[];
  default?: unknown;
}

interface GeneratedModuleJson {
  title?: string;
  description?: string;
  type?: string;
  properties?: Record<string, JsonProp>;
  required?: string[];
  'x-layer'?: string;
  'x-version'?: string;
  'x-source'?: string;
  crossReferences?: CrossModuleReference[];
}

/** 容器名后缀，用于识别"配置容器" (描述含"配置容器"或"容器") */
function isContainerProp(prop: JsonProp, key: string): boolean {
  if (prop.type !== 'object' || !prop.properties) return false;
  const desc = (prop.description || '').toLowerCase();
  return desc.includes('容器') || desc.includes('container') || key.endsWith('Set') || key.endsWith('Config');
}

/**
 * 将 JSON 参数属性转为扁平 ModuleParameter
 */
function jsonPropToParameter(
  key: string,
  prop: JsonProp,
  options: { fallbackType?: ModuleParameter['type'] } = {}
): ModuleParameter {
  const param: ModuleParameter = {
    name: key,
    type: jsonTypeToParamType(prop.type, prop.enum, options.fallbackType),
    description: prop.description || `${key} 参数`,
  };

  if (prop.default !== undefined) {
    param.default = prop.default;
  }
  if (typeof prop.minimum === 'number') param.min = prop.minimum;
  if (typeof prop.maximum === 'number') param.max = prop.maximum;
  if (Array.isArray(prop.enum)) {
    param.options = prop.enum.map(v => ({ value: v, label: String(v) }));
  }
  if (Array.isArray(prop.required)) {
    param.required = prop.required.length > 0;
  }

  return param;
}

/** JSON Schema type → ModuleParameter type */
function jsonTypeToParamType(
  jsonType: string | undefined,
  enumValues?: Array<string | number | boolean>,
  fallback: ModuleParameter['type'] = 'string'
): ModuleParameter['type'] {
  if (Array.isArray(enumValues) && enumValues.length > 0) return 'enum';
  switch (jsonType) {
    case 'boolean':
      return 'boolean';
    case 'integer':
      return 'integer';
    case 'number':
      return 'float';
    case 'string':
      return 'string';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    default:
      return fallback;
  }
}

/** 递归构建容器树 */
function buildContainer(
  name: string,
  prop: JsonProp,
  modulePrefix: string
): { container: ContainerSchema; flatParams: ModuleParameter[] } {
  const flatParams: ModuleParameter[] = [];
  const children: ContainerSchema[] = [];
  const paramNames: string[] = [];

  const props = prop.properties || {};
  for (const [childKey, childProp] of Object.entries(props)) {
    if (isContainerProp(childProp, childKey)) {
      const { container, flatParams: childFlat } = buildContainer(childKey, childProp, modulePrefix);
      children.push(container);
      flatParams.push(...childFlat);
    } else {
      const param = jsonPropToParameter(childKey, childProp);
      paramNames.push(childKey);
      flatParams.push(param);
    }
  }

  const container: ContainerSchema = {
    name,
    label: name,
    description: prop.description || `${name} 配置容器`,
    parameters: paramNames,
    ...(children.length > 0 ? { children } : {}),
  };

  return { container, flatParams };
}

/**
 * 将单个 generated JSON 转为扁平 ModuleSchema
 */
export function generatedJsonToModuleSchema(
  moduleName: string,
  json: GeneratedModuleJson
): ModuleSchema {
  const layer = (json['x-layer'] || 'Service') as ModuleLayer;
  const version = json['x-version'] || '4.4.0';

  const containers: ContainerSchema[] = [];
  const parameters: ModuleParameter[] = [];

  for (const [containerKey, containerProp] of Object.entries(json.properties || {})) {
    if (isContainerProp(containerProp, containerKey)) {
      const { container, flatParams } = buildContainer(containerKey, containerProp, moduleName);
      containers.push(container);
      parameters.push(...flatParams);
    } else {
      // 顶层非容器属性 (如 ComponentName) — 直接作为参数
      parameters.push(jsonPropToParameter(containerKey, containerProp));
    }
  }

  const schema: ModuleSchema = {
    name: moduleName,
    label: json.title || moduleName,
    layer,
    version,
    description: json.description || `${moduleName} module configuration`,
    parameters,
    containers,
  };

  if (Array.isArray(json.crossReferences) && json.crossReferences.length > 0) {
    schema.crossReferences = json.crossReferences;
  }

  return schema;
}

/**
 * 加载全部 54 个 generated JSON 为扁平 ModuleSchema[]
 */
export function loadModuleSchemas(): ModuleSchema[] {
  const entries = Object.entries(generated) as Array<[string, GeneratedModuleJson]>;
  return entries
    .map(([exportName, json]) => generatedJsonToModuleSchema(exportName, json))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** 默认导出: 与 schemaExtractor 注册兼容的单例 schema 列表 */
export const moduleSchemas: ModuleSchema[] = loadModuleSchemas();

export default moduleSchemas;

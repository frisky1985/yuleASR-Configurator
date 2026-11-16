import { matchesParamKey } from './param-update';

import type {
  ConfigContainer,
  ConfigFile,
  ConfigModule,
  ConfigParameter,
  FixDescriptor,
  ParameterValue,
} from '@/types';

/** 模块按 name 或 id 命中 */
function isTargetModule(module: ConfigModule, name: string): boolean {
  return module.name === name || module.id === name;
}

/**
 * 按 containerPath 分段逐层下沉，每段在当前层容器中按 id 或 name 匹配。
 * 返回索引链；任一段找不到返回 null。
 */
function resolveContainerPath(containers: ConfigContainer[], segments: string[]): number[] | null {
  const indexes: number[] = [];
  let level: ConfigContainer[] = containers;

  for (const segment of segments) {
    const index = level.findIndex(c => c.id === segment || c.name === segment);
    if (index < 0) return null;
    indexes.push(index);
    level = level[index].subContainers ?? [];
  }
  return indexes;
}

/** 更新参数；参数不存在或值已相等时返回 null（调用方据此保持原引用） */
function applyToParams(
  parameters: ConfigParameter[],
  paramKey: string,
  value: ParameterValue
): ConfigParameter[] | null {
  const index = parameters.findIndex(p => matchesParamKey(p, paramKey));
  if (index < 0) return null;
  const param = parameters[index];
  if (param.value === value) return null;

  const next = parameters.slice();
  next[index] = { ...param, value };
  return next;
}

/**
 * 沿索引链更新目标容器参数，只复制链路所在的容器与数组，未命中的兄弟保持原引用。
 * 无实际变更时返回 null。
 */
function setParamsAtPath(
  containers: ConfigContainer[],
  indexes: number[],
  paramKey: string,
  value: ParameterValue
): ConfigContainer[] | null {
  const [index, ...rest] = indexes;
  const container = containers[index];
  if (!container) return null;

  let nextContainer: ConfigContainer;
  if (rest.length === 0) {
    const parameters = applyToParams(container.parameters, paramKey, value);
    if (!parameters) return null;
    nextContainer = { ...container, parameters };
  } else {
    const subContainers = setParamsAtPath(container.subContainers ?? [], rest, paramKey, value);
    if (!subContainers) return null;
    nextContainer = { ...container, subContainers };
  }

  const next = containers.slice();
  next[index] = nextContainer;
  return next;
}

/**
 * 应用一个修复描述符，返回新配置（不修改入参）。
 *
 * - 只处理模块级与静态容器参数；实例级参数不会产出 fix
 * - 调用方保证 value 与目标参数类型兼容；clamp-min/clamp-max/set-default
 *   在此统一按「写入给定值」处理，不再二次判断
 * - 模块/容器/参数缺失或值已相等时返回入参 config 本身（不推进 updatedAt）
 */
export function applyFix(config: ConfigFile, fix: FixDescriptor): ConfigFile {
  const moduleIndex = config.modules.findIndex(m => isTargetModule(m, fix.module));
  if (moduleIndex < 0) return config;
  const module = config.modules[moduleIndex];

  let nextModule: ConfigModule;

  if (fix.kind === 'enable-module') {
    if (module.enabled) return config;
    nextModule = { ...module, enabled: true };
  } else if (!fix.containerPath) {
    const parameters = applyToParams(module.parameters, fix.parameter, fix.value);
    if (!parameters) return config;
    nextModule = { ...module, parameters };
  } else {
    const segments = fix.containerPath.split('.').filter(Boolean);
    if (segments.length === 0) return config;

    const indexes = resolveContainerPath(module.containers, segments);
    if (!indexes) return config;

    const containers = setParamsAtPath(module.containers, indexes, fix.parameter, fix.value);
    if (!containers) return config;
    nextModule = { ...module, containers };
  }

  const modules = config.modules.slice();
  modules[moduleIndex] = nextModule;
  return { ...config, modules, updatedAt: new Date().toISOString() };
}

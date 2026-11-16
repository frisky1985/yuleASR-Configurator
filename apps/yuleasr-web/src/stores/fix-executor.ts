import { matchesParamKey } from './param-update';

import type { ConfigContainer, ConfigFile, ConfigParameter, FixDescriptor } from '@/types';

/** 在容器树中按 id 或 name 定位容器，返回其 id；找不到返回 null */
function resolveContainerId(containers: ConfigContainer[], containerPath: string): string | null {
  const target = containerPath.split('.').filter(Boolean).pop();
  if (!target) return null;

  for (const container of containers) {
    if (container.id === target || container.name === target) return container.id;
    if (container.subContainers?.length) {
      const nested = resolveContainerId(container.subContainers, containerPath);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * 应用一个修复描述符，返回新配置（不修改入参）。
 * 只处理模块级与静态容器参数；实例级参数不会产出 fix。
 */
export function applyFix(config: ConfigFile, fix: FixDescriptor): ConfigFile {
  const stamp = new Date().toISOString();

  if (fix.kind === 'enable-module') {
    return {
      ...config,
      modules: config.modules.map(m =>
        m.name === fix.module || m.id === fix.module ? { ...m, enabled: true } : m
      ),
      updatedAt: stamp,
    };
  }

  const nextValue = (param: ConfigParameter): ConfigParameter =>
    param.value === fix.value ? param : { ...param, value: fix.value as ConfigParameter['value'] };

  const modules = config.modules.map(module => {
    if (module.name !== fix.module && module.id !== fix.module) return module;

    if (!fix.containerPath) {
      return {
        ...module,
        parameters: module.parameters.map(p =>
          matchesParamKey(p, fix.parameter) ? nextValue(p) : p
        ),
      };
    }

    const containerId = resolveContainerId(module.containers, fix.containerPath);
    if (!containerId) return module;

    const patch = (containers: ConfigContainer[]): ConfigContainer[] =>
      containers.map(container => {
        if (container.id !== containerId) {
          return container.subContainers?.length
            ? { ...container, subContainers: patch(container.subContainers) }
            : container;
        }
        return {
          ...container,
          parameters: container.parameters.map(p =>
            matchesParamKey(p, fix.parameter) ? nextValue(p) : p
          ),
        };
      });

    return { ...module, containers: patch(module.containers) };
  });

  return { ...config, modules, updatedAt: stamp };
}

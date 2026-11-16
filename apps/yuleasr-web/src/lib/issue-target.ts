import type { ConfigContainer, ConfigFile, ValidationIssue } from '@/types';

function findContainerId(containers: ConfigContainer[], target: string): string | null {
  const segments = target.split('.');

  // 单段路径保持原有行为：在整棵容器树中按 id/name 递归查找
  if (segments.length === 1) {
    for (const container of containers) {
      if (container.id === target || container.name === target) return container.id;
      if (container.subContainers?.length) {
        const nested = findContainerId(container.subContainers, target);
        if (nested) return nested;
      }
    }
    return null;
  }

  // 点号路径（如 "Outer.Inner"）：逐段下沉，返回最深层容器 id
  let current: ConfigContainer[] = containers;
  let foundId: string | null = null;
  for (const segment of segments) {
    const match = current.find(c => c.id === segment || c.name === segment);
    if (!match) return null;
    foundId = match.id;
    current = match.subContainers ?? [];
  }
  return foundId;
}

/** 把校验问题映射为 ConfigTree 可识别的选中路径 */
export function issueToConfigPath(config: ConfigFile, issue: ValidationIssue): string | null {
  const module = config.modules.find(m => m.name === issue.module || m.id === issue.module);
  if (!module) return null;

  const base = `layer:${module.layer}/module:${module.id}`;
  if (!issue.container) return base;

  const containerId = findContainerId(module.containers, issue.container);
  return containerId ? `${base}/container:${containerId}` : base;
}

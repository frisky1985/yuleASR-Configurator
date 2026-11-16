import type { ConfigContainer, ConfigFile, ValidationIssue } from '@/types';

function findContainerId(containers: ConfigContainer[], target: string): string | null {
  for (const container of containers) {
    if (container.id === target || container.name === target) return container.id;
    if (container.subContainers?.length) {
      const nested = findContainerId(container.subContainers, target);
      if (nested) return nested;
    }
  }
  return null;
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

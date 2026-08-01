/**
 * 参数路径更新辅助逻辑（Fix C1）
 *
 * 统一路径规范: `layer:/module:/container:/instance:/param:`
 * - 模块级参数:   layer:MCAL/module:adc/param:adcdozemode
 * - 静态容器参数: layer:MCAL/module:adc/container:adcconfigset/param:xxx
 * - 动态实例参数: layer:MCAL/module:can/container:cancontroller/instance:CanController_0/param:xxx
 */
import type { ConfigContainer } from '@/types';

/** 参数 key 匹配：兼容 id（all-modules 小写短名）与 name（UI 传入） */
export function matchesParamKey(p: { id: string; name?: string }, key: string): boolean {
  return p.id === key || p.name === key;
}

/**
 * 递归更新容器参数；instanceName 非空时更新动态实例（multiple 容器）。
 * 若容器未找到或参数不存在，记录错误并原样返回（不静默失败）。
 */
export function updateContainerParam(
  containers: ConfigContainer[],
  containerId: string,
  instanceName: string | null,
  paramKey: string,
  value: unknown
): ConfigContainer[] {
  return containers.map(container => {
    if (container.id !== containerId) {
      if (container.subContainers?.length) {
        return {
          ...container,
          subContainers: updateContainerParam(container.subContainers, containerId, instanceName, paramKey, value),
        };
      }
      return container;
    }

    if (instanceName) {
      // 动态实例：只更新目标实例（Fix C2 引入 instances 字段）
      return {
        ...container,
        instances: container.instances?.map(inst =>
          inst.name === instanceName
            ? { ...inst, paramValues: { ...inst.paramValues, [paramKey]: value } }
            : inst
        ),
      };
    }

    if (!container.parameters.some(p => matchesParamKey(p, paramKey))) {
      console.error(`[configStore] 未找到容器参数 ${paramKey} in ${containerId}`);
      return container;
    }
    return {
      ...container,
      parameters: container.parameters.map(p => (matchesParamKey(p, paramKey) ? { ...p, value } : p)),
    };
  });
}

/** 从路径中提取 module:/container:/instance:/param: 段 */
export function parseParamPath(path: string): {
  moduleId: string | null;
  containerId: string | null;
  instanceName: string | null;
  paramKey: string | null;
} {
  const pathParts = path.split('/');
  const modulePart = pathParts.find(p => p.startsWith('module:'));
  const containerPart = pathParts.find(p => p.startsWith('container:'));
  const instancePart = pathParts.find(p => p.startsWith('instance:'));
  const paramPart = pathParts.find(p => p.startsWith('param:'));

  // 无 param: 段时，最后一段作为参数 key（兼容旧调用：Editor 之前只传 selectedPath）
  const paramKey = paramPart
    ? paramPart.replace('param:', '')
    : pathParts[pathParts.length - 1].replace(/^(container|instance):/, '');

  return {
    moduleId: modulePart ? modulePart.replace('module:', '') : null,
    containerId: containerPart ? containerPart.replace('container:', '') : null,
    instanceName: instancePart ? instancePart.replace('instance:', '') : null,
    paramKey: paramKey || null,
  };
}

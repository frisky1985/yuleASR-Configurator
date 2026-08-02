/**
 * @yuletech/core - ChoiceContainerValidator
 *
 * 验证 AUTOSAR ECUC ChoiceContainerDef 语义: 标记为 x-choice-container
 * 的容器内互斥子项 (直接参数/子容器) 实例化时最多只能有一个被配置。
 *
 * 例如: CanTpChannelMode 通道模式选择、SpiChannelType 主从模式等
 * "多选一" 配置场景。
 */

import type { ModuleSchema, ModuleConfig, ValidationError } from '../types';

/**
 * 检查单个模块配置中的 ChoiceContainer 约束
 */
export class ChoiceContainerValidator {
  constructor(private schemas: Map<string, ModuleSchema>) {}

  /**
   * 验证一组模块配置
   */
  validate(configs: ModuleConfig[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const config of configs) {
      const schema = this.schemas.get(config.module);
      if (!schema || !schema.containers) continue;

      for (const containerDef of schema.containers) {
        if (!containerDef.xChoiceContainer) continue;

        const instances = config.containers?.[containerDef.name];
        // 无实例则跳过 (未配置不违反约束)
        if (!instances || instances.length === 0) continue;

        for (const instance of instances) {
          const setCount = this.countSetMembers(containerDef, instance);
          if (setCount > 1) {
            errors.push({
              path: `${config.module}.${containerDef.name}`,
              message: `ChoiceContainerDef "${containerDef.name}" 的互斥子项最多只能设置 1 个，当前设置了 ${setCount} 个`,
              severity: 'error',
              code: 'CHOICE_CONTAINER_EXCLUSIVE',
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * 计算容器实例中已设置的互斥成员数量
   * 优先使用 xChoiceParams 指定的互斥参数组; 未指定时回退到容器全部直接参数/子容器
   */
  private countSetMembers(
    containerDef: {
      name: string;
      parameters?: string[];
      children?: Array<{ name: string }>;
      xChoiceParams?: string[];
    },
    instance: { parameters: Record<string, unknown>; children?: Record<string, unknown[]> }
  ): number {
    let count = 0;

    if (containerDef.xChoiceParams && containerDef.xChoiceParams.length > 0) {
      // 仅检查指定的互斥参数
      for (const paramName of containerDef.xChoiceParams) {
        // Fix 21 (K8): instance.parameters 运行时可能缺失，防御性兜底
        const value = (instance.parameters ?? {})[paramName];
        if (value !== undefined && value !== null) count++;
      }
      return count;
    }

    // 直接参数: 已设置 (非 undefined/null) 即计入
    for (const paramName of containerDef.parameters || []) {
      const value = (instance.parameters ?? {})[paramName];
      if (value !== undefined && value !== null) count++;
    }

    // 子容器: 有实例即计入
    for (const child of containerDef.children || []) {
      const childInstances = instance.children?.[child.name];
      if (Array.isArray(childInstances) && childInstances.length > 0) count++;
    }

    return count;
  }
}

/**
 * 创建 ChoiceContainer 验证器
 */
export function createChoiceContainerValidator(schemas: ModuleSchema[]): ChoiceContainerValidator {
  const schemaMap = new Map(schemas.map(s => [s.name, s]));
  return new ChoiceContainerValidator(schemaMap);
}

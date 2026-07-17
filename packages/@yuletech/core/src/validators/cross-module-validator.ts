/**
 * @yuletech/core - CrossModuleValidator
 * 跨模块参数引用约束验证器
 *
 * 验证各模块配置参数之间声明的 crossReferences 关系是否满足。
 * 例如: Can.baudrate 必须在 CanTrcv.supported_baudrates 范围内。
 */

import type {
  ModuleSchema,
  ModuleConfig,
  ValidationError,
  CrossModuleReference,
} from '../types';

/**
 * 跨模块验证器
 *
 * TODO(#11): 当前为单例模式，通过 YuleasrValidator.crossModuleValidator 持有。
 * 多配置并行编辑时，校验状态会互相污染。届时需：
 *   1. CrossModuleValidator 实例与 Config 实例绑定
 *   2. 每个 Config 持有自己的 Validator 实例
 *   3. 移除全局 yuleasrValidator 单例，改为工厂函数按需创建
 */
export class CrossModuleValidator {
  constructor(private schemas: Map<string, ModuleSchema>) {}

  /**
   * 验证一组模块配置中的跨模块引用约束
   */
  validate(
    configs: ModuleConfig[],
    options: { includeBidirectional?: boolean } = {}
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const configMap = new Map(configs.map(c => [c.module, c]));

    for (const config of configs) {
      const schema = this.schemas.get(config.module);
      if (!schema) continue;

      for (const param of schema.parameters) {
        if (!param.crossReferences || param.crossReferences.length === 0) continue;

        const actualValue = config.parameters[param.name];
        // Skip if the parameter has no value and is not required
        if (actualValue === undefined || actualValue === null) continue;

        for (const ref of param.crossReferences) {
          const targetConfig = configMap.get(ref.module);
          if (!targetConfig) {
            // Target module not in this config set — skip, that's the YuleasrValidator's job
            continue;
          }

          const checkResult = this.checkReference(
            param.name,
            actualValue,
            ref,
            targetConfig,
            schema
          );

          if (checkResult) {
            errors.push(checkResult);
          }

          // Bidirectional check
          if (ref.bidirectional && options.includeBidirectional) {
            const reverseActual = targetConfig.parameters[ref.param];
            if (reverseActual === undefined || reverseActual === null) continue;

            // Build a reverse reference
            const reverseRef: CrossModuleReference = {
              module: config.module,
              container: undefined,
              param: param.name,
              relation: ref.relation,
              severity: ref.severity,
              description: `Reverse: ${ref.description}`,
            };

            const reverseResult = this.checkReference(
              ref.param,
              reverseActual,
              reverseRef,
              config,
              this.schemas.get(ref.module)
            );

            if (reverseResult) {
              errors.push(reverseResult);
            }
          }
        }
      }
    }

    return errors;
  }

  /**
   * 检查单条跨模块引用约束
   */
  private checkReference(
    _sourceParam: string,
    actualValue: unknown,
    ref: CrossModuleReference,
    targetConfig: ModuleConfig,
    _sourceSchema?: ModuleSchema
  ): ValidationError | null {
    // Resolve target value
    let targetValue: unknown;
    if (ref.container) {
      const instances = targetConfig.containers?.[ref.container];
      if (Array.isArray(instances) && instances.length > 0) {
        targetValue = instances[0].parameters[ref.param];
      }
    } else {
      targetValue = targetConfig.parameters[ref.param];
    }

    // For in_range/in_enum we need schema-level constraints
    let targetSchema: ModuleSchema | undefined;
    if (ref.relation === 'in_range' || ref.relation === 'in_enum') {
      targetSchema = this.schemas.get(ref.module);
    }

    const msg = this.evaluateRelation(
      actualValue,
      targetValue,
      ref.relation,
      targetSchema,
      ref
    );

    if (!msg) return null;

    return {
      path: `${targetConfig.module}.${ref.param}`,
      message: msg,
      severity: ref.severity,
      code: `CROSS_REF_${ref.relation.toUpperCase()}`,
    };
  }

  /**
   * 评估关系是否满足
   * 返回 null 表示满足，返回字符串表示失败原因
   */
  private evaluateRelation(
    actual: unknown,
    target: unknown,
    relation: CrossModuleReference['relation'],
    targetSchema?: ModuleSchema,
    ref?: CrossModuleReference
  ): string | null {
    switch (relation) {
      case 'equals': {
        if (actual === target) return null;
        return `期望值 ${JSON.stringify(target)}，实际 ${JSON.stringify(actual)} (${ref?.description || ''})`;
      }

      case 'less_than': {
        const a = Number(actual);
        const t = Number(target);
        if (isNaN(a) || isNaN(t)) return null; // not comparable, skip
        if (a < t) return null;
        return `期望 ${actual} < ${target} (${ref?.description || ''})`;
      }

      case 'greater_than': {
        const a = Number(actual);
        const t = Number(target);
        if (isNaN(a) || isNaN(t)) return null;
        if (a > t) return null;
        return `期望 ${actual} > ${target} (${ref?.description || ''})`;
      }

      case 'in_range': {
        if (!targetSchema) return null;
        // Find the target parameter in the schema to get min/max
        const targetParam = targetSchema.parameters.find(p => p.name === ref?.param);
        if (!targetParam) return null;
        const numVal = Number(actual);
        if (isNaN(numVal)) return null;

        if (targetParam.min !== undefined && numVal < targetParam.min) {
          return `值 ${actual} 小于目标模块 ${targetSchema.name} 允许的最小值 ${targetParam.min} (${ref?.description || ''})`;
        }
        if (targetParam.max !== undefined && numVal > targetParam.max) {
          return `值 ${actual} 大于目标模块 ${targetSchema.name} 允许的最大值 ${targetParam.max} (${ref?.description || ''})`;
        }
        return null;
      }

      case 'in_enum': {
        if (!targetSchema) return null;
        const targetParam = targetSchema.parameters.find(p => p.name === ref?.param);
        if (!targetParam || !targetParam.options) return null;

        const validValues = targetParam.options.map(o => o.value);
        if (validValues.includes(actual as string | number | boolean)) return null;
        return `值 ${actual} 不在目标模块 ${targetSchema.name} 的允许值 [${validValues.join(', ')}] 中 (${ref?.description || ''})`;
      }

      default:
        return null;
    }
  }

  /**
   * 增量验证：只验证涉及指定参数的跨模块引用约束
   * 用于 UI 修改单个参数后的局部重验证，避免全量扫描
   */
  validateAffectedBy(
    changedParams: Array<{ module: string; param: string }>,
    configs: ModuleConfig[],
    _options: { includeBidirectional?: boolean } = {}
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const configMap = new Map(configs.map(c => [c.module, c]));

    for (const { module: changedModule, param: changedParam } of changedParams) {
      const schema = this.schemas.get(changedModule);
      if (!schema) continue;

      const sourceParam = schema.parameters.find(p => p.name === changedParam);
      const changedConfig = configMap.get(changedModule);

      // (A) Forward: source param → its cross-references
      if (sourceParam?.crossReferences && changedConfig) {
        for (const ref of sourceParam.crossReferences) {
          const targetConfig = configMap.get(ref.module);
          if (!targetConfig) continue;

          const actualValue = changedConfig.parameters[changedParam];
          if (actualValue === undefined || actualValue === null) continue;

          const r = this.checkReference(changedParam, actualValue, ref, targetConfig, schema);
          if (r) errors.push(r);
        }
      }

      // (B) Reverse: other params that cross-reference this changed param
      for (const otherConfig of configs) {
        if (otherConfig.module === changedModule) continue;
        const otherSchema = this.schemas.get(otherConfig.module);
        if (!otherSchema) continue;

        for (const otherParam of otherSchema.parameters) {
          if (!otherParam.crossReferences) continue;
          for (const ref of otherParam.crossReferences) {
            if (ref.module === changedModule && ref.param === changedParam) {
              const actualValue = otherConfig.parameters[otherParam.name];
              if (actualValue === undefined || actualValue === null) continue;

              const tgt = configMap.get(changedModule);
              if (!tgt) continue;

              const r = this.checkReference(
                otherParam.name, actualValue, ref, tgt, otherSchema
              );
              if (r) errors.push(r);
            }
          }
        }
      }
    }

    return errors;
  }
}

/**
 * 创建跨模块验证器的工厂函数
 */
export function createCrossModuleValidator(schemas: ModuleSchema[]): CrossModuleValidator {
  const schemaMap = new Map(schemas.map(s => [s.name, s]));
  return new CrossModuleValidator(schemaMap);
}

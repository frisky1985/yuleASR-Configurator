/**
 * R8/E3 ECUC 值-定义一致性校验
 *
 * 基于 E1 值层（EcucModuleConfigValue）+ E2 定义层（EcucModuleDef）校验：
 *  - 值层参数/容器的 DEFINITION-REF 在定义层可解析（找不到 → 定义缺失，
 *    错误消息带 `Invalid reference:` 前缀 → classifyImportError → InvalidReferenceError）；
 *  - 参数值类型匹配定义（数值/文本/布尔；枚举值 ∈ LITERALS；不匹配 →
 *    错误消息带 `Assignment type mismatch:` 前缀 → AssignmentTypeError）；
 *  - 容器 multiplicity 合规（同父下实例数超过显式 UPPER-MULTIPLICITY →
 *    warning 级，不阻塞导入）。
 *
 * 关键边界（诚实声明）：
 *  - **定义层缺席的纯值层文件跳过校验**——导出器产物（serializeArxmlDocument）
 *    只含值层，若强校验会把全部参数误报为"定义缺失"；只有文件里存在
 *    ECUC-MODULE-DEF 时才启用一致性校验（有定义可依才有"不一致"可言）。
 *  - 定义解析优先按 DEFINITION-REF 完整路径（模块前缀逐段剥离，容器链逐段匹配），
 *    失败退化短名模糊查找（导出侧 round-trip 的 /name 形态）；
 *  - 模块定义缺失时只报 1 条模块级错误并跳过该模块（避免级联误报）；
 *  - 校验结果挂在 ImportReport：errors（硬错误，strict 入口按类重抛）+
 *    warnings（容器超限等软问题）。
 */

import type {
  EcucContainerDef,
  EcucContainerValue,
  EcucModuleDef,
  EcucParameterDef,
  EcucParameterDefKind,
  EcucParameterValue,
  ReadContext,
  SwcArxmlProject,
} from './reader';

// ============================================================================
// 错误消息构建
// ============================================================================

/** 参数定义类别人类可读标签（错误信息用） */
const KIND_LABELS: Record<EcucParameterDefKind, string> = {
  NUMERICAL: 'a numerical value',
  TEXTUAL: 'a textual value',
  BOOLEAN: 'a boolean value',
  ENUMERATION: 'one of the enumeration literals',
  REFERENCE: 'a reference value',
};

/** 值的人类可读描述（错误信息用） */
function describeValue(value: string | number | boolean): string {
  if (typeof value === 'string') return `'${value}' (string)`;
  if (typeof value === 'number') return `${value} (number)`;
  return `${value} (boolean)`;
}

// ============================================================================
// 定义解析（DEFINITION-REF → 定义树）
// ============================================================================

/** 按容器链从容器定义树根逐段匹配（路径语义；链首不匹配即失败） */
function findContainerDefByChain(
  defs: EcucContainerDef[],
  chain: string[]
): EcucContainerDef | undefined {
  if (chain.length === 0) return undefined;
  const next = defs.find(c => c.name === chain[0]);
  if (!next) return undefined;
  if (chain.length === 1) return next;
  return findContainerDefByChain(next.subContainerDefs, chain.slice(1));
}

/** 容器定义短名模糊查找（递归整树） */
function findContainerDefByName(
  defs: EcucContainerDef[],
  name: string
): EcucContainerDef | undefined {
  for (const def of defs) {
    if (def.name === name) return def;
    const sub = findContainerDefByName(def.subContainerDefs, name);
    if (sub) return sub;
  }
  return undefined;
}

/** 参数定义短名模糊查找（模块级 + 容器递归整树） */
function findParameterDefByName(
  moduleDef: EcucModuleDef,
  name: string
): EcucParameterDef | undefined {
  const direct = moduleDef.parameterDefs.find(p => p.name === name);
  if (direct) return direct;
  for (const containerDef of moduleDef.containerDefs) {
    const found = findParameterDefInContainers(containerDef, name);
    if (found) return found;
  }
  return undefined;
}

function findParameterDefInContainers(
  containerDef: EcucContainerDef,
  name: string
): EcucParameterDef | undefined {
  const direct = containerDef.parameterDefs.find(p => p.name === name);
  if (direct) return direct;
  for (const sub of containerDef.subContainerDefs) {
    const found = findParameterDefInContainers(sub, name);
    if (found) return found;
  }
  return undefined;
}

/**
 * 按 DEFINITION-REF 解析参数定义。
 * 路径形态兼容两种风格：
 *  - 完整路径：/Can/Can/CanController/CanControllerBaudRate（<前缀…>/<容器链…>/<参数>）
 *  - 短名：/CanControllerBaudRate（导出侧 round-trip 形态）
 * 策略：逐段剥离前导段（容忍版本前缀 /4.4.0 与模块短名段），尝试容器链逐段匹配
 * + 末段参数名；全部失败退化短名模糊查找（整树首个同名）。
 */
function resolveParameterDef(moduleDef: EcucModuleDef, ref: string): EcucParameterDef | undefined {
  const segments = ref.split('/').filter(s => s.length > 0);
  const paramName = segments[segments.length - 1];
  if (!paramName) return undefined;
  for (let start = 0; start < segments.length - 1; start++) {
    const chain = segments.slice(start, segments.length - 1);
    const containerDef = findContainerDefByChain(moduleDef.containerDefs, chain);
    if (containerDef) {
      const param = containerDef.parameterDefs.find(p => p.name === paramName);
      if (param) return param;
    }
  }
  return findParameterDefByName(moduleDef, paramName);
}

/** 按 DEFINITION-REF 解析容器定义（同 resolveParameterDef 的剥离 + 短名退化策略） */
function resolveContainerDef(moduleDef: EcucModuleDef, ref: string): EcucContainerDef | undefined {
  const segments = ref.split('/').filter(s => s.length > 0);
  const containerName = segments[segments.length - 1];
  if (!containerName) return undefined;
  for (let start = 0; start < segments.length; start++) {
    const chain = segments.slice(start);
    const def = findContainerDefByChain(moduleDef.containerDefs, chain);
    if (def) return def;
  }
  return findContainerDefByName(moduleDef.containerDefs, containerName);
}

// ============================================================================
// 校验器
// ============================================================================

/** 校验单个参数值：定义存在 + 值类型匹配定义（枚举 ∈ LITERALS） */
function validateParameterValue(
  ctx: ReadContext,
  moduleName: string,
  moduleDef: EcucModuleDef,
  param: EcucParameterValue
): void {
  const def = resolveParameterDef(moduleDef, param.definitionRef);
  if (!def) {
    ctx.report.errors.push(
      `Invalid reference: ${param.definitionRef || param.name} (ECUC module ${moduleName} parameter ${param.name}): parameter definition not found`
    );
    return;
  }

  const value = param.value;
  const ok =
    def.kind === 'NUMERICAL'
      ? typeof value === 'number'
      : def.kind === 'BOOLEAN'
        ? typeof value === 'boolean'
        : def.kind === 'TEXTUAL'
          ? typeof value === 'string'
          : def.kind === 'REFERENCE'
            ? typeof value === 'string'
            : /* ENUMERATION */ typeof value === 'string' &&
              def.literals !== undefined &&
              def.literals.includes(value);
  if (ok) return;

  const location = `ECUC module ${moduleName} parameter ${param.name}`;
  if (def.kind === 'ENUMERATION') {
    ctx.report.errors.push(
      `Assignment type mismatch: ${param.definitionRef} (${location}): value '${String(value)}' is not one of the enumeration literals [${(def.literals ?? []).join(', ')}]`
    );
  } else {
    ctx.report.errors.push(
      `Assignment type mismatch: ${param.definitionRef} (${location}): expected ${KIND_LABELS[def.kind]}, got ${describeValue(value)}`
    );
  }
}

/**
 * 校验一层容器值：定义存在 + 兄弟实例数不超 UPPER-MULTIPLICITY（warning），
 * 然后递归子容器。
 */
function validateContainerValues(
  ctx: ReadContext,
  moduleName: string,
  moduleDef: EcucModuleDef,
  containers: EcucContainerValue[]
): void {
  // 按解析到的容器定义分组计数（同一父下同定义的兄弟实例数）
  const counts = new Map<EcucContainerDef, number>();
  const resolved: Array<{ value: EcucContainerValue; def?: EcucContainerDef }> = [];

  for (const container of containers) {
    const def = resolveContainerDef(moduleDef, container.definitionRef);
    resolved.push({ value: container, def });
    if (!def) {
      ctx.report.errors.push(
        `Invalid reference: ${container.definitionRef || container.name} (ECUC module ${moduleName} container ${container.name}): container definition not found`
      );
      continue;
    }
    counts.set(def, (counts.get(def) ?? 0) + 1);
  }

  // multiplicity：显式 UPPER-MULTIPLICITY ≥ 0 且实例数超限 → warning（不阻塞导入）
  for (const [def, count] of counts) {
    const upper = def.upperMultiplicity;
    if (upper !== undefined && upper >= 0 && count > upper) {
      ctx.report.warnings.push({
        line: null,
        tag: 'ECUC-CONTAINER-VALUE',
        message: `${ctx.sourceName}(?): Container multiplicity exceeded: ${def.name} in ${moduleName}: ${count} instances exceed upper multiplicity ${upper}`,
      });
    }
  }

  for (const { value, def } of resolved) {
    if (def) validateContainerValues(ctx, moduleName, moduleDef, value.containers);
  }
}

/**
 * ECUC 值-定义一致性校验主入口。
 * 定义层缺席（纯值层文件）→ 跳过（见文件头关键边界）。
 * 错误/告警挂在 ctx.report（errors 供 strict 入口按类重抛，warnings 供 UI 提示）。
 */
export function validateEcucConsistency(ctx: ReadContext, project: SwcArxmlProject): void {
  // 纯值层文件（如导出器产物）：无定义可依，跳过避免把全部参数误报为定义缺失
  if (project.ecucModuleDefs.length === 0) return;

  for (const module of project.ecucModules) {
    const moduleDef = module.moduleDef;
    if (!moduleDef) {
      // 模块定义缺失：单条错误 + 跳过该模块（避免参数/容器级联误报）
      ctx.report.errors.push(
        `Invalid reference: ${module.definitionRef || module.name} (ECUC module ${module.name}): module definition not found`
      );
      continue;
    }

    for (const param of module.parameters) {
      validateParameterValue(ctx, module.name, moduleDef, param);
    }
    validateContainerValues(ctx, module.name, moduleDef, module.containers);
  }
}

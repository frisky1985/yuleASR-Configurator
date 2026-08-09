/**
 * ECUC 编辑服务（F3）— 只读视图 → 可编辑工作副本 + 回写映射
 *
 * 职责：
 *  - createEditableProject：EcucProjectView（只读）→ EcucEditableProject（可编辑工作副本）；
 *  - 编辑操作（不可变更新）：updateParamValue / toggleModuleEnabled /
 *    addContainerInstance / removeContainerInstance —— 每次操作后重算校验计数；
 *  - flattenEditableParams：编辑工程 → 扁平行（参数表视图）；
 *  - 回写映射：
 *      · editableToConfigModules → A4 generateArxml（导出 ARXML）；
 *      · editableToSchemas → F2a generateHeadersFromSchemas（直接生成 Cfg.h）。
 *
 * 边界（诚实声明）：
 *  - 工作副本只存在于页面内存，不落盘；「重置」= 从最后一次解析的 view 重建；
 *  - 新增容器实例时参数取定义 DEFAULT-VALUE（无默认则按类别给空值），
 *    definitionRef 按「父容器 DEFINITION-REF + 短名」拼接（与 E3 短名退化解析兼容）；
 *  - 参数值覆盖按「参数名精确匹配」挂到 schema 默认值上（schema 无同名参数
 *    则该编辑值不参与生成——宏名规则由 schema 决定，保持 F2a 语义）。
 */

import type { ModuleSchema } from '@yuletech/core';
import { loadModuleSchemas } from '@yuletech/core/schema/load-generated';

import {
  validateContainerInstanceCount,
  validateEditedParamValue,
} from './ecuc-editor-validation';

import type {
  ConfigContainer,
  ConfigModule,
  ConfigParameter,
  ConfigFile,
} from '@/types/config';
import type {
  EcucContainerPath,
  EcucEditContainer,
  EcucEditModule,
  EcucEditableFlatRow,
  EcucEditableProject,
  EcucEditIssue,
  EcucEditParam,
} from '@/types/ecuc-edit';
import type { EcucContainerView, EcucModuleView, EcucParamRow, EcucProjectView } from '@/types/ecuc-view';

// ============================================================================
// 视图 → 可编辑副本
// ============================================================================

function toEditParam(param: EcucParamRow): EcucEditParam {
  return {
    name: param.name,
    definitionRef: param.definitionRef,
    value: param.value,
    kind: param.kind,
    def: param.def,
    issue: null,
  };
}

function toEditContainer(container: EcucContainerView): EcucEditContainer {
  return {
    name: container.name,
    definitionRef: container.definitionRef,
    parameters: container.parameters.map(toEditParam),
    containers: container.containers.map(toEditContainer),
    def: container.def,
    issue: null,
  };
}

function toEditModule(module: EcucModuleView): EcucEditModule {
  return {
    name: module.name,
    definitionRef: module.definitionRef,
    moduleDefRef: module.moduleDefRef,
    enabled: true,
    parameters: module.parameters.map(toEditParam),
    containers: module.containers.map(toEditContainer),
    moduleDef: module.moduleDef,
  };
}

/** 递归重算某模块的容器 issue（实例数超限）与参数 issue（值校验） */
function recomputeModule(module: EcucEditModule): {
  errors: number;
  warnings: number;
} {
  let errors = 0;
  let warnings = 0;

  const countIssue = (issue: EcucEditIssue | null | undefined): void => {
    if (!issue) return;
    if (issue.severity === 'error') errors += 1;
    else warnings += 1;
  };

  const visitContainer = (container: EcucEditContainer): void => {
    // 同父兄弟组计数：按定义名分组
    const groups = new Map<string, number>();
    for (const c of container.containers) {
      groups.set(c.name, (groups.get(c.name) ?? 0) + 1);
    }
    for (const c of container.containers) {
      c.issue = validateContainerInstanceCount(
        c.name,
        groups.get(c.name) ?? 1,
        c.def
      );
      countIssue(c.issue);
      for (const p of c.parameters) {
        p.issue = validateEditedParamValue(p);
        countIssue(p.issue);
      }
      visitContainer(c);
    }
  };

  for (const p of module.parameters) {
    p.issue = validateEditedParamValue(p);
    countIssue(p.issue);
  }
  visitContainer(module as unknown as EcucEditContainer);

  return { errors, warnings };
}

/** 按带索引容器路径定位容器（找不到返回 undefined） */
function findContainerByPath(
  containers: EcucEditContainer[],
  path: EcucContainerPath
): EcucEditContainer | undefined {
  let current = containers;
  let found: EcucEditContainer | undefined;
  for (const seg of path) {
    found = current[seg.index];
    if (!found || found.name !== seg.name) return undefined;
    current = found.containers;
  }
  return found;
}

// ============================================================================
// 主入口
// ============================================================================

/**
 * 只读视图 → 可编辑工作副本。
 * 全部参数/容器先按当前值校验一遍（进入编辑态即显示存量问题）。
 */
export function createEditableProject(view: EcucProjectView): EcucEditableProject {
  const modules = view.modules.map(toEditModule);
  let errors = 0;
  let warnings = 0;
  for (const m of modules) {
    const counts = recomputeModule(m);
    errors += counts.errors;
    warnings += counts.warnings;
  }
  return { modules, dirty: false, errors, warnings };
}

/** 更新参数值（不可变；按模块名 + 容器路径 + 参数名定位，同名兄弟按索引区分） */
export function updateParamValue(
  project: EcucEditableProject,
  moduleName: string,
  containerPath: EcucContainerPath,
  paramName: string,
  value: string | number | boolean
): EcucEditableProject {
  const modules = project.modules.map(m => {
    if (m.name !== moduleName) return m;

    const updateParams = (params: EcucEditParam[]): EcucEditParam[] =>
      params.map(p => (p.name === paramName ? { ...p, value } : p));

    const cloneContainers = (containers: EcucEditContainer[], path: EcucContainerPath): EcucEditContainer[] =>
      containers.map((c, index) => {
        const segPath = [...path, { name: c.name, index }];
        const isTarget =
          segPath.length === containerPath.length &&
          segPath.every((s, i) => s.name === containerPath[i].name && s.index === containerPath[i].index);
        if (isTarget) {
          return { ...c, parameters: updateParams(c.parameters) };
        }
        return { ...c, containers: cloneContainers(c.containers, segPath) };
      });

    return {
      ...m,
      parameters: containerPath.length === 0 ? updateParams(m.parameters) : m.parameters,
      containers: cloneContainers(m.containers, []),
    };
  });

  return finalize(modules, true);
}

/** 模块启停 */
export function toggleModuleEnabled(
  project: EcucEditableProject,
  moduleName: string
): EcucEditableProject {
  const modules = project.modules.map(m =>
    m.name === moduleName ? { ...m, enabled: !m.enabled } : m
  );
  return finalize(modules, true);
}

/**
 * 新增容器实例（不可变）。
 * 在模块级（parentPath=[]）或指定容器下，按定义名创建新实例：
 * 参数取定义 DEFAULT-VALUE（数值/布尔解析；枚举取第一个字面量；无默认给类别空值）。
 *
 * @returns 新工程；若定义不存在（无从创建）返回原工程
 */
export function addContainerInstance(
  project: EcucEditableProject,
  moduleName: string,
  parentPath: EcucContainerPath,
  defName: string
): EcucEditableProject {
  let created = false;
  const modules = project.modules.map(m => {
    if (m.name !== moduleName) return m;

    const defs = parentPath.length === 0 ? m.moduleDef?.containerDefs : findContainerDefAt(m, parentPath)?.subContainerDefs;
    const def = defs?.find(d => d.name === defName);
    if (!def) return m;

    const parentRef =
      parentPath.length === 0
        ? m.definitionRef
        : findContainerByPath(m.containers, parentPath)?.definitionRef ?? m.definitionRef;

    const newContainer: EcucEditContainer = {
      name: def.name,
      definitionRef: `${parentRef}/${def.name}`,
      parameters: def.parameterDefs.map(p => ({
        name: p.name,
        definitionRef: `${parentRef}/${def.name}/${p.name}`,
        value: defaultValueFromDef(p),
        kind: p.kind,
        def: p,
        issue: null,
      })),
      containers: [],
      def,
      issue: null,
    };

    if (parentPath.length === 0) {
      created = true;
      return { ...m, containers: [...m.containers, newContainer] };
    }
    const cloneContainers = (containers: EcucEditContainer[], path: EcucContainerPath): EcucEditContainer[] =>
      containers.map((c, index) => {
        const segPath = [...path, { name: c.name, index }];
        const isTarget =
          segPath.length === parentPath.length &&
          segPath.every((s, i) => s.name === parentPath[i].name && s.index === parentPath[i].index);
        if (isTarget) {
          created = true;
          return { ...c, containers: [...c.containers, newContainer] };
        }
        return { ...c, containers: cloneContainers(c.containers, segPath) };
      });
    return { ...m, containers: cloneContainers(m.containers, []) };
  });

  return created ? finalize(modules, true) : project;
}

/** 查找路径上的容器定义（供新增子容器选型） */
function findContainerDefAt(
  module: EcucEditModule,
  path: EcucContainerPath
): EcucEditContainer['def'] {
  const container = findContainerByPath(module.containers, path);
  return container?.def;
}

/** 参数定义 → 新实例参数值（DEFAULT-VALUE 解析；无默认给类别空值） */
function defaultValueFromDef(def: {
  kind: EcucEditParam['kind'];
  defaultValue?: string;
  literals?: string[];
}): string | number | boolean {
  const raw = def.defaultValue;
  switch (def.kind) {
    case 'NUMERICAL': {
      if (raw === undefined || raw === '') return 0;
      const n = Number(raw);
      return Number.isNaN(n) ? 0 : n;
    }
    case 'BOOLEAN': {
      if (raw === undefined) return false;
      return raw === 'true' || raw === '1';
    }
    case 'ENUMERATION': {
      if (def.literals && def.literals.length > 0) {
        if (raw !== undefined && def.literals.includes(raw)) return raw;
        return def.literals[0];
      }
      return raw ?? '';
    }
    default:
      return raw ?? '';
  }
}

/**
 * 删除容器实例（不可变）。
 * parentPath 定位父容器（空 = 模块级），childIndex 指定同父兄弟中的实例。
 * 删除后父级容器 issue 重算（低于下限 → warning 提示，不阻止删除）。
 */
export function removeContainerInstance(
  project: EcucEditableProject,
  moduleName: string,
  parentPath: EcucContainerPath,
  childIndex: number
): EcucEditableProject {
  let removed = false;
  const modules = project.modules.map(m => {
    if (m.name !== moduleName) return m;

    if (parentPath.length === 0) {
      const target = m.containers[childIndex];
      if (!target) return m;
      removed = true;
      return { ...m, containers: m.containers.filter((_, i) => i !== childIndex) };
    }
    const cloneContainers = (containers: EcucEditContainer[], path: EcucContainerPath): EcucEditContainer[] => {
      const isTargetLevel =
        path.length === parentPath.length &&
        path.every((s, i) => s.name === parentPath[i].name && s.index === parentPath[i].index);
      if (isTargetLevel) {
        const target = containers[childIndex];
        if (!target) return containers;
        removed = true;
        return containers.filter((_, i) => i !== childIndex);
      }
      return containers.map((c, index) => ({
        ...c,
        containers: cloneContainers(c.containers, [...path, { name: c.name, index }]),
      }));
    };
    return { ...m, containers: cloneContainers(m.containers, []) };
  });

  return removed ? finalize(modules, true) : project;
}

/** 重算全部 issue + 计数，返回新工程（dirty 由调用方决定） */
function finalize(modules: EcucEditModule[], dirty: boolean): EcucEditableProject {
  let errors = 0;
  let warnings = 0;
  for (const m of modules) {
    const counts = recomputeModule(m);
    errors += counts.errors;
    warnings += counts.warnings;
  }
  return { modules, dirty, errors, warnings };
}

// ============================================================================
// 扁平行（参数表视图）
// ============================================================================

/** 编辑工程 → 扁平参数行（带索引路径 pathKey，供表格回写定位） */
export function flattenEditableParams(project: EcucEditableProject): EcucEditableFlatRow[] {
  const rows: EcucEditableFlatRow[] = [];

  const visitParams = (
    params: EcucEditParam[],
    module: string,
    pathKey: EcucContainerPath,
    pathLabel: string
  ): void => {
    for (const p of params) {
      rows.push({
        ...p,
        module,
        containerPath: pathKey.map(s => s.name),
        pathKey,
        pathLabel,
      });
    }
  };

  const visitContainers = (
    containers: EcucEditContainer[],
    module: string,
    parentKey: EcucContainerPath,
    parentLabel: string
  ): void => {
    containers.forEach((c, index) => {
      const key = [...parentKey, { name: c.name, index }];
      const label = parentLabel ? `${parentLabel} / ${c.name}` : c.name;
      visitParams(c.parameters, module, key, label);
      visitContainers(c.containers, module, key, label);
    });
  };

  for (const m of project.modules) {
    visitParams(m.parameters, m.name, [], '');
    visitContainers(m.containers, m.name, [], '');
  }
  return rows;
}

// ============================================================================
// 回写：编辑工程 → ConfigModule[]（A4 ARXML 导出）
// ============================================================================

/** def.kind / 值类型 → ConfigParameter.type（A4 导出器按 type 选 ARXML 元素） */
function paramTypeOf(param: EcucEditParam): ConfigParameter['type'] {
  switch (param.kind) {
    case 'NUMERICAL':
      return typeof param.value === 'number' && !Number.isInteger(param.value)
        ? 'float'
        : 'integer';
    case 'BOOLEAN':
      return 'boolean';
    case 'ENUMERATION':
      return 'enum';
    case 'TEXTUAL':
      return 'string';
    case 'REFERENCE':
      return 'reference';
    default:
      return typeof param.value === 'number'
        ? 'integer'
        : typeof param.value === 'boolean'
          ? 'boolean'
          : 'string';
  }
}

function toConfigParam(param: EcucEditParam): ConfigParameter {
  return {
    id: param.name,
    name: param.name,
    type: paramTypeOf(param),
    value: param.value,
    description: param.def?.name ? `ECUC parameter ${param.def.name}` : undefined,
    ...(param.def?.literals
      ? { options: param.def.literals.map(v => ({ value: v, label: v })) }
      : {}),
  };
}

function toConfigContainer(container: EcucEditContainer): ConfigContainer {
  return {
    id: container.name,
    name: container.name,
    displayName: container.name,
    parameters: container.parameters.map(toConfigParam),
    subContainers: container.containers.map(toConfigContainer),
  };
}

/**
 * 编辑工程 → ConfigFile（A4 导出器输入）。
 * 仅导出 enabled 模块；容器 1:1 映射（多实例天然并列，ARXML 按 multiplicity 合法）。
 */
export function editableToConfigModules(project: EcucEditableProject): ConfigModule[] {
  const now = new Date().toISOString();
  return project.modules
    .filter(m => m.enabled)
    .map(m => ({
      id: m.name,
      name: m.name,
      displayName: m.name,
      version: '4.4.0',
      layer: 'MCAL' as const,
      enabled: true,
      configStatus: 'configured' as const,
      configProgress: 100,
      configMethod: 'import' as const,
      containers: m.containers.map(toConfigContainer),
      parameters: m.parameters.map(toConfigParam),
      dependencies: [],
      createdAt: now,
      updatedAt: now,
    }));
}

/** 编辑工程 → 最小 ConfigFile（A4 generateArxml 输入） */
export function editableToConfigFile(project: EcucEditableProject): ConfigFile {
  const now = new Date().toISOString();
  return {
    id: `ecuc-edit-${now}`,
    name: 'ECUC 编辑导出',
    targetChip: '',
    modules: editableToConfigModules(project),
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// 回写：编辑工程 → ModuleSchema[]（F2a Cfg.h 生成）
// ============================================================================

/** 递归收集模块内全部参数（编辑值，按参数名覆盖 schema 默认值） */
function collectEditedParams(module: EcucEditModule): Map<string, string | number | boolean> {
  const map = new Map<string, string | number | boolean>();
  for (const p of module.parameters) map.set(p.name, p.value);
  const visit = (containers: EcucEditContainer[]): void => {
    for (const c of containers) {
      for (const p of c.parameters) map.set(p.name, p.value);
      visit(c.containers);
    }
  };
  visit(module.containers);
  return map;
}

/** 无 schema 的编辑模块 → 最小 ModuleSchema（参数类型按编辑值推断） */
function minimalSchemaFromEditModule(module: EcucEditModule): ModuleSchema {
  const params = collectEditedParams(module);
  return {
    name: module.name,
    label: module.name,
    layer: 'Service',
    version: '4.4.0',
    description: `ECUC 编辑导出模块（无预置 schema，参数来自 ARXML 值层）`,
    parameters: [...params.entries()].map(([name, value]) => ({
      name,
      type: typeof value === 'number'
        ? (Number.isInteger(value) ? 'integer' : 'float')
        : typeof value === 'boolean'
          ? 'boolean'
          : 'string',
      description: `Imported from ARXML: ${name}`,
      default: value,
    })),
  };
}

/**
 * 编辑工程 → ModuleSchema[]（供 F2a generateHeadersFromSchemas 直接生成 Cfg.h）。
 *
 * 规则：enabled 模块参与生成；有 schema 的模块用编辑值覆盖同名参数默认值
 * （schema 无同名参数则忽略该编辑值）；无 schema 的模块构造最小 schema。
 * 与 generateHeadersFromConfig 的关系：本函数是 ECUC 编辑侧入口（编辑值来自
 * ARXML 值层），generateHeadersFromConfig 是 Editor 配置侧入口。
 *
 * 边界（诚实声明）：宏头本质扁平（一参数一宏），同名参数在多实例容器中
 * 重复出现时，仅最后一个实例的值参与覆盖（Map 按名去重，后写覆盖先写）。
 */
export function editableToSchemas(
  project: EcucEditableProject,
  schemas?: ModuleSchema[]
): ModuleSchema[] {
  const allSchemas = schemas ?? loadModuleSchemas();
  const schemaByName = new Map(allSchemas.map(s => [s.name.toLowerCase(), s]));

  const out: ModuleSchema[] = [];
  for (const m of project.modules) {
    if (!m.enabled) continue;
    const base = schemaByName.get(m.name.toLowerCase());
    if (base) {
      const edits = collectEditedParams(m);
      out.push({
        ...base,
        parameters: (base.parameters ?? []).map(p =>
          edits.has(p.name) ? { ...p, default: edits.get(p.name) } : p
        ),
      });
    } else {
      out.push(minimalSchemaFromEditModule(m));
    }
  }
  return out;
}

/**
 * ECUC 展示视图适配器（core 领域模型 → web 只读展示模型）
 *
 * 设计（R8/E4，路径 a）：直接复用 core 类型（EcucModuleConfigValue/EcucModuleDef），
 * 本模块只做**派生与关联**，不改数据：
 *  - buildEcucProjectView：SwcArxmlProject → EcucProjectView（统计 + 定义元数据挂载 + 扁平参数行）；
 *  - 定义元数据匹配：值层容器链按名对齐定义层容器树，叶参数按名匹配参数定义
 *    （E2 已回填 moduleDef 到值层模块；这里补到容器/参数粒度，纯派生不落盘）。
 *
 * 边界（诚实声明）：
 *  - 只读展示适配；编辑能力未实现，留遗留；
 *  - 容器/参数定义匹配为短名（模糊）匹配：重名时取第一个，文件内定义缺失
 *    时该行无定义元数据（kind/def 为 undefined），UI 正常展示不报错。
 */

import type { SwcArxmlProject } from '@yuletech/core/arxml-import';

import type {
  EcucContainerDef,
  EcucContainerValue,
  EcucModuleConfigValue,
  EcucModuleDef,
  EcucParameterDef,
} from '@/services/arxml-ecuc-import';
import type {
  EcucContainerView,
  EcucFlatParamRow,
  EcucModuleView,
  EcucParamRow,
  EcucProjectView,
  EcucStats,
} from '@/types/ecuc-view';

/** 按名在容器定义列表中查找（取第一个匹配；定义缺失返回 undefined） */
function findContainerDef(
  defs: EcucContainerDef[] | undefined,
  name: string
): EcucContainerDef | undefined {
  return defs?.find(d => d.name === name);
}

/**
 * 参数定义匹配：模块级参数在 moduleDef.parameterDefs 查；
 * 容器内参数沿容器链下钻后在该容器 parameterDefs 查。
 * 纯短名匹配，重名取第一个；定义缺失返回 undefined（UI 正常展示不报错）。
 */
function findParameterDef(
  moduleDef: EcucModuleConfigValue['moduleDef'],
  containerPath: string[],
  name: string
): EcucParameterDef | undefined {
  if (!moduleDef) return undefined;
  if (containerPath.length === 0) {
    return moduleDef.parameterDefs.find(p => p.name === name);
  }
  // 沿容器链下钻；叶容器的参数定义在其 parameterDefs（非 subContainerDefs）
  let leaf: EcucContainerDef | undefined;
  let current: EcucContainerDef[] = moduleDef.containerDefs;
  for (const seg of containerPath) {
    leaf = current.find(c => c.name === seg);
    if (!leaf) return undefined;
    current = leaf.subContainerDefs;
  }
  if (!leaf) return undefined;
  return leaf.parameterDefs.find(p => p.name === name);
}

/** 值层参数 → 展示行（挂定义元数据） */
function toParamRow(
  param: EcucModuleConfigValue['parameters'][number],
  containerPath: string[],
  moduleDef: EcucModuleConfigValue['moduleDef']
): EcucParamRow {
  const def = findParameterDef(moduleDef, containerPath, param.name);
  return {
    name: param.name,
    value: param.value,
    definitionRef: param.definitionRef,
    kind: def?.kind,
    def,
  };
}

/** 值层容器 → 展示容器（递归；容器链对齐定义层） */
function toContainerView(
  container: EcucContainerValue,
  containerPath: string[],
  moduleDef: EcucModuleConfigValue['moduleDef']
): EcucContainerView {
  const def = findContainerDef(moduleDef?.containerDefs, container.name);
  const path = [...containerPath, container.name];
  return {
    name: container.name,
    definitionRef: container.definitionRef,
    parameters: container.parameters.map(p => toParamRow(p, path, moduleDef)),
    containers: container.containers.map(c => toContainerView(c, path, moduleDef)),
    def,
  };
}

/** 值层模块 → 展示模块（模块定义已由 E2 回填在 moduleDef） */
function toModuleView(module: EcucModuleConfigValue): EcucModuleView {
  return {
    name: module.name,
    definitionRef: module.definitionRef,
    moduleDefRef: module.moduleDefRef,
    parameters: module.parameters.map(p => toParamRow(p, [], module.moduleDef)),
    containers: module.containers.map(c => toContainerView(c, [], module.moduleDef)),
    moduleDef: module.moduleDef,
  };
}

/** 递归收集容器（返回 [容器数, 参数数]） */
function countContainersAndParams(containers: EcucContainerView[]): [number, number] {
  let containersCount = 0;
  let paramsCount = 0;
  for (const c of containers) {
    containersCount += 1;
    paramsCount += c.parameters.length;
    const [cc, pc] = countContainersAndParams(c.containers);
    containersCount += cc;
    paramsCount += pc;
  }
  return [containersCount, paramsCount];
}

/** 递归统计定义层容器/参数定义数 */
function countDefContainersAndParams(defs: EcucContainerDef[]): [number, number] {
  let containersCount = 0;
  let paramsCount = 0;
  for (const d of defs) {
    containersCount += 1;
    paramsCount += d.parameterDefs.length;
    const [cc, pc] = countDefContainersAndParams(d.subContainerDefs);
    containersCount += cc;
    paramsCount += pc;
  }
  return [containersCount, paramsCount];
}

/** 递归展开模块树 → 扁平参数行 */
function flattenParams(module: EcucModuleView): EcucFlatParamRow[] {
  const rows: EcucFlatParamRow[] = [];

  const visit = (params: EcucParamRow[], containerPath: string[], pathLabel: string): void => {
    for (const p of params) {
      rows.push({
        ...p,
        module: module.name,
        containerPath,
        pathLabel,
      });
    }
  };

  const visitContainers = (containers: EcucContainerView[], parentPath: string[]): void => {
    for (const c of containers) {
      const path = [...parentPath, c.name];
      const label = path.join(' / ');
      visit(c.parameters, path, label);
      visitContainers(c.containers, path);
    }
  };

  visit(module.parameters, [], '');
  visitContainers(module.containers, []);
  return rows;
}

/**
 * 构建展示统计。
 *
 * @param modules 展示模块（值层）
 * @param defModules 定义层模块（可空）
 */
export function buildEcucStats(modules: EcucModuleView[], defModules: EcucModuleDef[]): EcucStats {
  let moduleCount = 0;
  let containerCount = 0;
  let parameterCount = 0;
  let defContainerCount = 0;
  let defParameterCount = 0;

  for (const m of modules) {
    moduleCount += 1;
    parameterCount += m.parameters.length;
    const [cc, pc] = countContainersAndParams(m.containers);
    containerCount += cc;
    parameterCount += pc;
  }
  for (const d of defModules) {
    defParameterCount += d.parameterDefs.length;
    const [cc, pc] = countDefContainersAndParams(d.containerDefs);
    defContainerCount += cc;
    defParameterCount += pc;
  }

  // 定义覆盖率：有定义层的值层模块占比（无定义层文件 = 0）
  const withDef = modules.filter(m => m.moduleDef !== undefined).length;
  const defCoveragePercent = modules.length > 0 ? Math.round((withDef / modules.length) * 100) : 0;

  return {
    moduleCount,
    containerCount,
    parameterCount,
    defModuleCount: defModules.length,
    defContainerCount,
    defParameterCount,
    defCoveragePercent,
  };
}

/**
 * 主入口：SwcArxmlProject → EcucProjectView（只读展示模型）。
 *
 * @param project parseSwcArxml 返回的完整工程（含 ecucModules + ecucModuleDefs）
 * @returns 展示视图（模块树 + 扁平参数行 + 统计 + 报告）
 *
 * @example
 * ```ts
 * const parsed = parseSwcArxml(xml, 'Can.arxml');
 * const view = buildEcucProjectView(parsed);
 * console.log(view.stats.moduleCount);      // ECUC 值层模块数
 * console.log(view.flatParams[0]?.pathLabel); // 'Can / CanController'
 * ```
 */
export function buildEcucProjectView(project: SwcArxmlProject): EcucProjectView {
  const modules = project.ecucModules.map(toModuleView);
  const defModules = project.ecucModuleDefs;

  const flatParams: EcucFlatParamRow[] = [];
  for (const m of modules) {
    flatParams.push(...flattenParams(m));
  }

  return {
    modules,
    defModules,
    flatParams,
    stats: buildEcucStats(modules, defModules),
    report: project.report,
  };
}

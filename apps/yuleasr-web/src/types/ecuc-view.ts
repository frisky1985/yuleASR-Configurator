/**
 * ECUC 展示领域模型（只读视图）
 *
 * 背景（R8/E4）：core 的 ECUC 值层/定义层类型（EcucModuleConfigValue/EcucModuleDef）
 * 已是领域出口，本层只在 web 侧做「可展示形态」的薄包装：
 *  - 值层 + 定义层关联（参数行挂定义元数据：类别/多实例/默认值/枚举字面量）；
 *  - 树/表展示所需的派生数据（统计、扁平参数行、模块定义索引）。
 *
 * 设计边界（诚实声明）：
 *  - 本模型**只读**：不含任何编辑入口；编辑（改值/增删容器）留遗留；
 *  - 与 types/config.ts 的 ModuleSchema/ModuleConfig（EcucCodeGenerator 模型）
 *    **刻意独立**——导入 ECUC 值层携带 DEFINITION-REF 原文与定义关联，
 *    与生成器扁平配置语义不同，不映射以避免污染生成器。
 */

import type {
  EcucContainerDef,
  EcucModuleConfigValue,
  EcucModuleDef,
  EcucParameterDef,
  EcucParameterDefKind,
  ImportReport,
} from '@/services/arxml-ecuc-import';

/** 展示用参数行（值层参数 + 可选定义元数据） */
export interface EcucParamRow {
  /** 参数名（DEFINITION-REF 最后一段） */
  name: string;
  /** 参数值（数值/文本/布尔） */
  value: string | number | boolean;
  /** DEFINITION-REF 原文（如 /Can/Can/CanController/CanControllerBaudRate） */
  definitionRef: string;
  /** 定义类别（E2 定义层匹配到才非空；纯值层文件为 undefined） */
  kind?: EcucParameterDefKind;
  /** 定义层元数据（E2 定义层匹配到才非空） */
  def?: EcucParameterDef;
}

/** 展示用容器（递归） */
export interface EcucContainerView {
  /** 容器短名 */
  name: string;
  /** DEFINITION-REF 原文（DEST=ECUC-PARAM-CONF-CONTAINER-DEF） */
  definitionRef: string;
  /** 直接参数（已挂定义元数据） */
  parameters: EcucParamRow[];
  /** 子容器（SUB-CONTAINERS 递归） */
  containers: EcucContainerView[];
  /** 容器定义（E2 定义层按名匹配到才非空） */
  def?: EcucContainerDef;
}

/** 展示用模块（值层模块 + 定义关联 + 树形容器） */
export interface EcucModuleView {
  /** 模块短名 */
  name: string;
  /** DEFINITION-REF 原文（DEST=ECUC-MODULE-DEF） */
  definitionRef: string;
  /** 模块定义短名（DEFINITION-REF 最后一段） */
  moduleDefRef: string;
  /** 模块级参数（已挂定义元数据） */
  parameters: EcucParamRow[];
  /** 容器树（递归） */
  containers: EcucContainerView[];
  /** 关联的模块定义（E2 resolveEcucModuleDefs 回填；定义缺失时 undefined） */
  moduleDef?: EcucModuleDef;
}

/** 扁平参数行（参数表视图用；path 为模块/容器链，如 "Can / CanController"） */
export interface EcucFlatParamRow extends EcucParamRow {
  /** 模块短名 */
  module: string;
  /** 容器链（空数组 = 模块级参数） */
  containerPath: string[];
  /** 人类可读路径（模块 / 容器 / 容器） */
  pathLabel: string;
}

/** ECUC 统计（摘要卡片用） */
export interface EcucStats {
  /** 值层模块数 */
  moduleCount: number;
  /** 值层容器总数（递归） */
  containerCount: number;
  /** 值层参数总数（模块级 + 容器内，递归） */
  parameterCount: number;
  /** 定义层模块数（可为 0：纯值层文件） */
  defModuleCount: number;
  /** 定义层容器定义总数（递归） */
  defContainerCount: number;
  /** 定义层参数定义总数（递归） */
  defParameterCount: number;
  /** 值层模块关联到定义的比例（0-100；无定义层时为 0） */
  defCoveragePercent: number;
}

/** ECUC 展示工程视图（页面/组件消费的唯一入口） */
export interface EcucProjectView {
  /** 值层模块（树视图数据源） */
  modules: EcucModuleView[];
  /** 定义层模块（只读展示；纯值层文件为空数组） */
  defModules: EcucModuleDef[];
  /** 扁平参数行（参数表视图数据源） */
  flatParams: EcucFlatParamRow[];
  /** 统计摘要 */
  stats: EcucStats;
  /** 导入报告（计数 + 未处理元素告警 + E3 一致性问题） */
  report: ImportReport;
}

/** 空工程视图（未导入/导入为空时的占位） */
export function createEmptyEcucProjectView(): EcucProjectView {
  return {
    modules: [],
    defModules: [],
    flatParams: [],
    stats: {
      moduleCount: 0,
      containerCount: 0,
      parameterCount: 0,
      defModuleCount: 0,
      defContainerCount: 0,
      defParameterCount: 0,
      defCoveragePercent: 0,
    },
    report: {
      sourceName: '',
      schemaVersion: null,
      counts: {
        swComponents: 0,
        ports: 0,
        runnables: 0,
        interfaces: 0,
        dataElements: 0,
        operations: 0,
        applicationDataTypes: 0,
        implementationDataTypes: 0,
        compuMethods: 0,
        ecucModules: 0,
        ecucModuleDefs: 0,
      },
      warnings: [],
      errors: [],
    },
  };
}

/** 值层模块（core 类型，展示组件也直接消费） */
export type { EcucModuleConfigValue, EcucModuleDef };

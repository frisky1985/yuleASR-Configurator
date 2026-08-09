/**
 * ECUC 编辑领域模型（F3）
 *
 * 在 R8/E4 只读展示模型（EcucProjectView）之上叠加「可编辑」形态：
 *  - 每行参数带实时校验结果（issue，E3 同规则：类型/枚举/容器上限）；
 *  - 模块带 enabled 状态（模块启停：导出/生成时跳过禁用模块）；
 *  - 容器路径带实例索引（EcucContainerPath），同名兄弟实例可精确定位
 *    （多实例场景如多个 CanController 各改各的值）。
 *
 * 数据流：parseSwcArxml → buildEcucProjectView（只读）→ createEcucEditableProject
 *       → 页面编辑（updateParamValue / toggleModuleEnabled / addContainer / removeContainer）
 *       → 回写（editableToConfigModules → A4 导出 ARXML；editableToSchemas → F2a 生成 Cfg.h）。
 *
 * 设计边界（诚实声明）：
 *  - 编辑模型是展示模型的**派生工作副本**，不落盘、不污染 core 领域模型；
 *  - 校验规则与 E3（ecuc-consistency.ts）对齐但独立实现（编辑时逐参校验，
 *    不重新走完整导入管线）；定义缺失的参数无法校验（issue 为空，UI 正常展示）。
 */

import type { EcucProjectView } from './ecuc-view';

import type {
  EcucContainerDef,
  EcucModuleDef,
  EcucParameterDef,
  EcucParameterDefKind,
} from '@/services/arxml-ecuc-import';

/** 编辑校验问题（实时提示；规则与 E3 一致） */
export interface EcucEditIssue {
  severity: 'error' | 'warning';
  message: string;
}

/** 容器路径段：容器名 + 在同名兄弟中的索引（0 基），精确定位多实例 */
export interface EcucContainerSegment {
  name: string;
  index: number;
}

/** 容器路径（模块级参数 = 空数组） */
export type EcucContainerPath = EcucContainerSegment[];

/** 可编辑参数行（= 展示行 + issue） */
export interface EcucEditParam {
  name: string;
  definitionRef: string;
  value: string | number | boolean;
  kind?: EcucParameterDefKind;
  def?: EcucParameterDef;
  /** 实时校验结果（无定义/校验通过为 null/undefined） */
  issue?: EcucEditIssue | null;
}

/** 可编辑容器（递归） */
export interface EcucEditContainer {
  name: string;
  definitionRef: string;
  parameters: EcucEditParam[];
  containers: EcucEditContainer[];
  def?: EcucContainerDef;
  /** 容器实例数校验（超 upperMultiplicity 为 warning） */
  issue?: EcucEditIssue | null;
}

/** 可编辑模块 */
export interface EcucEditModule {
  name: string;
  definitionRef: string;
  moduleDefRef: string;
  /** 模块启停：禁用模块不参与导出 ARXML / 生成 Cfg.h */
  enabled: boolean;
  parameters: EcucEditParam[];
  containers: EcucEditContainer[];
  moduleDef?: EcucModuleDef;
}

/** 可编辑工程（页面编辑状态的唯一入口） */
export interface EcucEditableProject {
  modules: EcucEditModule[];
  /** 是否有未保存修改 */
  dirty: boolean;
  /** 实时校验错误数（导出前应清零） */
  errors: number;
  /** 实时校验告警数 */
  warnings: number;
}

/** 可编辑扁平参数行（参数表视图用；pathKey 为带索引的容器路径） */
export interface EcucEditableFlatRow extends EcucEditParam {
  module: string;
  containerPath: string[];
  pathKey: EcucContainerPath;
  pathLabel: string;
}

export type { EcucProjectView };

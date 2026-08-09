/**
 * ARXML 模板基类（R2 · 模板机制）
 *
 * 对齐 cogu/autosar src/autosar/xml/template.py（83 行）：
 *  - ElementTemplate：声明元素名/包角色/依赖列表；workspace.apply 自动执行
 *    "依赖先建 → 包自动创建 → 查重防重复 → create 后 append"
 *    （对应 cogu workspace.py:_apply_element_template 的四步）；
 *  - GenericTemplate：全自由扩展，workspace 不干预（template.py:16-26）；
 *  - ref()：元素创建后的引用路径预计算（template.py:58-62 对应物。
 *    省略 workspace 参数：包路径由 PACKAGE_PATHS 常量固定，无需运行时解析）。
 *
 * 包角色（package_role）→ SwcProjectConfig 集合的映射见 workspace.ts；
 * 包路径表与角色类型定义在本文件，避免 workspace ↔ template 运行时循环依赖。
 */

import type {
  ApplicationDataType,
  ApplicationSwComponentType,
  CompositionSwComponentType,
  CompuMethod,
  ImplementationDataType,
  PortInterfaceBase,
} from '../types/swc';

import type { TemplateWorkspace } from './workspace';

/** 有 SHORT-NAME 的模型元素（模板元素的公共约束，对应 cogu ARElement.name） */
export interface NamedElement {
  name: string;
}

/** 包角色 → 元素类型映射（包角色即 SwcProjectConfig 中一个集合的"类型键"） */
export interface SwcPackageElementTypeMap {
  ApplicationComponent: ApplicationSwComponentType;
  CompositionComponent: CompositionSwComponentType;
  Interface: PortInterfaceBase;
  ApplicationDataType: ApplicationDataType;
  ImplementationDataType: ImplementationDataType;
  CompuMethod: CompuMethod;
}

/** 包角色：决定元素落在 SwcProjectConfig 的哪个集合（cogu PackageRole 对应物） */
export type SwcPackageRole = keyof SwcPackageElementTypeMap;

/** 包路径表：角色 → AR-PACKAGE 引用路径（cogu get_package_ref_by_role 的静态版） */
export const PACKAGE_PATHS: Record<SwcPackageRole, string> = {
  ApplicationComponent: '/Components/ApplicationComponents',
  CompositionComponent: '/Components/CompositionComponents',
  Interface: '/Interfaces',
  ApplicationDataType: '/DataTypes/ApplicationDataTypes',
  ImplementationDataType: '/DataTypes/ImplementationDataTypes',
  CompuMethod: '/CompuMethods',
};

/** 包视图：指向 SwcProjectConfig 中某个集合（惰性，不复制数据；cogu Package 对应物） */
export interface SwcPackage<TElement extends NamedElement> {
  /** 包角色 */
  role: SwcPackageRole;
  /** 集合的只读视图 */
  elements: readonly TElement[];
  /** 按 SHORT-NAME 查找（查重防重复用） */
  find(name: string): TElement | undefined;
  /** 追加元素（cogu Package.append） */
  append(element: TElement): void;
}

/** 模板创建上下文：workspace.apply 在调用 create 前组装好的一切 */
export interface TemplateCreateContext<TElement extends NamedElement> {
  /** 目标包（已就绪：集合已初始化） */
  pkg: SwcPackage<TElement>;
  /** 应用模板的工作区（create 内可继续 apply 嵌套模板） */
  workspace: TemplateWorkspace;
  /** 依赖元素表：key = 依赖模板 ref()，value = 已创建元素 */
  dependencies: Map<string, unknown>;
}

/**
 * 元素模板基类：声明元素名/包角色/依赖，apply 时由工作区完成
 * 依赖先建 → 包自动创建 → 查重防重复 → create 后 append。
 */
export abstract class ElementTemplate<TElement extends NamedElement> {
  /** 依赖模板列表（apply 时先于本模板创建；cogu depends） */
  readonly depends: readonly ElementTemplate<NamedElement>[];

  constructor(
    /** 元素 SHORT-NAME */
    readonly elementName: string,
    /** 目标包角色（决定元素落在 SwcProjectConfig 的哪个集合） */
    readonly packageRole: SwcPackageRole,
    /** 依赖模板（默认无依赖） */
    depends: ElementTemplate<NamedElement>[] = [],
    /** 创建后是否追加进包（默认 true；false 时仅创建不落地） */
    readonly appendToPackage = true,
  ) {
    this.depends = depends;
  }

  /** 元素创建方法：返回带 name 的模型元素（workspace 负责查重与追加） */
  abstract create(context: TemplateCreateContext<TElement>): TElement;

  /** 元素创建后的引用路径（cogu ElementTemplate.ref 对应物） */
  ref(): string {
    return `${PACKAGE_PATHS[this.packageRole]}/${this.elementName}`;
  }
}

/**
 * 全自由模板：workspace.apply 直接转发，不做任何自动化（cogu GenericTemplate）。
 * 适合工作区结构外的一次性组装/批量操作。
 */
export abstract class GenericTemplate {
  /** 应用本模板（参数透传，工作区不干预） */
  abstract apply(workspace: TemplateWorkspace, ...args: unknown[]): unknown;
}

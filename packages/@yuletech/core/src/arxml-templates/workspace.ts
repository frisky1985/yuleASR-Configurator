/**
 * ARXML 模板工作区（R2 · 模板机制）
 *
 * 对齐 cogu/autosar src/autosar/xml/workspace.py 的 workspace 职责（轻量裁剪）：
 *  - 包角色 → SwcProjectConfig 内对应集合的映射（cogu Namespace.package_map 对应物）；
 *  - makePackage：包"自动创建"（惰性视图，不复制数据）；
 *  - apply：模板应用入口 —— 依赖先建 → 包就绪 → 查重防重复 → create 后 append
 *    （cogu workspace.py:_apply_element_template 同序，_create_dependencies 同语义）。
 *
 * 与 cogu 的差异（有意）：
 *  - cogu 的包是树状 Package 对象（make_packages 建中间层）；这里 SwcProjectConfig
 *    本身就是"按元素类型分集合"的平铺模型，包视图直接指向各集合，无中间层；
 *  - cogu 支持 namespace/package_map 重定向；这里包路径由 PACKAGE_PATHS 常量固定。
 */

import type { SwcProjectConfig } from '../types/swc';

import { AssignmentTypeError } from '../arxml-errors';
import {
  ElementTemplate,
  GenericTemplate,
  type NamedElement,
  type SwcPackage,
  type SwcPackageRole,
  PACKAGE_PATHS,
} from './element-template';

/** 集合提取：角色 → 项目内可变集合（可选集合惰性初始化，cogu make_packages 对应物） */
function collectionOf(project: SwcProjectConfig, role: SwcPackageRole): NamedElement[] {
  switch (role) {
    case 'ApplicationComponent':
      return project.applicationComponents;
    case 'CompositionComponent':
      return project.compositionComponents;
    case 'Interface':
      return (project.interfaces ??= []);
    case 'ApplicationDataType':
      return project.applicationDataTypes;
    case 'ImplementationDataType':
      return project.implementationDataTypes;
    case 'CompuMethod':
      return (project.compuMethods ??= []);
  }
}

/**
 * 模板工作区：包装一个 SwcProjectConfig，提供包自动创建 + 模板 apply。
 */
export class TemplateWorkspace {
  /** 角色 → 包视图缓存（同一角色同一次 apply 会话共享一个视图） */
  private readonly packages = new Map<SwcPackageRole, SwcPackage<NamedElement>>();

  constructor(readonly project: SwcProjectConfig) {}

  /**
   * 取回（或惰性创建）指定角色的包视图。包创建只初始化集合引用，
   * 不复制数据；后续 append 直接写回 project 对应集合。
   */
  makePackage<TElement extends NamedElement>(role: SwcPackageRole): SwcPackage<TElement> {
    let pkg = this.packages.get(role);
    if (pkg === undefined) {
      const elements = collectionOf(this.project, role);
      pkg = {
        role,
        elements,
        find: name => elements.find(element => element.name === name),
        append: element => {
          elements.push(element);
        },
      };
      this.packages.set(role, pkg);
    }
    return pkg as SwcPackage<TElement>;
  }

  /** 角色对应的包引用路径（cogu get_package_ref_by_role 对应物） */
  packageRef(role: SwcPackageRole): string {
    return PACKAGE_PATHS[role];
  }

  /** 应用元素模板：依赖先建 → 包就绪 → 查重防重复 → create 后 append */
  apply<TElement extends NamedElement>(template: ElementTemplate<TElement>): TElement;
  /** 应用全自由模板：直接转发，工作区不干预 */
  apply(template: GenericTemplate, ...args: unknown[]): unknown;
  apply(template: ElementTemplate<NamedElement> | GenericTemplate, ...args: unknown[]): unknown {
    if (template instanceof GenericTemplate) {
      return template.apply(this, ...args);
    }
    return this.applyElement(template);
  }

  private applyElement<TElement extends NamedElement>(
    template: ElementTemplate<TElement>
  ): TElement {
    // 1. 依赖先建（cogu _create_dependencies：递归 apply，结果按 ref 入表）
    const dependencies = new Map<string, unknown>();
    for (const dependency of template.depends) {
      const element = this.apply(dependency);
      dependencies.set(dependency.ref(), element);
    }

    // 2. 包自动创建（惰性视图，集合就绪）
    const pkg = this.makePackage<TElement>(template.packageRole);

    // 3. 查重防重复：已存在则直接返回既有元素（幂等，cogu 同行为）
    const existing = pkg.find(template.elementName);
    if (existing !== undefined) {
      return existing;
    }

    // 4. create + append（appendToPackage=false 时仅创建不落地）
    const element = template.create({ pkg, workspace: this, dependencies });
    if (typeof element !== 'object' || element === null || typeof element.name !== 'string') {
      throw new AssignmentTypeError(
        `${template.elementName}: create() 必须返回带 name 的模型元素，实际返回 ${String(element)}`
      );
    }
    if (template.appendToPackage) {
      pkg.append(element);
    }
    return element;
  }
}

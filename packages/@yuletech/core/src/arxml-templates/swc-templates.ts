/**
 * SWC 实用模板（R2 · 模板机制落地）
 *
 * 落地两个贴近现有数据模型（types/swc.ts）的模板：
 *  - SenderReceiverInterfaceTemplate：SenderReceiverInterface（包角色 Interface）；
 *  - ApplicationSwcTemplate：ApplicationSwComponentType（包角色 ApplicationComponent），
 *    端口引用的接口由 depends 中的接口模板"依赖先建"提供。
 *
 * 替代此前"新建 SWC/端口/接口靠手写工厂代码"的做法：工厂函数只构造单个对象，
 * 模板额外获得 workspace 的包落位/查重/依赖编排能力（cogu template.py 同思路）。
 */

import type {
  ApplicationSwComponentType,
  PortDirection,
  PortInterfaceBase,
  RunnableInvocationType,
  SenderReceiverInterface,
  SrDataElement,
} from '../types/swc';

import { ElementTemplate, type NamedElement, type TemplateCreateContext } from './element-template';

// ============================================================================
// SenderReceiverInterfaceTemplate
// ============================================================================

/** Sender-Receiver 接口模板选项 */
export interface SenderReceiverInterfaceTemplateOptions {
  /** 接口说明 */
  description?: string;
  /** 数据元素列表 */
  dataElements?: SrDataElement[];
}

/** Sender-Receiver 接口模板：创建接口并落入 Interface 包 */
export class SenderReceiverInterfaceTemplate extends ElementTemplate<SenderReceiverInterface> {
  constructor(
    elementName: string,
    private readonly options: SenderReceiverInterfaceTemplateOptions = {}
  ) {
    super(elementName, 'Interface');
  }

  create(): SenderReceiverInterface {
    return {
      name: this.elementName,
      kind: 'SenderReceiverInterface',
      description: this.options.description,
      dataElements: this.options.dataElements ?? [],
      isService: false,
    };
  }
}

// ============================================================================
// ApplicationSwcTemplate
// ============================================================================

/** SWC 端口声明（interfaceName 引用 depends 中接口模板创建的同名接口） */
export interface ApplicationSwcPortSpec {
  name: string;
  direction: PortDirection;
  interfaceName: string;
}

/** SWC runnable 声明 */
export interface ApplicationSwcRunnableSpec {
  name: string;
  invocationType?: RunnableInvocationType;
  minimumStartInterval?: number;
}

/** Application SWC 模板选项 */
export interface ApplicationSwcTemplateOptions {
  description?: string;
  ports?: ApplicationSwcPortSpec[];
  runnables?: ApplicationSwcRunnableSpec[];
}

/**
 * Application SWC 模板：依赖的接口模板先建（接口落入 Interface 包），
 * SWC 端口引用已建接口，接口列表自动从依赖表收集。
 */
export class ApplicationSwcTemplate extends ElementTemplate<ApplicationSwComponentType> {
  constructor(
    elementName: string,
    private readonly options: ApplicationSwcTemplateOptions = {},
    depends: ElementTemplate<NamedElement>[] = []
  ) {
    super(elementName, 'ApplicationComponent', depends);
  }

  create(context: TemplateCreateContext<ApplicationSwComponentType>): ApplicationSwComponentType {
    const ports = (this.options.ports ?? []).map(port => ({
      name: port.name,
      direction: port.direction,
      interfaceRef: port.interfaceName,
    }));
    const runnables = (this.options.runnables ?? []).map(runnable => ({
      name: runnable.name,
      invocationType: runnable.invocationType ?? 'cyclic',
      ...(runnable.minimumStartInterval !== undefined
        ? { minimumStartInterval: runnable.minimumStartInterval }
        : {}),
    }));

    // 依赖先建产物中的接口自动挂到 SWC.interfaces（端口可按名引用）
    const interfaces = Array.from(context.dependencies.values()).filter(
      (element): element is PortInterfaceBase =>
        typeof element === 'object' &&
        element !== null &&
        'kind' in element &&
        typeof (element as { kind?: unknown }).kind === 'string'
    );

    return {
      name: this.elementName,
      label: this.elementName,
      description: this.options.description ?? `Application SWC: ${this.elementName}`,
      layer: 'ASW',
      ports,
      internalBehavior: {
        name: `${this.elementName}_InternalBehavior`,
        runnables,
        irvs: [],
        perInstanceMemories: [],
        exclusiveAreas: [],
      },
      dataTypeMappings: [],
      interfaces,
    };
  }
}

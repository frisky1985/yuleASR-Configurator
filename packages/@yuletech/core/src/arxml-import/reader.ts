/**
 * @yuletech/core - ARXML SWC-layer Reader（R8/E1 起覆盖 ECUC 值层）
 *
 * 轻量自研 ARXML 解析器：SWC/端口/接口/数据类型/CompuMethod 层 +
 * ECUC 值层（ECUC-MODULE-CONFIGURATION-VALUES / PARAMETER-VALUES /
 * ECUC-CONTAINER-VALUE 递归，R8/E1 启动）。
 *
 * 设计借鉴 cogu/autosar（https://github.com/cogu/autosar）reader.py 的两个模式：
 *  1. switcher 字典分发（reader.py:116-200）—— 每个元素类型对应一个 _read_xxx 方法，
 *     新增元素类型 = 加一行字典 + 一个方法；
 *  2. ChildElementMap + 未处理元素告警（reader.py:69-101, 398-415）—— 记录每个父节点
 *     的子元素是否被消费，未消费的按 `file(line): Unprocessed element <TAG>` 告警，
 *     告警而非崩溃（OEM ARXML 必然含库不认识的元素）。
 *
 * R8/E1 边界（诚实声明，详见批次 3 报告）：
 *  - 本批只做 ECUC **值层**；定义层（ECUC-MODULE-DEF 元模型）不解析，
 *    DEFINITION-REF 保留字符串（definitionRef / moduleDefRef=短名），不做值-定义一致性校验；
 *  - ECUC 定义引用（DEST=ECUC-MODULE-DEF / ECUC-PARAM-CONF-CONTAINER-DEF）
 *    不参与 C1 pendingRefs 类型校验（无定义层目标可校验）；
 *  - IMPLEMENTATION-CONFIG-VARIANT 为标准元素但值层模型不捕获（skip 不告警，见 readEcucModule）。
 *
 * 与导出侧对称：EcucModuleConfigValue / EcucContainerValue / EcucParameterValue
 * 的字段命名对齐 arxml-export/serializer.ts 的 ArxmlExportModule / ArxmlExportContainer /
 * ArxmlExportParameter（name/value），导入导出闭环（serialize → parse 可还原）。
 */

import { XMLParser } from 'fast-xml-parser';

import type {
  ApplicationDataType,
  ApplicationSwComponentType,
  ClientServerInterface,
  CompositionSwComponentType,
  CompuMethod,
  ImplementationDataType,
  PortInterfaceBase,
  PortPrototype,
  RunnableEntity,
  SenderReceiverInterface,
  SwcInternalBehavior,
} from '../types/swc';

import { REF_CONSTRAINTS, REF_TARGET_KIND_LABELS, type RefTargetKind } from './reference';

// ============================================================================
// 导入报告类型
// ============================================================================

/** 未处理元素告警条目，格式对齐 cogu: `file(line): Unprocessed element <TAG>` */
export interface UnprocessedElementWarning {
  line: number | null;
  tag: string;
  message: string;
}

/** 导入报告：成功元素计数 + 未处理元素告警清单 + 错误 */
export interface ImportReport {
  /** 源文件名（用于告警 file(line) 前缀） */
  sourceName: string;
  /** schemaLocation 探测到的 AUTOSAR 版本号（如 48/49/50/51），未探测到为 null */
  schemaVersion: number | null;
  /** 成功导入的元素计数（按类别） */
  counts: {
    swComponents: number;
    ports: number;
    runnables: number;
    interfaces: number;
    dataElements: number;
    operations: number;
    applicationDataTypes: number;
    implementationDataTypes: number;
    compuMethods: number;
    /** ECUC 值层模块数（R8/E1） */
    ecucModules: number;
  };
  /** 未处理元素告警清单（不崩溃，仅告警） */
  warnings: UnprocessedElementWarning[];
  /** 解析/导入错误（XML 畸形等硬错误） */
  errors: string[];
}

// ============================================================================
// 内部模型（读取中间态，区别于导出的 swc.ts 领域模型）
// ============================================================================

/** 解析后的完整 SWC 工程（ARXML → 领域模型映射的中间结果） */
export interface SwcArxmlProject {
  applicationComponents: ApplicationSwComponentType[];
  compositionComponents: CompositionSwComponentType[];
  interfaces: PortInterfaceBase[];
  applicationDataTypes: ApplicationDataType[];
  implementationDataTypes: ImplementationDataType[];
  compuMethods: CompuMethod[];
  baseTypes: Map<string, string>;
  /** ECUC 值层模块（R8/E1；ECUC-MODULE-CONFIGURATION-VALUES） */
  ecucModules: EcucModuleConfigValue[];
  report: ImportReport;
}

// ============================================================================
// ECUC 值层数据模型（R8/E1）
// 字段命名对齐 arxml-export/serializer.ts：
//   ArxmlExportParameter.name/value      ↔ EcucParameterValue.name/value
//   ArxmlExportContainer.name/parameters ↔ EcucContainerValue.name/parameters
//   ArxmlExportModule.name/parameters    ↔ EcucModuleConfigValue.name/parameters
// 导入侧额外保留 definitionRef（DEFINITION-REF 原文，定义层远期解析用）。
// ============================================================================

/**
 * ECUC 参数值（值层）。
 *
 * 值类型按元素 tag 归一：
 *  - ECUC-BOOLEAN-PARAM-VALUE → boolean
 *  - ECUC-NUMERICAL-PARAM-VALUE → number（数值化失败保留原文）
 *  - ECUC-TEXTUAL-PARAM-VALUE → string
 * 与导出侧 ArxmlExportParameter.value（string | number | boolean）对称。
 */
export interface EcucParameterValue {
  /** 参数名（DEFINITION-REF 最后一段，与导出侧 name 对称） */
  name: string;
  /** DEFINITION-REF 原文（定义层不解析，保留字符串） */
  definitionRef: string;
  /** 参数值（数值/文本/布尔） */
  value: string | number | boolean;
}

/** ECUC 容器值（可递归嵌套，对应 CONTAINERS / SUB-CONTAINERS） */
export interface EcucContainerValue {
  /** 容器短名（SHORT-NAME） */
  name: string;
  /** DEFINITION-REF 原文（DEST=ECUC-PARAM-CONF-CONTAINER-DEF） */
  definitionRef: string;
  /** 直接参数值 */
  parameters: EcucParameterValue[];
  /** 子容器（SUB-CONTAINERS 递归） */
  containers: EcucContainerValue[];
}

/**
 * ECUC 模块配置值（ECUC-MODULE-CONFIGURATION-VALUES）。
 * 与导出侧 ArxmlExportModule 对称；moduleDefRef 为 DEFINITION-REF 短名。
 */
export interface EcucModuleConfigValue {
  /** 模块短名（SHORT-NAME） */
  name: string;
  /** DEFINITION-REF 原文（DEST=ECUC-MODULE-DEF，定义层远期解析） */
  definitionRef: string;
  /** 模块定义短名（DEFINITION-REF 最后一段） */
  moduleDefRef: string;
  /** 模块级参数（PARAMETER-VALUES） */
  parameters: EcucParameterValue[];
  /** 容器（CONTAINERS → ECUC-CONTAINER-VALUE 递归） */
  containers: EcucContainerValue[];
}

// ============================================================================
// XML 解析工厂（fast-xml-parser 统一配置）
// ============================================================================

/** 需要强制为数组的标签（ARXML 中可重复出现的元素） */
const ARRAY_TAGS = new Set([
  'AR-PACKAGE',
  'ELEMENTS',
  'APPLICATION-SW-COMPONENT-TYPE',
  'COMPOSITION-SW-COMPONENT-TYPE',
  'P-PORT-PROTOTYPE',
  'R-PORT-PROTOTYPE',
  'SENDER-RECEIVER-INTERFACE',
  'CLIENT-SERVER-INTERFACE',
  'APPLICATION-PRIMITIVE-DATA-TYPE',
  'IMPLEMENTATION-DATA-TYPE',
  'SW-BASE-TYPE',
  'COMPU-METHOD',
  'PORTS',
  'INTERNAL-BEHAVIORS',
  'SWC-INTERNAL-BEHAVIOR',
  'RUNNABLES',
  'RUNNABLE-ENTITY',
  'DATA-ELEMENTS',
  'DATA-ELEMENT-PROTOTYPE',
  'OPERATIONS',
  'CLIENT-SERVER-OPERATION',
  'ARGUMENT-DATA-PROTOTYPE',
  'ARGUMENTS',
  'COMPU-SCALES',
  'COMPU-SCALE',
  'COMPU-CONST',
  'COMPU-RATIONAL-COEFFS',
  'COMPU-NUMERATOR',
  'COMPU-DENOMINATOR',
  'V',
  'COMPU-INTERNAL-TO-PHYS',
  'COMPU-PHYS-TO-INTERNAL',
  'SW-DATA-DEF-PROPS',
  'SW-DATA-DEF-PROPS-VARIANTS',
  'SW-DATA-DEF-PROPS-CONDITIONAL',
  'BASE-TYPE-REF',
  'COMPU-METHOD-REF',
  'IMPLEMENTATION-DATA-TYPE-REF',
  'TYPE-TREF',
  'REQUIRED-INTERFACE-TREF',
  'PROVIDED-INTERFACE-TREF',
  // ECUC 值层（R8/E1）：值层元素可能单/多出现，统一强制数组保证遍历语义
  'ECUC-MODULE-CONFIGURATION-VALUES',
  'ECUC-CONTAINER-VALUE',
  'ECUC-NUMERICAL-PARAM-VALUE',
  'ECUC-TEXTUAL-PARAM-VALUE',
  'ECUC-BOOLEAN-PARAM-VALUE',
  'PARAMETER-VALUES',
  'CONTAINERS',
  'SUB-CONTAINERS',
]);

function createXmlParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    isArray: (name: string) => ARRAY_TAGS.has(name),
  });
}

// ============================================================================
// XML 辅助函数（与 adapters/arxml-parser.ts 同语义）
// ============================================================================

/** 获取子元素节点（可能为单对象或数组） */
export function getChild(parent: Record<string, unknown>, name: string): unknown {
  if (!parent || typeof parent !== 'object') return undefined;
  return parent[name];
}

/** 获取子元素的文本内容 */
export function getTextContent(parent: Record<string, unknown>, tagName: string): string | undefined {
  const child = getChild(parent, tagName);
  return getNodeText(child);
}

/** 从解析节点提取文本值（支持字符串/对象 #text/数字/布尔/数组） */
export function getNodeText(node: unknown): string | undefined {
  if (node === undefined || node === null) return undefined;
  if (Array.isArray(node)) {
    // isArray 标签（如 BASE-TYPE-REF / TYPE-TREF）解析为数组，取首元素
    return getNodeText(node[0]);
  }
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return node ? 'true' : 'false';
  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if ('#text' in obj) {
      const text = obj['#text'];
      if (text === undefined || text === null) return undefined;
      return String(text);
    }
  }
  return undefined;
}

/** 获取节点属性（fast-xml-parser 属性以 @_ 前缀存储） */
export function getAttribute(node: unknown, attrName: string): string | undefined {
  if (!node || typeof node !== 'object') return undefined;
  const obj = node as Record<string, unknown>;
  const val = obj[`@_${attrName}`];
  if (val === undefined || val === null) return undefined;
  return String(val);
}

/** 确保返回数组（单元素包装为数组） */
export function ensureArray<T>(value: unknown): T[] {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]) as T[];
}

/**
 * 取子元素并解包为对象（fast-xml-parser 对 isArray 标签返回数组，
 * 但多数容器语义是“单个父容器节点”，此处取首个元素）。
 */
export function firstChild(parent: Record<string, unknown> | undefined, name: string): Record<string, unknown> | undefined {
  if (!parent || typeof parent !== 'object') return undefined;
  const child = parent[name];
  if (child === undefined || child === null) return undefined;
  if (Array.isArray(child)) {
    const first = child[0];
    return first && typeof first === 'object' ? (first as Record<string, unknown>) : undefined;
  }
  return typeof child === 'object' ? (child as Record<string, unknown>) : undefined;
}

/** 提取 DESC 多语言文本（L-2 / L-1 / #text） */
export function getDescText(parent: Record<string, unknown>): string | undefined {
  const desc = firstChild(parent, 'DESC');
  if (!desc) return undefined;
  return getTextContent(desc, 'L-2') ?? getTextContent(desc, 'L-1') ?? getNodeText(desc);
}

// ============================================================================
// ChildElementMap（借鉴 cogu reader.py:69-101）
// 记录父节点所有子元素，get() 消费后标记为已访问；
// 处理完成后未访问的元素按 `file(line): Unprocessed element <TAG>` 告警。
// ============================================================================

interface WrappedElement {
  elem: unknown;
  isAccessed: boolean;
}

export class ChildElementMap {
  private readonly elements: Map<string, WrappedElement> = new Map();

  constructor(parent: Record<string, unknown>) {
    if (!parent || typeof parent !== 'object') return;
    for (const [key, value] of Object.entries(parent)) {
      // 跳过属性与文本节点
      if (key.startsWith('@_') || key === '#text') continue;
      if (!this.elements.has(key)) {
        this.elements.set(key, { elem: value, isAccessed: false });
      }
    }
  }

  /** 返回子元素并标记为已访问（消费语义） */
  get(tag: string): unknown {
    const wrapped = this.elements.get(tag);
    if (wrapped) {
      wrapped.isAccessed = true;
      return wrapped.elem;
    }
    return undefined;
  }

  /** 标记子元素为已消费但不返回（用于跳过已知但本次不导入的元素） */
  skip(tag: string): void {
    const wrapped = this.elements.get(tag);
    if (wrapped) wrapped.isAccessed = true;
  }

  /** 未消费的子元素（按 XML 文档顺序） */
  unprocessed(): Array<{ tag: string; elem: unknown }> {
    const result: Array<{ tag: string; elem: unknown }> = [];
    for (const [tag, wrapped] of this.elements) {
      if (!wrapped.isAccessed) result.push({ tag, elem: wrapped.elem });
    }
    return result;
  }
}

// ============================================================================
// 行号索引（用于告警 file(line) 格式）
// fast-xml-parser 不保留行号；这里预扫描源文本建立 tag → 行号列表（按出现顺序）。
// ============================================================================

export class LineIndex {
  private readonly linesByTag: Map<string, number[]> = new Map();

  constructor(xml: string) {
    const tagRe = /<([A-Z][A-Z0-9-]*)(?=[\s/>])/g;
    let match: RegExpExecArray | null;
    let line = 1;
    let lastEnd = 0;
    while ((match = tagRe.exec(xml)) !== null) {
      // 统计从 lastEnd 到 match.index 之间的换行数
      for (let i = lastEnd; i < match.index; i++) {
        if (xml[i] === '\n') line++;
      }
      const tag = match[1];
      if (!this.linesByTag.has(tag)) this.linesByTag.set(tag, []);
      this.linesByTag.get(tag)!.push(line);
      lastEnd = match.index;
    }
  }

  /** 返回该 tag 下一个（未消耗的）出现行号 */
  nextLine(tag: string): number | null {
    const lines = this.linesByTag.get(tag);
    const line = lines?.shift();
    return line === undefined ? null : line;
  }
}

// ============================================================================
// 读取上下文
// ============================================================================

/** 待解析引用（C1：解析期类型校验 + 短名写回） */
export interface PendingReference {
  /** 原始引用路径（如 /Interfaces/DoorState_IF） */
  ref: string;
  /** 期望目标类别（REF_CONSTRAINTS 约束表取值） */
  expected: RefTargetKind;
  /** 引用上下文（错误信息用，如 "port DoorState_R"） */
  context: string;
  /** 解析成功（目标存在且类别匹配）后写回短名；缺省则不写回 */
  onResolved?: (shortName: string) => void;
}

export interface ReadContext {
  sourceName: string;
  lineIndex: LineIndex;
  report: ImportReport;
  /** 全局引用解析：接口名 → 接口（用于端口 interfaceRef 校验） */
  interfaceMap: Map<string, PortInterfaceBase>;
  /** 数据类型引用：类型名 → 数据类型 */
  typeMap: Map<string, ApplicationDataType | ImplementationDataType>;
  /** 待解析引用队列（收集 → 末遍统一类型校验与写回） */
  pendingRefs: PendingReference[];
}

export function createReadContext(sourceName: string, xml: string): ReadContext {
  return {
    sourceName,
    lineIndex: new LineIndex(xml),
    report: {
      sourceName,
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
      },
      warnings: [],
      errors: [],
    },
    interfaceMap: new Map(),
    typeMap: new Map(),
    pendingRefs: [],
  };
}

/** 记录未处理元素告警：`file(line): Unprocessed element <TAG>`（对齐 cogu 输出格式） */
export function reportUnprocessed(ctx: ReadContext, _parent: Record<string, unknown>, tag: string): void {
  const line = ctx.lineIndex.nextLine(tag);
  ctx.report.warnings.push({
    line,
    tag,
    message: `${ctx.sourceName}(${line ?? '?'}): Unprocessed element <${tag}>`,
  });
}

/** 记录重复元素错误（R6：DuplicateElementError 分类，消息带固定前缀供 classifyImportError 识别） */
export function reportDuplicate(ctx: ReadContext, context: string, name: string): void {
  ctx.report.errors.push(`Duplicate element: ${name} in ${context}`);
}

/** 在读取器完成一个父节点后，报告其未消费子元素（cogu _report_unprocessed_elements 模式） */
export function reportUnprocessedChildren(ctx: ReadContext, childMap: ChildElementMap): void {
  for (const { tag } of childMap.unprocessed()) {
    reportUnprocessed(ctx, {}, tag);
  }
}

// ============================================================================
// 顶层入口：解析 ARXML → SwcArxmlProject
// ============================================================================

/**
 * 解析 ARXML 内容并提取 SWC 层元素（SWC/端口/接口/数据类型/CompuMethod）+ ECUC 值层
 * （ECUC-MODULE-CONFIGURATION-VALUES，R8/E1）。未知元素仅告警不崩溃；
 * ECUC 定义层（元模型）不解析（DEFINITION-REF 保留字符串，见文件头边界说明）。
 */
export function parseSwcArxml(xmlContent: string, sourceName = 'input.arxml'): SwcArxmlProject {
  const project: SwcArxmlProject = {
    applicationComponents: [],
    compositionComponents: [],
    interfaces: [],
    applicationDataTypes: [],
    implementationDataTypes: [],
    compuMethods: [],
    baseTypes: new Map(),
    ecucModules: [],
    report: {
      sourceName,
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
      },
      warnings: [],
      errors: [],
    },
  };

  const ctx = createReadContext(sourceName, xmlContent);

  try {
    const parser = createXmlParser();
    const parsed = parser.parse(xmlContent);

    const autosar = parsed.AUTOSAR;
    if (!autosar) {
      ctx.report.errors.push('Missing AUTOSAR root element');
      project.report = ctx.report;
      return project;
    }

    // fast-xml-parser 对畸形 XML 宽容，这里补一个闭合标签完整性校验
    if (!/<\/AUTOSAR\s*>/.test(xmlContent)) {
      ctx.report.errors.push('Malformed XML: missing closing </AUTOSAR> tag');
      project.report = ctx.report;
      return project;
    }

    // 探测 schema 版本：xsi:schemaLocation 属性（如 "AUTOSAR_00051.xsd"）或 @_schemaVersion
    const schemaLocation = getAttribute(autosar, 'schemaLocation') ?? getAttribute(autosar, 'xsi:schemaLocation');
    ctx.report.schemaVersion = detectSchemaVersion(schemaLocation);

    // 逐包分发解析（switcher 模式：先收集，后统一 resolve 引用）
    const packagesWrapper = getChild(autosar, 'AR-PACKAGES') as Record<string, unknown> | undefined;
    const packageNodes = ensureArray<Record<string, unknown>>(
      (packagesWrapper as Record<string, unknown> | undefined)?.['AR-PACKAGE'] as unknown
    );

    // 第一遍：收集所有可识别元素（两遍法便于跨包引用解析）
    // 递归下钻嵌套 AR-PACKAGE：真实 AUTOSAR 包可任意嵌套（含导出侧每模块一包的形态），
    // 扁平 ELEMENTS 里的元素直接收集。
    const elementNodes: Array<{ tag: string; node: Record<string, unknown> }> = [];
    for (const pkg of packageNodes) {
      collectPackageElements(pkg, elementNodes);
    }

    // 第一遍：数据类型 + CompuMethod + 基础类型（先建引用目标）
    for (const { tag, node } of elementNodes) {
      switch (tag) {
        case 'APPLICATION-PRIMITIVE-DATA-TYPE':
        case 'APPLICATION-DATA-TYPE':
          readApplicationDataType(ctx, node, project);
          break;
        case 'IMPLEMENTATION-DATA-TYPE':
          readImplementationDataType(ctx, node, project);
          break;
        case 'SW-BASE-TYPE':
          readBaseType(ctx, node, project);
          break;
        case 'COMPU-METHOD':
          readCompuMethod(ctx, node, project);
          break;
        default:
          break; // 非数据类型元素留到第二遍
      }
    }

    // 第二遍：接口（端口 interfaceRef 的引用目标）
    for (const { tag, node } of elementNodes) {
      if (tag === 'SENDER-RECEIVER-INTERFACE') readSenderReceiverInterface(ctx, node, project);
      else if (tag === 'CLIENT-SERVER-INTERFACE') readClientServerInterface(ctx, node, project);
    }

    // 第三遍：SWC 组件（端口引用接口）+ ECUC 值层模块（R8/E1）
    for (const { tag, node } of elementNodes) {
      if (tag === 'APPLICATION-SW-COMPONENT-TYPE') readApplicationSwc(ctx, node, project);
      else if (tag === 'COMPOSITION-SW-COMPONENT-TYPE') readCompositionSwc(ctx, node, project);
      else if (tag === 'ECUC-MODULE-CONFIGURATION-VALUES') readEcucModule(ctx, node, project);
      else if (!isKnownTopLevelTag(tag)) {
        // 未知顶层元素 → 告警不崩溃（OEM ARXML 必然含未知元素）
        reportUnprocessed(ctx, node, tag);
      }
    }

    // 解析引用：类型约束校验（C1）+ 短名写回（目标存在且类别匹配）
    resolveReferences(ctx, project);
  } catch (err) {
    ctx.report.errors.push(`Parse error: ${err instanceof Error ? err.message : String(err)}`);
  }

  project.report = ctx.report;
  return project;
}

// ============================================================================
// 顶层元素识别（switcher 已知标签表）
// ============================================================================

const KNOWN_TOP_LEVEL_TAGS = new Set([
  'APPLICATION-SW-COMPONENT-TYPE',
  'COMPOSITION-SW-COMPONENT-TYPE',
  'SENDER-RECEIVER-INTERFACE',
  'CLIENT-SERVER-INTERFACE',
  'APPLICATION-PRIMITIVE-DATA-TYPE',
  'APPLICATION-DATA-TYPE',
  'IMPLEMENTATION-DATA-TYPE',
  'SW-BASE-TYPE',
  'COMPU-METHOD',
  'ECUC-MODULE-CONFIGURATION-VALUES', // R8/E1：ECUC 值层顶层元素
]);

function isKnownTopLevelTag(tag: string): boolean {
  return KNOWN_TOP_LEVEL_TAGS.has(tag);
}

// ============================================================================
// 元素节点规范化
// ============================================================================

/**
 * fast-xml-parser 输出形如 { 'TAG': [{...}, {...}] } 或 { 'TAG': {...} }；
 * 展开为节点列表（同一 tag 多元素时全部返回）。
 */
function normalizeElementNodes(value: unknown): Array<Record<string, unknown>> {
  const nodes: Array<Record<string, unknown>> = [];
  const items = Array.isArray(value) ? value : [value];
  for (const item of items) {
    if (item && typeof item === 'object') {
      nodes.push(item as Record<string, unknown>);
    }
  }
  return nodes;
}

/**
 * 收集一个包（含递归下钻嵌套 AR-PACKAGE）内的所有顶层元素节点。
 * 嵌套包（含导出侧 serializeModule 每模块一包的形态）递归展开，
 * 其余元素按 { tag, node } 收集（同一 tag 多元素展开为多条）。
 */
function collectPackageElements(
  pkg: Record<string, unknown>,
  out: Array<{ tag: string; node: Record<string, unknown> }>
): void {
  const elements = getChild(pkg, 'ELEMENTS');
  for (const elem of ensureArray<Record<string, unknown>>(elements as unknown)) {
    for (const [tag, value] of Object.entries(elem)) {
      if (tag.startsWith('@_') || tag === '#text') continue;
      for (const node of normalizeElementNodes(value)) {
        if (tag === 'AR-PACKAGE') {
          // 嵌套包 → 递归下钻（真实 AUTOSAR 包可任意嵌套，避免误报 Unprocessed）
          collectPackageElements(node, out);
        } else {
          out.push({ tag, node });
        }
      }
    }
  }
}

// ============================================================================
// 引用解析辅助
// ============================================================================

/** 从引用路径取短名（最后一个 / 之后的部分） */
export function refShortName(ref: string): string {
  const idx = ref.lastIndexOf('/');
  return idx >= 0 ? ref.substring(idx + 1) : ref;
}

/**
 * 引用解析（C1 类型约束版）。
 * 按 REF_CONSTRAINTS 约束表逐条校验收集到的引用：
 *  - 目标存在且类别匹配 → 写回短名（onResolved）；
 *  - 目标存在但类别不符 → 硬错误（类型不符即报错，替代"告警后猜"）；
 *  - 目标不存在 → 容忍（保留原引用，OEM ARXML 可引用包外元素）。
 */
export function resolveReferences(ctx: ReadContext, project: SwcArxmlProject): void {
  // 目标注册表：元素名 → 类别集合（引用解析的唯一事实来源）。
  // 用 Set 而非单值：同名元素可能同时存在为接口与数据类型（跨包合法场景），
  // 任一类匹配即通过；都不匹配才报类型不符。
  const targets = new Map<string, Set<RefTargetKind>>();
  const register = (name: string, kind: RefTargetKind): void => {
    let kinds = targets.get(name);
    if (!kinds) {
      kinds = new Set();
      targets.set(name, kinds);
    }
    kinds.add(kind);
  };
  for (const iface of project.interfaces) register(iface.name, 'INTERFACE');
  for (const dt of project.applicationDataTypes) register(dt.name, 'DATA_TYPE');
  for (const dt of project.implementationDataTypes) register(dt.name, 'DATA_TYPE');
  for (const name of project.baseTypes.keys()) register(name, 'BASE_TYPE');
  for (const cm of project.compuMethods) register(cm.name, 'COMPU_METHOD');

  for (const pending of ctx.pendingRefs) {
    if (!pending.ref) continue;
    const shortName = refShortName(pending.ref);
    const actualKinds = targets.get(shortName);
    if (actualKinds === undefined) continue; // 缺失引用：容忍（UI 可提示缺失）
    if (!actualKinds.has(pending.expected)) {
      // 类型不符：报错而非猜测
      ctx.report.errors.push(
        `Invalid reference: ${pending.ref} (${pending.context}): expected ` +
          `${REF_TARGET_KIND_LABELS[pending.expected]}, but '${shortName}' is ` +
          `${[...actualKinds].map(k => REF_TARGET_KIND_LABELS[k]).join(', ')}`
      );
      continue;
    }
    pending.onResolved?.(shortName);
  }
}

// ============================================================================
// 版本探测（借鉴 cogu reader.py:589-600）
// ============================================================================

const SCHEMA_VERSION_RE = /AUTOSAR_(\d+)\.xsd/;

function detectSchemaVersion(schemaLocation: string | undefined): number | null {
  if (!schemaLocation) return null;
  const match = SCHEMA_VERSION_RE.exec(schemaLocation);
  return match ? parseInt(match[1], 10) : null;
}

// ============================================================================
// 各元素读取器（switcher 模式，借鉴 cogu _read_xxx 方法族）
// 每个读取器独立消费 ChildElementMap，未消费子元素统一告警。
// ============================================================================

// ── SW-BASE-TYPE ────────────────────────────────────────────

function readBaseType(ctx: ReadContext, node: Record<string, unknown>, project: SwcArxmlProject): void {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) {
    reportUnprocessed(ctx, node, 'SHORT-NAME');
    return;
  }
  children.skip('SHORT-NAME');
  const nativeDecl = getTextContent(node, 'NATIVE-DECLARATION');
  children.skip('NATIVE-DECLARATION');
  if (nativeDecl) project.baseTypes.set(name, nativeDecl);
  reportUnprocessedChildren(ctx, children);
}

// ── APPLICATION-PRIMITIVE-DATA-TYPE / APPLICATION-DATA-TYPE ──

function readApplicationDataType(ctx: ReadContext, node: Record<string, unknown>, project: SwcArxmlProject): void {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) return;
  children.skip('SHORT-NAME');

  const category = (getTextContent(node, 'CATEGORY') || 'VALUE').toUpperCase();
  children.skip('CATEGORY');

  const dt: ApplicationDataType = {
    name,
    category: category as ApplicationDataType['category'],
  };

  // SW-DATA-DEF-PROPS → ... → BASE-TYPE-REF / COMPU-METHOD-REF
  const swProps = firstChild(node, 'SW-DATA-DEF-PROPS');
  children.skip('SW-DATA-DEF-PROPS');
  if (swProps) {
    const variants = firstChild(swProps, 'SW-DATA-DEF-PROPS-VARIANTS');
    const conditional = ensureArray<Record<string, unknown>>(variants?.['SW-DATA-DEF-PROPS-CONDITIONAL'])[0];
    if (conditional) {
      const baseTypeRef = getTextContent(conditional, 'BASE-TYPE-REF');
      if (baseTypeRef) {
        dt.baseType = refShortName(baseTypeRef);
        ctx.pendingRefs.push({
          ref: baseTypeRef,
          expected: REF_CONSTRAINTS.baseTypeRef,
          context: `data type ${name}`,
        });
      }
      const compuRef = getTextContent(conditional, 'COMPU-METHOD-REF');
      if (compuRef) {
        dt.compuMethodRef = refShortName(compuRef);
        ctx.pendingRefs.push({
          ref: compuRef,
          expected: REF_CONSTRAINTS.compuMethodRef,
          context: `data type ${name}`,
        });
      }
    }
  }

  // 描述
  const desc = getDescText(node);
  if (desc) dt.description = desc;
  children.skip('DESC');

  project.applicationDataTypes.push(dt);
  ctx.report.counts.applicationDataTypes++;
  ctx.typeMap.set(dt.name, dt);
  reportUnprocessedChildren(ctx, children);
}

// ── IMPLEMENTATION-DATA-TYPE ────────────────────────────────

function readImplementationDataType(ctx: ReadContext, node: Record<string, unknown>, project: SwcArxmlProject): void {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) return;
  children.skip('SHORT-NAME');

  const category = (getTextContent(node, 'CATEGORY') || 'TYPE_REFERENCE').toUpperCase();
  children.skip('CATEGORY');

  const dt: ImplementationDataType = {
    name,
    category,
    cType: '',
  };

  const swProps = firstChild(node, 'SW-DATA-DEF-PROPS');
  children.skip('SW-DATA-DEF-PROPS');
  if (swProps) {
    const variants = firstChild(swProps, 'SW-DATA-DEF-PROPS-VARIANTS');
    const conditional = ensureArray<Record<string, unknown>>(variants?.['SW-DATA-DEF-PROPS-CONDITIONAL'])[0];
    if (conditional) {
      const baseTypeRef = getTextContent(conditional, 'BASE-TYPE-REF');
      if (baseTypeRef) {
        const shortName = refShortName(baseTypeRef);
        dt.cType = project.baseTypes.get(shortName) || shortName;
        ctx.pendingRefs.push({
          ref: baseTypeRef,
          expected: REF_CONSTRAINTS.baseTypeRef,
          context: `implementation data type ${name}`,
        });
      }
      const compuRef = getTextContent(conditional, 'COMPU-METHOD-REF');
      if (compuRef) {
        dt.compuMethodRef = refShortName(compuRef);
        ctx.pendingRefs.push({
          ref: compuRef,
          expected: REF_CONSTRAINTS.compuMethodRef,
          context: `implementation data type ${name}`,
        });
      }
    }
  }

  project.implementationDataTypes.push(dt);
  ctx.report.counts.implementationDataTypes++;
  ctx.typeMap.set(dt.name, dt);
  reportUnprocessedChildren(ctx, children);
}

// ── COMPU-METHOD ────────────────────────────────────────────

function readCompuMethod(ctx: ReadContext, node: Record<string, unknown>, project: SwcArxmlProject): void {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) return;
  children.skip('SHORT-NAME');

  const category = (getTextContent(node, 'CATEGORY') || 'IDENTICAL') as CompuMethod['category'];
  children.skip('CATEGORY');

  const compuMethod: CompuMethod = {
    name,
    category,
    scales: [],
  };

  // COMPU-INTERNAL-TO-PHYS（含 COMPU-SCALES / COMPU-DEFAULT-VALUE）
  const intToPhys = firstChild(node, 'COMPU-INTERNAL-TO-PHYS');
  children.skip('COMPU-INTERNAL-TO-PHYS');
  if (intToPhys) {
    readComputation(ctx, intToPhys, compuMethod);
  }

  // COMPU-PHYS-TO-INTERNAL（仅标记存在，不导入 scales）
  if (getChild(node, 'COMPU-PHYS-TO-INTERNAL')) {
    compuMethod.hasPhysToInternal = true;
    children.skip('COMPU-PHYS-TO-INTERNAL');
  }

  const desc = getDescText(node);
  if (desc) compuMethod.description = desc;
  children.skip('DESC');

  project.compuMethods.push(compuMethod);
  ctx.report.counts.compuMethods++;
  reportUnprocessedChildren(ctx, children);
}

/** 解析 COMPU-INTERNAL-TO-PHYS / COMPU-PHYS-TO-INTERNAL 公共结构 */
function readComputation(ctx: ReadContext, node: Record<string, unknown>, compuMethod: CompuMethod): void {
  const children = new ChildElementMap(node);

  const scalesWrapper = firstChild(node, 'COMPU-SCALES');
  children.skip('COMPU-SCALES');
  if (scalesWrapper) {
    for (const scaleNode of ensureArray<Record<string, unknown>>(scalesWrapper['COMPU-SCALE'])) {
      const scale = readCompuScale(ctx, scaleNode);
      if (scale) compuMethod.scales.push(scale);
    }
  }

  const defaultWrapper = firstChild(node, 'COMPU-DEFAULT-VALUE');
  children.skip('COMPU-DEFAULT-VALUE');
  if (defaultWrapper) {
    // COMPU-DEFAULT-VALUE 内可为 <VT> 或 <V>
    const vt = getTextContent(defaultWrapper, 'VT') ?? getTextContent(defaultWrapper, 'V') ?? getNodeText(defaultWrapper);
    if (vt !== undefined) compuMethod.defaultValue = vt;
  }

  reportUnprocessedChildren(ctx, children);
}

/** 解析单个 COMPU-SCALE */
function readCompuScale(ctx: ReadContext, node: Record<string, unknown>): CompuMethod['scales'][number] | null {
  const children = new ChildElementMap(node);

  const scale: CompuMethod['scales'][number] = {};

  const shortLabel = getTextContent(node, 'SHORT-LABEL');
  if (shortLabel) scale.shortLabel = shortLabel;
  children.skip('SHORT-LABEL');

  const lowerLimit = getTextContent(node, 'LOWER-LIMIT');
  if (lowerLimit !== undefined) scale.lowerLimit = parseFloat(lowerLimit);
  children.skip('LOWER-LIMIT');

  const upperLimit = getTextContent(node, 'UPPER-LIMIT');
  if (upperLimit !== undefined) scale.upperLimit = parseFloat(upperLimit);
  children.skip('UPPER-LIMIT');

  // COMPU-CONST → VT
  const compuConst = firstChild(node, 'COMPU-CONST');
  children.skip('COMPU-CONST');
  if (compuConst) {
    const vt = getTextContent(compuConst, 'VT') ?? getNodeText(compuConst);
    if (vt !== undefined) scale.content = vt;
  }

  // COMPU-RATIONAL-COEFFS → numerator / denominator
  const rational = firstChild(node, 'COMPU-RATIONAL-COEFFS');
  children.skip('COMPU-RATIONAL-COEFFS');
  if (rational) {
    const numWrapper = firstChild(rational, 'COMPU-NUMERATOR');
    if (numWrapper) {
      scale.numerator = ensureArray<Record<string, unknown>>(numWrapper['V'])
        .map(v => parseFloat(getNodeText(v) ?? '0'));
    }
    const denWrapper = firstChild(rational, 'COMPU-DENOMINATOR');
    if (denWrapper) {
      scale.denominator = ensureArray<Record<string, unknown>>(denWrapper['V'])
        .map(v => parseFloat(getNodeText(v) ?? '1'));
    }
  }

  // DESC（可选）
  const desc = getDescText(node);
  if (desc) scale.description = desc;
  children.skip('DESC');

  reportUnprocessedChildren(ctx, children);
  return scale;
}

// ── SENDER-RECEIVER-INTERFACE ───────────────────────────────

function readSenderReceiverInterface(ctx: ReadContext, node: Record<string, unknown>, project: SwcArxmlProject): void {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) return;
  children.skip('SHORT-NAME');

  const iface: SenderReceiverInterface = {
    name,
    kind: 'SenderReceiverInterface',
    dataElements: [],
  };

  const isService = getTextContent(node, 'IS-SERVICE');
  if (isService !== undefined) iface.isService = isService.toLowerCase() === 'true';
  children.skip('IS-SERVICE');

  const desc = getDescText(node);
  if (desc) iface.description = desc;
  children.skip('DESC');

  // DATA-ELEMENTS → DATA-ELEMENT-PROTOTYPE[]
  const deWrapper = firstChild(node, 'DATA-ELEMENTS');
  children.skip('DATA-ELEMENTS');
  if (deWrapper) {
    const seen = new Set<string>();
    for (const deNode of ensureArray<Record<string, unknown>>(deWrapper['DATA-ELEMENT-PROTOTYPE'])) {
      const de = readDataElementPrototype(ctx, deNode);
      if (de) {
        if (seen.has(de.name)) {
          reportDuplicate(ctx, `interface ${name} data elements`, de.name);
          continue;
        }
        seen.add(de.name);
        iface.dataElements.push(de);
        ctx.report.counts.dataElements++;
      }
    }
  }

  project.interfaces.push(iface);
  ctx.report.counts.interfaces++;
  ctx.interfaceMap.set(iface.name, iface);
  reportUnprocessedChildren(ctx, children);
}

/** 解析 DATA-ELEMENT-PROTOTYPE */
function readDataElementPrototype(ctx: ReadContext, node: Record<string, unknown>): SenderReceiverInterface['dataElements'][number] | null {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) {
    reportUnprocessedChildren(ctx, children);
    return null;
  }
  children.skip('SHORT-NAME');

  const typeRef = getTextContent(node, 'TYPE-TREF');
  children.skip('TYPE-TREF');

  const de: SenderReceiverInterface['dataElements'][number] = {
    name,
    typeRef: typeRef ? refShortName(typeRef) : '',
  };
  if (typeRef) {
    ctx.pendingRefs.push({
      ref: typeRef,
      expected: REF_CONSTRAINTS.typeRef,
      context: `data element ${name}`,
    });
  }

  const desc = getDescText(node);
  if (desc) de.description = desc;
  children.skip('DESC');

  reportUnprocessedChildren(ctx, children);
  return de;
}

// ── CLIENT-SERVER-INTERFACE ─────────────────────────────────

function readClientServerInterface(ctx: ReadContext, node: Record<string, unknown>, project: SwcArxmlProject): void {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) return;
  children.skip('SHORT-NAME');

  const iface: ClientServerInterface = {
    name,
    kind: 'ClientServerInterface',
    operations: [],
  };

  const isService = getTextContent(node, 'IS-SERVICE');
  if (isService !== undefined) iface.isService = isService.toLowerCase() === 'true';
  children.skip('IS-SERVICE');

  const desc = getDescText(node);
  if (desc) iface.description = desc;
  children.skip('DESC');

  const opsWrapper = firstChild(node, 'OPERATIONS');
  children.skip('OPERATIONS');
  if (opsWrapper) {
    const seen = new Set<string>();
    for (const opNode of ensureArray<Record<string, unknown>>(opsWrapper['CLIENT-SERVER-OPERATION'])) {
      const op = readCsOperation(ctx, opNode);
      if (op) {
        if (seen.has(op.name)) {
          reportDuplicate(ctx, `interface ${name} operations`, op.name);
          continue;
        }
        seen.add(op.name);
        iface.operations.push(op);
        ctx.report.counts.operations++;
      }
    }
  }

  project.interfaces.push(iface);
  ctx.report.counts.interfaces++;
  ctx.interfaceMap.set(iface.name, iface);
  reportUnprocessedChildren(ctx, children);
}

/** 解析 CLIENT-SERVER-OPERATION（含参数） */
function readCsOperation(ctx: ReadContext, node: Record<string, unknown>): ClientServerInterface['operations'][number] | null {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) {
    reportUnprocessedChildren(ctx, children);
    return null;
  }
  children.skip('SHORT-NAME');

  const op: ClientServerInterface['operations'][number] = {
    name,
  };

  const desc = getDescText(node);
  if (desc) op.description = desc;
  children.skip('DESC');

  // ARGUMENTS → ARGUMENT-DATA-PROTOTYPE[]
  const argsWrapper = firstChild(node, 'ARGUMENTS');
  children.skip('ARGUMENTS');
  if (argsWrapper) {
    const seen = new Set<string>();
    for (const argNode of ensureArray<Record<string, unknown>>(argsWrapper['ARGUMENT-DATA-PROTOTYPE'])) {
      const arg = readCsArgument(ctx, argNode);
      if (arg) {
        if (seen.has(arg.name)) {
          reportDuplicate(ctx, `operation ${name} arguments`, arg.name);
          continue;
        }
        seen.add(arg.name);
        if (!op.arguments) op.arguments = [];
        op.arguments.push(arg);
      }
    }
  }

  reportUnprocessedChildren(ctx, children);
  return op;
}

/** 解析 ARGUMENT-DATA-PROTOTYPE */
function readCsArgument(
  ctx: ReadContext,
  node: Record<string, unknown>
): { name: string; typeRef: string; direction: 'IN' | 'OUT' | 'INOUT' } | null {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) {
    reportUnprocessedChildren(ctx, children);
    return null;
  }
  children.skip('SHORT-NAME');

  const typeRef = getTextContent(node, 'TYPE-TREF');
  children.skip('TYPE-TREF');

  const directionRaw = (getTextContent(node, 'DIRECTION') || 'IN') as string;
  children.skip('DIRECTION');

  const arg = {
    name,
    typeRef: typeRef ? refShortName(typeRef) : '',
    direction: (directionRaw === 'OUT' ? 'OUT' : directionRaw === 'INOUT' ? 'INOUT' : 'IN') as 'IN' | 'OUT' | 'INOUT',
  };
  if (typeRef) {
    ctx.pendingRefs.push({
      ref: typeRef,
      expected: REF_CONSTRAINTS.typeRef,
      context: `argument ${name}`,
    });
  }

  reportUnprocessedChildren(ctx, children);
  return arg;
}

// ── APPLICATION-SW-COMPONENT-TYPE ───────────────────────────

function readApplicationSwc(ctx: ReadContext, node: Record<string, unknown>, project: SwcArxmlProject): void {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) return;
  children.skip('SHORT-NAME');

  const swc: ApplicationSwComponentType = {
    name,
    layer: 'ASW',
    ports: [],
    internalBehavior: {
      name: `${name}_InternalBehavior`,
      runnables: [],
      irvs: [],
    },
    dataTypeMappings: [],
    interfaces: [],
  };

  const desc = getDescText(node);
  if (desc) swc.description = desc;
  children.skip('DESC');

  // PORTS → P-PORT-PROTOTYPE[] / R-PORT-PROTOTYPE[]
  const portsWrapper = firstChild(node, 'PORTS');
  children.skip('PORTS');
  if (portsWrapper) {
    const seen = new Set<string>();
    for (const pNode of ensureArray<Record<string, unknown>>(portsWrapper['P-PORT-PROTOTYPE'])) {
      const port = readPortPrototype(ctx, pNode, 'OUT');
      if (port) {
        if (seen.has(port.name)) {
          reportDuplicate(ctx, `SWC ${name} ports`, port.name);
          continue;
        }
        seen.add(port.name);
        swc.ports.push(port);
        ctx.report.counts.ports++;
      }
    }
    for (const rNode of ensureArray<Record<string, unknown>>(portsWrapper['R-PORT-PROTOTYPE'])) {
      const port = readPortPrototype(ctx, rNode, 'IN');
      if (port) {
        if (seen.has(port.name)) {
          reportDuplicate(ctx, `SWC ${name} ports`, port.name);
          continue;
        }
        seen.add(port.name);
        swc.ports.push(port);
        ctx.report.counts.ports++;
      }
    }
  }

  // INTERNAL-BEHAVIORS → SWC-INTERNAL-BEHAVIOR → RUNNABLES
  const behaviorsWrapper = firstChild(node, 'INTERNAL-BEHAVIORS');
  children.skip('INTERNAL-BEHAVIORS');
  if (behaviorsWrapper) {
    const behaviorNode = ensureArray<Record<string, unknown>>(behaviorsWrapper['SWC-INTERNAL-BEHAVIOR'])[0];
    if (behaviorNode) {
      const behavior = readSwcInternalBehavior(ctx, behaviorNode);
      if (behavior) {
        swc.internalBehavior = behavior;
        ctx.report.counts.runnables += behavior.runnables.length;
      }
    }
  }

  project.applicationComponents.push(swc);
  ctx.report.counts.swComponents++;
  reportUnprocessedChildren(ctx, children);
}

/** 解析 PORT-PROTOTYPE（P/R 共用） */
function readPortPrototype(ctx: ReadContext, node: Record<string, unknown>, direction: 'IN' | 'OUT'): PortPrototype | null {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) {
    reportUnprocessedChildren(ctx, children);
    return null;
  }
  children.skip('SHORT-NAME');

  const providedRef = getTextContent(node, 'PROVIDED-INTERFACE-TREF');
  children.skip('PROVIDED-INTERFACE-TREF');
  const requiredRef = getTextContent(node, 'REQUIRED-INTERFACE-TREF');
  children.skip('REQUIRED-INTERFACE-TREF');

  const ref = providedRef || requiredRef || '';
  const port: PortPrototype = {
    name,
    direction,
    interfaceRef: ref,
  };
  if (ref) {
    ctx.pendingRefs.push({
      ref,
      expected: REF_CONSTRAINTS.interfaceRef,
      context: `port ${name}`,
      onResolved: shortName => {
        port.interfaceRef = shortName;
      },
    });
  }

  const desc = getDescText(node);
  if (desc) port.description = desc;
  children.skip('DESC');

  reportUnprocessedChildren(ctx, children);
  return port;
}

/** 解析 SWC-INTERNAL-BEHAVIOR（Runnable 实体） */
function readSwcInternalBehavior(ctx: ReadContext, node: Record<string, unknown>): SwcInternalBehavior | null {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  children.skip('SHORT-NAME');

  const behavior: SwcInternalBehavior = {
    name: name || 'InternalBehavior',
    runnables: [],
    irvs: [],
  };

  // RUNNABLES → RUNNABLE-ENTITY[]
  const runnablesWrapper = firstChild(node, 'RUNNABLES');
  children.skip('RUNNABLES');
  if (runnablesWrapper) {
    const seen = new Set<string>();
    for (const rNode of ensureArray<Record<string, unknown>>(runnablesWrapper['RUNNABLE-ENTITY'])) {
      const runnable = readRunnableEntity(ctx, rNode);
      if (runnable) {
        if (seen.has(runnable.name)) {
          reportDuplicate(ctx, `behavior ${name} runnables`, runnable.name);
          continue;
        }
        seen.add(runnable.name);
        behavior.runnables.push(runnable);
      }
    }
  }

  reportUnprocessedChildren(ctx, children);
  return behavior;
}

/** 解析 RUNNABLE-ENTITY */
function readRunnableEntity(ctx: ReadContext, node: Record<string, unknown>): RunnableEntity | null {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) {
    reportUnprocessedChildren(ctx, children);
    return null;
  }
  children.skip('SHORT-NAME');

  const runnable: RunnableEntity = {
    name,
    invocationType: 'event',
  };

  const symbol = getTextContent(node, 'SYMBOL');
  if (symbol) runnable.symbol = symbol;
  children.skip('SYMBOL');

  const canConcurrent = getTextContent(node, 'CAN-BE-INVOKED-CONCURRENTLY');
  if (canConcurrent !== undefined) runnable.canBeInvokedConcurrently = canConcurrent.toLowerCase() === 'true';
  children.skip('CAN-BE-INVOKED-CONCURRENTLY');

  const interval = getTextContent(node, 'MINIMUM-START-INTERVAL');
  if (interval !== undefined) {
    runnable.minimumStartInterval = parseFloat(interval);
    runnable.invocationType = 'cyclic';
  }
  children.skip('MINIMUM-START-INTERVAL');

  const desc = getDescText(node);
  if (desc) runnable.description = desc;
  children.skip('DESC');

  reportUnprocessedChildren(ctx, children);
  return runnable;
}

// ── COMPOSITION-SW-COMPONENT-TYPE ───────────────────────────

function readCompositionSwc(ctx: ReadContext, node: Record<string, unknown>, project: SwcArxmlProject): void {
  // 组合组件：本版本仅导入组件名与端口（连接器留待后续）
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) return;
  children.skip('SHORT-NAME');

  const swc: CompositionSwComponentType = {
    name,
    layer: 'ASW',
    components: [],
    ports: [],
    assemblyConnectors: [],
    delegationConnectors: [],
    interfaces: [],
  };

  const portsWrapper = firstChild(node, 'PORTS');
  children.skip('PORTS');
  if (portsWrapper) {
    for (const pNode of ensureArray<Record<string, unknown>>(portsWrapper['P-PORT-PROTOTYPE'])) {
      const port = readPortPrototype(ctx, pNode, 'OUT');
      if (port) swc.ports.push(port);
    }
    for (const rNode of ensureArray<Record<string, unknown>>(portsWrapper['R-PORT-PROTOTYPE'])) {
      const port = readPortPrototype(ctx, rNode, 'IN');
      if (port) swc.ports.push(port);
    }
  }

  project.compositionComponents.push(swc);
  ctx.report.counts.swComponents++;
  reportUnprocessedChildren(ctx, children);
}

// ============================================================================
// ECUC 值层（R8/E1）—— ECUC-MODULE-CONFIGURATION-VALUES
// 解析：模块（SHORT-NAME / DEFINITION-REF / PARAMETER-VALUES / CONTAINERS）
//      → 参数（ECUC-NUMERICAL/TEXTUAL/BOOLEAN-PARAM-VALUE）
//      → 容器（ECUC-CONTAINER-VALUE 递归 SUB-CONTAINERS）
// 与 arxml-export/serializer.ts 的 serializeModule / serializeContainer / serializeParam
// 对称，构成导入导出闭环（parse(serialize(x)) 可还原 x）。
// 边界：定义层（ECUC-MODULE-DEF 元模型）不解析，DEFINITION-REF 保留字符串；
// 不校验参数值是否匹配定义层（无元模型前提，见文件头说明）。
// ============================================================================

/** PARAMETER-VALUES 内可识别并导入的参数值元素 tag（switcher 表） */
const ECUC_PARAM_VALUE_TAGS = [
  'ECUC-NUMERICAL-PARAM-VALUE',
  'ECUC-TEXTUAL-PARAM-VALUE',
  'ECUC-BOOLEAN-PARAM-VALUE',
] as const;

const ECUC_PARAM_VALUE_TAG_SET = new Set<string>(ECUC_PARAM_VALUE_TAGS);

/**
 * 按参数元素 tag 归一值类型（与导出侧 ArxmlExportParameter.value 对称）：
 *  - ECUC-BOOLEAN-PARAM-VALUE → boolean
 *  - ECUC-NUMERICAL-PARAM-VALUE → number（数值化失败保留原文，诚实保真）
 *  - ECUC-TEXTUAL-PARAM-VALUE → string（原文）
 */
function parseEcucParamValue(tag: string, raw: string | undefined): string | number | boolean {
  if (raw === undefined) return '';
  switch (tag) {
    case 'ECUC-BOOLEAN-PARAM-VALUE':
      return raw.toLowerCase() === 'true';
    case 'ECUC-NUMERICAL-PARAM-VALUE': {
      const num = Number(raw);
      return Number.isNaN(num) ? raw : num;
    }
    default:
      return raw;
  }
}

/** 解析单个参数值元素（DEFINITION-REF + VALUE） */
function readEcucParameterValue(
  ctx: ReadContext,
  node: Record<string, unknown>,
  tag: string
): EcucParameterValue | null {
  const children = new ChildElementMap(node);
  const definitionRef = getTextContent(node, 'DEFINITION-REF');
  if (!definitionRef) {
    // 无 DEFINITION-REF 的参数无法命名（定义层未解析），走未处理告警不崩溃
    reportUnprocessedChildren(ctx, children);
    return null;
  }
  children.skip('DEFINITION-REF');
  const raw = getTextContent(node, 'VALUE');
  children.skip('VALUE');
  reportUnprocessedChildren(ctx, children);
  return {
    name: refShortName(definitionRef),
    definitionRef,
    value: parseEcucParamValue(tag, raw),
  };
}

/**
 * 解析 PARAMETER-VALUES 包装节点内的全部参数。
 * 按文档顺序遍历（fast-xml-parser 对象键序 = 首次出现序），
 * 保证与导出侧输入顺序一致（round-trip 顺序可还原）。
 */
function readEcucParameterValues(ctx: ReadContext, wrapper: Record<string, unknown>): EcucParameterValue[] {
  const parameters: EcucParameterValue[] = [];
  for (const [tag, value] of Object.entries(wrapper)) {
    if (tag.startsWith('@_') || tag === '#text') continue;
    if (!ECUC_PARAM_VALUE_TAG_SET.has(tag)) continue;
    for (const node of ensureArray<Record<string, unknown>>(value)) {
      const param = readEcucParameterValue(ctx, node, tag);
      if (param) parameters.push(param);
    }
  }
  return parameters;
}

/**
 * 解析单个 ECUC-CONTAINER-VALUE（递归：PARAMETER-VALUES + SUB-CONTAINERS）。
 * 与导出侧 ArxmlExportContainer（name/parameters/containers）对称。
 */
function readEcucContainer(ctx: ReadContext, node: Record<string, unknown>): EcucContainerValue | null {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) {
    reportUnprocessedChildren(ctx, children);
    return null;
  }
  children.skip('SHORT-NAME');

  const definitionRef = getTextContent(node, 'DEFINITION-REF') ?? '';
  children.skip('DEFINITION-REF');

  const container: EcucContainerValue = {
    name,
    definitionRef,
    parameters: [],
    containers: [],
  };

  const paramsWrapper = firstChild(node, 'PARAMETER-VALUES');
  children.skip('PARAMETER-VALUES');
  if (paramsWrapper) container.parameters = readEcucParameterValues(ctx, paramsWrapper);

  const subWrapper = firstChild(node, 'SUB-CONTAINERS');
  children.skip('SUB-CONTAINERS');
  if (subWrapper) {
    container.containers = ensureArray<Record<string, unknown>>(subWrapper['ECUC-CONTAINER-VALUE'])
      .map(sub => readEcucContainer(ctx, sub))
      .filter((c): c is EcucContainerValue => c !== null);
  }

  reportUnprocessedChildren(ctx, children);
  return container;
}

/** 解析 CONTAINERS / SUB-CONTAINERS 包装节点内的全部容器 */
function readEcucContainers(ctx: ReadContext, wrapper: Record<string, unknown>): EcucContainerValue[] {
  return ensureArray<Record<string, unknown>>(wrapper['ECUC-CONTAINER-VALUE'])
    .map(node => readEcucContainer(ctx, node))
    .filter((c): c is EcucContainerValue => c !== null);
}

/**
 * 读取 ECUC-MODULE-CONFIGURATION-VALUES（模块级值层导入）。
 * 与导出侧 ArxmlExportModule（name/parameters/containers）对称；
 * 另捕获 definitionRef（DEFINITION-REF 原文）与 moduleDefRef（短名）。
 */
function readEcucModule(ctx: ReadContext, node: Record<string, unknown>, project: SwcArxmlProject): void {
  const children = new ChildElementMap(node);
  const name = getTextContent(node, 'SHORT-NAME');
  if (!name) {
    reportUnprocessed(ctx, node, 'SHORT-NAME');
    reportUnprocessedChildren(ctx, children);
    return;
  }
  children.skip('SHORT-NAME');

  const definitionRef = getTextContent(node, 'DEFINITION-REF') ?? '';
  children.skip('DEFINITION-REF');

  // IMPLEMENTATION-CONFIG-VARIANT：标准元素但本批值层模型不捕获（边界见文件头），
  // 已知元素显式 skip 避免噪音告警（同 COMPU-PHYS-TO-INTERNAL 处理惯例）
  children.skip('IMPLEMENTATION-CONFIG-VARIANT');

  const module: EcucModuleConfigValue = {
    name,
    definitionRef,
    moduleDefRef: definitionRef ? refShortName(definitionRef) : '',
    parameters: [],
    containers: [],
  };

  const paramsWrapper = firstChild(node, 'PARAMETER-VALUES');
  children.skip('PARAMETER-VALUES');
  if (paramsWrapper) module.parameters = readEcucParameterValues(ctx, paramsWrapper);

  const containersWrapper = firstChild(node, 'CONTAINERS');
  children.skip('CONTAINERS');
  if (containersWrapper) module.containers = readEcucContainers(ctx, containersWrapper);

  // 重复模块名检测（R6 惯例：reportDuplicate + 跳过，不覆盖）
  if (project.ecucModules.some(m => m.name === name)) {
    reportDuplicate(ctx, 'ECUC modules', name);
  } else {
    project.ecucModules.push(module);
    ctx.report.counts.ecucModules++;
  }

  reportUnprocessedChildren(ctx, children);
}

/**
 * ARXML 引用类型约束表（R1 · 引用类型安全）
 *
 * 对齐 cogu/autosar src/autosar/xml/reference.py：47 个 Ref 类各自通过
 * accepted_sub_types() 声明引用目标允许的 DEST 白名单（如 SwBaseTypeRef 只接受
 * SW_BASE_TYPE），从类型层面防止"引错类型"。
 *
 * yuleASR 落地为**解析期约束表**：每个引用点（interfaceRef/typeRef/baseTypeRef/
 * compuMethodRef）声明期望的目标类别；解析时目标名存在但类别不符即报错
 * （替代"告警后猜"），目标不存在则容忍（OEM ARXML 可能引用包外元素，
 * 与 arxml-import 的告警不崩溃策略一致）。
 */

/** 引用目标类别（对齐 cogu IdentifiableSubTypes 本导入器涉及的子集） */
export type RefTargetKind =
  /** 端口接口（SENDER-RECEIVER-INTERFACE / CLIENT-SERVER-INTERFACE） */
  | 'INTERFACE'
  /** 数据类型（APPLICATION-PRIMITIVE-DATA-TYPE / APPLICATION-DATA-TYPE / IMPLEMENTATION-DATA-TYPE） */
  | 'DATA_TYPE'
  /** 基础类型（SW-BASE-TYPE） */
  | 'BASE_TYPE'
  /** 计算方法（COMPU-METHOD） */
  | 'COMPU_METHOD';

/**
 * 引用约束表：引用点 → 期望目标类别（唯一事实来源）。
 * 新增引用点 = 在此加一行，解析层自动获得类型校验。
 * 语义对齐 cogu accepted_sub_types() 白名单。
 */
export const REF_CONSTRAINTS = {
  /** 端口 interfaceRef 必须指向接口类元素 */
  interfaceRef: 'INTERFACE',
  /** TYPE-TREF（数据元素/参数）必须指向数据类型 */
  typeRef: 'DATA_TYPE',
  /** BASE-TYPE-REF（SwDataDefProps）必须指向基础类型 */
  baseTypeRef: 'BASE_TYPE',
  /** COMPU-METHOD-REF 必须指向计算方法 */
  compuMethodRef: 'COMPU_METHOD',
} as const satisfies Record<string, RefTargetKind>;

/** 约束表键（引用点名称），供解析层/测试引用 */
export type RefConstraintKey = keyof typeof REF_CONSTRAINTS;

/** 人类可读类别标签（错误信息用） */
export const REF_TARGET_KIND_LABELS: Record<RefTargetKind, string> = {
  INTERFACE: 'an interface (SENDER-RECEIVER-INTERFACE / CLIENT-SERVER-INTERFACE)',
  DATA_TYPE: 'a data type (APPLICATION-*-DATA-TYPE / IMPLEMENTATION-DATA-TYPE)',
  BASE_TYPE: 'a base type (SW-BASE-TYPE)',
  COMPU_METHOD: 'a CompuMethod (COMPU-METHOD)',
};

/**
 * ARXML SWC 层导入服务（Web 薄重导出层）
 *
 * core 是 ARXML 解析的唯一领域出口（Fix 18 惯例），
 * 本文件仅做薄重导出，避免大改 Editor/测试的 import 面。
 *
 * 导入范围：SWC/端口/接口/数据类型/CompuMethod 层（APPLICATION-SW-COMPONENT-TYPE 等）。
 * BSW 模块配置（ECUC 层）请使用 ./arxml-parser（ECUC-MODULE-CONFIGURATION-VALUES）。
 */

export {
  importSwcArxml,
  parseSwcArxml,
  ChildElementMap,
  LineIndex,
  refShortName,
  type SwcImportResult,
  type SwcArxmlProject,
  type ImportReport,
  type UnprocessedElementWarning,
} from '@yuletech/core/arxml-import';

export type {
  ApplicationDataType,
  ApplicationSwComponentType,
  ClientServerInterface,
  CompuMethod,
  CompuMethodCategory,
  CompuScale,
  ImplementationDataType,
  PortInterfaceBase,
  PortPrototype,
  RunnableEntity,
  SenderReceiverInterface,
  SwcInternalBehavior,
  SwcProjectConfig,
} from '@yuletech/core/types';

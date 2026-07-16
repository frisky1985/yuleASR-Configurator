/**
 * @yuletech/core - AUTOSAR OS Types
 * AUTOSAR OS 核心数据模型定义
 * 
 * 遵循 AUTOSAR 4.4 OS Specification
 * Covers: Task, ISR, Counter, Alarm, ScheduleTable, Event, Resource, OS Application
 */

/**
 * OS 任务类型
 * - BCC: Basic Conformance Class (basic tasks only)
 * - ECC: Extended Conformance Class (basic + extended tasks)
 */
export type OsTaskType = 'BCC' | 'ECC';

/**
 * OS 任务调度策略
 * - NON: Non-preemptive
 * - FULL: Fully preemptive
 * - MIXED: Mixed preemptive (for ECC tasks)
 */
export type OsTaskSchedule = 'NON' | 'FULL' | 'MIXED';

/**
 * OS 任务定义
 */
export interface OsTask {
  /** 任务名称 (唯一标识) */
  name: string;
  /** 任务优先级 (0-255) */
  priority: number;
  /** 调度策略 */
  schedule: OsTaskSchedule;
  /** 栈大小 (bytes) */
  stackSize: number;
  /** 最大激活次数 (1-255, BCC1/2 固定为1) */
  activationLimit: number;
  /** 任务类型 */
  taskType: OsTaskType;
  /** 是否自动启动 */
  autostart: boolean;
  /** 应用模式掩码 */
  appModeMask?: number;
  /** 是否使用 FPU */
  usesFpu?: boolean;
  /** 是否可信任务 */
  trusted?: boolean;
}

/**
 * OS 中断分类
 * - CATEGORY_1: Category 1 ISR (does not use OS services)
 * - CATEGORY_2: Category 2 ISR (can use OS services)
 */
export type OsIsrCategory = 1 | 2;

/**
 * OS 中断服务函数定义
 */
export interface OsIsr {
  /** ISR 名称 */
  name: string;
  /** ISR 分类 (1 或 2) */
  category: OsIsrCategory;
  /** 中断优先级 */
  priority: number;
  /** 栈大小 */
  stackSize: number;
  /** 中断源编号 */
  interruptSource?: number;
  /** 是否允许嵌套 */
  enableNesting?: boolean;
  /** 是否使用 FPU */
  usesFpu?: boolean;
  /** 中断类型 */
  interruptType?: string;
  /** 特殊函数名 */
  specialFunctionName?: string;
}

/**
 * OS Counter 计数器定义
 */
export interface OsCounter {
  /** 计数器名称 */
  name: string;
  /** 每分钟最大 ticks (分辨率) */
  ticksPerBase: number;
  /** 最大计数值 */
  maxAllowedValue: number;
  /** 最小周期 (ticks) */
  minCycle: number;
  /** 是否为硬件计数器 */
  isHardware: boolean;
  /** 硬件引用 (如 GPT 通道) */
  hardwareReference?: string;
}

/**
 * OS Alarm 到期动作类型
 */
export type OsAlarmActionType = 'ActivateTask' | 'SetEvent' | 'Callback';

/**
 * OS Alarm 到期动作定义
 */
export interface OsAlarmAction {
  /** 动作类型 */
  type: OsAlarmActionType;
  /** 目标任务 (ActivateTask / SetEvent 时使用) */
  task?: string;
  /** 事件掩码 (SetEvent 时使用) */
  event?: number;
  /** 回调函数名 (Callback 时使用) */
  callback?: string;
}

/**
 * OS Alarm 告警定义
 */
export interface OsAlarm {
  /** 告警名称 */
  name: string;
  /** 关联计数器 */
  counter: string;
  /** 到期动作 */
  action: OsAlarmAction;
  /** 首次触发时间 (ticks) */
  startValue: number;
  /** 周期触发时间 (0 = 单次) */
  cycleValue: number;
  /** 是否自动启动 */
  autostart: boolean;
  /** 应用模式掩码 */
  appModeMask?: number;
}

/**
 * OS ScheduleTable 到期点定义
 */
export interface ExpiryPoint {
  /** 到期时间偏移 (ticks) */
  offset: number;
  /** 到期动作列表 */
  actions: OsAlarmAction[];
}

/**
 * OS 同步策略
 * - NONE: No synchronization
 * - SINGLE: Single-shot synchronization
 * - IMPLICIT: Implicit synchronization (FBL sync)
 */
export type SyncStrategy = 'NONE' | 'SINGLE' | 'IMPLICIT';

/**
 * OS ScheduleTable 调度表定义
 */
export interface OsScheduleTable {
  /** 调度表名称 */
  name: string;
  /** 调度表总时长 (ticks) */
  duration: number;
  /** 到期点列表 */
  expiryPoints: ExpiryPoint[];
  /** 同步策略 */
  syncStrategy: SyncStrategy;
  /** 是否自动启动 */
  autostart: boolean;
  /** 应用模式掩码 */
  appModeMask?: number;
}

/**
 * OS Event 事件定义
 */
export interface OsEvent {
  /** 事件名称 */
  name: string;
  /** 关联任务 (ECC 任务) */
  task: string;
  /** 事件掩码 (位掩码) */
  mask: number;
}

/**
 * OS Resource 资源定义
 */
export interface OsResource {
  /** 资源名称 */
  name: string;
  /** 资源优先级上限 */
  priority: number;
  /** 是否内部资源 */
  isInternal: boolean;
}

/**
 * OS Application 应用定义
 */
export interface OsApplication {
  /** 应用名称 */
  name: string;
  /** 应用关联的 hook 函数 */
  hooks?: string[];
  /** 是否为可信应用 */
  trusted: boolean;
  /** 包含的任务 */
  tasks?: string[];
  /** 包含的 ISR */
  isrs?: string[];
  /** 包含的调度表 */
  scheduleTables?: string[];
}

/**
 * OS 配置容器定义
 */
export interface OsConfig {
  /** OS 任务列表 */
  tasks: OsTask[];
  /** OS 中断列表 */
  isrs: OsIsr[];
  /** OS 计数器列表 */
  counters: OsCounter[];
  /** OS 告警列表 */
  alarms: OsAlarm[];
  /** OS 调度表列表 */
  scheduleTables: OsScheduleTable[];
  /** OS 事件列表 */
  events: OsEvent[];
  /** OS 资源列表 */
  resources: OsResource[];
  /** OS 应用列表 */
  applications: OsApplication[];
  /** OS 系统配置参数 */
  system?: {
    /** 最大任务数 */
    maxTasks: number;
    /** 最大 ISR 数 */
    maxIsrs: number;
    /** 最大告警数 */
    maxAlarms: number;
    /** 最大资源数 */
    maxResources: number;
    /** 是否启用栈监控 */
    stackMonitoring: boolean;
    /** 是否启用时间保护 */
    timeProtection: boolean;
    /** 是否启用内存保护 (MPU) */
    memoryProtection: boolean;
    /** 是否启用 OS 服务追踪 */
    serviceTrace: boolean;
  };
}

/**
 * OS 模块完整配置
 */
export interface OsModuleConfig {
  /** OS 系统配置 */
  os: OsConfig;
}

/**
 * OS 生成的文件名常量
 */
export const OS_HEADER_NAME = 'Os_Cfg.h';
export const OS_SOURCE_NAME = 'Os.c';
export const OS_TYPES_HEADER = 'Os_Types.h';

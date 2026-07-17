/**
 * @yuletech/core - AUTOSAR OS Code Generator
 *
 * AUTOSAR OS 配置代码生成器
 * 生成 Os_Cfg.h、Os.c、Os_Types.h 等 OS 配置文件
 * 遵循 AUTOSAR 4.4 OS Specification
 *
 * 支持生成:
 *   - Task 配置 (BCC1/BCC2/ECC1/ECC2)
 *   - ISR 配置 (Category 1/2)
 *   - Counter 配置
 *   - Alarm 配置
 *   - ScheduleTable 配置
 *   - Event 配置
 *   - Resource 配置
 *   - OS Application 配置
 *
 * @file    os-generator.ts
 */

import type { ModuleConfig, ModuleSchema } from '../types';

import { formatCValue, toHex, parseVersion, generateAutosarFileHeader } from './autosar-format';

import type { CodeGenerator, GeneratorOptions, GenerationResult, GeneratedFile } from './index';

/**
 * AUTOSAR OS 代码生成器
 * 生成 OS 配置 C 代码
 */
export class OsCodeGenerator implements CodeGenerator {
  name = 'OsCodeGenerator';
  version = '1.0.0';
  supportedModules: string[] = ['Os', 'OS'];

  supports(moduleName: string): boolean {
    return this.supportedModules.includes(moduleName);
  }

  async generate(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): Promise<GenerationResult> {
    const files: GeneratedFile[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Extract OS configuration data
      const tasks = this.extractTaskConfigs(config);
      const isrs = this.extractIsrConfigs(config);
      const counters = this.extractCounterConfigs(config);
      const alarms = this.extractAlarmConfigs(config);
      const scheduleTables = this.extractScheduleTableConfigs(config);
      const events = this.extractEventConfigs(config);
      const resources = this.extractResourceConfigs(config);
      const applications = this.extractApplicationConfigs(config);
      const cores = this.extractPhysicalCoreConfigs(config);

      // Generate Os_Types.h
      const typesHeader = this.generateOsTypesHeader(
        config,
        tasks,
        isrs,
        events,
        resources,
        options
      );
      files.push({
        path: `${options.outputDir}/Os_Types.h`,
        content: typesHeader,
        language: 'h',
      });

      // Generate Os_Cfg.h
      const cfgHeader = this.generateOsCfgHeader(
        config,
        tasks,
        isrs,
        counters,
        alarms,
        scheduleTables,
        events,
        resources,
        applications,
        cores,
        options
      );
      files.push({
        path: `${options.outputDir}/Os_Cfg.h`,
        content: cfgHeader,
        language: 'h',
      });

      // Generate Os.c
      const sourceFile = this.generateOsSource(
        config,
        tasks,
        isrs,
        counters,
        alarms,
        scheduleTables,
        events,
        resources,
        applications,
        cores,
        options
      );
      files.push({
        path: `${options.outputDir}/Os.c`,
        content: sourceFile,
        language: 'c',
      });

      return {
        success: errors.length === 0,
        files,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        files,
        errors: [error instanceof Error ? error.message : 'OS code generation failed'],
      };
    }
  }

  // ======================== Config Extractors ========================

  private extractTaskConfigs(config: ModuleConfig): Record<string, Record<string, unknown>> {
    const tasks: Record<string, Record<string, unknown>> = {};
    const rawTasks = config.parameters['OsTask'] as Array<Record<string, unknown>>;
    if (rawTasks && Array.isArray(rawTasks)) {
      for (const t of rawTasks) {
        const name = String(t['OsTaskName'] || '');
        if (name) tasks[name] = t;
      }
    }
    // Also check containers
    const containerTasks = config.containers?.['OsTask'];
    if (containerTasks) {
      for (const ct of containerTasks) {
        const name = String(ct.parameters['OsTaskName'] || '');
        if (name) tasks[name] = ct.parameters;
      }
    }
    return tasks;
  }

  private extractIsrConfigs(config: ModuleConfig): Record<string, Record<string, unknown>> {
    const isrs: Record<string, Record<string, unknown>> = {};
    const rawIsrs = config.parameters['OsIsr'] as Array<Record<string, unknown>>;
    if (rawIsrs && Array.isArray(rawIsrs)) {
      for (const i of rawIsrs) {
        const name = String(i['OsIsrName'] || '');
        if (name) isrs[name] = i;
      }
    }
    const containerIsrs = config.containers?.['OsIsr'];
    if (containerIsrs) {
      for (const ci of containerIsrs) {
        const name = String(ci.parameters['OsIsrName'] || '');
        if (name) isrs[name] = ci.parameters;
      }
    }
    return isrs;
  }

  private extractCounterConfigs(config: ModuleConfig): Record<string, Record<string, unknown>> {
    const counters: Record<string, Record<string, unknown>> = {};
    const raw = config.parameters['OsCounter'] as Array<Record<string, unknown>>;
    if (raw && Array.isArray(raw)) {
      for (const c of raw) {
        const name = String(c['OsCounterName'] || '');
        if (name) counters[name] = c;
      }
    }
    const container = config.containers?.['OsCounter'];
    if (container) {
      for (const c of container) {
        const name = String(c.parameters['OsCounterName'] || '');
        if (name) counters[name] = c.parameters;
      }
    }
    return counters;
  }

  private extractAlarmConfigs(config: ModuleConfig): Record<string, Record<string, unknown>> {
    const alarms: Record<string, Record<string, unknown>> = {};
    const raw = config.parameters['OsAlarm'] as Array<Record<string, unknown>>;
    if (raw && Array.isArray(raw)) {
      for (const a of raw) {
        const name = String(a['OsAlarmName'] || '');
        if (name) alarms[name] = a;
      }
    }
    const container = config.containers?.['OsAlarm'];
    if (container) {
      for (const a of container) {
        const name = String(a.parameters['OsAlarmName'] || '');
        if (name) alarms[name] = a.parameters;
      }
    }
    return alarms;
  }

  private extractScheduleTableConfigs(
    config: ModuleConfig
  ): Record<string, Record<string, unknown>> {
    const sts: Record<string, Record<string, unknown>> = {};
    const raw = config.parameters['OsScheduleTable'] as Array<Record<string, unknown>>;
    if (raw && Array.isArray(raw)) {
      for (const s of raw) {
        const name = String(s['OsScheduleTableName'] || '');
        if (name) sts[name] = s;
      }
    }
    const container = config.containers?.['OsScheduleTable'];
    if (container) {
      for (const s of container) {
        const name = String(s.parameters['OsScheduleTableName'] || '');
        if (name) sts[name] = s.parameters;
      }
    }
    return sts;
  }

  private extractEventConfigs(config: ModuleConfig): Record<string, Record<string, unknown>> {
    const events: Record<string, Record<string, unknown>> = {};
    const raw = config.parameters['OsEvent'] as Array<Record<string, unknown>>;
    if (raw && Array.isArray(raw)) {
      for (const e of raw) {
        const name = String(e['OsEventName'] || '');
        if (name) events[name] = e;
      }
    }
    const container = config.containers?.['OsEvent'];
    if (container) {
      for (const e of container) {
        const name = String(e.parameters['OsEventName'] || '');
        if (name) events[name] = e.parameters;
      }
    }
    return events;
  }

  private extractResourceConfigs(config: ModuleConfig): Record<string, Record<string, unknown>> {
    const resources: Record<string, Record<string, unknown>> = {};
    const raw = config.parameters['OsResource'] as Array<Record<string, unknown>>;
    if (raw && Array.isArray(raw)) {
      for (const r of raw) {
        const name = String(r['OsResourceName'] || '');
        if (name) resources[name] = r;
      }
    }
    const container = config.containers?.['OsResource'];
    if (container) {
      for (const r of container) {
        const name = String(r.parameters['OsResourceName'] || '');
        if (name) resources[name] = r.parameters;
      }
    }
    return resources;
  }

  private extractApplicationConfigs(config: ModuleConfig): Record<string, Record<string, unknown>> {
    const apps: Record<string, Record<string, unknown>> = {};
    const raw = config.parameters['OsApplication'] as Array<Record<string, unknown>>;
    if (raw && Array.isArray(raw)) {
      for (const a of raw) {
        const name = String(a['OsApplicationName'] || '');
        if (name) apps[name] = a;
      }
    }
    const container = config.containers?.['OsApplication'];
    if (container) {
      for (const a of container) {
        const name = String(a.parameters['OsApplicationName'] || '');
        if (name) apps[name] = a.parameters;
      }
    }
    return apps;
  }

  private extractPhysicalCoreConfigs(
    config: ModuleConfig
  ): Record<string, Record<string, unknown>> {
    const cores: Record<string, Record<string, unknown>> = {};
    const raw = config.parameters['OsPhysicalCore'] as Array<Record<string, unknown>>;
    if (raw && Array.isArray(raw)) {
      for (const c of raw) {
        const id = String(c['OsPhysicalCoreId'] ?? '');
        if (id !== '') cores[id] = c;
      }
    }
    const container = config.containers?.['OsPhysicalCore'];
    if (container) {
      for (const c of container) {
        const id = String(c.parameters['OsPhysicalCoreId'] ?? '');
        if (id !== '') cores[id] = c.parameters;
      }
    }
    return cores;
  }

  // ======================== Os_Types.h ========================

  /**
   * 生成 Os_Types.h — OS 类型定义头文件
   */
  private generateOsTypesHeader(
    config: ModuleConfig,
    tasks: Record<string, Record<string, unknown>>,
    isrs: Record<string, Record<string, unknown>>,
    events: Record<string, Record<string, unknown>>,
    resources: Record<string, Record<string, unknown>>,
    options: GeneratorOptions
  ): string {
    const version = parseVersion(config.version);
    const taskCount = Object.keys(tasks).length;
    const isrCount = Object.keys(isrs).length;
    const eventCount = Object.keys(events).length;
    const resourceCount = Object.keys(resources).length;

    let content = generateAutosarFileHeader(
      'Os_Types.h',
      'Os',
      1, // Os module ID
      0x1234,
      'AUTOSAR Operating System (OS) Type Definitions'
    );

    content += `\
/*==================[preprocessor guards]====================================*/
#ifndef OS_TYPES_H
#define OS_TYPES_H

/*==================[includes]==============================================*/
#include "Std_Types.h"
#include "Os_Cfg.h"

/*==================[OS type definitions]====================================*/

/**
 * @brief OS Application Mode Type
 */
typedef uint8 OsAppModeType;

/**
 * @brief OS Task State
 */
typedef enum {
    TASK_SUSPENDED    = 0x00,  /**< Task is suspended */
    TASK_READY        = 0x01,  /**< Task is ready to run */
    TASK_RUNNING      = 0x02,  /**< Task is currently running */
    TASK_WAITING      = 0x04   /**< Task is waiting for an event (ECC only) */
} OsTaskStateType;

/**
 * @brief OS Task Type
 */
typedef enum {
    BASIC_TASK        = 0x00,  /**< Basic task (BCC1/2) */
    EXTENDED_TASK     = 0x01   /**< Extended task (ECC1/2, supports events) */
} OsTaskTypeType;

/**
 * @brief OS Task Schedule Policy
 */
typedef enum {
    NON_PREEMPTIVE    = 0x00,  /**< Non-preemptive scheduling */
    FULL_PREEMPTIVE   = 0x01,  /**< Fully preemptive scheduling */
    MIXED_PREEMPTIVE  = 0x02   /**< Mixed preemptive scheduling */
} OsTaskScheduleType;

/**
 * @brief OS ISR Category
 */
typedef enum {
    ISR_CATEGORY_1    = 1,     /**< Category 1 ISR (no OS API calls) */
    ISR_CATEGORY_2    = 2      /**< Category 2 ISR (can call OS APIs) */
} OsIsrCategoryType;

/**
 * @brief OS Status Type
 */
typedef enum {
    OS_STATUS_OK              = 0,  /**< Service call succeeded */
    OS_STATUS_NO_ACCESS       = 1,  /**< Caller has no access */
    OS_STATUS_NO_RESOURCE     = 2,  /**< Resource not available */
    OS_STATUS_IDLE            = 3,  /**< System is idle */
    OS_STATUS_ACTIVE          = 4,  /**< At least one task is active */
    OS_STATUS_EXTENDED        = 5,  /**< Extended status available */
    OS_STATUS_TERMINATED      = 6,  /**< Task has been terminated */
    OS_STATUS_CANCELED        = 7   /**< Alarm/timer canceled */
} OsStatusType;

/**
 * @brief OS Task Configuration Type
 */
typedef struct {
    uint8                   taskId;
    OsTaskTypeType          taskType;
    OsTaskScheduleType      schedule;
    uint8                   priority;
    uint32                  stackSize;
    uint8                   activationLimit;
    boolean                 autostart;
    boolean                 usesFpu;
    boolean                 isTrusted;
    OsAppModeType           appModeMask;
} OsTaskConfigType;

/**
 * @brief OS ISR Configuration Type
 */
typedef struct {
    uint8                   isrId;
    OsIsrCategoryType       category;
    uint8                   priority;
    uint32                  stackSize;
    uint32                  interruptSource;
    boolean                 enableNesting;
    boolean                 usesFpu;
} OsIsrConfigType;

/**
 * @brief OS Counter Configuration Type
 */
typedef struct {
    uint8                   counterId;
    uint32                  ticksPerBase;
    uint32                  maxAllowedValue;
    uint32                  minCycle;
    boolean                 isHardware;
} OsCounterConfigType;

/**
 * @brief OS Alarm Action Type
 */
typedef enum {
    ALARM_ACTION_ACTIVATE_TASK  = 0,  /**< Activate a task when alarm expires */
    ALARM_ACTION_SET_EVENT      = 1,  /**< Set an event when alarm expires */
    ALARM_ACTION_CALLBACK       = 2   /**< Call a callback function */
} OsAlarmActionType;

/**
 * @brief OS Alarm Configuration Type
 */
typedef struct {
    uint8                   alarmId;
    uint8                   counterRef;
    OsAlarmActionType       actionType;
    uint8                   taskRef;
    uint32                  eventMask;
    uint32                  startValue;
    uint32                  cycleValue;
    boolean                 autostart;
    OsAppModeType           appModeMask;
} OsAlarmConfigType;

/**
 * @brief OS Expiry Point Action Type
 */
typedef struct {
    uint32                  offset;
    OsAlarmActionType       actionType;
    uint8                   taskRef;
    uint32                  eventMask;
} OsExpiryPointType;

/**
 * @brief OS Schedule Table Sync Strategy
 */
typedef enum {
    SYNC_STRATEGY_NONE      = 0,  /**< No synchronization */
    SYNC_STRATEGY_SINGLE    = 1,  /**< Single-shot synchronization */
    SYNC_STRATEGY_IMPLICIT  = 2   /**< Implicit synchronization */
} OsSyncStrategyType;

/**
 * @brief OS Schedule Table Configuration Type
 */
typedef struct {
    uint8                   scheduleTableId;
    uint32                  duration;
    OsSyncStrategyType      syncStrategy;
    boolean                 autostart;
    OsAppModeType           appModeMask;
    uint8                   expiryPointCount;
    const OsExpiryPointType *expiryPoints;
} OsScheduleTableConfigType;

/**
 * @brief OS Event Configuration Type
 */
typedef struct {
    uint8                   eventId;
    uint8                   taskRef;
    uint32                  mask;
} OsEventConfigType;

/**
 * @brief OS Resource Configuration Type
 */
typedef struct {
    uint8                   resourceId;
    uint8                   priority;
    boolean                 isInternal;
} OsResourceConfigType;

/**
 * @brief OS Application Configuration Type
 */
typedef struct {
    uint8                   appId;
    boolean                 isTrusted;
    uint8                   taskCount;
    const uint8             *taskRefs;
    uint8                   isrCount;
    const uint8             *isrRefs;
} OsApplicationConfigType;

/**
 * @brief OS System Configuration Type
 */
typedef struct {
    uint8                   maxTasks;
    uint8                   maxIsrs;
    uint8                   maxAlarms;
    uint8                   maxResources;
    boolean                 stackMonitoring;
    boolean                 timeProtection;
    boolean                 memoryProtection;
    boolean                 serviceTrace;
    uint32                  idleTaskStackSize;
} OsSystemConfigType;

/**
 * @brief OS Configuration Set Type
 */
typedef struct {
    /* System config */
    const OsSystemConfigType            *systemConfig;
    /* Task configs */
    uint8                               taskCount;
    const OsTaskConfigType              *tasks;
    /* ISR configs */
    uint8                               isrCount;
    const OsIsrConfigType               *isrs;
    /* Counter configs */
    uint8                               counterCount;
    const OsCounterConfigType           *counters;
    /* Alarm configs */
    uint8                               alarmCount;
    const OsAlarmConfigType             *alarms;
    /* Schedule Table configs */
    uint8                               scheduleTableCount;
    const OsScheduleTableConfigType     *scheduleTables;
    /* Event configs */
    uint8                               eventCount;
    const OsEventConfigType             *events;
    /* Resource configs */
    uint8                               resourceCount;
    const OsResourceConfigType          *resources;
    /* Application configs */
    uint8                               applicationCount;
    const OsApplicationConfigType       *applications;
} Os_ConfigSetType;

/*==================[extern declarations]====================================*/
extern const Os_ConfigSetType Os_ConfigSet;

#endif /* OS_TYPES_H */

/*==================[end of file]===========================================*/
`;

    return content;
  }

  // ======================== Os_Cfg.h ========================

  /**
   * 生成 Os_Cfg.h — OS 配置宏定义头文件
   */
  private generateOsCfgHeader(
    config: ModuleConfig,
    tasks: Record<string, Record<string, unknown>>,
    isrs: Record<string, Record<string, unknown>>,
    counters: Record<string, Record<string, unknown>>,
    alarms: Record<string, Record<string, unknown>>,
    scheduleTables: Record<string, Record<string, unknown>>,
    events: Record<string, Record<string, unknown>>,
    resources: Record<string, Record<string, unknown>>,
    _applications: Record<string, Record<string, unknown>>,
    _cores: Record<string, Record<string, unknown>>,
    options: GeneratorOptions
  ): string {
    const moduleId = 1; // Os module ID
    const version = parseVersion(config.version);
    const taskCount = Object.keys(tasks).length;
    const isrCount = Object.keys(isrs).length;
    const counterCount = Object.keys(counters).length;
    const alarmCount = Object.keys(alarms).length;
    const stCount = Object.keys(scheduleTables).length;
    const eventCount = Object.keys(events).length;
    const resourceCount = Object.keys(resources).length;

    const gen = config.parameters;
    const maxTasks = gen['OsMaxTasks'] ?? 16;
    const maxIsrs = gen['OsMaxIsrs'] ?? 32;
    const maxAlarms = gen['OsMaxAlarms'] ?? 8;
    const maxResources = gen['OsMaxResources'] ?? 8;
    const stackMon = gen['OsStackMonitoring'] ?? false;
    const timeProt = gen['OsTimeProtection'] ?? false;
    const memProt = gen['OsMemoryProtection'] ?? false;
    const svcTrace = gen['OsServiceTrace'] ?? false;
    const scheduleCounter = gen['OsScheduleCounter'] ?? 'SystemTimer';
    const idleTaskName = gen['OsIdleTaskName'] ?? 'IdleTask';
    const idleStackSize = gen['OsIdleTaskStackSize'] ?? 512;

    let content = generateAutosarFileHeader(
      'Os_Cfg.h',
      'Os',
      moduleId,
      0x1234,
      'AUTOSAR Operating System (OS) Configuration Header'
    );

    content += `\
/*==================[preprocessor guards]====================================*/
#ifndef OS_CFG_H
#define OS_CFG_H

/*==================[includes]==============================================*/
#include "Std_Types.h"

/*==================[module identification]=================================*/
#define OS_MODULE_ID                    ((uint16)${moduleId}U)
#define OS_VENDOR_ID                    ((uint16)0x${toHex(0x1234)})

/*==================[version info]==========================================*/
#define OS_AR_MAJOR_VERSION             ((uint8)4U)
#define OS_AR_MINOR_VERSION             ((uint8)4U)
#define OS_AR_REVISION_VERSION          ((uint8)0U)
#define OS_SW_MAJOR_VERSION             ((uint8)${version.major}U)
#define OS_SW_MINOR_VERSION             ((uint8)${version.minor}U)
#define OS_SW_PATCH_VERSION             ((uint8)${version.patch}U)

/*==================[OS system configuration macros]========================*/

/**
 * @brief Maximum number of tasks in the system
 */
#define OS_MAX_TASKS                    ((uint8)${maxTasks}U)

/**
 * @brief Maximum number of ISRs in the system
 */
#define OS_MAX_ISRS                     ((uint8)${maxIsrs}U)

/**
 * @brief Maximum number of alarms in the system
 */
#define OS_MAX_ALARMS                   ((uint8)${maxAlarms}U)

/**
 * @brief Maximum number of resources in the system
 */
#define OS_MAX_RESOURCES                ((uint8)${maxResources}U)

/**
 * @brief Configured stack monitoring support
 */
#define OS_STACK_MONITORING             ${stackMon ? 'STD_ON' : 'STD_OFF'}

/**
 * @brief Configured time protection support
 */
#define OS_TIME_PROTECTION              ${timeProt ? 'STD_ON' : 'STD_OFF'}

/**
 * @brief Configured memory protection support
 */
#define OS_MEMORY_PROTECTION            ${memProt ? 'STD_ON' : 'STD_OFF'}

/**
 * @brief Configured OS service trace support
 */
#define OS_SERVICE_TRACE                ${svcTrace ? 'STD_ON' : 'STD_OFF'}

/**
 * @brief Default counter for schedule tables
 */
#define OS_SCHEDULE_COUNTER             ${formatCValue(scheduleCounter, 'string')}

/**
 * @brief Idle task name
 */
#define OS_IDLE_TASK_NAME               ${formatCValue(idleTaskName, 'string')}

/**
 * @brief Idle task stack size
 */
#define OS_IDLE_TASK_STACK_SIZE         ((uint32)${idleStackSize}U)

`;

    // Generate task ID macros
    if (taskCount > 0) {
      content += `/*==================[task configuration]======================================*/\n`;
      content += `/**\n * @brief Number of configured OS tasks\n */\n`;
      content += `#define OS_TASK_COUNT                   ((uint8)${taskCount}U)\n\n`;

      let idx = 0;
      for (const [name, task] of Object.entries(tasks)) {
        const priority = task['OsTaskPriority'] ?? 1;
        const schedule = task['OsTaskSchedule'] ?? 'FULL';
        const stackSize = task['OsTaskStackSize'] ?? 1024;
        const activationLimit = task['OsTaskActivationLimit'] ?? 1;
        const taskType = task['OsTaskType'] ?? 'BCC';
        const autostart = task['OsTaskAutostart'] ?? false;
        const usesFpu = task['OsTaskUsesFpu'] ?? false;
        const trusted = task['OsTaskTrusted'] ?? false;

        content += `/**\n`;
        content += ` * @brief Task ID for ${name}\n`;
        content += ` * @details Priority: ${priority}, Schedule: ${schedule}, Stack: ${stackSize}\n`;
        content += ` */\n`;
        content += `#define OS_TASK_ID_${name.toUpperCase()}      ((uint8)${idx}U)\n\n`;

        content += `/**\n * @brief ${name} task configuration macros\n */\n`;
        content += `#define ${name.toUpperCase()}_PRIORITY            ((uint8)${priority}U)\n`;
        content += `#define ${name.toUpperCase()}_SCHEDULE            ${schedule === 'FULL' ? 'FULL_PREEMPTIVE' : schedule === 'NON' ? 'NON_PREEMPTIVE' : 'MIXED_PREEMPTIVE'}\n`;
        content += `#define ${name.toUpperCase()}_STACK_SIZE           ((uint32)${stackSize}U)\n`;
        content += `#define ${name.toUpperCase()}_ACTIVATION_LIMIT     ((uint8)${activationLimit}U)\n`;
        content += `#define ${name.toUpperCase()}_TASK_TYPE            ${taskType === 'BCC' ? 'BASIC_TASK' : 'EXTENDED_TASK'}\n`;
        content += `#define ${name.toUpperCase()}_AUTOSTART            ${autostart ? 'TRUE' : 'FALSE'}\n`;
        content += `#define ${name.toUpperCase()}_USES_FPU             ${usesFpu ? 'TRUE' : 'FALSE'}\n`;
        content += `#define ${name.toUpperCase()}_IS_TRUSTED           ${trusted ? 'TRUE' : 'FALSE'}\n\n`;

        idx++;
      }
    }

    // Generate ISR ID macros
    if (isrCount > 0) {
      content += `/*==================[ISR configuration]======================================*/\n`;
      content += `/**\n * @brief Number of configured ISRs\n */\n`;
      content += `#define OS_ISR_COUNT                    ((uint8)${isrCount}U)\n\n`;

      let idx = 0;
      for (const [name, isr] of Object.entries(isrs)) {
        const category = isr['OsIsrCategory'] ?? 2;
        const priority = isr['OsIsrInterruptPriority'] ?? 1;
        const stackSize = isr['OsIsrStackSize'] ?? 512;
        const intSource = isr['OsIsrInterruptSource'] ?? 0;
        const nesting = isr['OsIsrEnableNesting'] ?? false;
        const usesFpu = isr['OsIsrUsesFpu'] ?? false;

        content += `/**\n`;
        content += ` * @brief ISR ID for ${name}\n`;
        content += ` * @details Category: ${category}, Priority: ${priority}, Stack: ${stackSize}\n`;
        content += ` */\n`;
        content += `#define OS_ISR_ID_${name.toUpperCase()}         ((uint8)${idx}U)\n\n`;

        content += `#define ${name.toUpperCase()}_ISR_CATEGORY            ((uint8)${category}U)\n`;
        content += `#define ${name.toUpperCase()}_ISR_PRIORITY            ((uint8)${priority}U)\n`;
        content += `#define ${name.toUpperCase()}_ISR_STACK_SIZE          ((uint32)${stackSize}U)\n`;
        content += `#define ${name.toUpperCase()}_ISR_INTERRUPT_SOURCE    ((uint32)${intSource}U)\n`;
        content += `#define ${name.toUpperCase()}_ISR_NESTING             ${nesting ? 'TRUE' : 'FALSE'}\n`;
        content += `#define ${name.toUpperCase()}_ISR_USES_FPU            ${usesFpu ? 'TRUE' : 'FALSE'}\n\n`;

        idx++;
      }
    }

    // Generate Counter ID macros
    if (counterCount > 0) {
      content += `/*==================[counter configuration]==================================*/\n`;
      content += `#define OS_COUNTER_COUNT                ((uint8)${counterCount}U)\n\n`;

      let idx = 0;
      for (const [name, counter] of Object.entries(counters)) {
        const ticksPerBase = counter['OsCounterTicksPerBase'] ?? 1000;
        const maxAllowed = counter['OsCounterMaxAllowedValue'] ?? 65535;
        const minCycle = counter['OsCounterMinCycle'] ?? 1;

        content += `/**\n * @brief Counter ID for ${name}\n */\n`;
        content += `#define OS_COUNTER_ID_${name.toUpperCase()}      ((uint8)${idx}U)\n`;
        content += `#define ${name.toUpperCase()}_TICKS_PER_BASE       ((uint32)${ticksPerBase}U)\n`;
        content += `#define ${name.toUpperCase()}_MAX_ALLOWED_VALUE    ((uint32)${maxAllowed}U)\n`;
        content += `#define ${name.toUpperCase()}_MIN_CYCLE            ((uint32)${minCycle}U)\n\n`;

        idx++;
      }
    }

    // Generate Alarm ID macros
    if (alarmCount > 0) {
      content += `/*==================[alarm configuration]====================================*/\n`;
      content += `#define OS_ALARM_COUNT                  ((uint8)${alarmCount}U)\n\n`;

      let idx = 0;
      for (const [name, alarm] of Object.entries(alarms)) {
        const counterRef = String(alarm['OsAlarmCounterRef'] ?? '');
        const actionType = String(alarm['OsAlarmActionType'] ?? 'ActivateTask');
        const startValue = Number(alarm['OsAlarmStartValue'] ?? 0);
        const cycleValue = Number(alarm['OsAlarmCycleValue'] ?? 0);
        const autostart = Boolean(alarm['OsAlarmAutostart'] ?? false);

        content += `/**\n * @brief Alarm ID for ${name} (Counter: ${counterRef})\n */\n`;
        content += `#define OS_ALARM_ID_${name.toUpperCase()}         ((uint8)${idx}U)\n`;
        content += `#define ${name.toUpperCase()}_COUNTER_REF          OS_COUNTER_ID_${counterRef.toUpperCase()}\n`;
        content += `#define ${name.toUpperCase()}_ACTION_TYPE          ${actionType === 'ActivateTask' ? 'ALARM_ACTION_ACTIVATE_TASK' : actionType === 'SetEvent' ? 'ALARM_ACTION_SET_EVENT' : 'ALARM_ACTION_CALLBACK'}\n`;
        content += `#define ${name.toUpperCase()}_START_VALUE          ((uint32)${startValue}U)\n`;
        content += `#define ${name.toUpperCase()}_CYCLE_VALUE          ((uint32)${cycleValue}U)\n`;
        content += `#define ${name.toUpperCase()}_AUTOSTART            ${autostart ? 'TRUE' : 'FALSE'}\n\n`;

        idx++;
      }
    }

    // Generate Schedule Table ID macros
    if (stCount > 0) {
      content += `/*==================[schedule table configuration]===========================*/\n`;
      content += `#define OS_SCHEDULE_TABLE_COUNT          ((uint8)${stCount}U)\n\n`;

      let idx = 0;
      for (const [name, st] of Object.entries(scheduleTables)) {
        const duration = st['OsScheduleTableDuration'] ?? 1000;
        const sync = st['OsScheduleTableSyncStrategy'] ?? 'NONE';

        content += `/**\n * @brief Schedule Table ID for ${name} (Duration: ${duration} ticks)\n */\n`;
        content += `#define OS_SCHEDULETABLE_ID_${name.toUpperCase()}  ((uint8)${idx}U)\n`;
        content += `#define ${name.toUpperCase()}_DURATION             ((uint32)${duration}U)\n`;
        content += `#define ${name.toUpperCase()}_SYNC_STRATEGY        ${sync === 'NONE' ? 'SYNC_STRATEGY_NONE' : sync === 'SINGLE' ? 'SYNC_STRATEGY_SINGLE' : 'SYNC_STRATEGY_IMPLICIT'}\n\n`;

        idx++;
      }
    }

    // Generate Event ID macros
    if (eventCount > 0) {
      content += `/*==================[event configuration]====================================*/\n`;
      content += `#define OS_EVENT_COUNT                  ((uint8)${eventCount}U)\n\n`;

      let idx = 0;
      for (const [name, ev] of Object.entries(events)) {
        const taskRef = String(ev['OsEventTaskRef'] ?? '');
        const mask = Number(ev['OsEventMask'] ?? 1);

        content += `/**\n * @brief Event ID for ${name} (Task: ${taskRef})\n */\n`;
        content += `#define OS_EVENT_ID_${name.toUpperCase()}          ((uint8)${idx}U)\n`;
        content += `#define ${name.toUpperCase()}_TASK_REF             OS_TASK_ID_${taskRef.toUpperCase()}\n`;
        content += `#define ${name.toUpperCase()}_MASK                 ((uint32)${mask}U)\n\n`;

        idx++;
      }
    }

    // Generate Resource ID macros
    if (resourceCount > 0) {
      content += `/*==================[resource configuration]=================================*/\n`;
      content += `#define OS_RESOURCE_COUNT               ((uint8)${resourceCount}U)\n\n`;

      let idx = 0;
      for (const [name, res] of Object.entries(resources)) {
        const priority = res['OsResourcePriority'] ?? 1;

        content += `/**\n * @brief Resource ID for ${name}\n */\n`;
        content += `#define OS_RESOURCE_ID_${name.toUpperCase()}       ((uint8)${idx}U)\n`;
        content += `#define ${name.toUpperCase()}_RESOURCE_PRIORITY    ((uint8)${priority}U)\n\n`;

        idx++;
      }
    }

    // OS API function declarations
    content += `\
/*==================[OS API function declarations]==========================*/

/**
 * @brief Initialize the Operating System
 * @return Std_ReturnType: E_OK on success, E_NOT_OK on failure
 */
Std_ReturnType Os_Init(void);

/**
 * @brief Start the Operating System (scheduler)
 * @details This function never returns
 */
void Os_Start(void);

/**
 * @brief Shutdown the Operating System
 * @param status System shutdown status
 */
void Os_Shutdown(OsStatusType status);

/**
 * @brief Get the current OS status
 * @return Current OS status
 */
OsStatusType Os_GetStatus(void);

/**
 * @brief Get version information of the OS module
 * @param versioninfo Pointer to store version information
 */
void Os_GetVersionInfo(Std_VersionInfoType *versioninfo);

/**
 * @brief Main function for OS tick processing (called by timer ISR)
 */
void Os_MainFunction(void);

/**
 * @brief Idle loop hook (called when no task is ready to run)
 */
void Os_IdleLoop(void);

#endif /* OS_CFG_H */

/*==================[end of file]===========================================*/
`;

    return content;
  }

  // ======================== Os.c ========================

  /**
   * 生成 Os.c — OS 配置源文件
   */
  private generateOsSource(
    config: ModuleConfig,
    tasks: Record<string, Record<string, unknown>>,
    isrs: Record<string, Record<string, unknown>>,
    counters: Record<string, Record<string, unknown>>,
    alarms: Record<string, Record<string, unknown>>,
    scheduleTables: Record<string, Record<string, unknown>>,
    events: Record<string, Record<string, unknown>>,
    resources: Record<string, Record<string, unknown>>,
    applications: Record<string, Record<string, unknown>>,
    _cores: Record<string, Record<string, unknown>>,
    options: GeneratorOptions
  ): string {
    const moduleId = 1;
    const version = parseVersion(config.version);
    const taskCount = Object.keys(tasks).length;
    const isrCount = Object.keys(isrs).length;
    const counterCount = Object.keys(counters).length;
    const alarmCount = Object.keys(alarms).length;
    const stCount = Object.keys(scheduleTables).length;
    const eventCount = Object.keys(events).length;
    const resourceCount = Object.keys(resources).length;
    const appCount = Object.keys(applications).length;

    let content = generateAutosarFileHeader(
      'Os.c',
      'Os',
      moduleId,
      0x1234,
      'AUTOSAR Operating System (OS) Configuration Source'
    );

    content += `\
/*==================[includes]==============================================*/
#include "Os_Types.h"
#include "Os_Cfg.h"
#include "Std_Types.h"

/*==================[module identification]=================================*/
#define OS_MODULE_ID                    ((uint16)${moduleId}U)
#define OS_VENDOR_ID                    ((uint16)0x${toHex(0x1234)})

/*==================[version info]==========================================*/
#define OS_AR_MAJOR_VERSION             ((uint8)4U)
#define OS_AR_MINOR_VERSION             ((uint8)4U)
#define OS_AR_REVISION_VERSION          ((uint8)0U)
#define OS_SW_MAJOR_VERSION             ((uint8)${version.major}U)
#define OS_SW_MINOR_VERSION             ((uint8)${version.minor}U)
#define OS_SW_PATCH_VERSION             ((uint8)${version.patch}U)

`;

    // Generate task configuration array
    if (taskCount > 0) {
      content += `\
/*==================[task configuration data]================================*/
/**
 * @brief OS Task Configuration Table
 * @details Array of all configured OS tasks
 */
static const OsTaskConfigType OsTaskConfigTable[OS_TASK_COUNT] = {
`;

      for (const [name, task] of Object.entries(tasks)) {
        const priority = task['OsTaskPriority'] ?? 1;
        const schedule = task['OsTaskSchedule'] ?? 'FULL';
        const stackSize = task['OsTaskStackSize'] ?? 1024;
        const activationLimit = task['OsTaskActivationLimit'] ?? 1;
        const taskType = task['OsTaskType'] ?? 'BCC';
        const autostart = task['OsTaskAutostart'] ?? false;
        const usesFpu = task['OsTaskUsesFpu'] ?? false;
        const trusted = task['OsTaskTrusted'] ?? false;
        const appModeMask = task['OsTaskAppModeMask'] ?? 1;

        content += `\
    /** ${name} configuration */
    {
        .taskId            = OS_TASK_ID_${name.toUpperCase()},
        .taskType          = ${taskType === 'BCC' ? 'BASIC_TASK' : 'EXTENDED_TASK'},
        .schedule          = ${schedule === 'FULL' ? 'FULL_PREEMPTIVE' : schedule === 'NON' ? 'NON_PREEMPTIVE' : 'MIXED_PREEMPTIVE'},
        .priority          = ((uint8)${priority}U),
        .stackSize         = ((uint32)${stackSize}U),
        .activationLimit   = ((uint8)${activationLimit}U),
        .autostart         = ${autostart ? 'TRUE' : 'FALSE'},
        .usesFpu           = ${usesFpu ? 'TRUE' : 'FALSE'},
        .isTrusted         = ${trusted ? 'TRUE' : 'FALSE'},
        .appModeMask       = ((OsAppModeType)${appModeMask}U)
    },
`;
      }

      content += `\
};\n\n`;
    }

    // Generate ISR configuration array
    if (isrCount > 0) {
      content += `\
/*==================[ISR configuration data]=================================*/
/**
 * @brief OS ISR Configuration Table
 * @details Array of all configured ISRs
 */
static const OsIsrConfigType OsIsrConfigTable[OS_ISR_COUNT] = {
`;

      for (const [name, isr] of Object.entries(isrs)) {
        const category = isr['OsIsrCategory'] ?? 2;
        const priority = isr['OsIsrInterruptPriority'] ?? 1;
        const stackSize = isr['OsIsrStackSize'] ?? 512;
        const intSource = isr['OsIsrInterruptSource'] ?? 0;
        const nesting = isr['OsIsrEnableNesting'] ?? false;
        const usesFpu = isr['OsIsrUsesFpu'] ?? false;

        content += `\
    /** ${name} configuration */
    {
        .isrId            = OS_ISR_ID_${name.toUpperCase()},
        .category         = ((uint8)${category}U),
        .priority         = ((uint8)${priority}U),
        .stackSize        = ((uint32)${stackSize}U),
        .interruptSource  = ((uint32)${intSource}U),
        .enableNesting    = ${nesting ? 'TRUE' : 'FALSE'},
        .usesFpu          = ${usesFpu ? 'TRUE' : 'FALSE'}
    },
`;
      }

      content += `\
};\n\n`;
    }

    // Generate Counter configuration array
    if (counterCount > 0) {
      content += `\
/*==================[counter configuration data]=============================*/
/**
 * @brief OS Counter Configuration Table
 * @details Array of all configured counters
 */
static const OsCounterConfigType OsCounterConfigTable[OS_COUNTER_COUNT] = {
`;

      for (const [name, counter] of Object.entries(counters)) {
        const ticksPerBase = counter['OsCounterTicksPerBase'] ?? 1000;
        const maxAllowed = counter['OsCounterMaxAllowedValue'] ?? 65535;
        const minCycle = counter['OsCounterMinCycle'] ?? 1;
        const isHardware = counter['OsCounterIsHardware'] ?? false;

        content += `\
    /** ${name} configuration */
    {
        .counterId        = OS_COUNTER_ID_${name.toUpperCase()},
        .ticksPerBase     = ((uint32)${ticksPerBase}U),
        .maxAllowedValue  = ((uint32)${maxAllowed}U),
        .minCycle         = ((uint32)${minCycle}U),
        .isHardware       = ${isHardware ? 'TRUE' : 'FALSE'}
    },
`;
      }

      content += `\
};\n\n`;
    }

    // Generate Alarm configuration array
    if (alarmCount > 0) {
      content += `\
/*==================[alarm configuration data]===============================*/
/**
 * @brief OS Alarm Configuration Table
 * @details Array of all configured alarms
 */
static const OsAlarmConfigType OsAlarmConfigTable[OS_ALARM_COUNT] = {
`;

      for (const [name, alarm] of Object.entries(alarms)) {
        const actionType = String(alarm['OsAlarmActionType'] ?? 'ActivateTask');
        const counterRef = String(alarm['OsAlarmCounterRef'] ?? '');
        const startValue = Number(alarm['OsAlarmStartValue'] ?? 0);
        const cycleValue = Number(alarm['OsAlarmCycleValue'] ?? 0);
        const autostart = Boolean(alarm['OsAlarmAutostart'] ?? false);
        const appModeMask = Number(alarm['OsAlarmAppModeMask'] ?? 1);
        const taskRef = String(alarm['OsAlarmActionTaskRef'] ?? '');
        const eventMask = Number(alarm['OsAlarmActionEventMask'] ?? 0);
        /* callback ref for future use */
        void alarm['OsAlarmActionCallback'];

        content += `\
    /** ${name} configuration */
    {
        .alarmId          = OS_ALARM_ID_${name.toUpperCase()},
        .counterRef       = OS_COUNTER_ID_${counterRef.toUpperCase()},
        .actionType       = ${actionType === 'ActivateTask' ? 'ALARM_ACTION_ACTIVATE_TASK' : actionType === 'SetEvent' ? 'ALARM_ACTION_SET_EVENT' : 'ALARM_ACTION_CALLBACK'},
        .taskRef          = ${taskRef ? `OS_TASK_ID_${taskRef.toUpperCase()}` : '0xFF'},
        .eventMask        = ((uint32)${eventMask}U),
        .startValue       = ((uint32)${startValue}U),
        .cycleValue       = ((uint32)${cycleValue}U),
        .autostart        = ${autostart ? 'TRUE' : 'FALSE'},
        .appModeMask      = ((OsAppModeType)${appModeMask}U)
    },
`;
      }

      content += `\
};\n\n`;
    }

    // Generate Schedule Table config array
    if (stCount > 0) {
      content += `\
/*==================[schedule table configuration data]======================*/\n`;

      // Generate expiry point tables first
      for (const [name, st] of Object.entries(scheduleTables)) {
        const expiryPoints = st['OsScheduleTableExpiryPoints'] as Array<Record<string, unknown>>;
        const epCount = expiryPoints && Array.isArray(expiryPoints) ? expiryPoints.length : 0;

        if (epCount > 0) {
          content += `\
/**
 * @brief ${name} expiry point configuration table
 */
static const OsExpiryPointType ${name}ExpiryPoints[${epCount}] = {
`;
          for (const ep of expiryPoints) {
            const offset = Number(ep['ExpiryPointOffset'] ?? 0);
            const epActionType = String(ep['ExpiryPointActionType'] ?? 'ActivateTask');
            const epTaskRef = String(ep['ExpiryPointTaskRef'] ?? '');
            const epEventMask = Number(ep['ExpiryPointEventMask'] ?? 0);

            content += `\
    {
        .offset        = ((uint32)${offset}U),
        .actionType    = ${epActionType === 'ActivateTask' ? 'ALARM_ACTION_ACTIVATE_TASK' : epActionType === 'SetEvent' ? 'ALARM_ACTION_SET_EVENT' : 'ALARM_ACTION_CALLBACK'},
        .taskRef       = ${epTaskRef ? `OS_TASK_ID_${epTaskRef.toUpperCase()}` : '0xFF'},
        .eventMask     = ((uint32)${epEventMask}U)
    },
`;
          }

          content += `\
};\n\n`;
        }
      }

      content += `\
static const OsScheduleTableConfigType OsScheduleTableConfigTable[OS_SCHEDULE_TABLE_COUNT] = {
`;

      for (const [name, st] of Object.entries(scheduleTables)) {
        const duration = st['OsScheduleTableDuration'] ?? 1000;
        const sync = st['OsScheduleTableSyncStrategy'] ?? 'NONE';
        const autostart = st['OsScheduleTableAutostart'] ?? false;
        const appModeMask = st['OsScheduleTableAppModeMask'] ?? 1;
        const expiryPoints = st['OsScheduleTableExpiryPoints'] as Array<Record<string, unknown>>;
        const epCount = expiryPoints && Array.isArray(expiryPoints) ? expiryPoints.length : 0;

        content += `\
    /** ${name} configuration */
    {
        .scheduleTableId    = OS_SCHEDULETABLE_ID_${name.toUpperCase()},
        .duration           = ((uint32)${duration}U),
        .syncStrategy       = ${sync === 'NONE' ? 'SYNC_STRATEGY_NONE' : sync === 'SINGLE' ? 'SYNC_STRATEGY_SINGLE' : 'SYNC_STRATEGY_IMPLICIT'},
        .autostart          = ${autostart ? 'TRUE' : 'FALSE'},
        .appModeMask        = ((OsAppModeType)${appModeMask}U),
        .expiryPointCount   = ((uint8)${epCount}U),
        .expiryPoints       = ${epCount > 0 ? `${name}ExpiryPoints` : 'NULL_PTR'}
    },
`;
      }

      content += `\
};\n\n`;
    }

    // Generate Event config array
    if (eventCount > 0) {
      content += `\
/*==================[event configuration data]===============================*/
/**
 * @brief OS Event Configuration Table
 * @details Array of all configured events
 */
static const OsEventConfigType OsEventConfigTable[OS_EVENT_COUNT] = {
`;

      for (const [name, ev] of Object.entries(events)) {
        const taskRef = String(ev['OsEventTaskRef'] ?? '');
        const mask = Number(ev['OsEventMask'] ?? 1);

        content += `\
    /** ${name} configuration */
    {
        .eventId          = OS_EVENT_ID_${name.toUpperCase()},
        .taskRef          = OS_TASK_ID_${taskRef.toUpperCase()},
        .mask             = ((uint32)${mask}U)
    },
`;
      }

      content += `\
};\n\n`;
    }

    // Generate Resource config array
    if (resourceCount > 0) {
      content += `\
/*==================[resource configuration data]============================*/
/**
 * @brief OS Resource Configuration Table
 * @details Array of all configured resources
 */
static const OsResourceConfigType OsResourceConfigTable[OS_RESOURCE_COUNT] = {
`;

      for (const [name, res] of Object.entries(resources)) {
        const priority = res['OsResourcePriority'] ?? 1;
        const isInternal = res['OsResourceIsInternal'] ?? false;

        content += `\
    /** ${name} configuration */
    {
        .resourceId       = OS_RESOURCE_ID_${name.toUpperCase()},
        .priority         = ((uint8)${priority}U),
        .isInternal       = ${isInternal ? 'TRUE' : 'FALSE'}
    },
`;
      }

      content += `\
};\n\n`;
    }

    // Generate Application config array
    if (appCount > 0) {
      content += `\
/*==================[application configuration data]=========================*/\n`;

      // Generate per-application task/ISR ref arrays
      for (const [name, app] of Object.entries(applications)) {
        const appTasks = app['OsApplicationTasks'] as Array<string>;
        const appIsrs = app['OsApplicationIsrs'] as Array<string>;
        const taskRefList = appTasks && Array.isArray(appTasks) ? appTasks : [];
        const isrRefList = appIsrs && Array.isArray(appIsrs) ? appIsrs : [];

        if (taskRefList.length > 0) {
          content += `\
/** ${name} task reference list */
static const uint8 ${name}TaskRefs[${taskRefList.length}] = {
`;
          for (const t of taskRefList) {
            content += `    OS_TASK_ID_${t.toUpperCase()},\n`;
          }
          content += `};\n\n`;
        }

        if (isrRefList.length > 0) {
          content += `\
/** ${name} ISR reference list */
static const uint8 ${name}IsrRefs[${isrRefList.length}] = {
`;
          for (const i of isrRefList) {
            content += `    OS_ISR_ID_${i.toUpperCase()},\n`;
          }
          content += `};\n\n`;
        }
      }

      content += `\
static const OsApplicationConfigType OsApplicationConfigTable[${appCount}] = {
`;

      for (const [name, app] of Object.entries(applications)) {
        const trusted = app['OsApplicationTrusted'] ?? false;
        const appTasks = app['OsApplicationTasks'] as Array<string>;
        const appIsrs = app['OsApplicationIsrs'] as Array<string>;
        const taskRefList = appTasks && Array.isArray(appTasks) ? appTasks : [];
        const isrRefList = appIsrs && Array.isArray(appIsrs) ? appIsrs : [];

        content += `\
    /** ${name} configuration */
    {
        .appId            = 0,
        .isTrusted        = ${trusted ? 'TRUE' : 'FALSE'},
        .taskCount        = ((uint8)${taskRefList.length}U),
        .taskRefs         = ${taskRefList.length > 0 ? `${name}TaskRefs` : 'NULL_PTR'},
        .isrCount         = ((uint8)${isrRefList.length}U),
        .isrRefs          = ${isrRefList.length > 0 ? `${name}IsrRefs` : 'NULL_PTR'}
    },
`;
      }

      content += `\
};\n\n`;
    }

    // Generate system config
    const gen = config.parameters;
    const maxTasks = gen['OsMaxTasks'] ?? 16;
    const maxIsrs = gen['OsMaxIsrs'] ?? 32;
    const maxAlarms = gen['OsMaxAlarms'] ?? 8;
    const maxResources = gen['OsMaxResources'] ?? 8;
    const stackMon = gen['OsStackMonitoring'] ?? false;
    const timeProt = gen['OsTimeProtection'] ?? false;
    const memProt = gen['OsMemoryProtection'] ?? false;
    const svcTrace = gen['OsServiceTrace'] ?? false;
    const idleStackSize = gen['OsIdleTaskStackSize'] ?? 512;

    content += `\
/*==================[system configuration]===================================*/
/**
 * @brief OS System Configuration
 */
static const OsSystemConfigType OsSystemConfig = {
    .maxTasks             = ((uint8)${maxTasks}U),
    .maxIsrs              = ((uint8)${maxIsrs}U),
    .maxAlarms            = ((uint8)${maxAlarms}U),
    .maxResources         = ((uint8)${maxResources}U),
    .stackMonitoring      = ${stackMon ? 'TRUE' : 'FALSE'},
    .timeProtection       = ${timeProt ? 'TRUE' : 'FALSE'},
    .memoryProtection     = ${memProt ? 'TRUE' : 'FALSE'},
    .serviceTrace         = ${svcTrace ? 'TRUE' : 'FALSE'},
    .idleTaskStackSize    = ((uint32)${idleStackSize}U)
};

/*==================[config set definition]==================================*/
/**
 * @brief OS Configuration Set
 * @details Global configuration set containing all OS configuration data
 */
const Os_ConfigSetType Os_ConfigSet = {
    .systemConfig         = &OsSystemConfig,
    .taskCount            = ((uint8)${taskCount}U),
    .tasks                = ${taskCount > 0 ? 'OsTaskConfigTable' : 'NULL_PTR'},
    .isrCount             = ((uint8)${isrCount}U),
    .isrs                 = ${isrCount > 0 ? 'OsIsrConfigTable' : 'NULL_PTR'},
    .counterCount         = ((uint8)${counterCount}U),
    .counters             = ${counterCount > 0 ? 'OsCounterConfigTable' : 'NULL_PTR'},
    .alarmCount           = ((uint8)${alarmCount}U),
    .alarms               = ${alarmCount > 0 ? 'OsAlarmConfigTable' : 'NULL_PTR'},
    .scheduleTableCount   = ((uint8)${stCount}U),
    .scheduleTables       = ${stCount > 0 ? 'OsScheduleTableConfigTable' : 'NULL_PTR'},
    .eventCount           = ((uint8)${eventCount}U),
    .events               = ${eventCount > 0 ? 'OsEventConfigTable' : 'NULL_PTR'},
    .resourceCount        = ((uint8)${resourceCount}U),
    .resources            = ${resourceCount > 0 ? 'OsResourceConfigTable' : 'NULL_PTR'},
    .applicationCount     = ((uint8)${appCount}U),
    .applications         = ${appCount > 0 ? 'OsApplicationConfigTable' : 'NULL_PTR'}
};

/*==================[OS API implementation]==================================*/

/**
 * @brief Initialize the Operating System
 */
Std_ReturnType Os_Init(void)
{
    /* OS initialization logic */
    return E_OK;
}

/**
 * @brief Start the Operating System (scheduler)
 */
void Os_Start(void)
{
    /* Start the OS scheduler - this function should never return */
    while (1u)
    {
        /* Idle loop - scheduler dispatches tasks */
        Os_IdleLoop();
    }
}

/**
 * @brief Shutdown the Operating System
 */
void Os_Shutdown(OsStatusType status)
{
    /* OS shutdown logic */
    (void)status;
}

/**
 * @brief Get the current OS status
 */
OsStatusType Os_GetStatus(void)
{
    return OS_STATUS_ACTIVE;
}

/**
 * @brief Get version information of the OS module
 */
void Os_GetVersionInfo(Std_VersionInfoType *versioninfo)
{
    if (versioninfo == NULL_PTR)
    {
        /* Report DET error */
        return;
    }

    versioninfo->vendorID         = OS_VENDOR_ID;
    versioninfo->moduleID         = OS_MODULE_ID;
    versioninfo->sw_major_version = OS_SW_MAJOR_VERSION;
    versioninfo->sw_minor_version = OS_SW_MINOR_VERSION;
    versioninfo->sw_patch_version = OS_SW_PATCH_VERSION;
}

/**
 * @brief Main function for OS tick processing
 */
void Os_MainFunction(void)
{
    /* Process expired alarms */
    /* Process schedule tables */
    /* Trigger task scheduling */
}

/**
 * @brief Idle loop hook
 */
void Os_IdleLoop(void)
{
    /* User-defined idle processing */
}

/*==================[end of file]===========================================*/
`;

    return content;
  }
}

// Export singleton
export const osCodeGenerator = new OsCodeGenerator();
export default OsCodeGenerator;

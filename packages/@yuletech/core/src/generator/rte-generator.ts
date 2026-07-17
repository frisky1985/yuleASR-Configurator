/**
 * @yuletech/core - RTE Code Generator
 * AutoSAR RTE (Runtime Environment) 代码生成器
 *
 * 生成 RTE 配置相关的 C 代码和头文件
 * 支持 RTE 接口、数据映射、事件等配置
 */

import type { ModuleConfig, ModuleSchema } from '../types';

import {
  generateAutosarFileHeader,
  generateAutosarFunctionHeader,
  generateVersionInfoMacros,
  generateDetReportError,
  DetErrorCode,
  getModuleId,
  toHex,
} from './autosar-format';

import type { CodeGenerator, GeneratorOptions, GenerationResult, GeneratedFile } from './index';

/**
 * RTE 接口定义
 */
export interface RteInterface {
  name: string;
  type: 'SenderReceiver' | 'ClientServer' | 'ModeSwitch' | 'Parameter';
  dataType: string;
  direction?: 'IN' | 'OUT' | 'INOUT';
  isQueued?: boolean;
  queueLength?: number;
}

/**
 * RTE 连接定义
 */
export interface RteConnection {
  portName: string;
  interfaceName: string;
  componentName: string;
  targetComponent?: string;
  targetPort?: string;
}

/**
 * RTE 任务定义
 */
export interface RteTask {
  name: string;
  priority: number;
  periodMs: number;
  activationType: 'cyclic' | 'event' | 'sporadic';
  runnableList: string[];
}

/**
 * RTE 配置结构
 */
export interface RteConfiguration {
  interfaces: RteInterface[];
  connections: RteConnection[];
  tasks: RteTask[];
  dataMappings: Map<string, string>;
  events: Array<{
    name: string;
    type: string;
    taskRef: string;
  }>;
}

/**
 * RTE 代码生成器
 */
export class RteCodeGenerator implements CodeGenerator {
  name = 'RteCodeGenerator';
  version = '1.0.0';
  supportedModules: string[] = ['RTE', 'Rte', 'Os'];

  supports(moduleName: string): boolean {
    return this.supportedModules.includes(moduleName);
  }

  async generate(
    config: ModuleConfig,
    _schema: ModuleSchema,
    options: GeneratorOptions
  ): Promise<GenerationResult> {
    const files: GeneratedFile[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 解析 RTE 配置
      const rteConfig = this.parseRteConfiguration(config);

      // 生成 RTE 头文件
      const headerFile = this.generateRteHeader(rteConfig, options);
      files.push({
        path: `${options.outputDir}/Rte.h`,
        content: headerFile,
        language: 'h',
      });

      // 生成 RTE 源文件
      const sourceFile = this.generateRteSource(rteConfig, options);
      files.push({
        path: `${options.outputDir}/Rte.c`,
        content: sourceFile,
        language: 'c',
      });

      // 生成 RTE 类型定义头文件
      const typesFile = this.generateRteTypes(rteConfig, options);
      files.push({
        path: `${options.outputDir}/Rte_Type.h`,
        content: typesFile,
        language: 'h',
      });

      // 生成 RTE 回调头文件
      const callbackFile = this.generateRteCallbacks(rteConfig, options);
      files.push({
        path: `${options.outputDir}/Rte_Callbacks.h`,
        content: callbackFile,
        language: 'h',
      });

      // 生成 RTE 配置头文件
      const configFile = this.generateRteConfig(rteConfig, options);
      files.push({
        path: `${options.outputDir}/Rte_Cfg.h`,
        content: configFile,
        language: 'h',
      });

      // 生成 RTE Lcfg 文件
      const lcfgFile = this.generateRteLcfg(rteConfig, options);
      files.push({
        path: `${options.outputDir}/Rte_Lcfg.c`,
        content: lcfgFile,
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
        errors: [error instanceof Error ? error.message : '未知错误'],
      };
    }
  }

  /**
   * 解析 RTE 配置
   */
  private parseRteConfiguration(config: ModuleConfig): RteConfiguration {
    const interfaces: RteInterface[] = [];
    const connections: RteConnection[] = [];
    const tasks: RteTask[] = [];
    const dataMappings = new Map<string, string>();
    const events: Array<{ name: string; type: string; taskRef: string }> = [];

    // 解析接口配置
    const interfacesParam = config.parameters['RteInterfaces'];
    if (Array.isArray(interfacesParam)) {
      for (const iface of interfacesParam) {
        interfaces.push({
          name: iface.name || 'Unknown',
          type: iface.type || 'SenderReceiver',
          dataType: iface.dataType || 'uint8',
          direction: iface.direction || 'IN',
          isQueued: iface.isQueued || false,
          queueLength: iface.queueLength || 1,
        });
      }
    }

    // 解析任务配置
    const tasksParam = config.parameters['RteTasks'];
    if (Array.isArray(tasksParam)) {
      for (const task of tasksParam) {
        tasks.push({
          name: task.name || 'DefaultTask',
          priority: task.priority || 1,
          periodMs: task.periodMs || 100,
          activationType: task.activationType || 'cyclic',
          runnableList: task.runnableList || [],
        });
      }
    }

    // 解析连接配置
    const connectionsParam = config.parameters['RteConnections'];
    if (Array.isArray(connectionsParam)) {
      for (const conn of connectionsParam) {
        connections.push({
          portName: conn.portName || '',
          interfaceName: conn.interfaceName || '',
          componentName: conn.componentName || '',
          targetComponent: conn.targetComponent,
          targetPort: conn.targetPort,
        });
      }
    }

    // 解析数据映射
    const mappingsParam = config.parameters['RteDataMappings'];
    if (mappingsParam && typeof mappingsParam === 'object') {
      for (const [key, value] of Object.entries(mappingsParam)) {
        dataMappings.set(key, String(value));
      }
    }

    // 解析事件配置
    const eventsParam = config.parameters['RteEvents'];
    if (Array.isArray(eventsParam)) {
      for (const event of eventsParam) {
        events.push({
          name: event.name || '',
          type: event.type || '',
          taskRef: event.taskRef || '',
        });
      }
    }

    return { interfaces, connections, tasks, dataMappings, events };
  }

  /**
   * 生成 RTE 头文件
   */
  private generateRteHeader(rteConfig: RteConfiguration, _options: GeneratorOptions): string {
    const moduleId = getModuleId('Rte');
    const vendorId = 0x1234;

    let content = generateAutosarFileHeader(
      'Rte.h',
      'Rte',
      moduleId,
      vendorId,
      'Runtime Environment Header'
    );

    content += `\
#ifndef RTE_H
#define RTE_H

/*==================[includes]==============================================*/
#include "Std_Types.h"
#include "Rte_Type.h"
#include "Rte_Cfg.h"

`;

    // AUTOSAR 标准版本信息
    content += generateVersionInfoMacros('Rte', 1, 0, 0, 4, 4, 0);

    content += `\
/*==================[API Service IDs]========================================*/
/** @brief RTE API Service IDs for DET error reporting */
#define RTE_SID_INIT           ((uint8)0x01)
#define RTE_SID_DEINIT         ((uint8)0x02)
#define RTE_SID_READ           ((uint8)0x03)
#define RTE_SID_WRITE          ((uint8)0x04)
#define RTE_SID_SEND           ((uint8)0x05)
#define RTE_SID_RECEIVE        ((uint8)0x06)
#define RTE_SID_CALL           ((uint8)0x07)
#define RTE_SID_RESULT         ((uint8)0x08)
#define RTE_SID_IRVREAD        ((uint8)0x09)
#define RTE_SID_IRVWRITE       ((uint8)0x0A)
#define RTE_SID_MODE           ((uint8)0x0B)
#define RTE_SID_TRIGGER        ((uint8)0x0C)
#define RTE_SID_SWITCH         ((uint8)0x0D)
#define RTE_SID_GETVERSIONINFO ((uint8)0x0E)
#define RTE_SID_MAINFUNCTION   ((uint8)0x0F)

/*==================[Error Codes]============================================*/
/** @brief RTE Standard Error Codes (SWS_Rte_00500) */
#define RTE_E_OK               ((Std_ReturnType)0x00)
#define RTE_E_NOK              ((Std_ReturnType)0x01)
#define RTE_E_UNCONNECTED      ((Std_ReturnType)0x02)
#define RTE_E_TIMEOUT          ((Std_ReturnType)0x03)
#define RTE_E_LIMIT            ((Std_ReturnType)0x04)
#define RTE_E_NO_DATA          ((Std_ReturnType)0x05)
#define RTE_E_TRANSMIT_ACK     ((Std_ReturnType)0x06)
#define RTE_E_INVALID          ((Std_ReturnType)0x07)
#define RTE_E_COM_BUSY         ((Std_ReturnType)0x08)
#define RTE_E_COM_STOPPED      ((Std_ReturnType)0x09)
#define RTE_E_DET_ERR          ((Std_ReturnType)0x0A)
#define RTE_E_LOST_DATA        ((Std_ReturnType)0x0B)
#define RTE_E_MAX_AGE_EXCEEDED ((Std_ReturnType)0x0C)
#define RTE_E_COM_STOPPED_NOSUCCESS ((Std_ReturnType)0x0D)
#define RTE_E_SEG_FAULT        ((Std_ReturnType)0x0E)
#define RTE_E_OUT_OF_RANGE     ((Std_ReturnType)0x0F)
#define RTE_E_SERIALIZATION_ERROR ((Std_ReturnType)0x10)
#define RTE_E_HARD_TRANSFORMER_ERROR ((Std_ReturnType)0x11)
#define RTE_E_SOFT_TRANSFORMER_ERROR ((Std_ReturnType)0x12)
#define RTE_E_INV_ARGUMENT     ((Std_ReturnType)0x13)
#define RTE_E_BUFFER_REQUEST_FAILED ((Std_ReturnType)0x14)

/*==================[type definitions]======================================*/
typedef uint16 Rte_Instance;

typedef struct {
    uint16 vendorID;
    uint16 moduleID;
    uint8 instanceID;
    uint8 sw_major_version;
    uint8 sw_minor_version;
    uint8 sw_patch_version;
} Rte_VersionInfoType;

typedef struct {
    uint16 status;
    uint16 errorCode;
} Rte_StatusType;

/*==================[external data declarations]============================*/
`;

    // 声明 RTE 接口
    content += this.generateRteInterfaceDeclarations(rteConfig);

    // 声明 RTE 任务
    content += this.generateRteTaskDeclarations(rteConfig);

    content += `\n/*==================[function declarations]=================================*/\n`;

    // Rte_Init with full Doxygen
    content += generateAutosarFunctionHeader(
      'Initialize the RTE module',
      [],
      'Std_ReturnType: RTE_E_OK if initialization succeeded, RTE_E_NOK otherwise',
      ['RTE module shall be uninitialized'],
      ['RTE module is initialized and ready for operation']
    );
    content += `Std_ReturnType Rte_Init(void);\n\n`;

    // Rte_DeInit
    content += generateAutosarFunctionHeader(
      'Deinitialize the RTE module',
      [],
      'Std_ReturnType: RTE_E_OK if de-initialization succeeded, RTE_E_NOK otherwise',
      ['RTE module shall be initialized'],
      ['RTE module is de-initialized']
    );
    content += `Std_ReturnType Rte_DeInit(void);\n\n`;

    // Rte_GetVersionInfo
    content += generateAutosarFunctionHeader(
      'Get RTE module version information',
      [
        {
          name: 'versionInfo',
          direction: 'out',
          description: 'Pointer to version information structure to be filled',
        },
      ],
      'void',
      ['versionInfo pointer shall not be NULL_PTR']
    );
    content += `void Rte_GetVersionInfo(Rte_VersionInfoType* versionInfo);\n\n`;

    // Rte_MainFunction (standard AUTOSAR BSW main processing)
    content += generateAutosarFunctionHeader(
      'RTE main function - cyclic processing',
      [],
      'void',
      ['RTE module shall be initialized'],
      ['All pending RTE processing is completed for this cycle']
    );
    content += `void Rte_MainFunction(void);\n\n`;

    // Rte_Start
    content += generateAutosarFunctionHeader(
      'Start RTE operation',
      [],
      'Std_ReturnType: RTE_E_OK if started, RTE_E_NOK otherwise',
      ['RTE module shall be initialized'],
      ['RTE is started and tasks are scheduled']
    );
    content += `Std_ReturnType Rte_Start(void);\n\n`;

    // Rte_Stop
    content += generateAutosarFunctionHeader(
      'Stop RTE operation',
      [],
      'Std_ReturnType: RTE_E_OK if stopped, RTE_E_NOK otherwise',
      ['RTE module shall be initialized'],
      ['RTE is stopped']
    );
    content += `Std_ReturnType Rte_Stop(void);\n\n`;

    // 生成接口函数声明
    content += this.generateRteApiDeclarations(rteConfig);

    content += `
#endif /* RTE_H */
/*==================[end of file]===========================================*/
`;

    return content;
  }

  /**
   * 生成 RTE 源文件
   */
  private generateRteSource(rteConfig: RteConfiguration, options: GeneratorOptions): string {
    const moduleId = getModuleId('Rte');
    const vendorId = 0x1234;

    let content = generateAutosarFileHeader(
      'Rte.c',
      'Rte',
      moduleId,
      vendorId,
      'Runtime Environment Implementation'
    );

    content += `\
/*==================[includes]==============================================*/
#include "Rte.h"
#include "Rte_Internal.h"
#include "Os.h"

/*==================[module identification]=================================*/
#define RTE_MODULE_ID          ((uint16)${moduleId}U)
#define RTE_VENDOR_ID          ((uint16)0x${toHex(vendorId)})

`;

    if (options.generateComments) {
      content += `/*==================[internal data]=========================================*/\n`;
    }

    // 内部状态变量
    content += `static boolean Rte_Initialized = FALSE;
static boolean Rte_Started = FALSE;

`;

    // 生成任务定义
    content += this.generateTaskDefinitions(rteConfig);

    // 生成接口数据结构
    content += this.generateInterfaceDataStructures(rteConfig);

    content += `/*==================[function definitions]==================================*/
/**
 * @brief Initialize RTE
 */
Std_ReturnType Rte_Init(void) {
    if (Rte_Initialized) {
        return RTE_E_OK;
    }

    /* Initialize internal data structures */
`;

    // 初始化接口数据
    for (const iface of rteConfig.interfaces) {
      content += `    /* Initialize ${iface.name} */
`;
      if (iface.isQueued && iface.queueLength) {
        content += `    Rte_${iface.name}_Queue.head = 0;
    Rte_${iface.name}_Queue.tail = 0;
    Rte_${iface.name}_Queue.count = 0;
`;
      }
    }

    content += `
    Rte_Initialized = TRUE;
    return RTE_E_OK;
}

/**
 * @brief Deinitialize RTE
 */
Std_ReturnType Rte_DeInit(void) {
    if (!Rte_Initialized) {
        return RTE_E_NOK;
    }

    Rte_Started = FALSE;
    Rte_Initialized = FALSE;
    return RTE_E_OK;
}

/**
 * @brief Get version information
 */
void Rte_GetVersionInfo(Rte_VersionInfoType* versionInfo) {
    if (versionInfo != NULL_PTR) {
        versionInfo->vendorID = RTE_VENDOR_ID;
        versionInfo->moduleID = RTE_MODULE_ID;
        versionInfo->instanceID = RTE_INSTANCE_ID;
        versionInfo->sw_major_version = RTE_SW_MAJOR_VERSION;
        versionInfo->sw_minor_version = RTE_SW_MINOR_VERSION;
        versionInfo->sw_patch_version = RTE_SW_PATCH_VERSION;
    }
}

/**
 * @brief Start RTE
 */
Std_ReturnType Rte_Start(void) {
    if (!Rte_Initialized) {
        return RTE_E_NOK;
    }

    Rte_Started = TRUE;
    return RTE_E_OK;
}

/**
 * @brief Stop RTE
 */
Std_ReturnType Rte_Stop(void) {
    if (!Rte_Initialized) {
        return RTE_E_NOK;
    }

    Rte_Started = FALSE;
    return RTE_E_OK;
}

/**
 * @brief Start timing
 */
void Rte_StartTiming(void) {
    /* Start task scheduling */
`;

    for (const task of rteConfig.tasks) {
      if (task.activationType === 'cyclic') {
        content += `    /* Start ${task.name} - cyclic ${task.periodMs}ms */
`;
      }
    }

    content += `}

`;

    // 生成 API 函数实现
    content += this.generateRteApiImplementations(rteConfig);

    // 生成任务体
    content += this.generateTaskBodies(rteConfig);

    content += `/*==================[end of file]===========================================*/
`;

    return content;
  }

  /**
   * 生成 RTE 类型定义
   */
  private generateRteTypes(rteConfig: RteConfiguration, _options: GeneratorOptions): string {
    const timestamp = new Date().toISOString();

    let content = `/* AUTOGENERATED FILE - DO NOT EDIT */
/* Generated by yuleASR Configurator - RTE Generator */
/* Timestamp: ${timestamp} */

#ifndef RTE_TYPE_H
#define RTE_TYPE_H

/*==================[includes]==============================================*/
#include "Std_Types.h"

/*==================[type definitions]======================================*/
`;

    // 定义数据类型
    const dataTypes = new Set<string>();
    for (const iface of rteConfig.interfaces) {
      if (!dataTypes.has(iface.dataType)) {
        dataTypes.add(iface.dataType);
        content += `/** @brief Data type for ${iface.dataType} */
`;
        if (iface.dataType.startsWith('uint')) {
          content += `typedef ${this.mapDataType(iface.dataType)} ${iface.dataType};
`;
        } else if (iface.dataType.startsWith('sint')) {
          content += `typedef ${this.mapDataType(iface.dataType)} ${iface.dataType};
`;
        }
        content += `
`;
      }
    }

    // 定义接口类型
    for (const iface of rteConfig.interfaces) {
      content += `/** @brief Interface type for ${iface.name} */
`;
      content += `typedef ${iface.dataType} Rte_${iface.name}_Type;
`;

      if (iface.isQueued) {
        content += `
typedef struct {
    Rte_${iface.name}_Type data[${iface.queueLength || 1}];
    uint16 head;
    uint16 tail;
    uint16 count;
} Rte_${iface.name}_QueueType;
`;
      }
      content += `
`;
    }

    content += `
#endif /* RTE_TYPE_H */
/*==================[end of file]===========================================*/
`;

    return content;
  }

  /**
   * 生成 RTE 回调头文件
   */
  private generateRteCallbacks(rteConfig: RteConfiguration, options: GeneratorOptions): string {
    const timestamp = new Date().toISOString();

    let content = `/* AUTOGENERATED FILE - DO NOT EDIT */
/* Generated by yuleASR Configurator - RTE Generator */
/* Timestamp: ${timestamp} */

#ifndef RTE_CALLBACKS_H
#define RTE_CALLBACKS_H

/*==================[includes]==============================================*/
#include "Std_Types.h"
#include "Rte_Type.h"

`;

    if (options.generateComments) {
      content += `/*==================[callback declarations]=================================*/\n`;
      content += `/* These callbacks must be implemented by application components */\n\n`;
    }

    // 生成任务回调声明
    for (const task of rteConfig.tasks) {
      content += `/** @brief Task ${task.name} callback */
extern void Rte_Task_${task.name}_Callback(void);

`;

      // 生成 Runnable 回调声明
      for (const runnable of task.runnableList) {
        content += `/** @brief Runnable ${runnable} callback */
extern void Runnable_${runnable}(void);
`;
      }
      content += `
`;
    }

    // 生成连接回调
    for (const conn of rteConfig.connections) {
      content += `/** @brief Connection callback for ${conn.portName} */
extern void Rte_${conn.portName}_Callback(void);
`;
    }

    content += `
#endif /* RTE_CALLBACKS_H */
/*==================[end of file]===========================================*/
`;

    return content;
  }

  /**
   * 生成 RTE 配置头文件
   */
  private generateRteConfig(rteConfig: RteConfiguration, _options: GeneratorOptions): string {
    const timestamp = new Date().toISOString();

    let content = `/* AUTOGENERATED FILE - DO NOT EDIT */
/* Generated by yuleASR Configurator - RTE Generator */
/* Timestamp: ${timestamp} */

#ifndef RTE_CFG_H
#define RTE_CFG_H

/*==================[configuration]=========================================*/
`;

    // 任务配置宏
    content += `/* Task Configuration */\n`;
    content += `#define RTE_TASK_COUNT    ${rteConfig.tasks.length}U\n\n`;

    for (let i = 0; i < rteConfig.tasks.length; i++) {
      const task = rteConfig.tasks[i];
      content += `/* ${task.name} Configuration */\n`;
      content += `#define RTE_TASK_${task.name.toUpperCase()}_ID        ${i}U\n`;
      content += `#define RTE_TASK_${task.name.toUpperCase()}_PRIORITY  ${task.priority}U\n`;
      content += `#define RTE_TASK_${task.name.toUpperCase()}_PERIOD    ${task.periodMs}U\n\n`;
    }

    // 接口配置宏
    content += `/* Interface Configuration */\n`;
    content += `#define RTE_INTERFACE_COUNT    ${rteConfig.interfaces.length}U\n\n`;

    for (let i = 0; i < rteConfig.interfaces.length; i++) {
      const iface = rteConfig.interfaces[i];
      content += `/* ${iface.name} Configuration */\n`;
      content += `#define RTE_INTERFACE_${iface.name.toUpperCase()}_ID        ${i}U\n`;
      content += `#define RTE_INTERFACE_${iface.name.toUpperCase()}_TYPE      ${this.mapInterfaceType(iface.type)}\n`;
      if (iface.isQueued) {
        content += `#define RTE_INTERFACE_${iface.name.toUpperCase()}_QUEUED   STD_ON\n`;
        content += `#define RTE_INTERFACE_${iface.name.toUpperCase()}_QUEUELEN ${iface.queueLength}U\n`;
      } else {
        content += `#define RTE_INTERFACE_${iface.name.toUpperCase()}_QUEUED   STD_OFF\n`;
      }
      content += `
`;
    }

    // 连接配置宏
    content += `/* Connection Configuration */\n`;
    content += `#define RTE_CONNECTION_COUNT    ${rteConfig.connections.length}U\n\n`;

    for (let i = 0; i < rteConfig.connections.length; i++) {
      const conn = rteConfig.connections[i];
      content += `#define RTE_CONNECTION_${conn.portName.toUpperCase()}_ID    ${i}U\n`;
    }

    content += `
#endif /* RTE_CFG_H */
/*==================[end of file]===========================================*/
`;

    return content;
  }

  /**
   * 生成 RTE Lcfg 文件
   */
  private generateRteLcfg(rteConfig: RteConfiguration, options: GeneratorOptions): string {
    const timestamp = new Date().toISOString();

    let content = `/* AUTOGENERATED FILE - DO NOT EDIT */
/* Generated by yuleASR Configurator - RTE Generator */
/* Timestamp: ${timestamp} */

/*==================[includes]==============================================*/
#include "Rte.h"
#include "Rte_Cfg.h"

`;

    if (options.generateComments) {
      content += `/*==================[link-time configuration]===============================*/\n`;
    }

    // 任务配置表
    if (rteConfig.tasks.length > 0) {
      content += `/* Task Configuration Table */\n`;
      content += `const Rte_TaskConfigType Rte_TaskConfigTable[RTE_TASK_COUNT] = {\n`;
      for (const task of rteConfig.tasks) {
        content += `    {\n`;
        content += `        .taskId = RTE_TASK_${task.name.toUpperCase()}_ID,\n`;
        content += `        .priority = ${task.priority}U,\n`;
        content += `        .periodMs = ${task.periodMs}U,\n`;
        content += `        .activationType = ${task.activationType.toUpperCase()},\n`;
        content += `        .runnableCount = ${task.runnableList.length}U,\n`;
        content += `        .runnableList = { ${task.runnableList.map(r => `Runnable_${r}`).join(', ')} }\n`;
        content += `    },\n`;
      }
      content += `};\n\n`;
    }

    // 接口配置表
    if (rteConfig.interfaces.length > 0) {
      content += `/* Interface Configuration Table */\n`;
      content += `const Rte_InterfaceConfigType Rte_InterfaceConfigTable[RTE_INTERFACE_COUNT] = {\n`;
      for (const iface of rteConfig.interfaces) {
        content += `    {\n`;
        content += `        .interfaceId = RTE_INTERFACE_${iface.name.toUpperCase()}_ID,\n`;
        content += `        .interfaceType = RTE_INTERFACE_${iface.name.toUpperCase()}_TYPE,\n`;
        content += `        .dataType = &Rte_${iface.dataType}_TypeInfo,\n`;
        content += `        .isQueued = RTE_INTERFACE_${iface.name.toUpperCase()}_QUEUED,\n`;
        content += `        .queueLength = ${iface.queueLength || 1}U\n`;
        content += `    },\n`;
      }
      content += `};\n\n`;
    }

    // 连接配置表
    if (rteConfig.connections.length > 0) {
      content += `/* Connection Configuration Table */\n`;
      content += `const Rte_ConnectionConfigType Rte_ConnectionConfigTable[RTE_CONNECTION_COUNT] = {\n`;
      for (const conn of rteConfig.connections) {
        content += `    {\n`;
        content += `        .connectionId = RTE_CONNECTION_${conn.portName.toUpperCase()}_ID,\n`;
        content += `        .portName = "${conn.portName}",\n`;
        content += `        .interfaceName = "${conn.interfaceName}",\n`;
        content += `        .componentName = "${conn.componentName}",\n`;
        content += `        .targetComponent = "${conn.targetComponent || 'NULL'}",\n`;
        content += `        .targetPort = "${conn.targetPort || 'NULL'}"\n`;
        content += `    },\n`;
      }
      content += `};\n\n`;
    }

    content += `/*==================[end of file]===========================================*/\n`;

    return content;
  }

  /**
   * 生成 RTE 接口声明
   */
  private generateRteInterfaceDeclarations(rteConfig: RteConfiguration): string {
    let content = '';

    for (const iface of rteConfig.interfaces) {
      content += `/* Interface: ${iface.name} (${iface.type}) */\n`;
      content += `extern Rte_${iface.name}_Type Rte_${iface.name};\n`;

      if (iface.isQueued) {
        content += `extern Rte_${iface.name}_QueueType Rte_${iface.name}_Queue;\n`;
      }
      content += `
`;
    }

    return content;
  }

  /**
   * 生成 RTE 任务声明
   */
  private generateRteTaskDeclarations(rteConfig: RteConfiguration): string {
    let content = '';

    for (const task of rteConfig.tasks) {
      content += `/* Task: ${task.name} */\n`;
      content += `extern const OsTaskType Rte_OsTask_${task.name};\n`;
      content += `extern void Rte_Task_${task.name}(void);\n\n`;
    }

    return content;
  }

  /**
   * 生成 RTE API 声明
   */
  private generateRteApiDeclarations(rteConfig: RteConfiguration): string {
    let content = '';

    // 发送接口 API
    for (const iface of rteConfig.interfaces) {
      if (iface.type === 'SenderReceiver') {
        content += `/* API for ${iface.name} */\n`;
        content += `Std_ReturnType Rte_Read_${iface.name}(Rte_${iface.name}_Type* data);\n`;
        content += `Std_ReturnType Rte_Write_${iface.name}(const Rte_${iface.name}_Type* data);\n`;
        content += `Std_ReturnType Rte_Receive_${iface.name}(Rte_${iface.name}_Type* data);\n`;
        content += `Std_ReturnType Rte_Send_${iface.name}(const Rte_${iface.name}_Type* data);\n\n`;
      } else if (iface.type === 'ClientServer') {
        content += `/* API for ${iface.name} */\n`;
        content += `Std_ReturnType Rte_Call_${iface.name}(void);\n`;
        content += `Std_ReturnType Rte_Result_${iface.name}(void);\n\n`;
      }
    }

    // 数据映射 API
    if (rteConfig.dataMappings && rteConfig.dataMappings.size > 0) {
      for (const key of Array.from(rteConfig.dataMappings.keys())) {
        content += `Std_ReturnType Rte_IRead_${key}(void);\n`;
      }
    }

    return content;
  }

  /**
   * 生成任务定义
   */
  private generateTaskDefinitions(rteConfig: RteConfiguration): string {
    let content = '';

    for (const task of rteConfig.tasks) {
      content += `/* Task: ${task.name} - Priority ${task.priority}, Period ${task.periodMs}ms */\n`;
      content += `TASK(${task.name})\n{
`;

      // 调用 Runnable
      for (const runnable of task.runnableList) {
        content += `    /* Execute Runnable: ${runnable} */\n`;
        content += `    Runnable_${runnable}();\n\n`;
      }

      if (task.activationType === 'cyclic') {
        content += `    TerminateTask();\n`;
      } else {
        content += `    /* Wait for event */\n`;
        content += `    WaitEvent(EVENT_${task.name.toUpperCase()});\n`;
        content += `    ClearEvent(EVENT_${task.name.toUpperCase()});\n`;
      }

      content += `}\n\n`;
    }

    return content;
  }

  /**
   * 生成接口数据结构
   */
  private generateInterfaceDataStructures(rteConfig: RteConfiguration): string {
    let content = '';

    for (const iface of rteConfig.interfaces) {
      content += `/* Interface data for ${iface.name} */\n`;
      content += `static Rte_${iface.name}_Type Rte_${iface.name}_Data;\n`;
      content += `Rte_${iface.name}_Type Rte_${iface.name};\n`;

      if (iface.isQueued) {
        content += `Rte_${iface.name}_QueueType Rte_${iface.name}_Queue;\n`;
      }
      content += `
`;
    }

    return content;
  }

  /**
   * 生成 RTE API 实现
   */
  private generateRteApiImplementations(rteConfig: RteConfiguration): string {
    let content = '';

    for (const iface of rteConfig.interfaces) {
      if (iface.type === 'SenderReceiver') {
        content += `/* Read/Write API for ${iface.name} */\n`;

        // Read API
        content += `Std_ReturnType Rte_Read_${iface.name}(Rte_${iface.name}_Type* data) {\n`;
        content += `    if (!Rte_Initialized || !Rte_Started) {\n`;
        content += `        return RTE_E_UNCONNECTED;\n`;
        content += `    }\n`;
        content += `    if (data == NULL_PTR) {\n`;
        content += `        return RTE_E_INVALID;\n`;
        content += `    }\n`;
        content += `    *data = Rte_${iface.name}_Data;\n`;
        content += `    return RTE_E_OK;\n`;
        content += `}\n\n`;

        // Write API
        content += `Std_ReturnType Rte_Write_${iface.name}(const Rte_${iface.name}_Type* data) {\n`;
        content += `    if (!Rte_Initialized || !Rte_Started) {\n`;
        content += `        return RTE_E_UNCONNECTED;\n`;
        content += `    }\n`;
        content += `    if (data == NULL_PTR) {\n`;
        content += `        return RTE_E_INVALID;\n`;
        content += `    }\n`;
        content += `    Rte_${iface.name}_Data = *data;\n`;
        content += `    return RTE_E_OK;\n`;
        content += `}\n\n`;
      }
    }

    return content;
  }

  /**
   * 生成任务体
   */
  private generateTaskBodies(rteConfig: RteConfiguration): string {
    let content = '';

    for (const task of rteConfig.tasks) {
      content += `/* Task: ${task.name} */\n`;
      content += `void Rte_Task_${task.name}(void) {\n`;
      content += `    /* Task body generated by RTE */\n`;
      content += `    /* Period: ${task.periodMs}ms, Priority: ${task.priority} */\n\n`;

      for (const runnable of task.runnableList) {
        content += `    Runnable_${runnable}();\n`;
      }

      content += `}\n\n`;
    }

    return content;
  }

  /**
   * 映射数据类型
   */
  private mapDataType(dataType: string): string {
    const typeMap: Record<string, string> = {
      uint8: 'uint8',
      uint16: 'uint16',
      uint32: 'uint32',
      sint8: 'sint8',
      sint16: 'sint16',
      sint32: 'sint32',
      float32: 'float32',
      float64: 'float64',
      boolean: 'boolean',
    };
    return typeMap[dataType] || 'uint32';
  }

  /**
   * 映射接口类型
   */
  private mapInterfaceType(type: string): string {
    const typeMap: Record<string, string> = {
      SenderReceiver: '0x01',
      ClientServer: '0x02',
      ModeSwitch: '0x03',
      Parameter: '0x04',
    };
    return typeMap[type] || '0x00';
  }
}

/**
 * 创建 RTE 代码生成器实例
 */
export function createRteGenerator(): RteCodeGenerator {
  return new RteCodeGenerator();
}

export default RteCodeGenerator;

import type { AutosarApi } from './types';

export const ECUM_APIS: AutosarApi[] = [
  {
    id: 'EcuM_Init',
    name: 'EcuM_Init',
    signature: 'void EcuM_Init(void)',
    brief: '初始化 ECU 状态管理器',
    description: '初始化 EcuM 模块。在系统上电后最早调用的 BSW 模块之一，负责建立基础的运行环境，初始化 BSW 调度器，并过渡到 RUN 状态。',
    params: [],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_Init 启动 ECU 状态管理 */
#include "EcuM.h"

void Startup_Sequence(void) {
    /* 系统上电后首先调用 */
    EcuM_Init();

    /* EcuM 会调度其他 BSW 模块的初始化 */
}`,
    seeAlso: ['EcuM_GetVersionInfo', 'EcuM_SelectWakeupSource', 'EcuM_ResetToRUN'],
    configParams: [
      { paramName: 'EcuMConfig', configModule: 'EcuM', path: 'EcuM/EcuMConfig' },
    ],
    status: 'standard',
  },
  {
    id: 'EcuM_GetVersionInfo',
    name: 'EcuM_GetVersionInfo',
    signature: 'void EcuM_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 EcuM 模块版本信息',
    description: '返回 EcuM 模块的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_GetVersionInfo 示例 */
#include "EcuM.h"

void EcuM_PrintVersion(void) {
    Std_VersionInfoType ver;
    EcuM_GetVersionInfo(&ver);
}`,
    seeAlso: [],
    status: 'standard',
  },
  {
    id: 'EcuM_SelectWakeupSource',
    name: 'EcuM_SelectWakeupSource',
    signature: 'Std_ReturnType EcuM_SelectWakeupSource(EcuM_WakeupSourceType WakeupSource)',
    brief: '选择唤醒源',
    description: '选择一个或多个唤醒源用于 ECU 唤醒。在进入睡眠模式前调用，指定哪些外部事件可以唤醒 ECU，如 CAN 总线活动、LIN 唤醒、外部引脚电平变化等。',
    params: [
      { name: 'WakeupSource', type: 'EcuM_WakeupSourceType', direction: 'in', description: '唤醒源类型掩码' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 选择成功；E_NOT_OK: 无效的唤醒源',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_SelectWakeupSource 选择 CAN 唤醒 */
#include "EcuM.h"

void EcuM_PrepareSleep(void) {
    /* 选择 CAN 和 LIN 作为唤醒源 */
    Std_ReturnType ret = EcuM_SelectWakeupSource(ECUM_WAKEUP_SOURCE_CAN | ECUM_WAKEUP_SOURCE_LIN);
    if (ret == E_OK) {
        /* 唤醒源已配置，可以进入睡眠 */
    }
}`,
    exampleDescription: '选择 CAN 和 LIN 总线作为 ECU 唤醒源',
    seeAlso: ['EcuM_CheckWakeup', 'EcuM_StartWakeupSources', 'EcuM_GetWakeupEvent'],
    status: 'standard',
  },
  {
    id: 'EcuM_CheckWakeup',
    name: 'EcuM_CheckWakeup',
    signature: 'Std_ReturnType EcuM_CheckWakeup(EcuM_WakeupSourceType WakeupSource)',
    brief: '检查指定唤醒源是否有效',
    description: '验证指定的唤醒源是否确实产生了唤醒事件。EcuM 会调用各通信模块的检查函数来确认唤醒源的有效性，防止误唤醒。',
    params: [
      { name: 'WakeupSource', type: 'EcuM_WakeupSourceType', direction: 'in', description: '要检查的唤醒源' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 唤醒有效；E_NOT_OK: 唤醒无效',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_CheckWakeup 验证唤醒源 */
#include "EcuM.h"

void EcuM_ValidateWakeup(void) {
    Std_ReturnType ret = EcuM_CheckWakeup(ECUM_WAKEUP_SOURCE_CAN);
    if (ret == E_OK) {
        /* CAN 总线确实有唤醒活动 */
    } else {
        /* 误唤醒，可能是噪声 */
    }
}`,
    exampleDescription: '验证 CAN 唤醒源是否有效',
    seeAlso: ['EcuM_SelectWakeupSource', 'EcuM_ValidateWakeupSource', 'EcuM_GetWakeupEvent'],
    status: 'standard',
  },
  {
    id: 'EcuM_StartWakeupSources',
    name: 'EcuM_StartWakeupSources',
    signature: 'void EcuM_StartWakeupSources(EcuM_WakeupSourceType WakeupSource)',
    brief: '启动唤醒源监视',
    description: '启动指定唤醒源的监视功能。使能相应的通信控制器或 GPIO 中断，使其能够在总线活动或电平变化时唤醒 ECU。',
    params: [
      { name: 'WakeupSource', type: 'EcuM_WakeupSourceType', direction: 'in', description: '要启动的唤醒源' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_StartWakeupSources 启用唤醒监视 */
#include "EcuM.h"

void EcuM_EnableWakeupMonitors(void) {
    /* 启动 CAN 和 LIN 唤醒监视 */
    EcuM_StartWakeupSources(ECUM_WAKEUP_SOURCE_CAN | ECUM_WAKEUP_SOURCE_LIN);
    /* 唤醒源监视已启动 */
}`,
    exampleDescription: '启动 CAN 和 LIN 唤醒源监视功能',
    seeAlso: ['EcuM_StopWakeupSources', 'EcuM_SelectWakeupSource'],
    status: 'standard',
  },
  {
    id: 'EcuM_StopWakeupSources',
    name: 'EcuM_StopWakeupSources',
    signature: 'void EcuM_StopWakeupSources(EcuM_WakeupSourceType WakeupSource)',
    brief: '停止唤醒源监视',
    description: '停止指定唤醒源的监视功能。通常在 ECU 进入正常运行模式后调用，关闭唤醒监视以降低功耗。',
    params: [
      { name: 'WakeupSource', type: 'EcuM_WakeupSourceType', direction: 'in', description: '要停止的唤醒源' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_StopWakeupSources 关闭唤醒监视 */
#include "EcuM.h"

void EcuM_DisableWakeupMonitors(void) {
    /* 停止 CAN 唤醒监视 */
    EcuM_StopWakeupSources(ECUM_WAKEUP_SOURCE_CAN);
}`,
    exampleDescription: 'ECU 正常运行后停止 CAN 唤醒监视',
    seeAlso: ['EcuM_StartWakeupSources', 'EcuM_SelectWakeupSource'],
    status: 'standard',
  },
  {
    id: 'EcuM_GetWakeupEvent',
    name: 'EcuM_GetWakeupEvent',
    signature: 'EcuM_WakeupSourceType EcuM_GetWakeupEvent(void)',
    brief: '获取当前唤醒事件源',
    description: '返回触发 ECU 从睡眠模式唤醒的事件源。用于确定是哪个外设或条件触发了唤醒，以便执行对应的唤醒处理流程。',
    params: [],
    returnType: 'EcuM_WakeupSourceType',
    returnDescription: '触发唤醒的事件源类型掩码',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_GetWakeupEvent 获取唤醒源 */
#include "EcuM.h"

void EcuM_IdentifyWakeupSource(void) {
    EcuM_WakeupSourceType source = EcuM_GetWakeupEvent();

    if (source & ECUM_WAKEUP_SOURCE_CAN) {
        /* CAN 总线唤醒 */
    } else if (source & ECUM_WAKEUP_SOURCE_LIN) {
        /* LIN 总线唤醒 */
    } else if (source & ECUM_WAKEUP_SOURCE_POWER) {
        /* 上电唤醒 */
    }
}`,
    exampleDescription: '识别触发 ECU 唤醒的事件源',
    seeAlso: ['EcuM_SelectWakeupSource', 'EcuM_CheckWakeup'],
    status: 'standard',
  },
  {
    id: 'EcuM_ResetToRUN',
    name: 'EcuM_ResetToRUN',
    signature: 'void EcuM_ResetToRUN(void)',
    brief: '请求重置到 RUN 状态',
    description: '请求将 ECU 状态重置并过渡到 RUN 模式。在需要从错误恢复或模式切换时调用，EcuM 将执行重置序列并重新初始化系统到 RUN 状态。',
    params: [],
    returnType: 'void',
    returnDescription: '无返回值（该函数通常不返回，触发系统重置）',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_ResetToRUN 请求系统重置 */
#include "EcuM.h"

void EcuM_TriggerReset(void) {
    /* 请求系统重置并重新进入 RUN 模式 */
    EcuM_ResetToRUN();
    /* 此处不会执行，系统即将重置 */
}`,
    exampleDescription: '请求 ECU 重置并重新启动',
    seeAlso: ['EcuM_Init', 'EcuM_ResetToPOSTRUN'],
    status: 'standard',
  },
  {
    id: 'EcuM_ResetToPOSTRUN',
    name: 'EcuM_ResetToPOSTRUN',
    signature: 'void EcuM_ResetToPOSTRUN(void)',
    brief: '请求过渡到 POSTRUN 模式',
    description: '请求将 ECU 从 RUN 模式过渡到 POSTRUN 模式。POSTRUN 模式下，部分 BSW 模块仍在运行但应用层已停止，用于执行关闭前清理操作。',
    params: [],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_ResetToPOSTRUN 进入后运行模式 */
#include "EcuM.h"

void EcuM_EnterPostRun(void) {
    /* 请求进入 POSTRUN 模式进行关闭前清理 */
    EcuM_ResetToPOSTRUN();
}`,
    exampleDescription: '进入 POSTRUN 模式执行关闭清理',
    seeAlso: ['EcuM_ResetToRUN', 'EcuM_Init'],
    status: 'standard',
  },
  {
    id: 'EcuM_SetWakeupEvent',
    name: 'EcuM_SetWakeupEvent',
    signature: 'Std_ReturnType EcuM_SetWakeupEvent(EcuM_WakeupSourceType WakeupSource)',
    brief: '设置唤醒事件',
    description: '由通信模块或中断服务程序调用，通知 EcuM 检测到指定唤醒源的事件。EcuM 收集所有唤醒事件并触发唤醒验证流程。',
    params: [
      { name: 'WakeupSource', type: 'EcuM_WakeupSourceType', direction: 'in', description: '检测到的唤醒源' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 事件已记录；E_NOT_OK: 无效的唤醒源',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_SetWakeupEvent 设置唤醒事件 */
#include "EcuM.h"

/* CAN 驱动中断检测到总线活动 */
void Can_WakeupInterrupt(void) {
    /* 通知 EcuM 检测到 CAN 唤醒事件 */
    EcuM_SetWakeupEvent(ECUM_WAKEUP_SOURCE_CAN);
}`,
    exampleDescription: 'CAN 驱动检测到总线活动时设置唤醒事件',
    seeAlso: ['EcuM_GetWakeupEvent', 'EcuM_CheckWakeup', 'EcuM_ValidateWakeupSource'],
    status: 'standard',
  },
  {
    id: 'EcuM_MainFunction',
    name: 'EcuM_MainFunction',
    signature: 'void EcuM_MainFunction(void)',
    brief: 'EcuM 主函数周期性调用',
    description: 'EcuM 的周期性主函数。必须在操作系统的周期性任务中调用，用于 EcuM 的内部状态机处理、唤醒验证超时管理和模式转换协调。',
    params: [],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_MainFunction 周期调度 */
#include "EcuM.h"

/* 周期任务中调用 */
void EcuM_PeriodicTask(void) {
    EcuM_MainFunction();
    /* EcuM 处理内部状态机和超时 */
}`,
    exampleDescription: '在周期任务中定时调用 EcuM_MainFunction',
    seeAlso: ['EcuM_Init'],
    status: 'standard',
  },
  {
    id: 'EcuM_ValidateWakeupSource',
    name: 'EcuM_ValidateWakeupSource',
    signature: 'Std_ReturnType EcuM_ValidateWakeupSource(EcuM_WakeupSourceType WakeupSource)',
    brief: '验证并确认唤醒源',
    description: '对指定的唤醒源进行最终验证确认。在 EcuM_CheckWakeup 确认有效后调用，完成唤醒源的完整验证流程并将 ECU 过渡到唤醒状态。',
    params: [
      { name: 'WakeupSource', type: 'EcuM_WakeupSourceType', direction: 'in', description: '要验证确认的唤醒源' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 验证通过，ECU 确认唤醒；E_NOT_OK: 验证失败',
    moduleId: 'EcuM',
    layerId: 'Service',
    version: '4.4',
    example: `/* EcuM_ValidateWakeupSource 确认唤醒 */
#include "EcuM.h"

void EcuM_ConfirmWakeup(void) {
    /* 检查并验证唤醒源 */
    if (EcuM_CheckWakeup(ECUM_WAKEUP_SOURCE_CAN) == E_OK) {
        Std_ReturnType ret = EcuM_ValidateWakeupSource(ECUM_WAKEUP_SOURCE_CAN);
        if (ret == E_OK) {
            /* 唤醒验证通过，ECU 正式唤醒 */
        }
    }
}`,
    exampleDescription: '完成 CAN 唤醒源的完整验证流程',
    seeAlso: ['EcuM_CheckWakeup', 'EcuM_SetWakeupEvent', 'EcuM_SelectWakeupSource'],
    status: 'standard',
  },
];

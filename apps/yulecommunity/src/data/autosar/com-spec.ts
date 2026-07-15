import type { AutosarApi } from './types';

export const COM_APIS: AutosarApi[] = [
  {
    id: 'Com_SendSignal',
    name: 'Com_SendSignal',
    signature: 'Std_ReturnType Com_SendSignal(Com_SignalIdType SignalId, const void* SignalDataPtr)',
    brief: '发送指定信号的值',
    description: '将指定信号的数据写入 Com 模块内部缓冲区，等待 PDU 周期发送或触发式发送。支持所有信号数据类型，包括布尔、枚举、整数和浮点数。',
    params: [
      { name: 'SignalId', type: 'Com_SignalIdType', direction: 'in', description: '信号 ID，标识要发送的信号' },
      { name: 'SignalDataPtr', type: 'const void*', direction: 'in', description: '指向信号数据的指针，数据长度与信号配置一致' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 发送成功；E_NOT_OK: 信号 ID 无效或数据指针为空',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_SendSignal 发送车速信号 */
#include "Com.h"

void Com_SendVehicleSpeed(void) {
    uint8 speed = 60; /* 60 km/h */
    Std_ReturnType ret = Com_SendSignal(COM_SIG_VEHICLE_SPEED, &speed);
    if (ret == E_OK) {
        /* 信号已写入内部缓冲区，等待周期发送 */
    }
}`,
    exampleDescription: '发送车速信号值 60 km/h',
    seeAlso: ['Com_ReceiveSignal', 'Com_SendSignalGroup', 'Com_WriteSignal'],
    configParams: [
      { paramName: 'ComConfig', configModule: 'Com', path: 'Com/ComConfig' },
    ],
    status: 'standard',
  },
  {
    id: 'Com_ReceiveSignal',
    name: 'Com_ReceiveSignal',
    signature: 'Std_ReturnType Com_ReceiveSignal(Com_SignalIdType SignalId, void* SignalDataPtr)',
    brief: '接收指定信号的值',
    description: '从 Com 模块的接收缓冲区读取指定信号的当前值。接收的数据已被解包和转换为宿主 CPU 格式。',
    params: [
      { name: 'SignalId', type: 'Com_SignalIdType', direction: 'in', description: '信号 ID，标识要接收的信号' },
      { name: 'SignalDataPtr', type: 'void*', direction: 'out', description: '数据输出缓冲区的指针，用于存储接收的信号值' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 接收成功；E_NOT_OK: 信号 ID 无效或数据无效',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_ReceiveSignal 读取车速信号 */
#include "Com.h"

void Com_ReadVehicleSpeed(void) {
    uint8 speed = 0;
    Std_ReturnType ret = Com_ReceiveSignal(COM_SIG_VEHICLE_SPEED, &speed);
    if (ret == E_OK) {
        /* speed 包含当前车速值 */
    }
}`,
    exampleDescription: '从 Com 接收缓冲区读取车速信号',
    seeAlso: ['Com_SendSignal', 'Com_ReceiveSignalGroup', 'Com_ReadSignal'],
    status: 'standard',
  },
  {
    id: 'Com_SendSignalGroup',
    name: 'Com_SendSignalGroup',
    signature: 'Std_ReturnType Com_SendSignalGroup(Com_SignalGroupIdType SignalGroupId)',
    brief: '发送指定信号组中所有信号',
    description: '将信号组中所有已更新的信号一次性打包并提交发送。信号组内的信号共享同一个 PDU，通过此函数实现原子性发送。',
    params: [
      { name: 'SignalGroupId', type: 'Com_SignalGroupIdType', direction: 'in', description: '信号组 ID，标识要发送的信号组' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 发送请求成功；E_NOT_OK: 信号组 ID 无效或组内信号有误',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_SendSignalGroup 发送整车状态组 */
#include "Com.h"

void Com_SendVehicleStatusGroup(void) {
    uint8 speed = 80;
    uint8 rpm = 3000;
    uint8 temp = 90;

    /* 先写入组内各信号 */
    Com_SendSignal(COM_SIG_SPEED, &speed);
    Com_SendSignal(COM_SIG_RPM, &rpm);
    Com_SendSignal(COM_SIG_COOLANT_TEMP, &temp);

    /* 一次性发送整个信号组 */
    Std_ReturnType ret = Com_SendSignalGroup(COM_SIGGROUP_VEHICLE_STATUS);
    if (ret == E_OK) {
        /* 信号组已原子性发送 */
    }
}`,
    exampleDescription: '原子性发送整车状态信号组',
    seeAlso: ['Com_SendSignal', 'Com_ReceiveSignalGroup'],
    status: 'standard',
  },
  {
    id: 'Com_ReceiveSignalGroup',
    name: 'Com_ReceiveSignalGroup',
    signature: 'Std_ReturnType Com_ReceiveSignalGroup(Com_SignalGroupIdType SignalGroupId)',
    brief: '接收指定信号组中所有信号',
    description: '将信号组对应的接收 PDU 数据一次性解包到内部信号缓冲区，确保组内所有信号在时间上保持一致。',
    params: [
      { name: 'SignalGroupId', type: 'Com_SignalGroupIdType', direction: 'in', description: '信号组 ID，标识要接收的信号组' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 接收成功；E_NOT_OK: 信号组 ID 无效',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_ReceiveSignalGroup 接收整车状态组 */
#include "Com.h"

void Com_ReadVehicleStatusGroup(void) {
    Std_ReturnType ret = Com_ReceiveSignalGroup(COM_SIGGROUP_VEHICLE_STATUS);
    if (ret == E_OK) {
        /* 组内所有信号数据已同步更新，调用 Com_ReceiveSignal 读取 */
    }
}`,
    exampleDescription: '同步接收整车状态信号组',
    seeAlso: ['Com_SendSignalGroup', 'Com_ReceiveSignal'],
    status: 'standard',
  },
  {
    id: 'Com_GetVersionInfo',
    name: 'Com_GetVersionInfo',
    signature: 'void Com_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 Com 模块版本信息',
    description: '返回 Com 模块的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_GetVersionInfo 示例 */
#include "Com.h"

void Com_PrintVersion(void) {
    Std_VersionInfoType ver;
    Com_GetVersionInfo(&ver);
}`,
    seeAlso: [],
    status: 'standard',
  },
  {
    id: 'Com_SetValidationStatus',
    name: 'Com_SetValidationStatus',
    signature: 'Std_ReturnType Com_SetValidationStatus(Com_SignalIdType SignalId, Com_ValidationStatusType Status)',
    brief: '设置信号的验证状态',
    description: '设置指定接收信号的验证结果状态。当应用层完成对信号的合理性或范围检查后，通过此函数通知 Com 模块该信号是否有效。',
    params: [
      { name: 'SignalId', type: 'Com_SignalIdType', direction: 'in', description: '信号 ID' },
      { name: 'Status', type: 'Com_ValidationStatusType', direction: 'in', description: '验证状态：COM_VALIDATION_OK / COM_VALIDATION_FAILED' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 设置成功；E_NOT_OK: 信号 ID 无效',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_SetValidationStatus 设置信号验证状态 */
#include "Com.h"

void Com_ValidateSpeedSignal(void) {
    uint8 speed;
    Com_ReceiveSignal(COM_SIG_VEHICLE_SPEED, &speed);

    /* 车速合理性检查：0~300 km/h */
    if (speed <= 300) {
        Com_SetValidationStatus(COM_SIG_VEHICLE_SPEED, COM_VALIDATION_OK);
    } else {
        Com_SetValidationStatus(COM_SIG_VEHICLE_SPEED, COM_VALIDATION_FAILED);
    }
}`,
    exampleDescription: '对车速信号进行合理性验证',
    seeAlso: ['Com_ReceiveSignal', 'Com_GetEventNotificationStatus'],
    status: 'standard',
  },
  {
    id: 'Com_ReadSignal',
    name: 'Com_ReadSignal',
    signature: 'Std_ReturnType Com_ReadSignal(Com_SignalIdType SignalId, void* SignalDataPtr)',
    brief: '读取信号的当前值（无更新语义）',
    description: '直接读取指定信号的当前值，不触发任何更新通知或回调。与 Com_ReceiveSignal 不同，Com_ReadSignal 仅读取而不改变信号的状态。',
    params: [
      { name: 'SignalId', type: 'Com_SignalIdType', direction: 'in', description: '信号 ID' },
      { name: 'SignalDataPtr', type: 'void*', direction: 'out', description: '信号值输出缓冲区' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 读取成功；E_NOT_OK: 信号 ID 无效',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_ReadSignal 直接读取信号值 */
#include "Com.h"

void Com_CheckSignalNoUpdate(void) {
    uint8 speed;
    Std_ReturnType ret = Com_ReadSignal(COM_SIG_VEHICLE_SPEED, &speed);
    if (ret == E_OK) {
        /* speed 为信号当前值，不触发任何更新回调 */
    }
}`,
    seeAlso: ['Com_ReceiveSignal', 'Com_WriteSignal'],
    status: 'standard',
  },
  {
    id: 'Com_WriteSignal',
    name: 'Com_WriteSignal',
    signature: 'Std_ReturnType Com_WriteSignal(Com_SignalIdType SignalId, const void* SignalDataPtr)',
    brief: '写入信号值（不触发发送）',
    description: '将信号值写入内部缓冲区，但不触发立即发送或更新 PDU 发送触发器。配合 Com_SendSignalGroup 使用，先在组内写入各信号再统一发送。',
    params: [
      { name: 'SignalId', type: 'Com_SignalIdType', direction: 'in', description: '信号 ID' },
      { name: 'SignalDataPtr', type: 'const void*', direction: 'in', description: '信号数据指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 写入成功；E_NOT_OK: 信号 ID 无效',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_WriteSignal 写入信号不触发发送 */
#include "Com.h"

void Com_PrepareSignals(void) {
    uint8 speed = 100;
    uint8 rpm = 2500;

    /* 写入信号但不发送 */
    Com_WriteSignal(COM_SIG_SPEED, &speed);
    Com_WriteSignal(COM_SIG_RPM, &rpm);

    /* 稍后统一发送 */
    Com_SendSignalGroup(COM_SIGGROUP_VEHICLE_STATUS);
}`,
    exampleDescription: '先写入多个信号再统一触发发送',
    seeAlso: ['Com_SendSignal', 'Com_SendSignalGroup', 'Com_ReadSignal'],
    status: 'standard',
  },
  {
    id: 'Com_GetEventNotificationStatus',
    name: 'Com_GetEventNotificationStatus',
    signature: 'Com_NotificationStatusType Com_GetEventNotificationStatus(Com_SignalIdType SignalId)',
    brief: '获取信号的事件通知状态',
    description: '返回指定信号的当前事件通知状态，指示信号是否有新数据到达尚未被应用处理。用于轮询方式接收信号的场景。',
    params: [
      { name: 'SignalId', type: 'Com_SignalIdType', direction: 'in', description: '信号 ID' },
    ],
    returnType: 'Com_NotificationStatusType',
    returnDescription: 'COM_NOTIFICATION_STATUS_NEW: 存在新数据；COM_NOTIFICATION_STATUS_NO_NEW: 无新数据',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_GetEventNotificationStatus 轮询信号更新 */
#include "Com.h"

void Com_PollSignalUpdate(void) {
    if (Com_GetEventNotificationStatus(COM_SIG_VEHICLE_SPEED) == COM_NOTIFICATION_STATUS_NEW) {
        uint8 speed;
        Com_ReceiveSignal(COM_SIG_VEHICLE_SPEED, &speed);
        /* 处理新数据 */
    }
}`,
    exampleDescription: '轮询检查车速信号是否有新数据',
    seeAlso: ['Com_ClearEventNotification', 'Com_ReceiveSignal'],
    status: 'standard',
  },
  {
    id: 'Com_ClearEventNotification',
    name: 'Com_ClearEventNotification',
    signature: 'void Com_ClearEventNotification(Com_SignalIdType SignalId)',
    brief: '清除信号的事件通知状态',
    description: '清除指定信号的新数据通知标志。在读取信号后调用，防止重复处理同一数据。',
    params: [
      { name: 'SignalId', type: 'Com_SignalIdType', direction: 'in', description: '信号 ID' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_ClearEventNotification 清除通知标志 */
#include "Com.h"

void Com_ReadAndClear(void) {
    uint8 speed;
    if (Com_GetEventNotificationStatus(COM_SIG_VEHICLE_SPEED) == COM_NOTIFICATION_STATUS_NEW) {
        Com_ReceiveSignal(COM_SIG_VEHICLE_SPEED, &speed);
        Com_ClearEventNotification(COM_SIG_VEHICLE_SPEED);
        /* 通知标志已清除，同一数据不会再次处理 */
    }
}`,
    seeAlso: ['Com_GetEventNotificationStatus', 'Com_ReceiveSignal'],
    status: 'standard',
  },
  {
    id: 'Com_GetCurrentComMode',
    name: 'Com_GetCurrentComMode',
    signature: 'Com_ModeType Com_GetCurrentComMode(Com_ModeGroupIdType ModeGroupId)',
    brief: '获取指定模式组的当前通信模式',
    description: '返回指定模式组的当前通信模式状态，如 COM_MODE_UNINIT、COM_MODE_OFF、COM_MODE_ON 等。用于控制信号通信的启停决策。',
    params: [
      { name: 'ModeGroupId', type: 'Com_ModeGroupIdType', direction: 'in', description: '模式组 ID' },
    ],
    returnType: 'Com_ModeType',
    returnDescription: '当前通信模式枚举值',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_GetCurrentComMode 检查通信模式 */
#include "Com.h"

void Com_CheckMode(void) {
    Com_ModeType mode = Com_GetCurrentComMode(COM_MODE_GROUP_DEFAULT);
    if (mode == COM_MODE_ON) {
        /* 正常通信模式，可以发送/接收信号 */
    } else if (mode == COM_MODE_OFF) {
        /* 通信关闭，信号传输不可用 */
    }
}`,
    exampleDescription: '检查默认模式组的通信状态',
    seeAlso: [],
    status: 'standard',
  },
  {
    id: 'Com_SendSignalWithWriteOnly',
    name: 'Com_SendSignalWithWriteOnly',
    signature: 'Std_ReturnType Com_SendSignalWithWriteOnly(Com_SignalIdType SignalId, const void* SignalDataPtr)',
    brief: '发送信号（WriteOnly 模式）',
    description: '以 WriteOnly 模式发送信号。与 Com_SendSignal 相同，但当信号配置为 WriteOnly 时，仅写入发送缓冲区而不触发发送确认。适用于不需要发送确认的应用场景。',
    params: [
      { name: 'SignalId', type: 'Com_SignalIdType', direction: 'in', description: '信号 ID' },
      { name: 'SignalDataPtr', type: 'const void*', direction: 'in', description: '信号数据指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 写入成功；E_NOT_OK: 信号 ID 无效',
    moduleId: 'Com',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* Com_SendSignalWithWriteOnly 快速发送 */
#include "Com.h"

void Com_FastSendStatus(void) {
    uint8 status = 0x01;
    Std_ReturnType ret = Com_SendSignalWithWriteOnly(COM_SIG_DIAG_STATUS, &status);
    if (ret == E_OK) {
        /* 数据已写入，WriteOnly 模式不等待发送确认 */
    }
}`,
    exampleDescription: 'WriteOnly 模式快速发送诊断状态信号',
    seeAlso: ['Com_SendSignal', 'Com_WriteSignal'],
    status: 'optional',
  },
];

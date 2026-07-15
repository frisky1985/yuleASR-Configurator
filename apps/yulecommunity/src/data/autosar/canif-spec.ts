import type { AutosarApi } from './types';

export const CANIF_APIS: AutosarApi[] = [
  {
    id: 'CanIf_Init',
    name: 'CanIf_Init',
    signature: 'void CanIf_Init(const CanIf_ConfigType* ConfigPtr)',
    brief: '初始化 CanIf 模块',
    description: '初始化 CAN 接口模块，配置 PDU 路由、控制器句柄、硬件对象过滤等参数。必须在任何其他 CanIf 操作前调用。',
    params: [
      { name: 'ConfigPtr', type: 'const CanIf_ConfigType*', direction: 'in', description: 'CanIf 配置指针，包含所有 PDU 和控制器配置' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_Init 初始化 CAN 接口 */
#include "CanIf.h"

void CanIf_InitExample(void) {
    CanIf_Init(&CanIf_Config);
    /* CAN 接口已初始化，PDU 收发功能可用 */
}`,
    seeAlso: ['CanIf_DeInit', 'CanIf_GetVersionInfo', 'CanIf_Transmit'],
    configParams: [
      { paramName: 'CanIfConfig', configModule: 'CanIf', path: 'CanIf/CanIfConfig' },
    ],
    status: 'standard',
  },
  {
    id: 'CanIf_DeInit',
    name: 'CanIf_DeInit',
    signature: 'void CanIf_DeInit(void)',
    brief: '反初始化 CanIf 模块',
    description: '反初始化 CanIf 模块，释放所有内部资源。调用后 CanIf 恢复到未初始化状态，所有 PDU 收发功能不可用。',
    params: [],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_DeInit 关闭 CAN 接口 */
#include "CanIf.h"

void CanIf_Shutdown(void) {
    CanIf_DeInit();
    /* CAN 接口已关闭 */
}`,
    seeAlso: ['CanIf_Init'],
    status: 'standard',
  },
  {
    id: 'CanIf_GetVersionInfo',
    name: 'CanIf_GetVersionInfo',
    signature: 'void CanIf_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 CanIf 模块版本信息',
    description: '返回 CanIf 模块的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_GetVersionInfo 示例 */
#include "CanIf.h"

void CanIf_PrintVersion(void) {
    Std_VersionInfoType ver;
    CanIf_GetVersionInfo(&ver);
}`,
    seeAlso: [],
    status: 'standard',
  },
  {
    id: 'CanIf_SetBaudrate',
    name: 'CanIf_SetBaudrate',
    signature: 'Std_ReturnType CanIf_SetBaudrate(CanIf_ControllerRefType ControllerId, uint16 BaudRateConfigID)',
    brief: '设置 CAN 控制器波特率',
    description: '通过 CanIf 设置指定 CAN 控制器的通信波特率。CanIf 将请求转发到 Can 驱动层执行实际的波特率配置。',
    params: [
      { name: 'ControllerId', type: 'CanIf_ControllerRefType', direction: 'in', description: 'CAN 控制器引用 ID' },
      { name: 'BaudRateConfigID', type: 'uint16', direction: 'in', description: '波特率配置 ID' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 波特率设置成功；E_NOT_OK: 设置失败',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_SetBaudrate 设置波特率 */
#include "CanIf.h"

void CanIf_ChangeBaudrate(void) {
    Std_ReturnType ret = CanIf_SetBaudrate(CANIF_CONTROLLER_0, CANIF_BAUDRATE_250KBPS);
    if (ret == E_OK) {
        /* CAN 控制器波特率已切换 */
    }
}`,
    seeAlso: ['CanIf_Init', 'CanIf_Transmit'],
    status: 'optional',
  },
  {
    id: 'CanIf_Transmit',
    name: 'CanIf_Transmit',
    signature: 'Std_ReturnType CanIf_Transmit(uint32 CanTxPduId, const PduInfoType* PduInfoPtr)',
    brief: '发送 CAN PDU',
    description: '通过 CanIf 发送指定的 CAN PDU。CanIf 根据 PDU ID 查找对应的硬件句柄和控制器，调用 Can 驱动层发送。支持确认和取消操作。',
    params: [
      { name: 'CanTxPduId', type: 'uint32', direction: 'in', description: '发送 PDU ID，标识要发送的 CAN 消息' },
      { name: 'PduInfoPtr', type: 'const PduInfoType*', direction: 'in', description: 'PDU 数据指针，包含 SDU 数据、长度等' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 发送请求已提交；E_NOT_OK: 发送失败',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_Transmit 发送 CAN 消息 */
#include "CanIf.h"

void CanIf_SendMessage(void) {
    uint8 data[8] = {0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77};
    PduInfoType pduInfo = {
        .SduDataPtr = data,
        .SduLength = 8
    };

    Std_ReturnType ret = CanIf_Transmit(CANIF_PDU_TX_0, &pduInfo);
    if (ret == E_OK) {
        /* 发送请求已提交到 Can 驱动 */
    }
}`,
    exampleDescription: '通过 CanIf 发送 8 字节 CAN 消息',
    seeAlso: ['CanIf_CancelTransmit', 'CanIf_ReadRxPduData', 'CanIf_TxConfirmation'],
    status: 'standard',
  },
  {
    id: 'CanIf_CancelTransmit',
    name: 'CanIf_CancelTransmit',
    signature: 'Std_ReturnType CanIf_CancelTransmit(uint32 CanTxPduId)',
    brief: '取消 CAN PDU 发送请求',
    description: '取消之前提交的指定 CAN PDU 的发送请求。如果该 PDU 尚未被硬件发送，将取消发送队列中的请求。',
    params: [
      { name: 'CanTxPduId', type: 'uint32', direction: 'in', description: '要取消的发送 PDU ID' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 取消成功；E_NOT_OK: 取消失败或 PDU 已发送',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_CancelTransmit 取消发送 */
#include "CanIf.h"

void CanIf_AbortTx(void) {
    Std_ReturnType ret = CanIf_CancelTransmit(CANIF_PDU_TX_0);
    if (ret == E_OK) {
        /* 发送请求已取消 */
    }
}`,
    exampleDescription: '取消 PDU 发送请求',
    seeAlso: ['CanIf_Transmit'],
    status: 'optional',
  },
  {
    id: 'CanIf_ReadRxPduData',
    name: 'CanIf_ReadRxPduData',
    signature: 'Std_ReturnType CanIf_ReadRxPduData(uint32 CanRxPduId, PduInfoType* PduInfoPtr)',
    brief: '读取接收到的 CAN PDU 数据',
    description: '从 CanIf 接收缓冲区读取指定接收 PDU 的最新数据。通常由上层模块（如 Com、PduR）在接收到 RxIndication 后调用。',
    params: [
      { name: 'CanRxPduId', type: 'uint32', direction: 'in', description: '接收 PDU ID' },
      { name: 'PduInfoPtr', type: 'PduInfoType*', direction: 'out', description: 'PDU 数据输出缓冲区' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 读取成功；E_NOT_OK: PDU ID 无效或无数据',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_ReadRxPduData 读取接收数据 */
#include "CanIf.h"

void CanIf_ReadReceivedData(void) {
    uint8 rxBuffer[64];
    PduInfoType pduInfo = {
        .SduDataPtr = rxBuffer,
        .SduLength = 64
    };

    Std_ReturnType ret = CanIf_ReadRxPduData(CANIF_PDU_RX_0, &pduInfo);
    if (ret == E_OK) {
        /* pduInfo.SduDataPtr 包含接收数据，SduLength 为实际数据长度 */
    }
}`,
    exampleDescription: '从 CanIf 接收缓冲区读取 CAN 数据',
    seeAlso: ['CanIf_Transmit', 'CanIf_RxIndication'],
    status: 'standard',
  },
  {
    id: 'CanIf_SetPduMode',
    name: 'CanIf_SetPduMode',
    signature: 'Std_ReturnType CanIf_SetPduMode(uint32 CanPduId, CanIf_PduModeType PduMode)',
    brief: '设置 PDU 通信模式',
    description: '设置指定 PDU 的通信模式，支持 CANIF_OFFLINE（离线）、CANIF_TX_ONLY（只发）、CANIF_RX_ONLY（只收）、CANIF_ONLINE（在线）等模式。',
    params: [
      { name: 'CanPduId', type: 'uint32', direction: 'in', description: 'PDU ID' },
      { name: 'PduMode', type: 'CanIf_PduModeType', direction: 'in', description: '目标 PDU 模式' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 设置成功；E_NOT_OK: PDU ID 无效',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_SetPduMode 设置 PDU 为只发送模式 */
#include "CanIf.h"

void CanIf_SetTxOnly(void) {
    Std_ReturnType ret = CanIf_SetPduMode(CANIF_PDU_TX_0, CANIF_TX_ONLY);
    if (ret == E_OK) {
        /* PDU 已设为只发送模式 */
    }
}`,
    exampleDescription: '将指定 PDU 设为仅发送模式',
    seeAlso: ['CanIf_GetPduMode', 'CanIf_Transmit'],
    status: 'standard',
  },
  {
    id: 'CanIf_GetPduMode',
    name: 'CanIf_GetPduMode',
    signature: 'CanIf_PduModeType CanIf_GetPduMode(uint32 CanPduId)',
    brief: '获取指定 PDU 的当前通信模式',
    description: '返回指定 PDU 的当前通信模式设置，用于运行时查询 PDU 的通信状态。',
    params: [
      { name: 'CanPduId', type: 'uint32', direction: 'in', description: 'PDU ID' },
    ],
    returnType: 'CanIf_PduModeType',
    returnDescription: '当前 PDU 通信模式',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_GetPduMode 查询 PDU 模式 */
#include "CanIf.h"

void CanIf_CheckPduMode(void) {
    CanIf_PduModeType mode = CanIf_GetPduMode(CANIF_PDU_TX_0);
    if (mode == CANIF_ONLINE) {
        /* PDU 处于在线模式，可正常通信 */
    }
}`,
    exampleDescription: '查询 PDU 当前是否在线',
    seeAlso: ['CanIf_SetPduMode'],
    status: 'standard',
  },
  {
    id: 'CanIf_TxConfirmation',
    name: 'CanIf_TxConfirmation',
    signature: 'void CanIf_TxConfirmation(uint32 CanTxPduId, Std_ReturnType Result)',
    brief: '发送确认回调函数',
    description: 'Can 驱动在 CAN 消息发送完成后调用的回调函数。CanIf 根据结果通知上层模块（如 Com、PduR）发送完成状态。',
    params: [
      { name: 'CanTxPduId', type: 'uint32', direction: 'in', description: '已发送的 PDU ID' },
      { name: 'Result', type: 'Std_ReturnType', direction: 'in', description: '发送结果：E_OK 表示成功，E_NOT_OK 表示失败' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_TxConfirmation 发送确认回调 */
#include "CanIf.h"

/* Can 驱动发送完成后的回调 */
void Can_Driver_TxDone(uint32 CanTxPduId, Std_ReturnType result) {
    /* CanIf 将通知上层模块 */
    CanIf_TxConfirmation(CanTxPduId, result);
}`,
    exampleDescription: 'Can 驱动发送完成时调用 CanIf 确认',
    seeAlso: ['CanIf_Transmit', 'CanIf_RxIndication'],
    status: 'standard',
  },
  {
    id: 'CanIf_RxIndication',
    name: 'CanIf_RxIndication',
    signature: 'void CanIf_RxIndication(uint32 CanRxPduId, const PduInfoType* PduInfoPtr)',
    brief: '接收指示回调函数',
    description: 'Can 驱动在接收到 CAN 消息后调用的回调函数。CanIf 将接收到的 PDU 路由到上层模块（如 Com、PduR）进行处理。',
    params: [
      { name: 'CanRxPduId', type: 'uint32', direction: 'in', description: '接收到的 PDU ID' },
      { name: 'PduInfoPtr', type: 'const PduInfoType*', direction: 'in', description: '接收到的 PDU 数据指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_RxIndication 接收指示回调 */
#include "CanIf.h"

/* Can 驱动接收完成后的回调 */
void Can_Driver_RxDone(uint32 CanRxPduId, const PduInfoType* pduInfo) {
    /* CanIf 将接收到的数据路由到上层模块 */
    CanIf_RxIndication(CanRxPduId, pduInfo);
}`,
    exampleDescription: 'Can 驱动接收完成时调用 CanIf 指示',
    seeAlso: ['CanIf_ReadRxPduData', 'CanIf_TxConfirmation', 'CanIf_ControllerModeIndication'],
    status: 'standard',
  },
  {
    id: 'CanIf_ControllerModeIndication',
    name: 'CanIf_ControllerModeIndication',
    signature: 'void CanIf_ControllerModeIndication(CanIf_ControllerRefType ControllerId, Can_ControllerStateType ControllerState)',
    brief: '控制器模式改变指示回调',
    description: 'Can 驱动在 CAN 控制器状态改变时调用的回调函数。通知 CanIf 控制器进入 STARTED、STOPPED 或 SLEEP 等模式。',
    params: [
      { name: 'ControllerId', type: 'CanIf_ControllerRefType', direction: 'in', description: 'CAN 控制器引用 ID' },
      { name: 'ControllerState', type: 'Can_ControllerStateType', direction: 'in', description: '控制器新状态' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'CanIf',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* CanIf_ControllerModeIndication 控制器状态回调 */
#include "CanIf.h"

/* Can 驱动报告控制器状态变化 */
void Can_Driver_StateChange(CanIf_ControllerRefType ctrlId, Can_ControllerStateType state) {
    CanIf_ControllerModeIndication(ctrlId, state);

    if (state == CAN_CS_STARTED) {
        /* 控制器已启动，可以通信 */
    } else if (state == CAN_CS_SLEEP) {
        /* 控制器已进入睡眠 */
    }
}`,
    exampleDescription: 'CAN 控制器状态变化时通知 CanIf',
    seeAlso: ['CanIf_TxConfirmation', 'CanIf_RxIndication', 'CanIf_SetPduMode'],
    status: 'standard',
  },
];

import type { AutosarApi } from './types';

export const PDUR_APIS: AutosarApi[] = [
  {
    id: 'PduR_Init',
    name: 'PduR_Init',
    signature: 'void PduR_Init(const PduR_ConfigType* ConfigPtr)',
    brief: '初始化 PduR 模块',
    description: '初始化 PduR 模块，加载 PDU 路由表配置。必须在任何 PDU 路由操作之前调用，且只能调用一次。配置包含所有源-目的 PDU 路由路径。',
    params: [
      { name: 'ConfigPtr', type: 'const PduR_ConfigType*', direction: 'in', description: 'PduR 配置指针，包含路由表、PDU 映射等配置' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_Init 初始化 PDU 路由器 */
#include "PduR.h"

void PduR_InitExample(void) {
    PduR_Init(&PduR_Config);
    /* 路由表已加载，PDU 路由功能可用 */
}`,
    seeAlso: ['PduR_GetVersionInfo', 'PduR_RoutePdu'],
    configParams: [
      { paramName: 'PduRConfig', configModule: 'PduR', path: 'PduR/PduRConfig' },
    ],
    status: 'standard',
  },
  {
    id: 'PduR_GetVersionInfo',
    name: 'PduR_GetVersionInfo',
    signature: 'void PduR_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 PduR 模块版本信息',
    description: '返回 PduR 模块的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_GetVersionInfo 示例 */
#include "PduR.h"

void PduR_PrintVersion(void) {
    Std_VersionInfoType ver;
    PduR_GetVersionInfo(&ver);
}`,
    seeAlso: ['PduR_Init'],
    status: 'standard',
  },
  {
    id: 'PduR_GetSourcePduHandle',
    name: 'PduR_GetSourcePduHandle',
    signature: 'PduR_PBConfigIdType PduR_GetSourcePduHandle(const PduR_ConfigType* ConfigPtr)',
    brief: '获取源 PDU 句柄',
    description: '从 PduR 配置中获取源 PDU 的配置句柄。句柄用于识别路由表中的源 PDU，配合路由操作使用。',
    params: [
      { name: 'ConfigPtr', type: 'const PduR_ConfigType*', direction: 'in', description: 'PduR 配置指针' },
    ],
    returnType: 'PduR_PBConfigIdType',
    returnDescription: '源 PDU 配置句柄 ID',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_GetSourcePduHandle 获取源句柄 */
#include "PduR.h"

void PduR_GetSrcHandle(void) {
    PduR_PBConfigIdType handle = PduR_GetSourcePduHandle(&PduR_Config);
    /* handle 可用于后续路由查询 */
}`,
    seeAlso: ['PduR_GetDestPduHandle', 'PduR_RoutePdu'],
    status: 'standard',
  },
  {
    id: 'PduR_RoutePdu',
    name: 'PduR_RoutePdu',
    signature: 'Std_ReturnType PduR_RoutePdu(PduR_SourcePduIdType SrcPduHandleId, const PduInfoType* PduInfoPtr)',
    brief: '路由 PDU 到目标模块',
    description: '根据源 PDU ID 查找路由表，将 PDU 数据路由到一个或多个目标模块。支持一对一、一对多路由以及网关转发场景。',
    params: [
      { name: 'SrcPduHandleId', type: 'PduR_SourcePduIdType', direction: 'in', description: '源 PDU 句柄 ID' },
      { name: 'PduInfoPtr', type: 'const PduInfoType*', direction: 'in', description: 'PDU 数据指针，包含 SDU 数据、长度和信息' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 路由成功；E_NOT_OK: 路由失败或无目标',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_RoutePdu 路由 CAN 消息到 Com */
#include "PduR.h"

void PduR_ForwardCanMsg(void) {
    uint8 data[8] = {0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08};
    PduInfoType pduInfo = {
        .SduDataPtr = data,
        .SduLength = 8
    };

    Std_ReturnType ret = PduR_RoutePdu(PDUR_SOURCE_PDU_CAN_0, &pduInfo);
    if (ret == E_OK) {
        /* PDU 已路由到目标模块 */
    }
}`,
    exampleDescription: '将 CAN 接收到的 PDU 路由到 Com 模块',
    seeAlso: ['PduR_TriggerTransmit', 'PduR_GetSourcePduHandle'],
    status: 'standard',
  },
  {
    id: 'PduR_GetDestPduHandle',
    name: 'PduR_GetDestPduHandle',
    signature: 'PduR_PBConfigIdType PduR_GetDestPduHandle(const PduR_ConfigType* ConfigPtr)',
    brief: '获取目的 PDU 句柄',
    description: '从 PduR 配置中获取目的 PDU 的配置句柄。用于在运行时查询特定目的 PDU 的配置标识。',
    params: [
      { name: 'ConfigPtr', type: 'const PduR_ConfigType*', direction: 'in', description: 'PduR 配置指针' },
    ],
    returnType: 'PduR_PBConfigIdType',
    returnDescription: '目的 PDU 配置句柄 ID',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_GetDestPduHandle 获取目的句柄 */
#include "PduR.h"

void PduR_GetDestHandle(void) {
    PduR_PBConfigIdType handle = PduR_GetDestPduHandle(&PduR_Config);
    /* handle 标识目的 PDU */
}`,
    seeAlso: ['PduR_GetSourcePduHandle', 'PduR_RoutePdu'],
    status: 'standard',
  },
  {
    id: 'PduR_SetPduRoutingConfiguration',
    name: 'PduR_SetPduRoutingConfiguration',
    signature: 'Std_ReturnType PduR_SetPduRoutingConfiguration(PduR_RoutingConfigurationType RoutingConfig)',
    brief: '动态设置 PDU 路由配置',
    description: '在运行时动态更改 PDU 路由配置。允许切换不同的路由表配置，适用于需要运行时重路由的场景。',
    params: [
      { name: 'RoutingConfig', type: 'PduR_RoutingConfigurationType', direction: 'in', description: '新的路由配置 ID' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 配置切换成功；E_NOT_OK: 配置无效',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_SetPduRoutingConfiguration 切换路由配置 */
#include "PduR.h"

void PduR_SwitchRoutingConfig(void) {
    Std_ReturnType ret = PduR_SetPduRoutingConfiguration(PDUR_ROUTING_CFG_1);
    if (ret == E_OK) {
        /* 路由配置已切换 */
    }
}`,
    seeAlso: ['PduR_GetRoutingConfiguration', 'PduR_EnableRouting'],
    status: 'optional',
  },
  {
    id: 'PduR_GetRoutingConfiguration',
    name: 'PduR_GetRoutingConfiguration',
    signature: 'PduR_RoutingConfigurationType PduR_GetRoutingConfiguration(void)',
    brief: '获取当前路由配置',
    description: '返回当前生效的 PDU 路由配置 ID。用于在运行时查询当前路由策略。',
    params: [],
    returnType: 'PduR_RoutingConfigurationType',
    returnDescription: '当前路由配置 ID',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_GetRoutingConfiguration 查询当前配置 */
#include "PduR.h"

void PduR_CheckRoutingCfg(void) {
    PduR_RoutingConfigurationType cfg = PduR_GetRoutingConfiguration();
    if (cfg == PDUR_ROUTING_CFG_0) {
        /* 默认路由配置 */
    }
}`,
    seeAlso: ['PduR_SetPduRoutingConfiguration'],
    status: 'standard',
  },
  {
    id: 'PduR_EnableRouting',
    name: 'PduR_EnableRouting',
    signature: 'Std_ReturnType PduR_EnableRouting(void)',
    brief: '启用 PDU 路由功能',
    description: '启用 PDU 路由功能。在 PduR_Init 后默认启用，但通过此函数可以从禁用状态恢复路由功能。',
    params: [],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 路由已启用；E_NOT_OK: 启用失败',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_EnableRouting 启用路由 */
#include "PduR.h"

void PduR_ResumeRouting(void) {
    Std_ReturnType ret = PduR_EnableRouting();
    if (ret == E_OK) {
        /* PDU 路由功能已恢复 */
    }
}`,
    exampleDescription: '从禁用状态恢复 PDU 路由功能',
    seeAlso: ['PduR_DisableRouting', 'PduR_RoutePdu'],
    status: 'standard',
  },
  {
    id: 'PduR_DisableRouting',
    name: 'PduR_DisableRouting',
    signature: 'Std_ReturnType PduR_DisableRouting(void)',
    brief: '禁用 PDU 路由功能',
    description: '禁用 PDU 路由功能。禁用后所有 PduR_RoutePdu 调用将返回 E_NOT_OK。用于安全模式或诊断模式下的通信隔离。',
    params: [],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 路由已禁用；E_NOT_OK: 禁用失败',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_DisableRouting 禁用路由 */
#include "PduR.h"

void PduR_StopRouting(void) {
    Std_ReturnType ret = PduR_DisableRouting();
    if (ret == E_OK) {
        /* PDU 路由已禁用，实现通信隔离 */
    }
}`,
    exampleDescription: '禁用 PDU 路由实现通信隔离',
    seeAlso: ['PduR_EnableRouting', 'PduR_RoutePdu'],
    status: 'standard',
  },
  {
    id: 'PduR_TriggerTransmit',
    name: 'PduR_TriggerTransmit',
    signature: 'Std_ReturnType PduR_TriggerTransmit(PduR_SourcePduIdType SrcPduHandleId, PduInfoType* PduInfoPtr)',
    brief: '触发 PDU 发送',
    description: '触发指定源 PDU 的发送请求。PduR 会调用下层（如 CanIf、LinIf）的发送接口，并将结果返回。用于上层模块通过 PduR 发起发送。',
    params: [
      { name: 'SrcPduHandleId', type: 'PduR_SourcePduIdType', direction: 'in', description: '源 PDU 句柄 ID' },
      { name: 'PduInfoPtr', type: 'PduInfoType*', direction: 'inout', description: 'PDU 数据指针，函数返回时可能包含发送状态信息' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 发送已触发；E_NOT_OK: 触发失败',
    moduleId: 'PduR',
    layerId: 'ECUAL',
    version: '4.4',
    example: `/* PduR_TriggerTransmit 触发发送 */
#include "PduR.h"

void PduR_TriggerCanTx(void) {
    uint8 data[8] = {0};
    PduInfoType pduInfo = {
        .SduDataPtr = data,
        .SduLength = 8
    };

    Std_ReturnType ret = PduR_TriggerTransmit(PDUR_SOURCE_PDU_COM_0, &pduInfo);
    if (ret == E_OK) {
        /* 发送已通过 PduR 触发到下层接口 */
    }
}`,
    exampleDescription: '触发 Com 模块的 PDU 通过 CanIf 发送',
    seeAlso: ['PduR_RoutePdu', 'CanIf_Transmit'],
    status: 'standard',
  },
];

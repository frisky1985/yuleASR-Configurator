import type { AutosarApi } from './types';

export const RTE_APIS: AutosarApi[] = [
  {
    id: 'Rte_Start',
    name: 'Rte_Start',
    signature: 'void Rte_Start(void)',
    brief: '启动 RTE 运行环境',
    description: '初始化并启动 RTE 运行环境。在 RTE 生成的应用代码调用任何 RTE API 之前必须调用此函数。Rte_Start 会初始化 RTE 内部数据结构并启动所有配置的定时任务。',
    params: [],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_Start 启动运行时环境 */
#include "Rte.h"

void main(void) {
    /* 初始化 BSW 模块 */
    EcuM_Init();

    /* 启动 RTE 运行环境 */
    Rte_Start();

    /* RTE 已启动，应用组件可以开始通信 */
}`,
    seeAlso: ['Rte_Stop', 'Rte_GetVersionInfo'],
    configParams: [
      { paramName: 'RteConfig', configModule: 'Rte', path: 'Rte/RteConfig' },
    ],
    status: 'standard',
  },
  {
    id: 'Rte_Stop',
    name: 'Rte_Stop',
    signature: 'void Rte_Stop(void)',
    brief: '停止 RTE 运行环境',
    description: '停止 RTE 运行环境并释放所有内部资源。在系统关闭流程中调用，确保所有挂起的通信和数据写操作完成。',
    params: [],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_Stop 停止运行时环境 */
#include "Rte.h"

void ShutdownSequence(void) {
    /* 停止 RTE 运行环境 */
    Rte_Stop();

    /* RTE 已停止，可安全关闭系统 */
}`,
    seeAlso: ['Rte_Start'],
    status: 'standard',
  },
  {
    id: 'Rte_GetVersionInfo',
    name: 'Rte_GetVersionInfo',
    signature: 'void Rte_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 RTE 模块版本信息',
    description: '返回 RTE 运行环境的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_GetVersionInfo 示例 */
#include "Rte.h"

void Rte_PrintVersion(void) {
    Std_VersionInfoType ver;
    Rte_GetVersionInfo(&ver);
}`,
    seeAlso: [],
    status: 'standard',
  },
  {
    id: 'Rte_WriteVariable',
    name: 'Rte_WriteVariable',
    signature: 'Std_ReturnType Rte_WriteVariable(Rte_VariableRef Variable, const void* Data)',
    brief: '写入组件间变量',
    description: '将数据写入指定的组件间变量。Sender-Receiver 通信模式中的发送端使用此函数来更新变量值，供接收端组件读取。',
    params: [
      { name: 'Variable', type: 'Rte_VariableRef', direction: 'in', description: '变量引用，标识目标变量' },
      { name: 'Data', type: 'const void*', direction: 'in', description: '待写入的数据指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 写入成功；E_NOT_OK: 写入失败',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_WriteVariable 写入组件变量 */
#include "Rte.h"

void App_UpdateSpeed(void) {
    uint8 currentSpeed = 100;
    Std_ReturnType ret = Rte_WriteVariable(RTE_VAR_VEHICLE_SPEED, &currentSpeed);
    if (ret == E_OK) {
        /* 车速变量已更新，接收端组件可读取 */
    }
}`,
    exampleDescription: '应用组件更新车速变量供其他组件读取',
    seeAlso: ['Rte_ReadVariable', 'Rte_SendSignal', 'Rte_IRvSend'],
    status: 'standard',
  },
  {
    id: 'Rte_ReadVariable',
    name: 'Rte_ReadVariable',
    signature: 'Std_ReturnType Rte_ReadVariable(Rte_VariableRef Variable, void* Data)',
    brief: '读取组件间变量',
    description: '从指定的组件间变量读取数据。Sender-Receiver 通信模式中的接收端使用此函数获取其他组件写入的变量值。',
    params: [
      { name: 'Variable', type: 'Rte_VariableRef', direction: 'in', description: '变量引用，标识要读取的变量' },
      { name: 'Data', type: 'void*', direction: 'out', description: '数据输出缓冲区指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 读取成功；E_NOT_OK: 读取失败或变量未初始化',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_ReadVariable 读取组件变量 */
#include "Rte.h"

void App_DisplaySpeed(void) {
    uint8 currentSpeed = 0;
    Std_ReturnType ret = Rte_ReadVariable(RTE_VAR_VEHICLE_SPEED, &currentSpeed);
    if (ret == E_OK) {
        /* currentSpeed 包含其他组件写入的车速值 */
    }
}`,
    exampleDescription: '应用组件读取车速变量进行显示',
    seeAlso: ['Rte_WriteVariable', 'Rte_ReceiveSignal', 'Rte_IRvReceive'],
    status: 'standard',
  },
  {
    id: 'Rte_SendSignal',
    name: 'Rte_SendSignal',
    signature: 'Std_ReturnType Rte_SendSignal(Rte_SignalRef Signal, const void* Data)',
    brief: '发送 RTE 信号',
    description: '将数据作为信号发送到 RTE 信号链。RTE 信号是一种与通信总线信号直接关联的跨 ECU 数据传输机制，数据通过 RTE 路由到通信栈。',
    params: [
      { name: 'Signal', type: 'Rte_SignalRef', direction: 'in', description: '信号引用，标识要发送的信号' },
      { name: 'Data', type: 'const void*', direction: 'in', description: '信号数据指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 发送成功；E_NOT_OK: 发送失败',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_SendSignal 发送跨 ECU 信号 */
#include "Rte.h"

void App_SendDoorStatus(void) {
    uint8 doorStatus = 0x01; /* 车门已锁 */
    Std_ReturnType ret = Rte_SendSignal(RTE_SIG_DOOR_LOCK_STATUS, &doorStatus);
    if (ret == E_OK) {
        /* 信号通过 RTE 路由到底层通信栈发送 */
    }
}`,
    exampleDescription: '应用组件发送车门锁状态信号到总线',
    seeAlso: ['Rte_ReceiveSignal', 'Rte_WriteVariable', 'Rte_CallOperation'],
    status: 'standard',
  },
  {
    id: 'Rte_ReceiveSignal',
    name: 'Rte_ReceiveSignal',
    signature: 'Std_ReturnType Rte_ReceiveSignal(Rte_SignalRef Signal, void* Data)',
    brief: '接收 RTE 信号',
    description: '从 RTE 信号链接收信号数据。接收从其他 ECU 发送的、经过通信栈解码后到达 RTE 的信号数据。',
    params: [
      { name: 'Signal', type: 'Rte_SignalRef', direction: 'in', description: '信号引用，标识要接收的信号' },
      { name: 'Data', type: 'void*', direction: 'out', description: '信号数据输出缓冲区' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 接收成功；E_NOT_OK: 接收失败或无新数据',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_ReceiveSignal 接收跨 ECU 信号 */
#include "Rte.h"

void App_ReadDoorStatus(void) {
    uint8 doorStatus = 0;
    Std_ReturnType ret = Rte_ReceiveSignal(RTE_SIG_DOOR_LOCK_STATUS, &doorStatus);
    if (ret == E_OK) {
        /* doorStatus 包含从其他 ECU 接收的门锁状态 */
    }
}`,
    exampleDescription: '应用组件接收车门锁状态信号',
    seeAlso: ['Rte_SendSignal', 'Rte_ReadVariable', 'Rte_IRvReceive'],
    status: 'standard',
  },
  {
    id: 'Rte_CallOperation',
    name: 'Rte_CallOperation',
    signature: 'Std_ReturnType Rte_CallOperation(Rte_OperationRef Operation, void* Result, const void* Args)',
    brief: '调用组件间操作',
    description: '通过 RTE 调用另一组件提供的可运行操作（Client-Server 通信）。支持同步和异步调用模式，异步调用通过回调返回结果。',
    params: [
      { name: 'Operation', type: 'Rte_OperationRef', direction: 'in', description: '操作引用，标识要调用的远端操作' },
      { name: 'Result', type: 'void*', direction: 'out', description: '操作返回值缓冲区' },
      { name: 'Args', type: 'const void*', direction: 'in', description: '操作参数指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 调用成功；E_NOT_OK: 调用失败',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_CallOperation 调用远程操作 */
#include "Rte.h"

typedef struct {
    uint8 inputParam;
} OperationArgs;

typedef struct {
    uint16 outputValue;
} OperationResult;

void App_RequestCalculation(void) {
    OperationArgs args = { .inputParam = 42 };
    OperationResult result;

    Std_ReturnType ret = Rte_CallOperation(RTE_OP_CALCULATE_VALUE, &result, &args);
    if (ret == E_OK) {
        /* result.outputValue 包含计算结果 */
    }
}`,
    exampleDescription: '调用其他组件的计算操作获取结果',
    seeAlso: ['Rte_SendSignal', 'Rte_WriteVariable'],
    status: 'standard',
  },
  {
    id: 'Rte_IRvSend',
    name: 'Rte_IRvSend',
    signature: 'Std_ReturnType Rte_IRvSend(Rte_IRvRef IRvRef, const void* Data)',
    brief: '发送运行时不变数据',
    description: '发送运行时不变（IRv）数据。IRv 数据在运行期间保持恒定，此操作用于在配置阶段或初始化时将静态数据分发给其他组件。',
    params: [
      { name: 'IRvRef', type: 'Rte_IRvRef', direction: 'in', description: 'IRv 数据引用' },
      { name: 'Data', type: 'const void*', direction: 'in', description: '运行时不变数据指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 发送成功；E_NOT_OK: 发送失败',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_IRvSend 发送运行时不变数据 */
#include "Rte.h"

typedef struct {
    uint16 maxSpeed;
    uint16 maxRpm;
    uint8  engineType;
} VehicleParams;

void App_SendVehicleParams(void) {
    const VehicleParams params = {
        .maxSpeed = 250,
        .maxRpm = 8000,
        .engineType = 0x01
    };

    Std_ReturnType ret = Rte_IRvSend(RTE_IRV_VEHICLE_PARAMS, &params);
    if (ret == E_OK) {
        /* 不变数据已分发 */
    }
}`,
    exampleDescription: '分发电控单元参数运行时不变数据',
    seeAlso: ['Rte_IRvReceive', 'Rte_SendSignal', 'Rte_WriteVariable'],
    status: 'standard',
  },
  {
    id: 'Rte_IRvReceive',
    name: 'Rte_IRvReceive',
    signature: 'Std_ReturnType Rte_IRvReceive(Rte_IRvRef IRvRef, void* Data)',
    brief: '接收运行时不变数据',
    description: '从 RTE 接收运行时不变（IRv）数据。接收其他组件在初始化阶段发送的静态配置数据，在运行期间保持不变。',
    params: [
      { name: 'IRvRef', type: 'Rte_IRvRef', direction: 'in', description: 'IRv 数据引用' },
      { name: 'Data', type: 'void*', direction: 'out', description: 'IRv 数据输出缓冲区' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 接收成功；E_NOT_OK: 接收失败',
    moduleId: 'Rte',
    layerId: 'RTE_ASW',
    version: '4.4',
    example: `/* Rte_IRvReceive 接收运行时不变数据 */
#include "Rte.h"

typedef struct {
    uint16 maxSpeed;
    uint16 maxRpm;
    uint8  engineType;
} VehicleParams;

void App_LoadVehicleParams(void) {
    VehicleParams params;
    Std_ReturnType ret = Rte_IRvReceive(RTE_IRV_VEHICLE_PARAMS, &params);
    if (ret == E_OK) {
        /* params 包含电控单元参数 */
    }
}`,
    exampleDescription: '读取电控单元运行时不变数据',
    seeAlso: ['Rte_IRvSend', 'Rte_ReadVariable', 'Rte_ReceiveSignal'],
    status: 'standard',
  },
];

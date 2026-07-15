import type { AutosarApi } from './types';

export const CAN_APIS: AutosarApi[] = [
  {
    id: 'Can_Init',
    name: 'Can_Init',
    signature: 'Std_ReturnType Can_Init(const Can_ConfigType* Config)',
    brief: '初始化 CAN 控制器和所有相关配置',
    description: '该函数初始化 CAN 控制器模块，包括 CAN 控制器的选择、波特率、唤醒方式、接收 ID 过滤规则等。必须在任何其他 CAN 操作之前调用。',
    params: [
      { name: 'Config', type: 'const Can_ConfigType*', direction: 'in', description: 'CAN 配置结构体指针，包含控制器和硬件对象配置' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 初始化成功；E_NOT_OK: 初始化失败',
    moduleId: 'Can',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Can_Init 初始化 CAN 控制器 */
#include "Can.h"

const Can_ConfigType CanConfig = {
    .CanController = {
        .CanControllerId = 0,
        .CanControllerBaudrate = 500000,
        .CanControllerWakeupSource = CAN_WAKEUP_SOURCE_INTERNAL
    }
};

void Can_InitExample(void) {
    Std_ReturnType ret = Can_Init(&CanConfig);
    if (ret == E_OK) {
        /* CAN 初始化成功，可以发送/接收消息 */
    }
}`,
    exampleDescription: '初始化一个波特率为 500kbps 的 CAN 控制器',
    seeAlso: ['Can_Write', 'Can_Read', 'Can_SetBaudrate'],
    configParams: [
      { paramName: 'CanGeneral', configModule: 'Can', path: 'Can/CanGeneral' },
      { paramName: 'CanConfigSet', configModule: 'Can', path: 'Can/CanConfigSet' },
    ],
    status: 'standard',
  },
  {
    id: 'Can_Write',
    name: 'Can_Write',
    signature: 'Std_ReturnType Can_Write(Can_HwHandleType Hth, const Can_PduType* PduInfo)',
    brief: '发送 CAN 消息到总线',
    description: '将给定的 CAN 消息（包含 ID、DLC、数据）发送到指定硬件句柄对应的 CAN 控制器。支持标准帧（11-bit ID）和扩展帧（29-bit ID）格式。',
    params: [
      { name: 'Hth', type: 'Can_HwHandleType', direction: 'in', description: 'CAN 硬件发送句柄，指定发送控制器' },
      { name: 'PduInfo', type: 'const Can_PduType*', direction: 'in', description: 'CAN 消息结构体，包含 ID、长度、数据载荷' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 发送请求已提交；E_NOT_OK: 发送失败',
    moduleId: 'Can',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Can_Write 发送标准帧示例 */
#include "Can.h"

void Can_WriteExample(void) {
    uint8 data[8] = {0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08};
    Can_PduType pdu = {
        .id = 0x123,           /* 标准 11-bit ID */
        .length = 8,
        .sdu = data,
        .swPduHandle = NULL
    };
    Can_Write(CAN_HTH_0, &pdu);
}`,
    exampleDescription: '发送一个 8 字节的标准帧 CAN 消息',
    seeAlso: ['Can_Init', 'Can_Read', 'Can_SetBaudrate'],
    status: 'standard',
  },
  {
    id: 'Can_Read',
    name: 'Can_Read',
    signature: 'void Can_Read(Can_HwHandleType Hrh, Can_PduType* PduInfo)',
    brief: '读取接收到的 CAN 消息',
    description: '从接收缓冲器中读取已接收的 CAN 消息内容。通常从中断服务程序或轮询任务中调用。接收到的数据通过 PduInfo 指针返回。',
    params: [
      { name: 'Hrh', type: 'Can_HwHandleType', direction: 'in', description: 'CAN 硬件接收句柄' },
      { name: 'PduInfo', type: 'Can_PduType*', direction: 'out', description: '输出缓冲区，存放接收到的 CAN 消息' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，数据通过 PduInfo 指针返回',
    moduleId: 'Can',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Can_Read 中断方式接收示例 */
#include "Can.h"

void Can_IrqHandler(void) {
    Can_PduType receivedPdu;
    Can_Read(CAN_HRH_0, &receivedPdu);

    if (receivedPdu.id == 0x123) {
        /* 处理匹配 ID 的数据 */
    }
}`,
    seeAlso: ['Can_Init', 'Can_Write', 'Can_SetBaudrate'],
    status: 'standard',
  },
  {
    id: 'Can_SetBaudrate',
    name: 'Can_SetBaudrate',
    signature: 'Std_ReturnType Can_SetBaudrate(Can_HwHandleType Hth, uint16 BaudRateConfigID)',
    brief: '动态设置 CAN 控制器波特率',
    description: '在运行时动态改变指定 CAN 控制器的通信波特率。波特率配置 ID 必须在配置阶段预定义。',
    params: [
      { name: 'Hth', type: 'Can_HwHandleType', direction: 'in', description: 'CAN 硬件句柄' },
      { name: 'BaudRateConfigID', type: 'uint16', direction: 'in', description: '波特率配置标识符，引用预定义的波特率配置' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 波特率设置成功；E_NOT_OK: 设置失败或无效 ID',
    moduleId: 'Can',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Can_SetBaudrate 切换波特率 */
#include "Can.h"

void Can_SwitchBaudrate(void) {
    Std_ReturnType ret = Can_SetBaudrate(CAN_HTH_0, CAN_BAUDRATE_250KBPS);
    if (ret != E_OK) {
        /* 波特率切换失败处理 */
    }
}`,
    seeAlso: ['Can_Init', 'Can_Write', 'Can_Read'],
    status: 'optional',
    timing: '执行时间取决于硬件 PLL 重新锁定时间',
  },
  {
    id: 'Can_GetVersionInfo',
    name: 'Can_GetVersionInfo',
    signature: 'void Can_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 CAN 驱动模块版本信息',
    description: '返回 CAN 驱动模块的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'Can',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Can_GetVersionInfo 示例 */
#include "Can.h"

void Can_PrintVersion(void) {
    Std_VersionInfoType ver;
    Can_GetVersionInfo(&ver);
}`,
    seeAlso: [],
    status: 'standard',
  },
  {
    id: 'Can_CheckWakeup',
    name: 'Can_CheckWakeup',
    signature: 'Std_ReturnType Can_CheckWakeup(EcuM_WakeupSourceType WakeupSource)',
    brief: '检查 CAN 是否检测到唤醒事件',
    description: '检查 CAN 控制器在当前唤醒源下是否检测到总线活动。用于 EcuM 的唤醒验证流程。',
    params: [
      { name: 'WakeupSource', type: 'EcuM_WakeupSourceType', direction: 'in', description: '唤醒源类型' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 检测到唤醒；E_NOT_OK: 未检测到唤醒',
    moduleId: 'Can',
    layerId: 'MCAL',
    version: '4.4',
    seeAlso: ['Can_Init'],
    status: 'standard',
    example: `/* Can_CheckWakeup 唤醒检查示例 */
#include "Can.h"

void Can_WakeupCheck(void) {
    Std_ReturnType ret = Can_CheckWakeup(ECUM_WAKEUP_SOURCE_CAN);
    if (ret == E_OK) {
        /* CAN 总线有活动，系统已唤醒 */
    }
}`,
  },
];

import type { AutosarApi } from './types';

export const DIO_APIS: AutosarApi[] = [
  {
    id: 'Dio_ReadChannel',
    name: 'Dio_ReadChannel',
    signature: 'Dio_LevelType Dio_ReadChannel(Dio_ChannelType ChannelId)',
    brief: '读取指定 DIO 通道的电平状态',
    description: '返回指定 DIO 通道的当前电平状态。该函数直接读取 GPIO 输入寄存器，具有极低的调用开销，适用于时序敏感的应用场景。',
    params: [
      { name: 'ChannelId', type: 'Dio_ChannelType', direction: 'in', description: 'DIO 通道标识符，标识要读取的引脚' },
    ],
    returnType: 'Dio_LevelType',
    returnDescription: 'STD_HIGH: 高电平；STD_LOW: 低电平',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_ReadChannel 读取按键状态 */
#include "Dio.h"

void Dio_ReadButton(void) {
    Dio_LevelType level;

    /* 读取按键引脚电平 */
    level = Dio_ReadChannel(BUTTON_START_CHANNEL);

    if (level == STD_HIGH) {
        /* 按键按下 */
    } else {
        /* 按键释放 */
    }
}`,
    exampleDescription: '读取按键引脚电平判断按键状态',
    seeAlso: ['Dio_WriteChannel', 'Dio_FlipChannel', 'Dio_ReadPort'],
    status: 'standard',
  },
  {
    id: 'Dio_WriteChannel',
    name: 'Dio_WriteChannel',
    signature: 'void Dio_WriteChannel(Dio_ChannelType ChannelId, Dio_LevelType Level)',
    brief: '设置指定 DIO 通道的电平状态',
    description: '将指定 DIO 通道的电平设置为 STD_HIGH 或 STD_LOW。该函数直接写入 GPIO 输出寄存器，适用于控制 LED、继电器等输出设备。',
    params: [
      { name: 'ChannelId', type: 'Dio_ChannelType', direction: 'in', description: 'DIO 通道标识符' },
      { name: 'Level', type: 'Dio_LevelType', direction: 'in', description: '目标电平：STD_HIGH 或 STD_LOW' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_WriteChannel 控制 LED */
#include "Dio.h"

void Dio_ControlLed(void) {
    /* 点亮 LED */
    Dio_WriteChannel(LED_GREEN_CHANNEL, STD_HIGH);

    /* 延时后熄灭 */
    /* Dio_WriteChannel(LED_GREEN_CHANNEL, STD_LOW); */
}`,
    exampleDescription: '控制 LED 引脚输出高低电平',
    seeAlso: ['Dio_ReadChannel', 'Dio_WritePort', 'Dio_FlipChannel'],
    status: 'standard',
  },
  {
    id: 'Dio_FlipChannel',
    name: 'Dio_FlipChannel',
    signature: 'Dio_LevelType Dio_FlipChannel(Dio_ChannelType ChannelId)',
    brief: '翻转指定 DIO 通道的电平状态',
    description: '将指定 DIO 通道的当前电平翻转（高→低或低→高），并返回翻转后的电平值。该操作是原子性的，适用于不需要关心当前状态的应用场景。',
    params: [
      { name: 'ChannelId', type: 'Dio_ChannelType', direction: 'in', description: 'DIO 通道标识符' },
    ],
    returnType: 'Dio_LevelType',
    returnDescription: '翻转后的电平：STD_HIGH 或 STD_LOW',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_FlipChannel 闪烁 LED */
#include "Dio.h"

void Dio_ToggleLed(void) {
    /* 翻转 LED 状态并读取结果 */
    Dio_LevelType newLevel = Dio_FlipChannel(LED_RED_CHANNEL);
    /* newLevel 为翻转后的电平 */
}`,
    exampleDescription: '翻转 LED 引脚电平实现闪烁效果',
    seeAlso: ['Dio_ReadChannel', 'Dio_WriteChannel'],
    status: 'standard',
  },
  {
    id: 'Dio_ReadPort',
    name: 'Dio_ReadPort',
    signature: 'Dio_PortLevelType Dio_ReadPort(Dio_PortType PortId)',
    brief: '读取整个 DIO 端口的电平状态',
    description: '一次性读取指定 DIO 端口所有引脚的电平状态。返回值是一个位掩码，每个位对应一个引脚的电平。适用于需要快速读取一组引脚状态的场景。',
    params: [
      { name: 'PortId', type: 'Dio_PortType', direction: 'in', description: 'DIO 端口标识符' },
    ],
    returnType: 'Dio_PortLevelType',
    returnDescription: '端口电平位掩码，每个位对应一个引脚的电平',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_ReadPort 读取整个端口 */
#include "Dio.h"

void Dio_ReadAllPins(void) {
    Dio_PortLevelType portValue;

    /* 一次性读取 PORTA 所有引脚 */
    portValue = Dio_ReadPort(PORT_A);

    /* 检查位 3 是否为高 */
    if (portValue & 0x08) {
        /* 引脚 3 为高电平 */
    }
}`,
    exampleDescription: '读取整个端口所有引脚的电平状态',
    seeAlso: ['Dio_WritePort', 'Dio_ReadChannel'],
    status: 'standard',
  },
  {
    id: 'Dio_WritePort',
    name: 'Dio_WritePort',
    signature: 'void Dio_WritePort(Dio_PortType PortId, Dio_PortLevelType Level)',
    brief: '设置整个 DIO 端口的电平状态',
    description: '一次性设置指定 DIO 端口所有引脚的电平状态。Level 参数是一个位掩码，每个位对应一个引脚的电平。未使用的位应设置为 0。',
    params: [
      { name: 'PortId', type: 'Dio_PortType', direction: 'in', description: 'DIO 端口标识符' },
      { name: 'Level', type: 'Dio_PortLevelType', direction: 'in', description: '端口电平位掩码，设置各引脚电平' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_WritePort 批量设置引脚 */
#include "Dio.h"

void Dio_SetPortOutput(void) {
    /* 设置 PORTA 低 4 位为高，高 4 位为低 */
    Dio_WritePort(PORT_A, 0x0F);
}`,
    exampleDescription: '批量设置端口电平',
    seeAlso: ['Dio_ReadPort', 'Dio_WriteChannel', 'Dio_WriteChannelGroup'],
    status: 'standard',
  },
  {
    id: 'Dio_ReadChannelGroup',
    name: 'Dio_ReadChannelGroup',
    signature: 'Dio_PortLevelType Dio_ReadChannelGroup(const Dio_ChannelGroupType* ChannelGroupIdPtr)',
    brief: '读取指定通道组的电平状态',
    description: '读取指定通道组中所有引脚的电平状态。通道组是跨端口的一组连续引脚的逻辑分组，返回值仅包含该组引脚的掩码位。',
    params: [
      { name: 'ChannelGroupIdPtr', type: 'const Dio_ChannelGroupType*', direction: 'in', description: '通道组配置指针，包含端口基准、偏移和掩码信息' },
    ],
    returnType: 'Dio_PortLevelType',
    returnDescription: '通道组的电平位掩码',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_ReadChannelGroup 读取通道组 */
#include "Dio.h"

const Dio_ChannelGroupType ledGroup = {
    .port = PORT_B,
    .offset = 2,       /* 从引脚 2 开始 */
    .mask = 0x0F       /* 4 个引脚 */
};

void Dio_ReadLedGroup(void) {
    Dio_PortLevelType value = Dio_ReadChannelGroup(&ledGroup);
}`,
    seeAlso: ['Dio_WriteChannelGroup', 'Dio_ReadPort'],
    status: 'standard',
  },
  {
    id: 'Dio_WriteChannelGroup',
    name: 'Dio_WriteChannelGroup',
    signature: 'void Dio_WriteChannelGroup(const Dio_ChannelGroupType* ChannelGroupIdPtr, Dio_PortLevelType Level)',
    brief: '设置指定通道组的电平状态',
    description: '设置指定通道组中所有引脚的电平状态。仅修改通道组掩码覆盖的引脚，不影响该端口中其他引脚的状态。',
    params: [
      { name: 'ChannelGroupIdPtr', type: 'const Dio_ChannelGroupType*', direction: 'in', description: '通道组配置指针' },
      { name: 'Level', type: 'Dio_PortLevelType', direction: 'in', description: '通道组目标电平位掩码' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_WriteChannelGroup 控制 LED 组 */
#include "Dio.h"

extern const Dio_ChannelGroupType ledGroup;

void Dio_SetLedPattern(uint8 pattern) {
    /* 仅修改 LED 组引脚，不影响同端口其他引脚 */
    Dio_WriteChannelGroup(&ledGroup, pattern);
}`,
    seeAlso: ['Dio_ReadChannelGroup', 'Dio_WritePort'],
    status: 'standard',
  },
  {
    id: 'Dio_GetVersionInfo',
    name: 'Dio_GetVersionInfo',
    signature: 'void Dio_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 Dio 驱动模块版本信息',
    description: '返回 Dio 驱动模块的厂商 ID、模块 ID、软件版本号等版本信息。用于诊断和兼容性检查。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_GetVersionInfo 示例 */
#include "Dio.h"

void Dio_PrintVersion(void) {
    Std_VersionInfoType ver;
    Dio_GetVersionInfo(&ver);
    /* ver.vendorID, ver.moduleID, ver.sw_major_version 等 */
}`,
    seeAlso: [],
    status: 'standard',
  },
  {
    id: 'Dio_SetChannelMode',
    name: 'Dio_SetChannelMode',
    signature: 'Std_ReturnType Dio_SetChannelMode(Dio_ChannelType ChannelId, Dio_ChannelModeType Mode)',
    brief: '设置 DIO 通道的工作模式',
    description: '在运行时动态改变指定 DIO 通道的工作模式，如推挽输出、开漏输出、高阻输入等。该函数为可选功能，并非所有硬件平台都支持。',
    params: [
      { name: 'ChannelId', type: 'Dio_ChannelType', direction: 'in', description: 'DIO 通道标识符' },
      { name: 'Mode', type: 'Dio_ChannelModeType', direction: 'in', description: '目标工作模式（推挽/开漏/高阻等）' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 设置成功；E_NOT_OK: 不支持该模式或硬件限制',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_SetChannelMode 切换引脚模式 */
#include "Dio.h"

void Dio_SwitchToOpenDrain(void) {
    Std_ReturnType ret = Dio_SetChannelMode(LED_CHANNEL, DIO_MODE_OPEN_DRAIN);
    if (ret != E_OK) {
        /* 硬件不支持开漏模式 */
    }
}`,
    seeAlso: ['Dio_ReadChannel', 'Dio_WriteChannel'],
    status: 'optional',
    timing: '执行时间取决于硬件寄存器操作周期',
  },
  {
    id: 'Dio_GetOutputState',
    name: 'Dio_GetOutputState',
    signature: 'Dio_LevelType Dio_GetOutputState(Dio_ChannelType ChannelId)',
    brief: '获取 DIO 通道的输出锁存状态',
    description: '读取指定 DIO 通道的输出锁存寄存器值，而非实际的引脚电平。该函数用于确认已写入的输出值，与 Dio_ReadChannel（读取实际引脚电平）不同。',
    params: [
      { name: 'ChannelId', type: 'Dio_ChannelType', direction: 'in', description: 'DIO 通道标识符' },
    ],
    returnType: 'Dio_LevelType',
    returnDescription: '输出锁存值：STD_HIGH 或 STD_LOW',
    moduleId: 'Dio',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Dio_GetOutputState 检查输出状态 */
#include "Dio.h"

void Dio_CheckOutput(void) {
    Dio_LevelType level = Dio_GetOutputState(LED_CHANNEL);
    if (level == STD_HIGH) {
        /* 输出寄存器为高 */
    }
}`,
    seeAlso: ['Dio_ReadChannel', 'Dio_WriteChannel'],
    status: 'optional',
  },
];

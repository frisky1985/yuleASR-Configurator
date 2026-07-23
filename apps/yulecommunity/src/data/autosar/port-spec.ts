import type { AutosarApi } from './types';

export const PORT_APIS: AutosarApi[] = [
  {
    id: 'Port_Init',
    name: 'Port_Init',
    signature: 'void Port_Init(const Port_ConfigType* ConfigPtr)',
    brief: '初始化 Port 模块，应用所有引脚配置',
    description: '初始化 Port 模块，根据配置表一次性设置所有引脚的功能复用、方向、驱动能力和上下拉电阻。必须在任何 Port 引脚操作前调用。',
    params: [
      { name: 'ConfigPtr', type: 'const Port_ConfigType*', direction: 'in', description: 'Port 配置表指针，包含所有引脚的初始化配置' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_Init 初始化所有引脚配置 */
#include "Port.h"

void Port_InitExample(void) {
    Port_Init(&Port_Config);
    /* 所有引脚按配置表完成初始化 */
}`,
    seeAlso: ['Port_SetPinDirection', 'Port_SetPinMode', 'Port_RefreshPortDirection'],
    configParams: [
      { paramName: 'PortConfigSet', configModule: 'Port', path: 'Port/PortConfigSet' },
    ],
    status: 'standard',
  },
  {
    id: 'Port_SetPinDirection',
    name: 'Port_SetPinDirection',
    signature: 'void Port_SetPinDirection(Port_PinType Pin, Port_PinDirectionType Direction)',
    brief: '运行时设置引脚方向',
    description: '在运行时动态改变指定引脚的方向（输入或输出）。适用于需要在运行时切换引脚方向的场景，如双向数据总线。',
    params: [
      { name: 'Pin', type: 'Port_PinType', direction: 'in', description: '引脚 ID' },
      { name: 'Direction', type: 'Port_PinDirectionType', direction: 'in', description: '目标方向：PORT_PIN_IN 或 PORT_PIN_OUT' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_SetPinDirection 切换引脚方向 */
#include "Port.h"

void Port_SwitchDirection(void) {
    /* 将引脚切换为输出模式 */
    Port_SetPinDirection(PIN_CAN_TX, PORT_PIN_OUT);
}`,
    seeAlso: ['Port_Init', 'Port_RefreshPortDirection', 'Port_SetPinMode'],
    status: 'standard',
  },
  {
    id: 'Port_RefreshPortDirection',
    name: 'Port_RefreshPortDirection',
    signature: 'void Port_RefreshPortDirection(void)',
    brief: '刷新所有引脚方向为配置值',
    description: '将所有引脚的方向刷新为配置表中的初始值。用于在运行时恢复引脚方向到已知状态，例如从错误恢复或模式切换后。',
    params: [],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_RefreshPortDirection 刷新方向 */
#include "Port.h"

void Port_ResetDirections(void) {
    /* 将所有引脚方向恢复为配置值 */
    Port_RefreshPortDirection();
}`,
    seeAlso: ['Port_Init', 'Port_SetPinDirection'],
    status: 'standard',
  },
  {
    id: 'Port_SetPinMode',
    name: 'Port_SetPinMode',
    signature: 'void Port_SetPinMode(Port_PinType Pin, Port_PinModeType Mode)',
    brief: '设置引脚功能复用模式',
    description: '将指定引脚切换到不同的功能复用模式，如 GPIO、UART、CAN、SPI 等。必须在引脚锁定前调用，锁定后调用无效。',
    params: [
      { name: 'Pin', type: 'Port_PinType', direction: 'in', description: '引脚 ID' },
      { name: 'Mode', type: 'Port_PinModeType', direction: 'in', description: '目标复用模式（如 PORT_PIN_MODE_DIO、PORT_PIN_MODE_CAN）' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_SetPinMode 切换引脚功能 */
#include "Port.h"

void Port_ConfigPins(void) {
    /* 将引脚配置为 CAN 功能 */
    Port_SetPinMode(PIN_CAN_RX, PORT_PIN_MODE_CAN);
    Port_SetPinMode(PIN_CAN_TX, PORT_PIN_MODE_CAN);

    /* 将引脚配置为 UART 功能 */
    Port_SetPinMode(PIN_UART_TX, PORT_PIN_MODE_UART);
}`,
    seeAlso: ['Port_Init', 'Port_SetPinDirection'],
    status: 'standard',
  },
  {
    id: 'Port_GetVersionInfo',
    name: 'Port_GetVersionInfo',
    signature: 'void Port_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 Port 驱动模块版本信息',
    description: '返回 Port 驱动模块的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_GetVersionInfo 示例 */
#include "Port.h"

void Port_PrintVersion(void) {
    Std_VersionInfoType ver;
    Port_GetVersionInfo(&ver);
}`,
    seeAlso: [],
    status: 'standard',
  },
  {
    id: 'Port_SetPinPullConfig',
    name: 'Port_SetPinPullConfig',
    signature: 'void Port_SetPinPullConfig(Port_PinType Pin, Port_PinPullConfigType PullConfig)',
    brief: '设置引脚内部上下拉电阻',
    description: '配置指定引脚的内部上下拉电阻，支持上拉、下拉或浮空三种状态。用于确保输入引脚在悬空时处于确定电平。',
    params: [
      { name: 'Pin', type: 'Port_PinType', direction: 'in', description: '引脚 ID' },
      { name: 'PullConfig', type: 'Port_PinPullConfigType', direction: 'in', description: '上下拉配置：上拉/下拉/浮空' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_SetPinPullConfig 配置上拉电阻 */
#include "Port.h"

void Port_EnablePullUp(void) {
    Port_SetPinPullConfig(BUTTON_PIN, PORT_PULL_UP);
}`,
    seeAlso: ['Port_Init', 'Port_SetPinDirection'],
    status: 'optional',
  },
  {
    id: 'Port_SetPinSlewRate',
    name: 'Port_SetPinSlewRate',
    signature: 'void Port_SetPinSlewRate(Port_PinType Pin, Port_PinSlewRateType SlewRate)',
    brief: '设置引脚输出压摆率',
    description: '配置输出引脚的信号压摆率。高速通信接口（如 CAN、SPI）通常需要高压摆率，而普通 GPIO 可使用低压摆率以降低 EMI。',
    params: [
      { name: 'Pin', type: 'Port_PinType', direction: 'in', description: '引脚 ID' },
      { name: 'SlewRate', type: 'Port_PinSlewRateType', direction: 'in', description: '压摆率配置：低/中/高' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_SetPinSlewRate 配置高速输出 */
#include "Port.h"

void Port_FastOutput(void) {
    Port_SetPinSlewRate(SPI_CLK_PIN, PORT_SLEW_RATE_HIGH);
}`,
    seeAlso: ['Port_Init'],
    status: 'optional',
  },
  {
    id: 'Port_SetPinDriveStrength',
    name: 'Port_SetPinDriveStrength',
    signature: 'void Port_SetPinDriveStrength(Port_PinType Pin, Port_PinDriveStrengthType Strength)',
    brief: '设置引脚驱动强度',
    description: '配置输出引脚的驱动能力。高驱动强度适用于大负载或高速开关场景，低驱动强度有助于降低功耗和 EMI。',
    params: [
      { name: 'Pin', type: 'Port_PinType', direction: 'in', description: '引脚 ID' },
      { name: 'Strength', type: 'Port_PinDriveStrengthType', direction: 'in', description: '驱动强度：低/中/高' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_SetPinDriveStrength 设置驱动能力 */
#include "Port.h"

void Port_StrongDrive(void) {
    Port_SetPinDriveStrength(LED_CHANNEL, PORT_DRIVE_STRENGTH_HIGH);
}`,
    seeAlso: ['Port_Init', 'Port_SetPinSlewRate'],
    status: 'optional',
  },
  {
    id: 'Port_SetPinInputFilter',
    name: 'Port_SetPinInputFilter',
    signature: 'void Port_SetPinInputFilter(Port_PinType Pin, Port_PinInputFilterType Filter)',
    brief: '设置引脚输入滤波器',
    description: '配置输入引脚的数字滤波器，可滤除短于设定宽度的噪声脉冲。适用于按键、开关等易产生抖动的输入信号。',
    params: [
      { name: 'Pin', type: 'Port_PinType', direction: 'in', description: '引脚 ID' },
      { name: 'Filter', type: 'Port_PinInputFilterType', direction: 'in', description: '滤波器配置：旁路/单周期/多周期' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_SetPinInputFilter 启用滤波 */
#include "Port.h"

void Port_EnableDebounce(void) {
    Port_SetPinInputFilter(BUTTON_PIN, PORT_INPUT_FILTER_3_CYCLES);
}`,
    seeAlso: ['Port_Init'],
    status: 'optional',
  },
  {
    id: 'Port_LockPin',
    name: 'Port_LockPin',
    signature: 'void Port_LockPin(Port_PinType Pin)',
    brief: '锁定引脚配置防止意外修改',
    description: '锁定指定引脚的配置，防止后续误操作修改引脚的功能复用、方向或电气特性。锁定后，对该引脚的大多数配置函数调用将被忽略。通常用于关键安全引脚的配置保护。',
    params: [
      { name: 'Pin', type: 'Port_PinType', direction: 'in', description: '要锁定的引脚 ID' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_LockPin 锁定关键引脚 */
#include "Port.h"

void Port_ProtectPins(void) {
    /* 配置完成，锁定关键引脚防止误操作 */
    Port_LockPin(PIN_CAN_TX);
    Port_LockPin(PIN_CAN_RX);
}`,
    seeAlso: ['Port_SetPinMode', 'Port_SetPinDirection'],
    status: 'standard',
    timing: '锁定操作通常为一次性写入，不可逆',
  },
  {
    id: 'Port_GetPinMode',
    name: 'Port_GetPinMode',
    signature: 'Port_PinModeType Port_GetPinMode(Port_PinType Pin)',
    brief: '获取引脚当前模式',
    description: '读取指定引脚当前的功能复用模式。用于诊断或调试目的，确认引脚已被正确配置为目标模式。',
    params: [
      { name: 'Pin', type: 'Port_PinType', direction: 'in', description: '引脚 ID' },
    ],
    returnType: 'Port_PinModeType',
    returnDescription: '当前引脚复用模式',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_GetPinMode 读取引脚模式 */
#include "Port.h"

void Port_DebugPin(void) {
    Port_PinModeType mode = Port_GetPinMode(PIN_CAN_TX);
    if (mode == PORT_PIN_MODE_CAN) {
        /* 引脚已正确配置为 CAN 功能 */
    }
}`,
    seeAlso: ['Port_SetPinMode', 'Port_LockPin'],
    status: 'standard',
  },
  {
    id: 'Port_GetPinDirection',
    name: 'Port_GetPinDirection',
    signature: 'Port_PinDirectionType Port_GetPinDirection(Port_PinType Pin)',
    brief: '获取引脚当前方向',
    description: '读取指定引脚当前的输入/输出方向。用于运行时检查引脚方向状态。',
    params: [
      { name: 'Pin', type: 'Port_PinType', direction: 'in', description: '引脚 ID' },
    ],
    returnType: 'Port_PinDirectionType',
    returnDescription: '当前引脚方向：PORT_PIN_IN 或 PORT_PIN_OUT',
    moduleId: 'Port',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Port_GetPinDirection 读取方向 */
#include "Port.h"

void Port_CheckDirection(void) {
    Port_PinDirectionType dir = Port_GetPinDirection(PIN_CAN_TX);
}`,
    seeAlso: ['Port_SetPinDirection', 'Port_GetPinMode'],
    status: 'standard',
  },
];

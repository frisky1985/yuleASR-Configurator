import type { AutosarApi } from './types';

export const MCU_APIS: AutosarApi[] = [
  {
    id: 'Mcu_Init',
    name: 'Mcu_Init',
    signature: 'void Mcu_Init(const Mcu_ConfigType* ConfigPtr)',
    brief: '初始化 Mcu 模块，配置时钟和复位参数',
    description: '初始化微控制器模块，配置系统时钟源、PLL 倍频系数、分频器和复位参数。必须在任何外设初始化和时钟配置前调用。',
    params: [
      { name: 'ConfigPtr', type: 'const Mcu_ConfigType*', direction: 'in', description: 'Mcu 配置指针，包含时钟源选择和 PLL 配置' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Mcu',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Mcu_Init 初始化系统时钟 */
#include "Mcu.h"

void SystemInit(void) {
    /* 使用默认配置初始化 Mcu */
    Mcu_Init(&Mcu_Config);

    /* 配置系统时钟 */
    Mcu_InitClock(MCU_CLOCK_CONFIG_0);
}`,
    exampleDescription: '初始化 MCU 并配置系统时钟',
    seeAlso: ['Mcu_InitClock', 'Mcu_SetMode', 'Mcu_GetPllStatus'],
    status: 'standard',
  },
  {
    id: 'Mcu_InitClock',
    name: 'Mcu_InitClock',
    signature: 'Std_ReturnType Mcu_InitClock(Mcu_ClockType ClockSetting)',
    brief: '激活指定时钟配置',
    description: '根据配置 ID 激活预定义的时钟设置，包括 PLL 锁定目标频率、分频系数等。在切换时钟时需要等待 PLL 锁定。',
    params: [
      { name: 'ClockSetting', type: 'Mcu_ClockType', direction: 'in', description: '时钟配置 ID，引用预定义的时钟设置' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 时钟激活成功；E_NOT_OK: 时钟配置无效或 PLL 锁定失败',
    moduleId: 'Mcu',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Mcu_InitClock 切换时钟 */
#include "Mcu.h"

void Mcu_SwitchClock(void) {
    Std_ReturnType ret = Mcu_InitClock(MCU_CLOCK_CONFIG_1);
    if (ret == E_OK) {
        /* 等待 PLL 锁定 */
        while (Mcu_GetPllStatus() != MCU_PLL_LOCKED);
    }
}`,
    exampleDescription: '切换到备用时钟配置',
    seeAlso: ['Mcu_Init', 'Mcu_GetPllStatus', 'Mcu_DistributePllClock'],
    status: 'standard',
    timing: 'PLL 锁定时间取决于硬件和配置，通常为几十到几百微秒',
  },
  {
    id: 'Mcu_DistributePllClock',
    name: 'Mcu_DistributePllClock',
    signature: 'Std_ReturnType Mcu_DistributePllClock(void)',
    brief: '分发 PLL 时钟到各外设总线',
    description: '在 PLL 锁定后，将 PLL 时钟分发到各外设总线模块。必须在 Mcu_InitClock 成功且 PLL 锁定后才能调用。',
    params: [],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 分发成功；E_NOT_OK: PLL 未锁定或分发失败',
    moduleId: 'Mcu',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Mcu_DistributePllClock 分发时钟 */
#include "Mcu.h"

void Mcu_EnablePeripheralClocks(void) {
    Mcu_DistributePllClock();
}`,
    seeAlso: ['Mcu_InitClock', 'Mcu_GetPllStatus'],
    status: 'standard',
  },
  {
    id: 'Mcu_GetPllStatus',
    name: 'Mcu_GetPllStatus',
    signature: 'Mcu_PllStatusType Mcu_GetPllStatus(void)',
    brief: '获取 PLL 锁定状态',
    description: '返回 PLL 的当前锁定状态。在 Mcu_InitClock 后轮询此函数，直到返回 MCU_PLL_LOCKED 表示 PLL 已稳定。',
    params: [],
    returnType: 'Mcu_PllStatusType',
    returnDescription: 'MCU_PLL_LOCKED: PLL 已锁定；MCU_PLL_UNLOCKED: PLL 未锁定或正在锁定',
    moduleId: 'Mcu',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Mcu_GetPllStatus 轮询 PLL 状态 */
#include "Mcu.h"

void Mcu_WaitPllLock(void) {
    while (Mcu_GetPllStatus() != MCU_PLL_LOCKED) {
        /* 等待 PLL 稳定 */
    }
}`,
    seeAlso: ['Mcu_InitClock', 'Mcu_DistributePllClock'],
    status: 'standard',
  },
  {
    id: 'Mcu_SetMode',
    name: 'Mcu_SetMode',
    signature: 'void Mcu_SetMode(Mcu_ModeType McuMode)',
    brief: '设置微控制器功耗模式',
    description: '切换微控制器的功耗模式，支持 RUN（正常运行）、WAIT（外设运行、CPU 停止）和 STOP（深度睡眠）三种模式。用于系统低功耗管理。',
    params: [
      { name: 'McuMode', type: 'Mcu_ModeType', direction: 'in', description: '目标功耗模式：MCU_MODE_RUN / MCU_MODE_WAIT / MCU_MODE_STOP' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Mcu',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Mcu_SetMode 进入低功耗 */
#include "Mcu.h"

void Mcu_EnterSleep(void) {
    /* 进入 STOP 深度睡眠模式 */
    Mcu_SetMode(MCU_MODE_STOP);
    /* 唤醒后从下一行继续执行 */
}`,
    exampleDescription: '进入 STOP 深度睡眠模式',
    seeAlso: ['Mcu_Init', 'Mcu_GetResetReason'],
    status: 'standard',
    timing: '模式切换时间取决于硬件，WAIT 模式通常为几个时钟周期，STOP 模式受唤醒时间影响',
  },
  {
    id: 'Mcu_GetResetReason',
    name: 'Mcu_GetResetReason',
    signature: 'Mcu_ResetType Mcu_GetResetReason(void)',
    brief: '获取最近一次复位原因',
    description: '返回最近一次系统复位的原因，如上电复位、外部复位引脚、看门狗复位、低电压检测等。用于系统诊断和错误分析。',
    params: [],
    returnType: 'Mcu_ResetType',
    returnDescription: '复位原因类型枚举',
    moduleId: 'Mcu',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Mcu_GetResetReason 诊断复位原因 */
#include "Mcu.h"

void Mcu_DiagnoseReset(void) {
    Mcu_ResetType reason = Mcu_GetResetReason();

    switch (reason) {
        case MCU_RESET_POWER_ON:
            /* 上电复位 */
            break;
        case MCU_RESET_WATCHDOG:
            /* 看门狗超时复位 */
            break;
        case MCU_RESET_EXTERNAL:
            /* 外部复位引脚 */
            break;
        default:
            break;
    }
}`,
    seeAlso: ['Mcu_Init', 'Mcu_GetResetRawValue'],
    status: 'standard',
  },
  {
    id: 'Mcu_GetResetRawValue',
    name: 'Mcu_GetResetRawValue',
    signature: 'Mcu_RawResetType Mcu_GetResetRawValue(void)',
    brief: '获取原始复位寄存器值',
    description: '直接读取复位状态寄存器的原始值，提供比 Mcu_GetResetReason 更详细的复位源信息，用于深入调试。',
    params: [],
    returnType: 'Mcu_RawResetType',
    returnDescription: '复位状态寄存器的原始位掩码值',
    moduleId: 'Mcu',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Mcu_GetResetRawValue 读取寄存器 */
#include "Mcu.h"

void Mcu_DebugReset(void) {
    Mcu_RawResetType raw = Mcu_GetResetRawValue();
    /* raw 包含详细的复位源位信息 */
}`,
    seeAlso: ['Mcu_GetResetReason'],
    status: 'standard',
  },
  {
    id: 'Mcu_GetVersionInfo',
    name: 'Mcu_GetVersionInfo',
    signature: 'void Mcu_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 Mcu 驱动模块版本信息',
    description: '返回 Mcu 驱动模块的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'Mcu',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Mcu_GetVersionInfo 示例 */
#include "Mcu.h"

void Mcu_PrintVersion(void) {
    Std_VersionInfoType ver;
    Mcu_GetVersionInfo(&ver);
}`,
    seeAlso: [],
    status: 'standard',
  },
];

export interface ModuleApi {
  name: string;
  params: string;
  returns: string;
  desc: string;
}

export interface ModuleConfig {
  name: string;
  type: string;
  desc: string;
  default?: string;
}

export interface ModuleDetail {
  id: string;
  name: string;
  layer: string;
  status: string;
  version: string;
  stars: number;
  forks: number;
  shortDesc: string;
  overview: string;
  features: string[];
  apis: ModuleApi[];
  configs: ModuleConfig[];
  dependencies: string[];
  codeExample: string;
  codeLanguage: string;
  changelog: { version: string; date: string; changes: string[] }[];
}

const mcalDetails: Record<string, ModuleDetail> = {
  Mcu: {
    id: 'mcu',
    name: 'Mcu',
    layer: 'MCAL',
    status: '已完成',
    version: 'v1.2.0',
    stars: 48,
    forks: 12,
    shortDesc: '微控制器驱动，负责时钟、复位和功耗管理',
    overview:
      'Mcu (Microcontroller Driver) 是 MCAL 层的核心模块，负责初始化微控制器的时钟系统、复位管理和低功耗模式切换，支持动态时钟门控和多种功耗模式。',
    features: [
      '时钟系统初始化与动态配置',
      '多种复位源检测与处理',
      'RUN / WAIT / STOP 三种功耗模式',
      '时钟门控控制，降低动态功耗',
      '看门狗超时复位保护',
      '符合 AutoSAR Classic Platform 4.4 规范',
    ],
    apis: [
      { name: 'Mcu_Init', params: 'const Mcu_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 Mcu 模块，配置时钟和复位参数' },
      { name: 'Mcu_InitRamSection', params: 'Mcu_RamSectionType RamSection', returns: 'Std_ReturnType', desc: '初始化指定的 RAM 段' },
      { name: 'Mcu_InitClock', params: 'Mcu_ClockType ClockSetting', returns: 'Std_ReturnType', desc: '根据配置激活指定时钟设置' },
      { name: 'Mcu_DistributePllClock', params: 'void', returns: 'Std_ReturnType', desc: '分发 PLL 时钟到各外设' },
      { name: 'Mcu_GetPllStatus', params: 'void', returns: 'Mcu_PllStatusType', desc: '获取 PLL 锁定状态' },
      { name: 'Mcu_SetMode', params: 'Mcu_ModeType McuMode', returns: 'void', desc: '设置微控制器功耗模式' },
      { name: 'Mcu_GetResetReason', params: 'void', returns: 'Mcu_ResetType', desc: '获取最近一次复位原因' },
      { name: 'Mcu_GetResetRawValue', params: 'void', returns: 'Mcu_RawResetType', desc: '获取原始复位寄存器值' },
    ],
    configs: [
      { name: 'McuClockSettingConfig', type: 'Mcu_ClockSettingConfigType', desc: '时钟分频器、倍频器配置', default: '见 Mcu_Cfg.c' },
      { name: 'McuModeSettingConfi', type: 'Mcu_ModeSettingConfigType', desc: '功耗模式外设状态配置', default: '见 Mcu_Cfg.c' },
      { name: 'McuRamSectorSettingConfig', type: 'Mcu_RamSectorSettingConfigType', desc: 'RAM 段初始化配置', default: '见 Mcu_Cfg.c' },
    ],
    dependencies: ['Det (开发时)', 'McalLib'],
    codeExample: `/* Mcu 初始化示例 */
#include "Mcu.h"

void SystemInit(void)
{
    /* 初始化 Mcu 模块 */
    Mcu_Init(&Mcu_Config);

    /* 配置系统时钟为 1.2GHz */
    if (Mcu_InitClock(MCU_CLOCK_CONFIG_0) == E_OK)
    {
        /* 等待 PLL 锁定 */
        while (Mcu_GetPllStatus() != MCU_PLL_LOCKED)
        {
            ;
        }
        /* 分发时钟 */
        Mcu_DistributePllClock();
    }

    /* 初始化 RAM 段 */
    Mcu_InitRamSection(MCU_RAM_SECTION_0);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.2.0', date: '2026-04-20', changes: ['新增动态时钟门控支持', '优化 STOP 模式恢复时间'] },
      { version: 'v1.1.0', date: '2026-03-15', changes: ['增加复位原因诊断接口', '修复 PLL 锁定检测偶发失效'] },
      { version: 'v1.0.0', date: '2026-01-10', changes: ['初始版本发布', '支持基础时钟配置'] },
    ],
  },
  Port: {
    id: 'port',
    name: 'Port',
    layer: 'MCAL',
    status: '已完成',
    version: 'v1.1.0',
    stars: 42,
    forks: 10,
    shortDesc: '端口驱动，配置引脚功能和方向',
    overview:
      'Port 驱动负责配置微控制器引脚的功能复用、方向（输入/输出）、驱动能力和上下拉电阻，支持 128 个可配置引脚。',
    features: [
      '引脚功能复用配置 (MUX_MODE)',
      '输入/输出方向控制',
      '内部上下拉电阻配置',
      '驱动强度与压摆率设置',
      '数字输入滤波器',
      '引脚锁定保护机制',
    ],
    apis: [
      { name: 'Port_Init', params: 'const Port_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 Port 模块，应用所有引脚配置' },
      { name: 'Port_SetPinDirection', params: 'Port_PinType Pin, Port_PinDirectionType Direction', returns: 'void', desc: '运行时设置引脚方向' },
      { name: 'Port_RefreshPortDirection', params: 'void', returns: 'void', desc: '刷新引脚方向为配置值' },
      { name: 'Port_SetPinMode', params: 'Port_PinType Pin, Port_PinModeType Mode', returns: 'void', desc: '设置引脚功能复用模式' },
    ],
    configs: [
      { name: 'PortPinMode', type: 'Port_PinModeType', desc: '引脚复用功能选择', default: 'PORT_PIN_MODE_DIO' },
      { name: 'PortPinDirection', type: 'Port_PinDirectionType', desc: '引脚方向', default: 'PORT_PIN_IN' },
      { name: 'PortPinLevelValue', type: 'Port_PinLevelValueType', desc: '初始电平', default: 'PORT_PIN_LEVEL_LOW' },
    ],
    dependencies: ['Det (开发时)'],
    codeExample: `/* Port 引脚配置示例 */
#include "Port.h"

void Port_InitExample(void)
{
    /* 初始化所有引脚 */
    Port_Init(&Port_Config);

    /* 运行时动态切换 CAN_TX 引脚方向 */
    Port_SetPinDirection(CAN_TX_PIN, PORT_PIN_OUT);

    /* 切换引脚为 UART 功能 */
    Port_SetPinMode(UART_RX_PIN, PORT_PIN_MODE_UART);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.1.0', date: '2026-03-10', changes: ['新增引脚锁定保护', '支持驱动强度分级配置'] },
      { version: 'v1.0.0', date: '2026-01-15', changes: ['初始版本发布'] },
    ],
  },
  Dio: {
    id: 'dio',
    name: 'Dio',
    layer: 'MCAL',
    status: '已完成',
    version: 'v1.1.0',
    stars: 38,
    forks: 8,
    shortDesc: '数字IO驱动，读写引脚电平状态',
    overview:
      'Dio (Digital I/O) 驱动提供对引脚电平状态的读写操作。基于 GPIO 寄存器直接访问，具有极低的调用开销，适用于时序敏感的场景。',
    features: [
      '单引脚读写操作',
      '端口级批量读写',
      '通道组读写 (Channel Group)',
      '原子操作保证',
      '零开销抽象 (inline 函数)',
    ],
    apis: [
      { name: 'Dio_ReadChannel', params: 'Dio_ChannelType ChannelId', returns: 'Dio_LevelType', desc: '读取指定通道电平' },
      { name: 'Dio_WriteChannel', params: 'Dio_ChannelType ChannelId, Dio_LevelType Level', returns: 'void', desc: '写入指定通道电平' },
      { name: 'Dio_FlipChannel', params: 'Dio_ChannelType ChannelId', returns: 'Dio_LevelType', desc: '翻转指定通道电平' },
      { name: 'Dio_ReadPort', params: 'Dio_PortType PortId', returns: 'Dio_PortLevelType', desc: '读取整个端口电平' },
      { name: 'Dio_WritePort', params: 'Dio_PortType PortId, Dio_PortLevelType Level', returns: 'void', desc: '写入整个端口电平' },
    ],
    configs: [
      { name: 'DioChannelId', type: 'Dio_ChannelType', desc: 'DIO 通道标识符', default: '硬件相关' },
    ],
    dependencies: ['Port'],
    codeExample: `/* Dio 读写示例 */
#include "Dio.h"

void Dio_Example(void)
{
    Dio_LevelType level;

    /* 读取按键状态 */
    level = Dio_ReadChannel(KEY_BUTTON_CHANNEL);

    /* 点亮 LED */
    Dio_WriteChannel(LED_CHANNEL, STD_HIGH);

    /* 翻转 LED 状态 */
    Dio_FlipChannel(LED_CHANNEL);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.1.0', date: '2026-03-12', changes: ['优化 GPIO 访问为单次内存操作', '新增 FlipChannel 接口'] },
      { version: 'v1.0.0', date: '2026-01-18', changes: ['初始版本发布'] },
    ],
  },
  Can: {
    id: 'can',
    name: 'Can',
    layer: 'MCAL',
    status: '已完成',
    version: 'v1.3.0',
    stars: 56,
    forks: 18,
    shortDesc: 'CAN控制器驱动，支持CAN FD协议',
    overview:
      'Can 驱动提供对 FlexCAN 控制器的底层访问，支持经典 CAN 和 CAN FD 协议。包含多邮箱管理、中断驱动收发、错误处理和总线关闭恢复机制。',
    features: [
      '经典 CAN (ISO 11898-1) 支持',
      'CAN FD (ISO 11898-1:2015) 支持',
      '64 个可配置邮箱',
      '中断和轮询两种收发模式',
      '总线关闭自动恢复',
      '错误计数与状态报告',
    ],
    apis: [
      { name: 'Can_Init', params: 'const Can_ConfigType* Config', returns: 'void', desc: '初始化 CAN 控制器' },
      { name: 'Can_SetControllerMode', params: 'uint8 Controller, Can_StateTransitionType Transition', returns: 'Can_ReturnType', desc: '设置控制器状态' },
      { name: 'Can_Write', params: 'Can_HwHandleType Hth, const Can_PduType* PduInfo', returns: 'Can_ReturnType', desc: '发送 CAN 报文' },
      { name: 'Can_ReadRxPduData', params: 'Can_HwHandleType Hrh, Can_PduType* PduInfo', returns: 'Can_ReturnType', desc: '读取接收到的报文数据' },
    ],
    configs: [
      { name: 'CanControllerBaudrateConfig', type: 'Can_ControllerBaudrateConfigType', desc: '波特率配置 (仲裁段/数据段)', default: '500K/2M' },
      { name: 'CanHwObjectConfig', type: 'Can_HwObjectConfigType', desc: '硬件对象 (邮箱) 配置', default: '见 Can_Cfg.c' },
    ],
    dependencies: ['Det (开发时)', 'CanIf'],
    codeExample: `/* CAN 报文发送示例 */
#include "Can.h"

void Can_SendMessage(void)
{
    Can_PduType pdu;
    uint8 data[8] = {0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08};

    pdu.swPduHandle = 0;
    pdu.length = 8;
    pdu.id = 0x123;
    pdu.sdu = data;

    if (Can_Write(CAN_HTH_0, &pdu) == CAN_OK)
    {
        /* 发送成功 */
    }
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.3.0', date: '2026-04-15', changes: ['新增 CAN FD 支持', '优化邮箱仲裁算法'] },
      { version: 'v1.2.0', date: '2026-03-20', changes: ['增加总线关闭恢复机制', '修复接收溢出中断丢失'] },
      { version: 'v1.0.0', date: '2026-02-01', changes: ['初始版本发布'] },
    ],
  },
  Spi: {
    id: 'spi',
    name: 'Spi',
    layer: 'MCAL',
    status: '已完成',
    version: 'v1.2.0',
    stars: 44,
    forks: 11,
    shortDesc: 'SPI串行外设接口驱动',
    overview:
      'Spi 驱动管理 ECU SPI 主设备的同步和异步串行通信。支持全双工数据传输、多从设备片选管理和 DMA 传输模式。',
    features: [
      '同步/异步传输模式',
      '全双工数据交换',
      '多从设备管理 (Channel/Job/Sequence)',
      'DMA 传输支持',
      '等级化缓冲区管理',
      '中断和轮询驱动模式',
    ],
    apis: [
      { name: 'Spi_Init', params: 'const Spi_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 Spi 模块' },
      { name: 'Spi_DeInit', params: 'void', returns: 'Std_ReturnType', desc: '反初始化 Spi 模块' },
      { name: 'Spi_WriteIB', params: 'Spi_ChannelType Channel, const Spi_DataBufferType* DataBufferPtr', returns: 'Std_ReturnType', desc: '写入内部缓冲区' },
      { name: 'Spi_AsyncTransmit', params: 'Spi_SequenceType Sequence', returns: 'Std_ReturnType', desc: '异步发送序列' },
      { name: 'Spi_SyncTransmit', params: 'Spi_SequenceType Sequence', returns: 'Std_ReturnType', desc: '同步发送序列' },
    ],
    configs: [
      { name: 'SpiChannel', type: 'Spi_ChannelConfigType', desc: '通道配置 (位宽、默认值)', default: '8bit' },
      { name: 'SpiJob', type: 'Spi_JobConfigType', desc: '作业配置 (CS、波特率)', default: '见 Spi_Cfg.c' },
      { name: 'SpiSequence', type: 'Spi_SequenceConfigType', desc: '序列配置 (作业链表)', default: '见 Spi_Cfg.c' },
    ],
    dependencies: ['Det (开发时)'],
    codeExample: `/* SPI 同步传输示例 */
#include "Spi.h"

void Spi_TransferExample(void)
{
    uint8 txBuf[4] = {0xA5, 0x5A, 0x00, 0xFF};
    uint8 rxBuf[4];

    /* 写入发送缓冲区 */
    Spi_WriteIB(SPI_CHANNEL_0, txBuf);

    /* 同步执行传输序列 */
    if (Spi_SyncTransmit(SPI_SEQUENCE_0) == E_OK)
    {
        /* 读取接收数据 */
        Spi_ReadIB(SPI_CHANNEL_0, rxBuf);
    }
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.2.0', date: '2026-04-01', changes: ['新增 DMA 传输模式', '优化异步传输回调机制'] },
      { version: 'v1.0.0', date: '2026-02-10', changes: ['初始版本发布'] },
    ],
  },
  Gpt: {
    id: 'gpt',
    name: 'Gpt',
    layer: 'MCAL',
    status: '已完成',
    version: 'v1.1.0',
    stars: 35,
    forks: 7,
    shortDesc: '通用定时器驱动',
    overview:
      'Gpt (General Purpose Timer) 驱动提供微秒和毫秒级定时功能，支持单次触发和连续模式，可用于任务调度、超时检测和 PWM 生成。',
    features: [
      '单次触发 (One-shot) 模式',
      '连续运行 (Continuous) 模式',
      '微秒/毫秒分辨率配置',
      '通道预分频器配置',
      '中断通知回调机制',
      '定时器状态查询',
    ],
    apis: [
      { name: 'Gpt_Init', params: 'const Gpt_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 Gpt 模块' },
      { name: 'Gpt_StartTimer', params: 'Gpt_ChannelType Channel, Gpt_ValueType Value', returns: 'void', desc: '启动定时器' },
      { name: 'Gpt_StopTimer', params: 'Gpt_ChannelType Channel', returns: 'void', desc: '停止定时器' },
      { name: 'Gpt_GetTimeElapsed', params: 'Gpt_ChannelType Channel', returns: 'Gpt_ValueType', desc: '获取已流逝时间' },
      { name: 'Gpt_GetTimeRemaining', params: 'Gpt_ChannelType Channel', returns: 'Gpt_ValueType', desc: '获取剩余时间' },
    ],
    configs: [
      { name: 'GptChannelConfigSet', type: 'Gpt_ChannelConfigType', desc: '定时器通道配置', default: '见 Gpt_Cfg.c' },
    ],
    dependencies: ['Det (开发时)'],
    codeExample: `/* GPT 定时器示例 */
#include "Gpt.h"

void Gpt_InitExample(void)
{
    /* 初始化 GPT */
    Gpt_Init(&Gpt_Config);

    /* 启动通道 0，定时 10ms */
    Gpt_StartTimer(GPT_CHANNEL_0, 10000);
}

/* 中断回调 */
void Gpt_Notification_Channel0(void)
{
    /* 10ms 定时到达 */
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.1.0', date: '2026-03-18', changes: ['新增时间剩余查询接口', '修复连续模式下中断丢失'] },
      { version: 'v1.0.0', date: '2026-02-15', changes: ['初始版本发布'] },
    ],
  },
  Pwm: {
    id: 'pwm',
    name: 'Pwm',
    layer: 'MCAL',
    status: '已完成',
    version: 'v1.1.0',
    stars: 32,
    forks: 6,
    shortDesc: '脉宽调制驱动',
    overview:
      'Pwm 驱动生成可变占空比的方波信号，支持边缘对齐和中心对齐模式，可用于电机控制、LED 调光和电源管理。',
    features: [
      '固定周期 / 可变周期模式',
      '边缘对齐与中心对齐',
      '占空比 0-100% 可调',
      '极性配置 (高电平有效/低电平有效)',
      '空闲状态定义',
      '相位偏移支持',
    ],
    apis: [
      { name: 'Pwm_Init', params: 'const Pwm_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 Pwm 模块' },
      { name: 'Pwm_SetDutyCycle', params: 'Pwm_ChannelType ChannelNumber, uint16 DutyCycle', returns: 'void', desc: '设置占空比' },
      { name: 'Pwm_SetPeriodAndDuty', params: 'Pwm_ChannelType ChannelNumber, Pwm_PeriodType Period, uint16 DutyCycle', returns: 'void', desc: '设置周期和占空比' },
      { name: 'Pwm_SetOutputToIdle', params: 'Pwm_ChannelType ChannelNumber', returns: 'void', desc: '输出置为空闲状态' },
    ],
    configs: [
      { name: 'PwmChannelConfigSet', type: 'Pwm_ChannelConfigType', desc: 'PWM 通道配置', default: '见 Pwm_Cfg.c' },
    ],
    dependencies: ['Det (开发时)'],
    codeExample: `/* PWM 占空比设置示例 */
#include "Pwm.h"

void Pwm_ControlMotor(void)
{
    /* 初始化 PWM */
    Pwm_Init(&Pwm_Config);

    /* 设置通道 0 占空比为 50% */
    Pwm_SetDutyCycle(PWM_CHANNEL_0, 0x8000);

    /* 动态调整占空比到 75% */
    Pwm_SetDutyCycle(PWM_CHANNEL_0, 0xC000);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.1.0', date: '2026-03-22', changes: ['新增相位偏移配置', '优化中心对齐精度'] },
      { version: 'v1.0.0', date: '2026-02-20', changes: ['初始版本发布'] },
    ],
  },
  Adc: {
    id: 'adc',
    name: 'Adc',
    layer: 'MCAL',
    status: '已完成',
    version: 'v1.2.0',
    stars: 40,
    forks: 9,
    shortDesc: '模数转换驱动',
    overview:
      'Adc 驱动管理模数转换器的单次和连续采样，支持多通道扫描、硬件触发和 DMA 传输，适用于传感器信号采集。',
    features: [
      '单次转换和连续转换模式',
      '多通道扫描序列',
      '硬件/软件触发',
      '12-bit 分辨率',
      '结果对齐方式配置',
      'DMA 结果传输',
    ],
    apis: [
      { name: 'Adc_Init', params: 'const Adc_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 Adc 模块' },
      { name: 'Adc_StartGroupConversion', params: 'Adc_GroupType Group', returns: 'void', desc: '启动组转换' },
      { name: 'Adc_StopGroupConversion', params: 'Adc_GroupType Group', returns: 'void', desc: '停止组转换' },
      { name: 'Adc_ReadGroup', params: 'Adc_GroupType Group, Adc_ValueGroupType* DataBufferPtr', returns: 'Std_ReturnType', desc: '读取组转换结果' },
    ],
    configs: [
      { name: 'AdcChannel', type: 'Adc_ChannelConfigType', desc: 'ADC 通道配置', default: '见 Adc_Cfg.c' },
      { name: 'AdcGroup', type: 'Adc_GroupConfigType', desc: 'ADC 组配置', default: '见 Adc_Cfg.c' },
    ],
    dependencies: ['Det (开发时)'],
    codeExample: `/* ADC 采样示例 */
#include "Adc.h"

void Adc_SampleExample(void)
{
    Adc_ValueGroupType results[4];

    /* 初始化 ADC */
    Adc_Init(&Adc_Config);

    /* 启动通道组 0 转换 */
    Adc_StartGroupConversion(ADC_GROUP_0);

    /* 等待转换完成 (或在中断回调中读取) */
    if (Adc_ReadGroup(ADC_GROUP_0, results) == E_OK)
    {
        /* 处理 4 通道采样结果 */
    }
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.2.0', date: '2026-04-10', changes: ['新增 DMA 传输支持', '优化采样精度校准'] },
      { version: 'v1.0.0', date: '2026-02-25', changes: ['初始版本发布'] },
    ],
  },
  Wdg: {
    id: 'wdg',
    name: 'Wdg',
    layer: 'MCAL',
    status: '已完成',
    version: 'v1.0.0',
    stars: 28,
    forks: 5,
    shortDesc: '看门狗驱动',
    overview:
      'Wdg 驱动提供硬件看门狗的超时配置和喂狗接口，支持内部看门狗和外部看门狗芯片，是系统安全运行的关键保障。',
    features: [
      '超时周期配置',
      '窗口看门狗支持',
      '快速喂狗接口',
      '超时回调通知',
      '调试模式暂停',
      '复位后状态保持',
    ],
    apis: [
      { name: 'Wdg_Init', params: 'const Wdg_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 Wdg 模块' },
      { name: 'Wdg_SetTriggerCondition', params: 'uint16 Timeout', returns: 'void', desc: '设置触发条件/喂狗' },
    ],
    configs: [
      { name: 'WdgSettingsConfig', type: 'Wdg_SettingsConfigType', desc: '看门狗超时配置', default: '见 Wdg_Cfg.c' },
    ],
    dependencies: ['Det (开发时)'],
    codeExample: `/* 看门狗初始化与喂狗 */
#include "Wdg.h"

void Wdg_InitExample(void)
{
    /* 初始化看门狗，超时 100ms */
    Wdg_Init(&Wdg_Config);
}

void MainLoop(void)
{
    while (1)
    {
        /* 业务逻辑 */
        ProcessTasks();

        /* 喂狗，重置超时计数器 */
        Wdg_SetTriggerCondition(100);
    }
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.0.0', date: '2026-03-01', changes: ['初始版本发布'] },
    ],
  },
};

const ecualDetails: Record<string, ModuleDetail> = {
  CanIf: {
    id: 'canif',
    name: 'CanIf',
    layer: 'ECUAL',
    status: '已完成',
    version: 'v1.2.0',
    stars: 52,
    forks: 14,
    shortDesc: 'CAN接口层，统一管理CAN通信',
    overview:
      'CanIf (CAN Interface) 是 ECUAL 层的核心通信接口，为上层模块提供统一的 CAN 报文收发服务，屏蔽底层 Can 驱动的硬件差异。',
    features: [
      '统一 PDU 收发接口',
      '多控制器管理',
      '发送确认/接收指示回调',
      '控制器模式管理 (Started/Stopped/Sleep)',
      '报文过滤配置',
      '总线关闭通知',
    ],
    apis: [
      { name: 'CanIf_Init', params: 'const CanIf_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 CanIf 模块' },
      { name: 'CanIf_Transmit', params: 'PduIdType TxPduId, const PduInfoType* PduInfoPtr', returns: 'Std_ReturnType', desc: '发送 PDU' },
      { name: 'CanIf_SetControllerMode', params: 'uint8 Controller, CanIf_ControllerModeType ControllerMode', returns: 'Std_ReturnType', desc: '设置控制器模式' },
    ],
    configs: [
      { name: 'CanIfHthCfg', type: 'CanIf_HthConfigType', desc: '发送硬件句柄配置', default: '见 CanIf_Cfg.c' },
      { name: 'CanIfRxPduCfg', type: 'CanIf_RxPduConfigType', desc: '接收 PDU 配置', default: '见 CanIf_Cfg.c' },
    ],
    dependencies: ['Can', 'PduR', 'Com', 'CanTp'],
    codeExample: `/* CanIf 发送示例 */
#include "CanIf.h"

void CanIf_SendPdu(void)
{
    PduInfoType pduInfo;
    uint8 data[8] = {0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08};

    pduInfo.SduDataPtr = data;
    pduInfo.SduLength = 8;

    if (CanIf_Transmit(CANIF_TX_PDU_ID_0, &pduInfo) == E_OK)
    {
        /* 发送请求成功 */
    }
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.2.0', date: '2026-04-18', changes: ['优化 PDU 路由性能', '新增总线关闭恢复通知'] },
      { version: 'v1.0.0', date: '2026-03-05', changes: ['初始版本发布'] },
    ],
  },
  IoHwAb: {
    id: 'iohwab',
    name: 'IoHwAb',
    layer: 'ECUAL',
    status: '已完成',
    version: 'v1.1.0',
    stars: 36,
    forks: 8,
    shortDesc: 'IO硬件抽象层',
    overview:
      'IoHwAb (IO Hardware Abstraction) 将底层 Dio/Adc/Pwm 等驱动抽象为标准化接口，使 ASW 组件无需关心具体硬件实现。',
    features: [
      '数字 IO 抽象',
      '模拟量采集抽象',
      'PWM 输出抽象',
      '信号翻转与滤波',
      '硬件通道映射',
    ],
    apis: [
      { name: 'IoHwAb_Init', params: 'const IoHwAb_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 IoHwAb' },
      { name: 'IoHwAb_Dio_WriteChannel', params: 'IoHwAb_ChannelType Channel, IoHwAb_LevelType Level', returns: 'Std_ReturnType', desc: '抽象 DIO 写操作' },
      { name: 'IoHwAb_Adc_GetPhyValue', params: 'IoHwAb_SignalType Signal, float32* Value', returns: 'Std_ReturnType', desc: '获取物理量值' },
    ],
    configs: [
      { name: 'IoHwAbChannel', type: 'IoHwAb_ChannelConfigType', desc: '通道映射配置', default: '见 IoHwAb_Cfg.c' },
    ],
    dependencies: ['Dio', 'Adc', 'Pwm'],
    codeExample: `/* IoHwAb 使用示例 */
#include "IoHwAb.h"

void Sensor_Read(void)
{
    float32 temperature;

    /* 读取温度传感器物理值 (已做量程转换) */
    if (IoHwAb_Adc_GetPhyValue(TEMP_SENSOR_SIG, &temperature) == E_OK)
    {
        /* temperature 单位为摄氏度 */
    }
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.1.0', date: '2026-04-05', changes: ['新增信号滤波配置', '支持多物理单位转换'] },
      { version: 'v1.0.0', date: '2026-03-10', changes: ['初始版本发布'] },
    ],
  },
  CanTp: {
    id: 'cantp',
    name: 'CanTp',
    layer: 'ECUAL',
    status: '已完成',
    version: 'v1.1.0',
    stars: 41,
    forks: 10,
    shortDesc: 'CAN传输协议层(ISO 15765-2)',
    overview:
      'CanTp (CAN Transport Protocol) 实现 ISO 15765-2 标准，在 CAN 报文之上提供多帧分段传输服务，支持单帧、首帧、连续帧和流控帧。',
    features: [
      '单帧 (SF) 传输',
      '多帧分段传输 (FF + CF)',
      '流控帧 (FC) 管理',
      '块大小 (BS) 和间隔 (STmin) 配置',
      '超时检测 (N_Ar, N_Br, N_Cr)',
      '填充字节处理',
    ],
    apis: [
      { name: 'CanTp_Init', params: 'const CanTp_ConfigType* CfgPtr', returns: 'void', desc: '初始化 CanTp' },
      { name: 'CanTp_Transmit', params: 'PduIdType TxPduId, const PduInfoType* PduInfoPtr', returns: 'Std_ReturnType', desc: '发送 PDU (自动分段)' },
      { name: 'CanTp_Shutdown', params: 'void', returns: 'void', desc: '关闭 CanTp' },
    ],
    configs: [
      { name: 'CanTpRxNSdu', type: 'CanTp_RxNSduType', desc: '接收 N-SDU 配置', default: '见 CanTp_Cfg.c' },
      { name: 'CanTpTxNSdu', type: 'CanTp_TxNSduType', desc: '发送 N-SDU 配置', default: '见 CanTp_Cfg.c' },
    ],
    dependencies: ['CanIf', 'PduR'],
    codeExample: `/* CanTp 发送多帧示例 */
#include "CanTp.h"

void CanTp_SendLongMessage(void)
{
    uint8 longData[100]; /* 超过 8 字节的数据 */
    PduInfoType pduInfo;

    /* 填充数据... */
    pduInfo.SduDataPtr = longData;
    pduInfo.SduLength = 100;

    /* CanTp 自动分段发送 */
    CanTp_Transmit(CANTP_TX_NSDU_0, &pduInfo);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.1.0', date: '2026-04-08', changes: ['优化流控算法', '修复连续帧序列号错误'] },
      { version: 'v1.0.0', date: '2026-03-15', changes: ['初始版本发布'] },
    ],
  },
  EthIf: {
    id: 'ethif',
    name: 'EthIf',
    layer: 'ECUAL',
    status: '已完成',
    version: 'v1.0.0',
    stars: 33,
    forks: 7,
    shortDesc: '以太网接口层',
    overview:
      'EthIf (Ethernet Interface) 为上层提供标准以太网报文收发服务，支持 VLAN 标记、交换机管理和链路状态监控。',
    features: [
      '以太网帧收发',
      'VLAN 标记支持',
      '交换机端口管理',
      '链路状态监控',
      '帧校验 (FCS)',
    ],
    apis: [
      { name: 'EthIf_Init', params: 'const EthIf_ConfigType* CfgPtr', returns: 'void', desc: '初始化 EthIf' },
      { name: 'EthIf_Transmit', params: 'uint8 CtrlIdx, Eth_BufIdxType BufIdx, Eth_FrameType FrameType, uint16 LenByte', returns: 'Std_ReturnType', desc: '发送以太网帧' },
    ],
    configs: [
      { name: 'EthIfCtrlConfig', type: 'EthIf_CtrlConfigType', desc: '控制器配置', default: '见 EthIf_Cfg.c' },
    ],
    dependencies: ['Eth', 'TcpIp'],
    codeExample: `/* EthIf 初始化示例 */
#include "EthIf.h"

void EthIf_InitExample(void)
{
    EthIf_Init(&EthIf_Config);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.0.0', date: '2026-03-20', changes: ['初始版本发布'] },
    ],
  },
  MemIf: {
    id: 'memif',
    name: 'MemIf',
    layer: 'ECUAL',
    status: '已完成',
    version: 'v1.1.0',
    stars: 29,
    forks: 6,
    shortDesc: '存储器接口层',
    overview:
      'MemIf (Memory Interface) 提供统一的存储器抽象接口，使 NvM 无需关心底层是 Fee 还是 Ea 实现。',
    features: [
      'Fee/Ea 统一接口',
      '块读写抽象',
      '状态查询',
      '设备索引管理',
    ],
    apis: [
      { name: 'MemIf_Init', params: 'void', returns: 'void', desc: '初始化 MemIf' },
      { name: 'MemIf_Read', params: 'uint8 DeviceIndex, uint16 BlockNumber, uint16 BlockOffset, uint8* DataBufferPtr, uint16 Length', returns: 'Std_ReturnType', desc: '读取存储块' },
      { name: 'MemIf_Write', params: 'uint8 DeviceIndex, uint16 BlockNumber, uint8* DataBufferPtr', returns: 'Std_ReturnType', desc: '写入存储块' },
    ],
    configs: [
      { name: 'MemIfDeviceConfig', type: 'MemIf_DeviceConfigType', desc: '设备配置', default: '见 MemIf_Cfg.c' },
    ],
    dependencies: ['Fee', 'Ea'],
    codeExample: `/* MemIf 读写示例 */
#include "MemIf.h"

void MemIf_Example(void)
{
    uint8 data[16];

    /* 从 Fee 设备读取块 10 */
    MemIf_Read(MEMIF_FEE_DEVICE, 10, 0, data, 16);

    /* 修改后写回 */
    MemIf_Write(MEMIF_FEE_DEVICE, 10, data);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.1.0', date: '2026-04-02', changes: ['优化设备索引检查'] },
      { version: 'v1.0.0', date: '2026-03-22', changes: ['初始版本发布'] },
    ],
  },
  Fee: {
    id: 'fee',
    name: 'Fee',
    layer: 'ECUAL',
    status: '已完成',
    version: 'v1.1.0',
    stars: 31,
    forks: 7,
    shortDesc: 'Flash EEPROM仿真层',
    overview:
      'Fee (Flash EEPROM Emulation) 在 Flash 存储器上模拟 EEPROM 的随机读写特性，提供掉电安全的数据存储和磨损均衡。',
    features: [
      'Flash 模拟 EEPROM',
      '掉电安全写操作',
      '磨损均衡算法',
      '垃圾回收机制',
      '块一致性校验',
    ],
    apis: [
      { name: 'Fee_Init', params: 'void', returns: 'void', desc: '初始化 Fee' },
      { name: 'Fee_Read', params: 'uint16 BlockNumber, uint16 BlockOffset, uint8* DataBufferPtr, uint16 Length', returns: 'Std_ReturnType', desc: '读取块数据' },
      { name: 'Fee_Write', params: 'uint16 BlockNumber, uint8* DataBufferPtr', returns: 'Std_ReturnType', desc: '写入块数据' },
      { name: 'Fee_JobResult', params: 'void', returns: 'MemIf_JobResultType', desc: '获取异步作业结果' },
    ],
    configs: [
      { name: 'FeeBlockConfiguration', type: 'Fee_BlockConfigType', desc: '块大小和配置', default: '见 Fee_Cfg.c' },
    ],
    dependencies: ['Fls', 'MemIf'],
    codeExample: `/* Fee 数据存储示例 */
#include "Fee.h"

void Fee_StoreData(void)
{
    uint8 calibration[8] = {0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08};

    /* 写入标定数据到块 1 */
    Fee_Write(1, calibration);

    /* 查询作业结果 */
    while (Fee_JobResult() == MEMIF_JOB_PENDING)
    {
        Fee_MainFunction();
    }
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.1.0', date: '2026-04-12', changes: ['优化垃圾回收触发策略', '修复偶发性块损坏'] },
      { version: 'v1.0.0', date: '2026-03-25', changes: ['初始版本发布'] },
    ],
  },
  Ea: {
    id: 'ea',
    name: 'Ea',
    layer: 'ECUAL',
    status: '已完成',
    version: 'v1.0.0',
    stars: 25,
    forks: 5,
    shortDesc: 'EEPROM抽象层',
    overview:
      'Ea (EEPROM Abstraction) 为外部 EEPROM 芯片提供标准访问接口，支持页面读写和错误恢复。',
    features: [
      '外部 EEPROM 标准接口',
      '页面读写操作',
      '写保护管理',
      'ECC 错误检测',
    ],
    apis: [
      { name: 'Ea_Init', params: 'void', returns: 'void', desc: '初始化 Ea' },
      { name: 'Ea_Read', params: 'uint16 BlockNumber, uint16 BlockOffset, uint8* DataBufferPtr, uint16 Length', returns: 'Std_ReturnType', desc: '读取块数据' },
      { name: 'Ea_Write', params: 'uint16 BlockNumber, uint8* DataBufferPtr', returns: 'Std_ReturnType', desc: '写入块数据' },
    ],
    configs: [
      { name: 'EaBlockConfiguration', type: 'Ea_BlockConfigType', desc: '块配置', default: '见 Ea_Cfg.c' },
    ],
    dependencies: ['Eep', 'MemIf'],
    codeExample: `/* Ea 读写示例 */
#include "Ea.h"

void Ea_Example(void)
{
    uint8 config[16];

    Ea_Read(0, 0, config, 16);
    Ea_Write(0, config);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.0.0', date: '2026-03-28', changes: ['初始版本发布'] },
    ],
  },
  FrIf: {
    id: 'frif',
    name: 'FrIf',
    layer: 'ECUAL',
    status: '已完成',
    version: 'v1.0.0',
    stars: 22,
    forks: 4,
    shortDesc: 'FlexRay接口层',
    overview:
      'FrIf (FlexRay Interface) 为上层提供统一的 FlexRay 通信服务，支持静态和动态段报文收发。',
    features: [
      'FlexRay 帧收发',
      '静态/动态段支持',
      '全局时间同步',
      '集群管理',
    ],
    apis: [
      { name: 'FrIf_Init', params: 'const FrIf_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 FrIf' },
      { name: 'FrIf_Transmit', params: 'PduIdType FrIfTxPduId, const PduInfoType* PduInfoPtr', returns: 'Std_ReturnType', desc: '发送 FlexRay 帧' },
    ],
    configs: [
      { name: 'FrIfPdu', type: 'FrIf_PduConfigType', desc: 'PDU 配置', default: '见 FrIf_Cfg.c' },
    ],
    dependencies: ['Fr', 'PduR'],
    codeExample: `/* FrIf 发送示例 */
#include "FrIf.h"

void FrIf_Send(void)
{
    PduInfoType pdu;
    uint8 data[16];

    pdu.SduDataPtr = data;
    pdu.SduLength = 16;

    FrIf_Transmit(FRIF_TX_PDU_0, &pdu);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.0.0', date: '2026-04-01', changes: ['初始版本发布'] },
    ],
  },
  LinIf: {
    id: 'linif',
    name: 'LinIf',
    layer: 'ECUAL',
    status: '已完成',
    version: 'v1.0.0',
    stars: 24,
    forks: 5,
    shortDesc: 'LIN接口层',
    overview:
      'LinIf (LIN Interface) 管理 LIN 主节点调度表，为上层提供标准 LIN 报文收发和从节点配置服务。',
    features: [
      '调度表管理',
      '主/从节点支持',
      '诊断帧处理 (0x3C/0x3D)',
      '从节点配置',
      '休眠/唤醒管理',
    ],
    apis: [
      { name: 'LinIf_Init', params: 'const LinIf_ConfigType* Config', returns: 'void', desc: '初始化 LinIf' },
      { name: 'LinIf_Transmit', params: 'PduIdType LinIfTxSduId, const PduInfoType* PduInfoPtr', returns: 'Std_ReturnType', desc: '发送 LIN 报文' },
    ],
    configs: [
      { name: 'LinIfFrame', type: 'LinIf_FrameConfigType', desc: '帧配置', default: '见 LinIf_Cfg.c' },
    ],
    dependencies: ['Lin', 'PduR'],
    codeExample: `/* LinIf 初始化示例 */
#include "LinIf.h"

void LinIf_InitExample(void)
{
    LinIf_Init(&LinIf_Config);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v1.0.0', date: '2026-04-03', changes: ['初始版本发布'] },
    ],
  },
};

const serviceDetails: Record<string, ModuleDetail> = {
  Com: {
    id: 'com',
    name: 'Com',
    layer: 'Service',
    status: '开发中',
    version: 'v0.8.0',
    stars: 18,
    forks: 4,
    shortDesc: '通信服务层，信号路由与打包',
    overview:
      'Com (Communication) 是 AutoSAR 通信栈的核心，负责信号打包/解包、路由和周期性发送管理。',
    features: [
      '信号打包与解包',
      '发送模式管理 (周期/事件/混合)',
      '信号网关路由',
      '更新位和失效值处理',
      '大端/小端字节序支持',
      '信号滤波',
    ],
    apis: [
      { name: 'Com_Init', params: 'const Com_ConfigType* config', returns: 'void', desc: '初始化 Com' },
      { name: 'Com_SendSignal', params: 'Com_SignalIdType SignalId, const void* SignalDataPtr', returns: 'uint8', desc: '发送信号' },
      { name: 'Com_ReceiveSignal', params: 'Com_SignalIdType SignalId, void* SignalDataPtr', returns: 'uint8', desc: '接收信号' },
    ],
    configs: [
      { name: 'ComSignal', type: 'Com_SignalType', desc: '信号配置', default: '见 Com_Cfg.c' },
    ],
    dependencies: ['PduR', 'ComM', 'EcuM'],
    codeExample: `/* Com 信号收发示例 */
#include "Com.h"

void Com_SignalExample(void)
{
    uint16 engineSpeed = 3000;

    /* 发送发动机转速信号 */
    Com_SendSignal(ENGINE_SPEED_SIG, &engineSpeed);

    /* 接收车速信号 */
    Com_ReceiveSignal(VEHICLE_SPEED_SIG, &vehicleSpeed);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v0.8.0', date: '2026-04-20', changes: ['新增信号网关路由', '优化周期发送调度'] },
      { version: 'v0.5.0', date: '2026-04-01', changes: ['基础信号打包解包'] },
    ],
  },
  PduR: {
    id: 'pdur',
    name: 'PduR',
    layer: 'Service',
    status: '开发中',
    version: 'v0.7.0',
    stars: 15,
    forks: 3,
    shortDesc: 'PDU路由器，协议数据单元路由',
    overview:
      'PduR (PDU Router) 是通信栈的核心路由模块，负责在不同总线接口和上层模块之间转发 PDU。',
    features: [
      '1:1 / 1:N / N:1 路由',
      '网关路由 (不同总线间转发)',
      'FIFO 缓冲',
      '多播支持',
      '路由表动态配置',
    ],
    apis: [
      { name: 'PduR_Init', params: 'const PduR_PBConfigType* ConfigPtr', returns: 'void', desc: '初始化 PduR' },
      { name: 'PduR_RxIndication', params: 'PduIdType RxPduId, const PduInfoType* PduInfoPtr', returns: 'void', desc: '接收指示' },
      { name: 'PduR_TxConfirmation', params: 'PduIdType TxPduId, Std_ReturnType result', returns: 'void', desc: '发送确认' },
    ],
    configs: [
      { name: 'PduRRoutingPath', type: 'PduR_RoutingPathType', desc: '路由路径配置', default: '见 PduR_Cfg.c' },
    ],
    dependencies: ['CanIf', 'CanTp', 'Com', 'Dcm'],
    codeExample: `/* PduR 路由示例 */
#include "PduR.h"

/* PduR 自动完成路由，无需应用层干预 */
/* CAN -> Com 路由已在配置中定义 */`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v0.7.0', date: '2026-04-22', changes: ['新增 FIFO 缓冲支持', '优化网关路由延迟'] },
      { version: 'v0.5.0', date: '2026-04-05', changes: ['基础路由功能'] },
    ],
  },
  NvM: {
    id: 'nvm',
    name: 'NvM',
    layer: 'Service',
    status: '规划中',
    version: '-',
    stars: 12,
    forks: 2,
    shortDesc: '非易失性存储管理器',
    overview: 'NvM (NVRAM Manager) 管理非易失性数据的存储和恢复，提供块管理和冗余保护。',
    features: ['块管理', '冗余保护', '显式/隐式写', 'ROM 默认数据'],
    apis: [{ name: 'NvM_Init', params: 'void', returns: 'void', desc: '初始化 NvM' }],
    configs: [{ name: 'NvMBlockDescriptor', type: 'NvM_BlockDescriptorType', desc: '块描述符', default: '见 NvM_Cfg.c' }],
    dependencies: ['MemIf', 'Fee', 'Ea'],
    codeExample: '',
    codeLanguage: 'c',
    changelog: [],
  },
  Dcm: {
    id: 'dcm',
    name: 'Dcm',
    layer: 'Service',
    status: '规划中',
    version: '-',
    stars: 10,
    forks: 2,
    shortDesc: '诊断通信管理器(UDS)',
    overview: 'Dcm (Diagnostic Communication Manager) 实现 ISO 14229 (UDS) 诊断协议栈。',
    features: ['UDS 服务实现', '会话管理', '安全访问', 'DID 读写'],
    apis: [{ name: 'Dcm_Init', params: 'const Dcm_ConfigType* ConfigPtr', returns: 'void', desc: '初始化 Dcm' }],
    configs: [{ name: 'DcmDsdServiceTable', type: 'Dcm_DsdServiceTableType', desc: '服务表配置', default: '见 Dcm_Cfg.c' }],
    dependencies: ['PduR', 'Dem'],
    codeExample: '',
    codeLanguage: 'c',
    changelog: [],
  },
  Dem: {
    id: 'dem',
    name: 'Dem',
    layer: 'Service',
    status: '规划中',
    version: '-',
    stars: 8,
    forks: 1,
    shortDesc: '诊断事件管理器',
    overview: 'Dem (Diagnostic Event Manager) 管理诊断事件的状态、计数器和存储。',
    features: ['事件状态管理', '故障计数器', '扩展数据记录', '冻结帧'],
    apis: [{ name: 'Dem_Init', params: 'void', returns: 'void', desc: '初始化 Dem' }],
    configs: [{ name: 'DemEventParameter', type: 'Dem_EventParameterType', desc: '事件参数', default: '见 Dem_Cfg.c' }],
    dependencies: ['Dcm', 'NvM'],
    codeExample: '',
    codeLanguage: 'c',
    changelog: [],
  },
};

const rteDetails: Record<string, ModuleDetail> = {
  Rte: {
    id: 'rte',
    name: 'Rte',
    layer: 'RTE + ASW',
    status: '头文件完成',
    version: 'v0.5.0',
    stars: 14,
    forks: 3,
    shortDesc: '运行时环境，组件间通信接口',
    overview:
      'Rte (Runtime Environment) 是 AutoSAR 应用层组件之间的通信接口，由 RTE 生成器根据软件组件描述自动生成。',
    features: [
      'Sender-Receiver 接口',
      'Client-Server 接口',
      '模式切换通知',
      '可运行实体触发',
      '端口映射',
    ],
    apis: [
      { name: 'Rte_Read', params: 'Rte_Instance, PortName_ElementName, DataElement', returns: 'Std_ReturnType', desc: '读取端口数据元素' },
      { name: 'Rte_Write', params: 'Rte_Instance, PortName_ElementName, DataElement', returns: 'Std_ReturnType', desc: '写入端口数据元素' },
      { name: 'Rte_Call', params: 'Rte_Instance, PortName_OperationName, ...', returns: 'Std_ReturnType', desc: '调用服务器操作' },
    ],
    configs: [],
    dependencies: ['Com', 'PduR', 'Os'],
    codeExample: `/* RTE 接口使用示例 */
#include "Rte_Swc1.h"

void Swc1_Runnable(void)
{
    uint16 speed;

    /* 读取输入端口 */
    Rte_Read_Swc1_PPort_VehicleSpeed(&speed);

    /* 处理逻辑... */

    /* 写入输出端口 */
    Rte_Write_Swc1_RPort_DisplaySpeed(speed);
}`,
    codeLanguage: 'c',
    changelog: [
      { version: 'v0.5.0', date: '2026-04-15', changes: ['生成基础头文件', '支持 Sender-Receiver 接口'] },
    ],
  },
  EngineControl: {
    id: 'enginecontrol',
    name: 'EngineControl',
    layer: 'RTE + ASW',
    status: '规划中',
    version: '-',
    stars: 6,
    forks: 1,
    shortDesc: '发动机控制应用组件',
    overview: '发动机控制软件组件，实现空燃比控制、点火正时和怠速控制算法。',
    features: ['空燃比闭环控制', '点火正时优化', '怠速转速控制'],
    apis: [],
    configs: [],
    dependencies: ['Rte', 'Com'],
    codeExample: '',
    codeLanguage: 'c',
    changelog: [],
  },
  VehicleDynamics: {
    id: 'vehicledynamics',
    name: 'VehicleDynamics',
    layer: 'RTE + ASW',
    status: '规划中',
    version: '-',
    stars: 5,
    forks: 1,
    shortDesc: '车辆动力学应用组件',
    overview: '车辆动力学控制组件，包括 ESP、TCS 和底盘控制算法。',
    features: ['ESP 控制', '牵引力控制', '横摆角速度控制'],
    apis: [],
    configs: [],
    dependencies: ['Rte', 'Com'],
    codeExample: '',
    codeLanguage: 'c',
    changelog: [],
  },
  DiagnosticManager: {
    id: 'diagnosticmanager',
    name: 'DiagnosticManager',
    layer: 'RTE + ASW',
    status: '规划中',
    version: '-',
    stars: 4,
    forks: 0,
    shortDesc: '诊断管理应用组件',
    overview: '诊断管理应用组件，提供 OBD 和 UDS 诊断服务的高层接口。',
    features: ['OBD 服务', '故障码管理', '诊断会话控制'],
    apis: [],
    configs: [],
    dependencies: ['Rte', 'Dcm', 'Dem'],
    codeExample: '',
    codeLanguage: 'c',
    changelog: [],
  },
  IOControl: {
    id: 'iocontrol',
    name: 'IOControl',
    layer: 'RTE + ASW',
    status: '规划中',
    version: '-',
    stars: 4,
    forks: 0,
    shortDesc: 'IO控制应用组件',
    overview: 'IO 控制应用组件，抽象整车数字量/模拟量输入输出控制。',
    features: ['数字量 IO 控制', '模拟量采集', 'PWM 输出管理'],
    apis: [],
    configs: [],
    dependencies: ['Rte', 'IoHwAb'],
    codeExample: '',
    codeLanguage: 'c',
    changelog: [],
  },
};

const allModules: Record<string, ModuleDetail> = {
  ...mcalDetails,
  ...ecualDetails,
  ...serviceDetails,
  ...rteDetails,
};

export function getModuleDetail(name: string): ModuleDetail | undefined {
  return allModules[name];
}

export function getAllModuleNames(): string[] {
  return Object.keys(allModules);
}

// Export all modules as array for comparison feature
export const allModulesList: ModuleDetail[] = Object.values(allModules);

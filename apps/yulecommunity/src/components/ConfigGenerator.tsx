import { useState } from 'react';
import {
  Code,
  Cpu,
  Layers,
  Database,
  Settings,
  Copy,
  Download,
  CheckCircle2,
  Play,
  ChevronDown,
  Wrench,
} from 'lucide-react';

type ConfigTab = 'mcal' | 'bsw';

/* ---------- MCAL Module Definitions ---------- */
interface McalParam {
  name: string;
  label: string;
  type: 'number' | 'select' | 'boolean' | 'text';
  options?: string[];
  defaultValue: string | boolean | number;
  desc: string;
}

interface McalModule {
  id: string;
  name: string;
  icon: React.ElementType;
  params: McalParam[];
}

const mcalModules: McalModule[] = [
  {
    id: 'mcu',
    name: 'Mcu (微控制器驱动)',
    icon: Cpu,
    params: [
      { name: 'sysClockHz', label: '系统时钟频率 (Hz)', type: 'number', defaultValue: 1800000000, desc: '目标处理器主频，默认 1.8GHz' },
      { name: 'ahbPrescaler', label: 'AHB 分频系数', type: 'select', options: ['1', '2', '4', '8'], defaultValue: '2', desc: 'AHB 总线时钟分频' },
      { name: 'apbPrescaler', label: 'APB 分频系数', type: 'select', options: ['1', '2', '4', '8'], defaultValue: '4', desc: 'APB 外设时钟分频' },
      { name: 'lowPowerEnable', label: '低功耗模式', type: 'boolean', defaultValue: true, desc: '使能低功耗管理模式' },
      { name: 'wdgClockSrc', label: '看门狗时钟源', type: 'select', options: ['IRC', 'SYSCLK', 'RTC'], defaultValue: 'IRC', desc: '看门狗定时器时钟源选择' },
    ],
  },
  {
    id: 'port',
    name: 'Port (端口驱动)',
    icon: Layers,
    params: [
      { name: 'pinNumber', label: '引脚编号', type: 'select', options: ['GPIO1_IO00', 'GPIO1_IO01', 'GPIO1_IO02', 'GPIO1_IO03', 'GPIO1_IO04', 'GPIO1_IO05'], defaultValue: 'GPIO1_IO00', desc: '选择要配置的 GPIO 引脚' },
      { name: 'pinMode', label: '引脚模式', type: 'select', options: ['INPUT', 'OUTPUT', 'ALTERNATE_0', 'ALTERNATE_1', 'ALTERNATE_2'], defaultValue: 'OUTPUT', desc: '引脚功能模式' },
      { name: 'pullConfig', label: '上下拉配置', type: 'select', options: ['NONE', 'PULL_UP', 'PULL_DOWN'], defaultValue: 'PULL_UP', desc: '内部上下拉电阻配置' },
      { name: 'driveStrength', label: '驱动强度', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'], defaultValue: 'MEDIUM', desc: '引脚输出驱动能力' },
      { name: 'slewRate', label: '压摆率控制', type: 'boolean', defaultValue: false, desc: '使能压摆率控制以降低 EMI' },
    ],
  },
  {
    id: 'can',
    name: 'Can (CAN 控制器驱动)',
    icon: Database,
    params: [
      { name: 'canInstance', label: 'CAN 实例', type: 'select', options: ['CAN0', 'CAN1', 'CAN2'], defaultValue: 'CAN1', desc: '选择 CAN 控制器实例' },
      { name: 'baudrate', label: '波特率 (bps)', type: 'select', options: ['125000', '250000', '500000', '1000000'], defaultValue: '500000', desc: 'CAN 总线通信波特率' },
      { name: 'samplePoint', label: '采样点 (%)', type: 'select', options: ['75', '80', '87.5'], defaultValue: '87.5', desc: '位采样点位置' },
      { name: 'canFdEnable', label: 'CAN FD 模式', type: 'boolean', defaultValue: true, desc: '使能 CAN FD 灵活数据速率' },
      { name: 'fdDataBaudrate', label: 'FD 数据段波特率', type: 'select', options: ['1000000', '2000000', '4000000', '8000000'], defaultValue: '2000000', desc: 'CAN FD 数据段波特率' },
      { name: 'rxFifoDepth', label: '接收 FIFO 深度', type: 'number', defaultValue: 64, desc: '接收缓冲区大小' },
      { name: 'txQueueDepth', label: '发送队列深度', type: 'number', defaultValue: 16, desc: '发送缓冲区大小' },
    ],
  },
  {
    id: 'spi',
    name: 'Spi (SPI 串行外设接口)',
    icon: Layers,
    params: [
      { name: 'spiInstance', label: 'SPI 实例', type: 'select', options: ['SPI0', 'SPI1', 'SPI2', 'SPI3'], defaultValue: 'SPI1', desc: '选择 SPI 控制器实例' },
      { name: 'baudrateHz', label: 'SPI 时钟频率 (Hz)', type: 'number', defaultValue: 10000000, desc: 'SPI 通信时钟频率' },
      { name: 'clockPolarity', label: '时钟极性 (CPOL)', type: 'select', options: ['LOW', 'HIGH'], defaultValue: 'LOW', desc: '空闲时时钟电平' },
      { name: 'clockPhase', label: '时钟相位 (CPHA)', type: 'select', options: ['FIRST_EDGE', 'SECOND_EDGE'], defaultValue: 'FIRST_EDGE', desc: '数据采样边沿' },
      { name: 'dataWidth', label: '数据位宽', type: 'select', options: ['8', '16', '32'], defaultValue: '8', desc: '单次传输数据位宽' },
      { name: 'chipSelectPolarity', label: '片选极性', type: 'select', options: ['ACTIVE_LOW', 'ACTIVE_HIGH'], defaultValue: 'ACTIVE_LOW', desc: '片选信号有效电平' },
    ],
  },
  {
    id: 'gpt',
    name: 'Gpt (通用定时器)',
    icon: Cpu,
    params: [
      { name: 'timerInstance', label: '定时器实例', type: 'select', options: ['GPT1', 'GPT2', 'GPT3', 'GPT4'], defaultValue: 'GPT1', desc: '选择定时器硬件实例' },
      { name: 'clockSource', label: '时钟源', type: 'select', options: ['PERIPHERAL_CLK', 'HIGH_FREQ_REF', 'LOW_FREQ_REF'], defaultValue: 'PERIPHERAL_CLK', desc: '定时器计数时钟源' },
      { name: 'prescaler', label: '预分频系数', type: 'number', defaultValue: 1, desc: '计数器预分频值' },
      { name: 'maxCounterValue', label: '最大计数值', type: 'number', defaultValue: 4294967295, desc: '计数器溢出值 (32-bit)' },
      { name: 'channelMode', label: '通道模式', type: 'select', options: ['CONTINUOUS', 'ONE_SHOT'], defaultValue: 'CONTINUOUS', desc: '计数器运行模式' },
    ],
  },
];

/* ---------- BSW Module Definitions ---------- */
interface BswParam {
  name: string;
  label: string;
  type: 'number' | 'select' | 'boolean' | 'text';
  options?: string[];
  defaultValue: string | boolean | number;
  desc: string;
}

interface BswModule {
  id: string;
  name: string;
  layer: string;
  icon: React.ElementType;
  params: BswParam[];
}

const bswModules: BswModule[] = [
  {
    id: 'com',
    name: 'Com (通信服务层)',
    layer: 'Service',
    icon: Database,
    params: [
      { name: 'numSignals', label: '信号数量', type: 'number', defaultValue: 32, desc: 'COM 模块管理的信号总数' },
      { name: 'numIPdus', label: 'I-PDU 数量', type: 'number', defaultValue: 16, desc: '交互层 PDU 数量' },
      { name: 'signalBufferSize', label: '信号缓冲区大小 (字节)', type: 'number', defaultValue: 256, desc: '信号数据缓冲区总大小' },
      { name: 'txMode', label: '默认发送模式', type: 'select', options: ['DIRECT', 'PERIODIC', 'MIXED'], defaultValue: 'MIXED', desc: 'I-PDU 默认传输模式' },
      { name: 'devErrorDetect', label: '开发错误检测', type: 'boolean', defaultValue: true, desc: '使能 DET 错误检测' },
      { name: 'versionInfoApi', label: '版本信息 API', type: 'boolean', defaultValue: true, desc: '提供版本信息查询接口' },
    ],
  },
  {
    id: 'pdur',
    name: 'PduR (PDU 路由器)',
    layer: 'Service',
    icon: Layers,
    params: [
      { name: 'numRoutingPaths', label: '路由路径数量', type: 'number', defaultValue: 20, desc: 'PDU 路由路径总数' },
      { name: 'numDestinations', label: '每路径最大目标数', type: 'number', defaultValue: 4, desc: '单条路径最多目标模块数' },
      { name: 'fifoDepth', label: 'FIFO 队列深度', type: 'number', defaultValue: 8, desc: '延迟路由 FIFO 深度' },
      { name: 'devErrorDetect', label: '开发错误检测', type: 'boolean', defaultValue: true, desc: '使能 DET 错误检测' },
    ],
  },
  {
    id: 'nvm',
    name: 'NvM (非易失性存储管理器)',
    layer: 'Service',
    icon: Database,
    params: [
      { name: 'numBlocks', label: 'NV Block 数量', type: 'number', defaultValue: 32, desc: '管理的非易失性数据块数量' },
      { name: 'blockSize', label: '块大小 (字节)', type: 'number', defaultValue: 64, desc: '单个 NV Block 大小' },
      { name: 'redundancy', label: '冗余策略', type: 'select', options: ['NONE', 'MIRROR', 'BLOCK_REDUNDANCY'], defaultValue: 'MIRROR', desc: '数据冗余保护策略' },
      { name: 'writeCycleLimit', label: '写入周期限制', type: 'number', defaultValue: 100000, desc: 'Flash 最大写入次数' },
      { name: 'readAllAtInit', label: '初始化时读取全部', type: 'boolean', defaultValue: true, desc: '启动时自动读取所有 NV Block' },
    ],
  },
  {
    id: 'canif',
    name: 'CanIf (CAN 接口层)',
    layer: 'ECUAL',
    icon: Layers,
    params: [
      { name: 'numControllers', label: '控制器数量', type: 'number', defaultValue: 2, desc: 'CAN 控制器实例数' },
      { name: 'numTxPdus', label: '发送 PDU 数量', type: 'number', defaultValue: 32, desc: '发送方向 PDU 配置数' },
      { name: 'numRxPdus', label: '接收 PDU 数量', type: 'number', defaultValue: 32, desc: '接收方向 PDU 配置数' },
      { name: 'softwareFiltering', label: '软件过滤', type: 'boolean', defaultValue: true, desc: '使能软件层面报文过滤' },
      { name: 'devErrorDetect', label: '开发错误检测', type: 'boolean', defaultValue: true, desc: '使能 DET 错误检测' },
    ],
  },
  {
    id: 'iohwab',
    name: 'IoHwAb (IO 硬件抽象层)',
    layer: 'ECUAL',
    icon: Wrench,
    params: [
      { name: 'numAnalogChannels', label: '模拟通道数', type: 'number', defaultValue: 8, desc: 'ADC 模拟输入通道数' },
      { name: 'numDigitalChannels', label: '数字通道数', type: 'number', defaultValue: 16, desc: 'DIO 数字通道数' },
      { name: 'numPwmChannels', label: 'PWM 通道数', type: 'number', defaultValue: 4, desc: 'PWM 输出通道数' },
      { name: 'adcResolution', label: 'ADC 分辨率 (位)', type: 'select', options: ['8', '10', '12', '16'], defaultValue: '12', desc: 'ADC 采样分辨率' },
      { name: 'pwmFrequencyHz', label: 'PWM 默认频率 (Hz)', type: 'number', defaultValue: 1000, desc: 'PWM 默认输出频率' },
    ],
  },
];

/* ---------- Code Generators ---------- */
function generateMcalCode(moduleId: string, values: Record<string, string | boolean | number>): string {
  const timestamp = new Date().toISOString().split('T')[0];
  let code = `/**\n * @file ${moduleId.toUpperCase()}_Cfg.h\n * @brief Auto-generated MCAL ${moduleId.toUpperCase()} Configuration\n * @version 1.0.0\n * @date ${timestamp}\n * @generated-by YuleTech ConfigGenerator\n */\n\n`;
  code += `#ifndef ${moduleId.toUpperCase()}_CFG_H\n`;
  code += `#define ${moduleId.toUpperCase()}_CFG_H\n\n`;
  code += `#include "Std_Types.h"\n\n`;
  code += `/*==================================================================================================\n`;
  code += `*                                    GENERATED CONFIGURATION\n`;
  code += `==================================================================================================*/\n\n`;

  switch (moduleId) {
    case 'mcu':
      code += `/* Clock Configuration */\n`;
      code += `#define MCU_SYS_CLOCK_HZ              (${values.sysClockHz}UL)\n`;
      code += `#define MCU_AHB_PRESCALER             (${values.ahbPrescaler}U)\n`;
      code += `#define MCU_APB_PRESCALER             (${values.apbPrescaler}U)\n`;
      code += `#define MCU_AHB_CLOCK_HZ              (MCU_SYS_CLOCK_HZ / MCU_AHB_PRESCALER)\n`;
      code += `#define MCU_APB_CLOCK_HZ              (MCU_AHB_CLOCK_HZ / MCU_APB_PRESCALER)\n\n`;
      code += `/* Power Management */\n`;
      code += `#define MCU_LOW_POWER_ENABLE          (${values.lowPowerEnable ? 'STD_ON' : 'STD_OFF'})\n\n`;
      code += `/* Watchdog Configuration */\n`;
      code += `#define MCU_WDG_CLOCK_SRC             (MCU_WDG_CLK_${values.wdgClockSrc})\n`;
      break;

    case 'port':
      code += `/* Pin Configuration */\n`;
      code += `#define PORT_PIN_NUMBER               (PORT_${values.pinNumber})\n`;
      code += `#define PORT_PIN_MODE                 (PORT_MODE_${values.pinMode})\n`;
      code += `#define PORT_PIN_PULL                 (PORT_PULL_${values.pullConfig})\n`;
      code += `#define PORT_PIN_DRIVE_STRENGTH       (PORT_DRIVE_${values.driveStrength})\n`;
      code += `#define PORT_PIN_SLEW_RATE_CTRL       (${values.slewRate ? 'STD_ON' : 'STD_OFF'})\n\n`;
      code += `/* Pin Mode Defines */\n`;
      code += `#define PORT_MODE_INPUT               (0x00U)\n`;
      code += `#define PORT_MODE_OUTPUT              (0x01U)\n`;
      code += `#define PORT_MODE_ALTERNATE_0         (0x02U)\n`;
      code += `#define PORT_MODE_ALTERNATE_1         (0x03U)\n`;
      code += `#define PORT_MODE_ALTERNATE_2         (0x04U)\n\n`;
      code += `/* Pull Configuration */\n`;
      code += `#define PORT_PULL_NONE                (0x00U)\n`;
      code += `#define PORT_PULL_UP                  (0x01U)\n`;
      code += `#define PORT_PULL_DOWN                (0x02U)\n`;
      break;

    case 'can':
      code += `/* CAN Controller Configuration */\n`;
      code += `#define CAN_INSTANCE                  (CAN_${values.canInstance})\n`;
      code += `#define CAN_BAUDRATE_BPS              (${values.baudrate}UL)\n`;
      code += `#define CAN_SAMPLE_POINT_PERCENT      (${values.samplePoint}U)\n`;
      code += `#define CAN_FD_ENABLE                 (${values.canFdEnable ? 'STD_ON' : 'STD_OFF'})\n`;
      code += `#define CAN_FD_DATA_BAUDRATE          (${values.fdDataBaudrate}UL)\n\n`;
      code += `/* Buffer Configuration */\n`;
      code += `#define CAN_RX_FIFO_DEPTH             (${values.rxFifoDepth}U)\n`;
      code += `#define CAN_TX_QUEUE_DEPTH            (${values.txQueueDepth}U)\n\n`;
      code += `/* Timing Calculation (sample point ${values.samplePoint}%) */\n`;
      code += `/* Auto-generated: TQ = 8, PropSeg = 3, PhaseSeg1 = 3, PhaseSeg2 = 2 */\n`;
      code += `#define CAN_NBR_TIME_QUANTA           (8U)\n`;
      code += `#define CAN_PROP_SEG                  (3U)\n`;
      code += `#define CAN_PHASE_SEG1                (3U)\n`;
      code += `#define CAN_PHASE_SEG2                (2U)\n`;
      code += `#define CAN_SJW                       (1U)\n`;
      break;

    case 'spi':
      code += `/* SPI Controller Configuration */\n`;
      code += `#define SPI_INSTANCE                  (SPI_${values.spiInstance})\n`;
      code += `#define SPI_BAUDRATE_HZ               (${values.baudrateHz}UL)\n`;
      code += `#define SPI_CLOCK_POLARITY            (SPI_CPOL_${values.clockPolarity})\n`;
      code += `#define SPI_CLOCK_PHASE               (SPI_CPHA_${values.clockPhase})\n`;
      code += `#define SPI_DATA_WIDTH                (${values.dataWidth}U)\n`;
      code += `#define SPI_CS_POLARITY               (SPI_CS_${values.chipSelectPolarity})\n\n`;
      code += `/* Timing: At ${values.baudrateHz}Hz, bit period = ${(1000000000 / Number(values.baudrateHz)).toFixed(1)} ns */\n`;
      break;

    case 'gpt':
      code += `/* GPT Timer Configuration */\n`;
      code += `#define GPT_TIMER_INSTANCE            (GPT_${values.timerInstance})\n`;
      code += `#define GPT_CLOCK_SOURCE              (GPT_CLK_${values.clockSource})\n`;
      code += `#define GPT_PRESCALER                 (${values.prescaler}U)\n`;
      code += `#define GPT_MAX_COUNTER_VALUE         (${values.maxCounterValue}UL)\n`;
      code += `#define GPT_CHANNEL_MODE              (GPT_MODE_${values.channelMode})\n\n`;
      code += `/* Calculated timer resolution */\n`;
      code += `/* GPT_CLK = APB_CLK / GPT_PRESCALER */\n`;
      break;

    default:
      code += `/* Generic configuration for ${moduleId} */\n`;
      Object.entries(values).forEach(([key, val]) => {
        const constName = `${moduleId.toUpperCase()}_CFG_${key.toUpperCase()}`;
        if (typeof val === 'boolean') {
          code += `#define ${constName.padEnd(40)} (${val ? 'STD_ON' : 'STD_OFF'})\n`;
        } else if (typeof val === 'number') {
          code += `#define ${constName.padEnd(40)} (${val}U)\n`;
        } else {
          code += `#define ${constName.padEnd(40)} (${val})\n`;
        }
      });
  }

  code += `\n#endif /* ${moduleId.toUpperCase()}_CFG_H */\n`;
  return code;
}

function generateBswCode(moduleId: string, values: Record<string, string | boolean | number>): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const modUpper = moduleId.toUpperCase();
  let code = `/**\n * @file ${modUpper}_Cfg.h\n * @brief Auto-generated BSW ${modUpper} Configuration\n * @version 1.0.0\n * @date ${timestamp}\n * @generated-by YuleTech ConfigGenerator\n */\n\n`;
  code += `#ifndef ${modUpper}_CFG_H\n`;
  code += `#define ${modUpper}_CFG_H\n\n`;
  code += `#include "Std_Types.h"\n\n`;
  code += `/*==================================================================================================\n`;
  code += `*                                    GENERATED CONFIGURATION\n`;
  code += `==================================================================================================*/\n\n`;

  switch (moduleId) {
    case 'com':
      code += `/* General Configuration */\n`;
      code += `#define COM_NUM_SIGNALS               (${values.numSignals}U)\n`;
      code += `#define COM_NUM_IPDUS                 (${values.numIPdus}U)\n`;
      code += `#define COM_SIGNAL_BUFFER_SIZE        (${values.signalBufferSize}U)\n`;
      code += `#define COM_DEV_ERROR_DETECT          (${values.devErrorDetect ? 'STD_ON' : 'STD_OFF'})\n`;
      code += `#define COM_VERSION_INFO_API          (${values.versionInfoApi ? 'STD_ON' : 'STD_OFF'})\n\n`;
      code += `/* Default Transmission Mode */\n`;
      code += `#define COM_TX_MODE_DIRECT            (0x00U)\n`;
      code += `#define COM_TX_MODE_PERIODIC          (0x01U)\n`;
      code += `#define COM_TX_MODE_MIXED             (0x02U)\n`;
      code += `#define COM_DEFAULT_TX_MODE           (COM_TX_MODE_${values.txMode})\n\n`;
      code += `/* Signal Configuration Array */\n`;
      code += `extern const Com_SignalConfigType Com_SignalConfig[COM_NUM_SIGNALS];\n`;
      code += `extern const Com_IPduConfigType Com_IPduConfig[COM_NUM_IPDUS];\n`;
      break;

    case 'pdur':
      code += `/* Routing Configuration */\n`;
      code += `#define PDUR_NUMBER_OF_ROUTING_PATHS  (${values.numRoutingPaths}U)\n`;
      code += `#define PDUR_MAX_DESTINATIONS_PER_PATH (${values.numDestinations}U)\n`;
      code += `#define PDUR_MAX_FIFO_DEPTH           (${values.fifoDepth}U)\n`;
      code += `#define PDUR_DEV_ERROR_DETECT         (${values.devErrorDetect ? 'STD_ON' : 'STD_OFF'})\n\n`;
      code += `/* Module IDs for Routing */\n`;
      code += `#define PDUR_MODULE_COM               (0x01U)\n`;
      code += `#define PDUR_MODULE_CANIF             (0x02U)\n`;
      code += `#define PDUR_MODULE_DCM               (0x03U)\n`;
      code += `#define PDUR_MODULE_LINIF             (0x04U)\n\n`;
      code += `extern const PduR_RoutingPathConfigType PduR_RoutingPaths[PDUR_NUMBER_OF_ROUTING_PATHS];\n`;
      break;

    case 'nvm':
      code += `/* Block Configuration */\n`;
      code += `#define NVM_NUM_BLOCKS                (${values.numBlocks}U)\n`;
      code += `#define NVM_BLOCK_SIZE                (${values.blockSize}U)\n`;
      code += `#define NVM_WRITE_CYCLE_LIMIT         (${values.writeCycleLimit}UL)\n`;
      code += `#define NVM_READ_ALL_AT_INIT          (${values.readAllAtInit ? 'STD_ON' : 'STD_OFF'})\n\n`;
      code += `/* Redundancy Strategy */\n`;
      code += `#define NVM_REDUNDANCY_NONE           (0x00U)\n`;
      code += `#define NVM_REDUNDANCY_MIRROR         (0x01U)\n`;
      code += `#define NVM_REDUNDANCY_BLOCK          (0x02U)\n`;
      code += `#define NVM_REDUNDANCY_STRATEGY       (NVM_REDUNDANCY_${values.redundancy})\n\n`;
      code += `/* Memory Layout */\n`;
      code += `/* Total NV memory: ${Number(values.numBlocks) * Number(values.blockSize)} bytes */\n`;
      code += `/* Flash sectors required: ${Math.ceil((Number(values.numBlocks) * Number(values.blockSize)) / 4096)} (4KB each) */\n`;
      break;

    case 'canif':
      code += `/* Controller Configuration */\n`;
      code += `#define CANIF_NUM_CONTROLLERS         (${values.numControllers}U)\n`;
      code += `#define CANIF_NUM_TX_PDUS             (${values.numTxPdus}U)\n`;
      code += `#define CANIF_NUM_RX_PDUS             (${values.numRxPdus}U)\n`;
      code += `#define CANIF_SOFTWARE_FILTERING      (${values.softwareFiltering ? 'STD_ON' : 'STD_OFF'})\n`;
      code += `#define CANIF_DEV_ERROR_DETECT        (${values.devErrorDetect ? 'STD_ON' : 'STD_OFF'})\n\n`;
      code += `/* PDU Configuration */\n`;
      code += `extern const CanIf_TxPduConfigType CanIf_TxPduConfig[CANIF_NUM_TX_PDUS];\n`;
      code += `extern const CanIf_RxPduConfigType CanIf_RxPduConfig[CANIF_NUM_RX_PDUS];\n`;
      break;

    case 'iohwab':
      code += `/* Channel Configuration */\n`;
      code += `#define IOHWAB_NUM_ANALOG_CHANNELS    (${values.numAnalogChannels}U)\n`;
      code += `#define IOHWAB_NUM_DIGITAL_CHANNELS   (${values.numDigitalChannels}U)\n`;
      code += `#define IOHWAB_NUM_PWM_CHANNELS       (${values.numPwmChannels}U)\n`;
      code += `#define IOHWAB_ADC_RESOLUTION         (${values.adcResolution}U)\n`;
      code += `#define IOHWAB_PWM_DEFAULT_FREQ_HZ    (${values.pwmFrequencyHz}UL)\n\n`;
      code += `/* ADC Voltage Reference */\n`;
      code += `#define IOHWAB_ADC_VREF_MV            (3300U)  /* 3.3V reference */\n`;
      code += `/* ADC LSB value: ${(3300 / Math.pow(2, Number(values.adcResolution))).toFixed(3)} mV */\n`;
      break;

    default:
      code += `/* Generic configuration for ${moduleId} */\n`;
      Object.entries(values).forEach(([key, val]) => {
        const constName = `${modUpper}_CFG_${key.toUpperCase()}`;
        if (typeof val === 'boolean') {
          code += `#define ${constName.padEnd(40)} (${val ? 'STD_ON' : 'STD_OFF'})\n`;
        } else if (typeof val === 'number') {
          code += `#define ${constName.padEnd(40)} (${val}U)\n`;
        } else {
          code += `#define ${constName.padEnd(40)} (${val})\n`;
        }
      });
  }

  code += `\n#endif /* ${modUpper}_CFG_H */\n`;
  return code;
}

/* ---------- Component ---------- */
export function ConfigGenerator() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('mcal');
  const [selectedMcalModule, setSelectedMcalModule] = useState<string>(mcalModules[0].id);
  const [selectedBswModule, setSelectedBswModule] = useState<string>(bswModules[0].id);
  const [mcalValues, setMcalValues] = useState<Record<string, Record<string, string | boolean | number>>>(() => {
    const mcalDefaults: Record<string, Record<string, string | boolean | number>> = {};
    mcalModules.forEach((mod) => {
      mcalDefaults[mod.id] = {};
      mod.params.forEach((p) => { mcalDefaults[mod.id][p.name] = p.defaultValue; });
    });
    return mcalDefaults;
  });
  const [bswValues, setBswValues] = useState<Record<string, Record<string, string | boolean | number>>>(() => {
    const bswDefaults: Record<string, Record<string, string | boolean | number>> = {};
    bswModules.forEach((mod) => {
      bswDefaults[mod.id] = {};
      mod.params.forEach((p) => { bswDefaults[mod.id][p.name] = p.defaultValue; });
    });
    return bswDefaults;
  });
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const currentMcalModule = mcalModules.find((m) => m.id === selectedMcalModule) || mcalModules[0];
  const currentBswModule = bswModules.find((m) => m.id === selectedBswModule) || bswModules[0];

  function handleMcalChange(paramName: string, value: string | boolean | number) {
    setMcalValues((prev) => ({
      ...prev,
      [selectedMcalModule]: { ...prev[selectedMcalModule], [paramName]: value },
    }));
  }

  function handleBswChange(paramName: string, value: string | boolean | number) {
    setBswValues((prev) => ({
      ...prev,
      [selectedBswModule]: { ...prev[selectedBswModule], [paramName]: value },
    }));
  }

  function handleGenerateMcal() {
    const vals = mcalValues[selectedMcalModule] || {};
    const code = generateMcalCode(selectedMcalModule, vals);
    setGeneratedCode(code);
  }

  function handleGenerateBsw() {
    const vals = bswValues[selectedBswModule] || {};
    const code = generateBswCode(selectedBswModule, vals);
    setGeneratedCode(code);
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const moduleId = activeTab === 'mcal' ? selectedMcalModule : selectedBswModule;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moduleId.toUpperCase()}_Cfg.h`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="py-16 bg-card/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-sm font-medium mb-4">
            <Settings className="w-4 h-4" />
            在线配置工具
          </span>
          <h2 className="text-3xl font-bold mb-3">
            可视化配置生成器
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            通过图形化界面配置 MCAL 驱动和 BSW 模块参数，一键生成符合 AutoSAR 标准的
            C 语言配置头文件，直接集成到您的项目中。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted rounded-xl p-1">
            <button
              onClick={() => { setActiveTab('mcal'); setGeneratedCode(''); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'mcal'
                  ? 'bg-[hsl(var(--primary))] text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Cpu className="w-4 h-4" />
              MCAL 配置
            </button>
            <button
              onClick={() => { setActiveTab('bsw'); setGeneratedCode(''); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'bsw'
                  ? 'bg-[hsl(var(--primary))] text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-4 h-4" />
              BSW 配置
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4 text-[hsl(var(--accent))]" />
                参数配置
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Module Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  选择模块
                </label>
                <div className="relative">
                  <select
                    value={activeTab === 'mcal' ? selectedMcalModule : selectedBswModule}
                    onChange={(e) =>
                      activeTab === 'mcal'
                        ? setSelectedMcalModule(e.target.value)
                        : setSelectedBswModule(e.target.value)
                    }
                    className="w-full pl-10 pr-10 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/50 appearance-none"
                  >
                    {(activeTab === 'mcal' ? mcalModules : bswModules).map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        {mod.name}
                      </option>
                    ))}
                  </select>
                  <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Parameters */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {(activeTab === 'mcal' ? currentMcalModule.params : currentBswModule.params).map((param) => (
                  <div key={param.name}>
                    <label className="block text-sm font-medium mb-1.5">
                      {param.label}
                    </label>
                    {param.type === 'select' && param.options ? (
                      <select
                        value={String(
                          (activeTab === 'mcal'
                            ? mcalValues[selectedMcalModule]?.[param.name]
                            : bswValues[selectedBswModule]?.[param.name]) ?? param.defaultValue
                        )}
                        onChange={(e) =>
                          activeTab === 'mcal'
                            ? handleMcalChange(param.name, e.target.value)
                            : handleBswChange(param.name, e.target.value)
                        }
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/50"
                      >
                        {param.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : param.type === 'boolean' ? (
                      <button
                        onClick={() =>
                          activeTab === 'mcal'
                            ? handleMcalChange(
                                param.name,
                                !(mcalValues[selectedMcalModule]?.[param.name] ?? param.defaultValue)
                              )
                            : handleBswChange(
                                param.name,
                                !(bswValues[selectedBswModule]?.[param.name] ?? param.defaultValue)
                              )
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                          (activeTab === 'mcal'
                            ? mcalValues[selectedMcalModule]?.[param.name]
                            : bswValues[selectedBswModule]?.[param.name]) ?? param.defaultValue
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                            : 'bg-muted border-border text-muted-foreground'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {(activeTab === 'mcal'
                          ? mcalValues[selectedMcalModule]?.[param.name]
                          : bswValues[selectedBswModule]?.[param.name]) ?? param.defaultValue
                          ? '已启用'
                          : '已禁用'}
                      </button>
                    ) : (
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={String(
                          (activeTab === 'mcal'
                            ? mcalValues[selectedMcalModule]?.[param.name]
                            : bswValues[selectedBswModule]?.[param.name]) ?? param.defaultValue
                        )}
                        onChange={(e) =>
                          activeTab === 'mcal'
                            ? handleMcalChange(
                                param.name,
                                param.type === 'number' ? Number(e.target.value) : e.target.value
                              )
                            : handleBswChange(
                                param.name,
                                param.type === 'number' ? Number(e.target.value) : e.target.value
                              )
                        }
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/50 font-mono"
                      />
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{param.desc}</p>
                  </div>
                ))}
              </div>

              {/* Generate Button */}
              <button
                onClick={activeTab === 'mcal' ? handleGenerateMcal : handleGenerateBsw}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl font-semibold hover:bg-[hsl(var(--primary-glow))] transition-all"
              >
                <Play className="w-4 h-4" />
                生成配置代码
              </button>
            </div>
          </div>

          {/* Code Preview Panel */}
          <div className="bg-[#1a1a2e] border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-[hsl(var(--accent))]" />
                生成的代码
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!generatedCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-30"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '已复制' : '复制'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!generatedCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-30"
                >
                  <Download className="w-3.5 h-3.5" />
                  下载
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {generatedCode ? (
                <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {generatedCode}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <Code className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">点击左侧"生成配置代码"按钮</p>
                  <p className="text-xs mt-1">生成符合 AutoSAR 标准的 C 语言头文件</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

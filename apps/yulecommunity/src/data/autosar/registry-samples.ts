import type { RegistryModule } from './registry-types';

export const REGISTRY_MODULES: RegistryModule[] = [
  {
    id: 'can-stack',
    name: 'CAN Stack (CAN/CANFD/TCAN)',
    version: '2.1.0',
    layer: 'MCAL',
    description: '完整的 CAN/CANFD/TCAN 协议栈实现，支持经典 CAN 2.0 和 CAN FD 灵活数据速率。包含 Can_Init、Can_Write、Can_Read 等标准 API，支持 DLC 校验、错误处理及 Bus-Off 恢复。',
    tags: ['CAN', 'CANFD', 'TCAN', '通信', '协议栈', 'MCAL'],
    author: 'YuleTech AutoSAR Team',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-can-stack",
      "description": "AutoSAR CAN Stack配置",
      "version": "2.1.0",
      "vendor": "YuleTech",
      "mcu": "S32K144",
      "module": {
        "Can": {
          "CanGeneral": {
            "CanDevErrorDetect": false,
            "CanVersionCheckApi": true,
            "CanTimeoutDuration": 100,
            "CanMaxRxBufferSize": 64,
            "CanMaxTxBufferSize": 64
          },
          "CanConfigSet": {
            "CanControllers": [
              {
                "id": "CanController_0",
                "CanControllerActivation": true,
                "CanControllerBaudRate": 500000,
                "CanControllerBaudRateConfig": {
                  "CanControllerBaudRate": 500000,
                  "CanControllerBaudRateFD": 2000000
                },
                "CanControllerPropSeg": 6,
                "CanControllerSeg1": 7,
                "CanControllerSeg2": 2,
                "CanControllerSyncJumpWidth": 1
              }
            ],
            "CanHohConfig": [
              { "id": "CanHoh_0", "CanObjectType": "BASIC", "CanHohType": "FULL_CAN" },
              { "id": "CanHoh_1", "CanObjectType": "BASIC", "CanHohType": "BASIC_CAN" }
            ]
          }
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['S32K144', 'S32K344', 'S32G274A', 'TC397', 'STM32H743'],
      os: ['FreeRTOS', 'AUTOSAR OS', 'Bare-metal'],
      compiler: ['GCC ARM Embedded', 'IAR Embedded Workbench', 'ARM Compiler 6', 'Tasking TriCore'],
    },
    dependencies: [
      { name: 'MCU Driver', version: '>=1.0.0', optional: false },
      { name: 'Port Driver', version: '>=1.0.0', optional: false },
    ],
    stats: { downloads: 2847, rating: 4.8, reviewCount: 156 },
    status: 'published',
    timestamps: {
      created: '2024-08-15T10:00:00Z',
      updated: '2025-03-20T14:30:00Z',
      published: '2024-09-01T08:00:00Z',
    },
  },
  {
    id: 'dio-driver',
    name: 'DIO Driver (通用数字I/O)',
    version: '1.5.2',
    layer: 'MCAL',
    description: '通用数字 I/O 驱动，兼容标准 AutoSAR DIO 规范。支持 Dio_ReadChannel、Dio_WriteChannel、Dio_ReadPort、Dio_WritePort，以及通道组批量读写和电平翻转功能。',
    tags: ['DIO', 'GPIO', '数字IO', 'MCAL', '基础驱动'],
    author: 'YuleTech AutoSAR Team',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-dio-driver",
      "description": "AutoSAR DIO驱动配置",
      "version": "1.5.2",
      "vendor": "YuleTech",
      "mcu": "S32K144",
      "module": {
        "Dio": {
          "DioGeneral": {
            "DioDevErrorDetect": false,
            "DioVersionCheckApi": true,
            "DioFlipChannelApi": true,
            "DioMaskedWritePortApi": true
          },
          "DioConfigSet": {
            "DioPorts": [
              { "id": "DioPort_A", "dioPortId": 0, "dioPortDirection": "INPUT" },
              { "id": "DioPort_B", "dioPortId": 1, "dioPortDirection": "OUTPUT" },
              { "id": "DioPort_C", "dioPortId": 2, "dioPortDirection": "INPUT" },
              { "id": "DioPort_D", "dioPortId": 3, "dioPortDirection": "OUTPUT" }
            ],
            "DioChannels": [
              { "id": "DioChannel_0", "dioPortId": 0, "dioChannelId": 5, "dioChannelDirection": "IN" },
              { "id": "DioChannel_1", "dioPortId": 1, "dioChannelId": 3, "dioChannelDirection": "OUT" }
            ]
          }
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['S32K144', 'S32K344', 'i.MX8M Mini', 'i.MX6UL', 'STM32H743', 'STM32F407', 'TC397', 'RH850/U2A'],
      os: ['FreeRTOS', 'ThreadX', 'Zephyr', 'AUTOSAR OS', 'Bare-metal'],
      compiler: ['GCC ARM Embedded', 'IAR Embedded Workbench', 'ARM Compiler 6', 'Green Hills MULTI', 'Tasking TriCore', 'Renesas CC-RH'],
    },
    dependencies: [
      { name: 'Mcu Driver', version: '>=1.0.0', optional: false },
      { name: 'Port Driver', version: '>=1.0.0', optional: false },
    ],
    stats: { downloads: 5231, rating: 4.9, reviewCount: 342 },
    status: 'published',
    timestamps: {
      created: '2024-06-01T09:00:00Z',
      updated: '2025-02-28T11:00:00Z',
      published: '2024-06-15T10:00:00Z',
    },
  },
  {
    id: 'spi-master',
    name: 'SPI Master/Slave 驱动',
    version: '2.0.1',
    layer: 'MCAL',
    description: '高性能 SPI 主从驱动，支持同步/异步模式、DMA 传输、多片选管理。兼容标准 AutoSAR SPI Handler/Driver 规范，支持队列化传输和中断控制。',
    tags: ['SPI', '通信', 'MCAL', 'DMA', '同步', '异步'],
    author: 'YuleTech AutoSAR Team',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-spi-master",
      "description": "AutoSAR SPI Master配置",
      "version": "2.0.1",
      "vendor": "YuleTech",
      "mcu": "S32K144",
      "module": {
        "Spi": {
          "SpiGeneral": {
            "SpiDevErrorDetect": false,
            "SpiVersionCheckApi": true,
            "SpiInterruptibleSeq": true,
            "SpiCancelApi": true
          },
          "SpiConfigSet": {
            "SpiChannels": [
              { "id": "SpiChannel_0", "spiChannelId": 0, "spiChannelType": "HALF_DUPLEX", "spiDataWidth": 8 },
              { "id": "SpiChannel_1", "spiChannelId": 1, "spiChannelType": "FULL_DUPLEX", "spiDataWidth": 16 }
            ],
            "SibNtfConfig": [
              { "id": "SibNtf_0", "spiNotificationType": "TX_COMPLETE" }
            ]
          }
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['S32K144', 'TC397', 'TC212', 'STM32H743', 'STM32G474', 'i.MX8M Mini'],
      os: ['FreeRTOS', 'AUTOSAR OS', 'Bare-metal'],
      compiler: ['GCC ARM Embedded', 'IAR Embedded Workbench', 'ARM Compiler 6', 'Tasking TriCore'],
    },
    dependencies: [
      { name: 'DMA Driver', version: '>=1.0.0', optional: true },
      { name: 'Port Driver', version: '>=1.0.0', optional: false },
    ],
    stats: { downloads: 1892, rating: 4.6, reviewCount: 98 },
    status: 'published',
    timestamps: {
      created: '2024-09-20T08:00:00Z',
      updated: '2025-04-01T16:00:00Z',
      published: '2024-10-05T09:00:00Z',
    },
  },
  {
    id: 'mcu-clock-config',
    name: 'MCU Clock & Reset Manager',
    version: '1.8.0',
    layer: 'MCAL',
    description: 'MCU 时钟和复位管理模块，支持 PLL 频率配置、时钟树设置、看门狗管理、低功耗模式切换。自动适配不同 MCU 的时钟树拓扑。',
    tags: ['MCU', '时钟', '复位', '低功耗', 'PLL', 'MCAL'],
    author: 'YuleTech AutoSAR Team',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-mcu-clock",
      "description": "AutoSAR MCU Clock配置",
      "version": "1.8.0",
      "vendor": "YuleTech",
      "mcu": "S32K144",
      "module": {
        "Mcu": {
          "McuGeneral": {
            "McuDevErrorDetect": false,
            "McuVersionCheckApi": true,
            "McuPerformResetApi": true,
            "McuGetResetReasonApi": true
          },
          "McuClockSettingConfig": [
            {
              "id": "McuClockSetting_0",
              "mcuClockSrc": "PLL",
              "mcuClockSrcFreq": 80000000,
              "mcuPllFreq": 160000000,
              "mcuSysClkFreq": 160000000,
              "mcuBusClkFreq": 80000000
            }
          ],
          "McuResetReasonConfig": {
            "McuEnablePowerOnReset": true,
            "McuEnableExternalReset": true,
            "McuEnableWatchdogReset": true
          }
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['S32K144', 'S32K344', 'S32G274A', 'TC397', 'STM32H743', 'STM32F407', 'i.MX8M Mini', 'RH850/F1KM'],
      os: ['FreeRTOS', 'AUTOSAR OS', 'Bare-metal'],
      compiler: ['GCC ARM Embedded', 'IAR Embedded Workbench', 'ARM Compiler 6', 'Tasking TriCore', 'Renesas CC-RH'],
    },
    dependencies: [],
    stats: { downloads: 4156, rating: 4.7, reviewCount: 221 },
    status: 'published',
    timestamps: {
      created: '2024-05-10T07:00:00Z',
      updated: '2025-03-15T10:00:00Z',
      published: '2024-05-25T09:00:00Z',
    },
  },
  {
    id: 'os-scheduler',
    name: 'AUTOSAR OS 调度器 (OSEK/VDX)',
    version: '3.2.0',
    layer: 'Service',
    description: '完整 OSEK/VDX 标准调度器实现，支持优先级调度、时间触发的 TASK、ISR 中断服务管理、资源管理、事件机制、ALARM 定时器和计数服务。',
    tags: ['OS', '调度器', 'OSEK', 'VDX', '实时', '任务', 'Service'],
    author: 'YuleTech AutoSAR Team',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-os-scheduler",
      "description": "AUTOSAR OS调度器配置",
      "version": "3.2.0",
      "vendor": "YuleTech",
      "mcu": "TC397",
      "module": {
        "Os": {
          "OsGeneral": {
            "OsStackMonitoring": true,
            "OsScheduleCounter": "OsCounter_SystemTick",
            "OsUseGetServiceId": true
          },
          "OsTaskConfig": [
            { "id": "Task_Init", "taskPriority": 10, "taskActivation": 1, "taskSchedule": "FULL", "taskStackSize": 1024 },
            { "id": "Task_CanRx", "taskPriority": 20, "taskActivation": 5, "taskSchedule": "FULL", "taskStackSize": 512 },
            { "id": "Task_CanTx", "taskPriority": 15, "taskActivation": 3, "taskSchedule": "FULL", "taskStackSize": 512 },
            { "id": "Task_Idle", "taskPriority": 1, "taskActivation": 1, "taskSchedule": "FULL", "taskStackSize": 256 }
          ],
          "OsCounterConfig": [
            { "id": "OsCounter_SystemTick", "ticksPerBase": 1, "maxAllowedValue": 4294967295, "minCycle": 1 }
          ]
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['TC397', 'TC212', 'TC334', 'S32K144', 'S32G274A', 'RH850/U2A'],
      os: ['AUTOSAR OS'],
      compiler: ['Tasking TriCore', 'Green Hills MULTI', 'Renesas CC-RH', 'GCC ARM Embedded'],
    },
    dependencies: [
      { name: 'MCU Driver', version: '>=1.0.0', optional: false },
      { name: 'Timer Driver', version: '>=1.0.0', optional: false },
    ],
    stats: { downloads: 3241, rating: 4.8, reviewCount: 189 },
    status: 'published',
    timestamps: {
      created: '2024-07-01T10:00:00Z',
      updated: '2025-04-10T08:00:00Z',
      published: '2024-07-20T11:00:00Z',
    },
  },
  {
    id: 'lin-master',
    name: 'LIN Master/Slave 协议栈',
    version: '1.3.0',
    layer: 'ECUAL',
    description: 'LIN 2.2 协议栈实现，支持主从模式、帧调度表、诊断传输层。兼容标准 LIN 规范，支持自动波特率检测和帧超时监控。',
    tags: ['LIN', '通信', 'ECUAL', '协议栈', '车身'],
    author: 'Community Contributor - WangX',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-lin-master",
      "description": "LIN 2.2协议栈配置",
      "version": "1.3.0",
      "vendor": "Community",
      "mcu": "S32K144",
      "module": {
        "Lin": {
          "LinGeneral": {
            "LinDevErrorDetect": true,
            "LinVersionCheckApi": true,
            "LinTimeoutDuration": 1000
          },
          "LinConfigSet": {
            "LinControllers": [
              {
                "id": "LinController_0",
                "linControllerBaudRate": 19200,
                "linControllerWakeUpSupport": true,
                "linControllerMode": "MASTER"
              }
            ],
            "LinSchedules": [
              {
                "id": "LinSchedule_Default",
                "linScheduleEntries": [
                  { "linFrameId": 0, "linFrameResponseType": "SLAVE_RESPONSE", "linFrameDlc": 8, "linEntryDelay": 10 },
                  { "linFrameId": 1, "linFrameResponseType": "MASTER_RESPONSE", "linFrameDlc": 6, "linEntryDelay": 10 }
                ]
              }
            ]
          }
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['S32K144', 'S32K344', 'TC397', 'STM32F407', 'RH850/F1KM'],
      os: ['FreeRTOS', 'AUTOSAR OS', 'Bare-metal'],
      compiler: ['GCC ARM Embedded', 'IAR Embedded Workbench', 'Tasking TriCore', 'Renesas CC-RH'],
    },
    dependencies: [
      { name: 'Port Driver', version: '>=1.0.0', optional: false },
      { name: 'MCU Driver', version: '>=1.0.0', optional: false },
    ],
    stats: { downloads: 987, rating: 4.3, reviewCount: 45 },
    status: 'published',
    timestamps: {
      created: '2024-11-05T09:00:00Z',
      updated: '2025-03-28T12:00:00Z',
      published: '2024-11-20T10:00:00Z',
    },
  },
  {
    id: 'eth-socket',
    name: 'Ethernet Socket Adapter (SoAd)',
    version: '0.9.0',
    layer: 'Complex',
    description: '以太网 Socket 适配器模块，支持 TCP/UDP Socket 管理、多连接、PduR 路由。当前为预览版，支持基础 TCP 连接和数据收发。',
    tags: ['以太网', 'TCP/IP', 'SoAd', 'Socket', '通信', 'Complex', '预览'],
    author: 'YuleTech AutoSAR Team',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-eth-socket",
      "description": "以太网Socket适配器配置",
      "version": "0.9.0",
      "vendor": "YuleTech",
      "mcu": "i.MX8M Mini",
      "module": {
        "SoAd": {
          "SoAdGeneral": {
            "SoAdDevErrorDetect": true,
            "SoAdVersionCheckApi": true,
            "SoAdMaxSocketCount": 16,
            "SoAdMaxConnectionCount": 32
          },
          "SoAdConfigSet": {
            "SoAdSocketConfig": [
              {
                "id": "SoAdSocket_TcpServer",
                "soAdSocketDomain": "AF_INET",
                "soAdSocketType": "SOCK_STREAM",
                "soAdSocketProtocol": "IPPROTO_TCP",
                "soAdSocketPort": 502
              },
              {
                "id": "SoAdSocket_UdpClient",
                "soAdSocketDomain": "AF_INET",
                "soAdSocketType": "SOCK_DGRAM",
                "soAdSocketProtocol": "IPPROTO_UDP",
                "soAdSocketPort": 0
              }
            ]
          }
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['i.MX8M Mini', 'i.MX8M Plus', 'S32G274A', 'TC397'],
      os: ['Linux (PREEMPT_RT)', 'QNX', 'AUTOSAR OS'],
      compiler: ['GCC ARM Embedded', 'ARM Compiler 6', 'Green Hills MULTI', 'Tasking TriCore'],
    },
    dependencies: [
      { name: 'Ethernet Driver (Eth)', version: '>=1.0.0', optional: false },
      { name: 'PduR', version: '>=1.0.0', optional: false },
    ],
    stats: { downloads: 654, rating: 4.1, reviewCount: 28 },
    status: 'draft',
    timestamps: {
      created: '2025-01-10T10:00:00Z',
      updated: '2025-04-05T09:00:00Z',
    },
  },
  {
    id: 'wdg-driver',
    name: '看门狗驱动 (Wdg/WdgM)',
    version: '1.2.0',
    layer: 'Service',
    description: '看门狗驱动和管理模块，支持硬件和软件看门狗。Wdg 提供底层触发/刷新，WdgM 提供多级监控、触发条件和故障恢复策略。',
    tags: ['看门狗', 'Wdg', 'WdgM', '安全', '监控', 'Service'],
    author: 'Community Contributor - LiZ',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-wdg-driver",
      "description": "看门狗驱动配置",
      "version": "1.2.0",
      "vendor": "Community",
      "mcu": "TC397",
      "module": {
        "Wdg": {
          "WdgGeneral": {
            "WdgDevErrorDetect": true,
            "WdgVersionCheckApi": true,
            "WdgSetModeApi": true
          },
          "WdgConfigSet": {
            "WdgModeConfig": [
              { "id": "WdgMode_Off", "wdgModeId": 0, "wdgModeName": "WdgM_OFF" },
              { "id": "WdgMode_Slow", "wdgModeId": 1, "wdgModeName": "WdgM_SLOW", "wdgTimeout": 1000 },
              { "id": "WdgMode_Fast", "wdgModeId": 2, "wdgModeName": "WdgM_FAST", "wdgTimeout": 100 }
            ]
          }
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['TC397', 'TC212', 'TC334', 'S32K144', 'STM32H743', 'STM32F407', 'RH850/U2A'],
      os: ['FreeRTOS', 'AUTOSAR OS', 'Bare-metal'],
      compiler: ['GCC ARM Embedded', 'IAR Embedded Workbench', 'ARM Compiler 6', 'Tasking TriCore', 'Renesas CC-RH', 'TI Code Composer Studio'],
    },
    dependencies: [
      { name: 'MCU Driver', version: '>=1.0.0', optional: false },
    ],
    stats: { downloads: 2134, rating: 4.5, reviewCount: 112 },
    status: 'published',
    timestamps: {
      created: '2024-08-25T08:00:00Z',
      updated: '2025-02-20T15:00:00Z',
      published: '2024-09-10T09:00:00Z',
    },
  },
  {
    id: 'pwm-timer',
    name: 'PWM Timer 驱动 (Icu/Pwm)',
    version: '1.6.0',
    layer: 'MCAL',
    description: 'PWM 输出和输入捕获驱动模块。Pwm 支持多通道 PWM 输出、频率/占空比调制、边缘对齐和中心对齐模式。Icu 支持输入捕获、信号测量和周期检测。',
    tags: ['PWM', 'ICU', '定时器', 'MCAL', '电机控制', '信号测量'],
    author: 'YuleTech AutoSAR Team',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-pwm-timer",
      "description": "PWM/Timer驱动配置",
      "version": "1.6.0",
      "vendor": "YuleTech",
      "mcu": "STM32G474",
      "module": {
        "Pwm": {
          "PwmGeneral": {
            "PwmDevErrorDetect": false,
            "PwmVersionCheckApi": true,
            "PwmChannelCount": 8
          },
          "PwmConfigSet": {
            "PwmChannels": [
              { "id": "PwmChannel_0", "pwmChannelId": 0, "pwmPeriod": 1000, "pwmDutyCycle": 500, "pwmPolarity": "HIGH", "pwmMode": "EDGE_ALIGNED" },
              { "id": "PwmChannel_1", "pwmChannelId": 1, "pwmPeriod": 1000, "pwmDutyCycle": 250, "pwmPolarity": "HIGH", "pwmMode": "EDGE_ALIGNED" }
            ]
          }
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['STM32G474', 'STM32H743', 'STM32F407', 'S32K144', 'TC334', 'TMS320F28379D'],
      os: ['FreeRTOS', 'AUTOSAR OS', 'Bare-metal'],
      compiler: ['GCC ARM Embedded', 'IAR Embedded Workbench', 'ARM Compiler 6', 'Tasking TriCore', 'TI Code Composer Studio'],
    },
    dependencies: [
      { name: 'MCU Driver', version: '>=1.0.0', optional: false },
      { name: 'Port Driver', version: '>=1.0.0', optional: false },
    ],
    stats: { downloads: 1567, rating: 4.4, reviewCount: 76 },
    status: 'published',
    timestamps: {
      created: '2024-10-12T07:00:00Z',
      updated: '2025-03-05T13:00:00Z',
      published: '2024-10-28T08:00:00Z',
    },
  },
  {
    id: 'fls-nvm',
    name: 'Flash/NVM 存储器驱动',
    version: '0.8.5',
    layer: 'Service',
    description: 'Flash 驱动和 NVRAM 管理器。Fls 提供 Flash 读写擦除操作，NvM 提供 EEPROM 模拟、数据管理和校验。当前为 Beta 版，支持基本块操作。',
    tags: ['Flash', 'NVM', 'NvM', 'Fls', '存储器', 'Service', 'Beta'],
    author: 'YuleTech AutoSAR Team',
    configData: JSON.stringify({
      "$schema": "./yuleasr.schema.json",
      "name": "yuleasr-fls-nvm",
      "description": "Flash/NVM驱动配置",
      "version": "0.8.5",
      "vendor": "YuleTech",
      "mcu": "TC397",
      "module": {
        "Fls": {
          "FlsGeneral": {
            "FlsDevErrorDetect": true,
            "FlsVersionCheckApi": true,
            "FlsSectorSize": 32768,
            "FlsPageSize": 256,
            "FlsTotalSize": 4194304
          },
          "FlsConfigSet": {
            "FlsSectors": [
              { "id": "FlsSector_0", "flsSectorIndex": 0, "flsSectorStartAddr": 0, "flsSectorSize": 32768 },
              { "id": "FlsSector_1", "flsSectorIndex": 1, "flsSectorStartAddr": 32768, "flsSectorSize": 32768 }
            ]
          }
        }
      }
    }, null, 2),
    compatibility: {
      mcu: ['TC397', 'TC212', 'S32K144', 'STM32H743', 'i.MX8M Mini', 'TMS320F280049'],
      os: ['FreeRTOS', 'AUTOSAR OS', 'Bare-metal'],
      compiler: ['GCC ARM Embedded', 'IAR Embedded Workbench', 'ARM Compiler 6', 'Tasking TriCore', 'TI Code Composer Studio'],
    },
    dependencies: [
      { name: 'MCU Driver', version: '>=1.0.0', optional: false },
    ],
    stats: { downloads: 432, rating: 3.9, reviewCount: 18 },
    status: 'draft',
    timestamps: {
      created: '2025-02-01T08:00:00Z',
      updated: '2025-04-08T11:00:00Z',
    },
  },
];

export function getRegistryModuleById(id: string): RegistryModule | undefined {
  return REGISTRY_MODULES.find(m => m.id === id);
}

export function getRegistryStats() {
  const totalModules = REGISTRY_MODULES.length;
  const totalDownloads = REGISTRY_MODULES.reduce((s, m) => s + m.stats.downloads, 0);
  const layers = [...new Set(REGISTRY_MODULES.map(m => m.layer))];
  const mcus = [...new Set(REGISTRY_MODULES.flatMap(m => m.compatibility.mcu))];
  return { totalModules, totalDownloads, layers, mcus };
}

export function getRegistryVersionHistory(_moduleId: string) {
  return [
    { version: '2.1.0', date: '2025-03-20', notes: '支持 CAN FD 灵活数据速率, 修复 Bus-Off 恢复问题' },
    { version: '2.0.0', date: '2024-12-10', notes: '重构协议栈架构, 新增 TCAN 支持' },
    { version: '1.5.0', date: '2024-09-15', notes: '增加 DLC 校验, 优化错误处理' },
    { version: '1.0.0', date: '2024-06-01', notes: '初始版本, 支持 CAN 2.0 通信' },
  ];
}

// ═══════════════════════════════════════════════
// 双轨模式: API 优先 + localStorage 降级
// ═══════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface RegistryListQuery {
  search?: string;
  layer?: string;
  mcu?: string;
  os?: string;
  sort?: 'downloads' | 'rating' | 'newest' | 'name';
  page?: number;
  limit?: number;
}

export interface RegistryListResponse {
  data: RegistryModule[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * 从后端获取模块列表 (API 优先)
 */
export async function fetchRegistryList(query: RegistryListQuery = {}): Promise<RegistryListResponse | null> {
  try {
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.layer) params.set('layer', query.layer);
    if (query.mcu) params.set('mcu', query.mcu);
    if (query.os) params.set('os', query.os);
    if (query.sort) params.set('sort', query.sort);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const res = await fetch(`${API_BASE}/devhub/registry?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('invalid response');
    return { data: json.data, pagination: json.pagination };
  } catch {
    return null;
  }
}

/**
 * 从后端获取模块详情
 */
export async function fetchRegistryModule(id: string): Promise<RegistryModule | null> {
  try {
    const res = await fetch(`${API_BASE}/devhub/registry/${id}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('invalid response');
    return json.data;
  } catch {
    return null;
  }
}

/**
 * 从后端获取统计信息
 */
export async function fetchRegistryStats(): Promise<{
  totalModules: number;
  totalDownloads: number;
  layerCount: number;
  mcus: string[];
} | null> {
  try {
    const res = await fetch(`${API_BASE}/devhub/registry/stats`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('invalid response');
    return json.data;
  } catch {
    return null;
  }
}

/**
 * 从后端提交评价
 */
export async function submitReview(moduleId: string, rating: number, content?: string): Promise<boolean> {
  const token = localStorage.getItem('admin_token') || '';
  try {
    const res = await fetch(`${API_BASE}/devhub/registry/${moduleId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating, content }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
}

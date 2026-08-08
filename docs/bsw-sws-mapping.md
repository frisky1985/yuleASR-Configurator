# yuleASR BSW 模块 ↔ AUTOSAR SWS 章节映射

> 维护：A4-2（2026-08-09）· 风格借鉴 cogu/autosar CHANGELOG.md 每版本的 "类名 |
> XSD 复杂类型" 对照表（见 `reports/cogu-autosar-analysis-20260808.md`
> e) 节）。目的：Configurator 管理的每个模块/数据模型 ↔ 规范出处（AUTOSAR
> SWS 文档）双向可追溯，评审/对接 OEM 工具（EB
> tresos、DaVinci）时按表定位规范章节。

## 0. 阅读约定

- **模块** = `packages/@yuletech/core/src/schema/generated/<module>.json`
  的 schema id（54 个）。
- **SWS 文档** = AUTOSAR 发布包（R19-11 ~ R22-11）中的 PDF 规范，文档名如
  `SWS_Can.pdf`。章节号随 AUTOSAR 版本有偏移，本文给文档名 + 关键章节主题，精确页码以对应版本 PDF 为准。
- **层** = AUTOSAR 标准分层（MCAL / ECUAL / Service / RTE / OS /
  ASW）。⚠️ 技术债：仓库 `x-layer` 字段与标准分层有出入（如
  `can/port/mcu: Service`，标准应为 MCAL），详见 §5。

## 1. BSW 模块 ↔ SWS 文档映射（54 模块全量）

### 1.1 MCAL（微控制器抽象层）

| 模块 (schema id) | 中文名                 | AUTOSAR SWS 文档       | 关键章节主题                                           |
| ---------------- | ---------------------- | ---------------------- | ------------------------------------------------------ |
| Adc              | ADC 驱动               | SWS_Adc                | AdcGeneral / AdcHwUnit / 采样与转换                    |
| Can              | CAN 驱动               | SWS_Can                | CanController / CanHardwareObject / 位时序             |
| CanTrcv          | CAN 收发器驱动         | SWS_CanTrcv            | CanTrcvGeneral / 收发器模式（sleep/wakeup）            |
| Crypto           | Crypto 驱动            | SWS_Crypto             | CryptoGeneral / CryptoDriverObject / 密钥槽            |
| Dio              | 数字 IO 驱动           | SWS_Dio                | DioGeneral / DioChannel / DioPort                      |
| Eep              | EEPROM 驱动            | SWS_Eep                | EepGeneral / EepBlock / 擦写管理                       |
| Eth              | 以太网驱动             | SWS_Eth                | EthGeneral / EthController / 收发队列                  |
| Fls              | Flash 驱动             | SWS_Fls                | FlsGeneral / FlsSector / 擦写操作                      |
| Fr               | FlexRay 驱动           | SWS_Fr                 | FrGeneral / FrChannel / 帧收发                         |
| Gpt              | 通用定时器驱动         | SWS_Gpt                | GptGeneral / GptChannel / 比较捕获                     |
| Icu              | 输入捕获驱动           | SWS_Icu                | IcuGeneral / IcuChannel / 信号测量                     |
| Lin              | LIN 驱动               | SWS_Lin                | LinGeneral / LinChannel / 帧调度                       |
| Mcu              | 微控制器单元驱动       | SWS_Mcu                | McuGeneral / McuClockSetting / McuModeSetting / 低功耗 |
| Port             | 端口驱动               | SWS_Port               | PortGeneral / PortPin / 引脚复用                       |
| Pwm              | PWM 驱动               | SWS_Pwm                | PwmGeneral / PwmChannel / 占空比与周期                 |
| Spi              | SPI 驱动               | SWS_Spi                | SpiGeneral / SpiChannel / SpiJob / 同步异步            |
| Wdg              | 看门狗驱动             | SWS_Wdg                | WdgGeneral / WdgSettings / 触发模式                    |
| Uart             | 串口驱动（厂商扩展）   | —（无标准 SWS，见 §4） | 厂商 MCAL 手册                                         |
| I2c              | I2C 驱动（厂商扩展）   | —（无标准 SWS，见 §4） | 厂商 MCAL 手册                                         |
| Mcl              | 微控制器驱动库（扩展） | —（无标准 SWS，见 §4） | yuleASR 自研库                                         |

### 1.2 ECUAL（ECU 抽象层）

| 模块 (schema id) | 中文名       | AUTOSAR SWS 文档 | 关键章节主题                                        |
| ---------------- | ------------ | ---------------- | --------------------------------------------------- |
| CanIf            | CAN 接口     | SWS_CanIf        | CanIfGeneral / CanIfTxPdu / CanIfRxPdu / 控制器模式 |
| EthIf            | 以太网接口   | SWS_EthIf        | EthIfGeneral / EthIfTxConfirmation / 收发 PDU       |
| FrIf             | FlexRay 接口 | SWS_FrIf         | FrIfGeneral / FrIfTxPdu / FrIfRxPdu                 |
| LinIf            | LIN 接口     | SWS_LinIf        | LinIfGeneral / LinIfScheduler / 帧收发              |
| MemIf            | 内存抽象接口 | SWS_MemIf        | MemIfGeneral / MemIfJob / 抽象设备选择              |
| IoHwAb           | IO 硬件抽象  | SWS_IoHwAb       | IoHwAbGeneral / IoHwAbPort / 信号读写               |

### 1.3 Service 层

| 模块 (schema id) | 中文名                  | AUTOSAR SWS 文档 | 关键章节主题                                        |
| ---------------- | ----------------------- | ---------------- | --------------------------------------------------- |
| BswM             | BSW 模式管理器          | SWS_BswM         | BswMGeneral / BswMModeRequestPort / BswMArbitration |
| CanNm            | CAN 网络管理            | SWS_CanNm        | CanNmGeneral / CanNmCluster / NM 报文处理           |
| CanSM            | CAN 状态管理            | SWS_CanSM        | CanSMGeneral / CanSMController / 总线状态机         |
| CanTp            | CAN 传输层              | SWS_CanTp        | CanTpGeneral / CanTpChannel / 多帧分段              |
| Com              | 通信                    | SWS_Com          | ComGeneral / ComIPdu / 信号收发与网关               |
| ComM             | 通信管理器              | SWS_ComM         | ComMGeneral / ComMChannel / 通信模式切换            |
| Crc              | CRC 例程                | SWS_Crc          | CrcGeneral / Crc8/Crc16/Crc32 计算                  |
| CryIf            | Crypto 接口             | SWS_CryIf        | CryIfGeneral / CryIfChannel / 密钥访问              |
| Csm              | Crypto 服务管理         | SWS_Csm          | CsmGeneral / CsmJob / 加解密队列                    |
| Dcm              | 诊断通信管理            | SWS_Dcm          | DcmGeneral / DcmDsp / 诊断会话与服务                |
| Dem              | 诊断事件管理            | SWS_Dem          | DemGeneral / DemEvent / 事件状态与快照              |
| Det              | 默认错误跟踪            | SWS_Det          | DetGeneral / DetErrorHook / 开发错误上报            |
| Ea               | EEPROM 抽象             | SWS_Ea           | EaGeneral / EaBlock / 与 Eep 对接                   |
| EcuM             | ECU 状态管理            | SWS_EcuM         | EcuMGeneral / EcuMState / 启动关闭序列              |
| Fee              | Flash EEPROM 模拟       | SWS_Fee          | FeeGeneral / FeeBlock / 磨损均衡与虚拟页            |
| Nm               | 网络管理接口            | SWS_Nm           | NmGeneral / NmChannel / 网络协调                    |
| NvM              | 非易失存储管理          | SWS_NvM          | NvMGeneral / NvMBlock / 数据存储与校验              |
| PduR             | PDU 路由                | SWS_PduR         | PduRGeneral / PduRRoutingTable / 上下行路由         |
| WdgIf            | 看门狗接口              | SWS_WdgIf        | WdgIfGeneral / WdgIfDevice / 触发分发               |
| WdgM             | 看门狗管理              | SWS_WdgM         | WdgMGeneral / WdgMCheckpoint / 喂狗监控             |
| Xcp              | XCP 标定协议            | SWS_Xcp          | XcpGeneral / XcpSlave / 测量标定通道                |
| Sbc              | 系统基础芯片（扩展）    | —（见 §4）       | 厂商 SBC 驱动手册                                   |
| Ble              | BLE 驱动（扩展）        | —（见 §4）       | yuleASR 扩展（蓝牙通信）                            |
| Arti             | ARTI 运行时接口（扩展） | —（见 §4）       | yuleASR 自研运行时抽象                              |

### 1.4 RTE / OS / ASW

| 模块 (schema id) | 中文名        | AUTOSAR SWS 文档                        | 关键章节主题                                     |
| ---------------- | ------------- | --------------------------------------- | ------------------------------------------------ |
| Rte              | 运行时环境    | SWS_Rte                                 | RteGeneral / 端口 API / runnable 调度 / 通信模式 |
| Os               | 操作系统      | SWS_Os                                  | OsGeneral / 任务调度 / 中断 / 计数器 / 资源      |
| appswc           | 应用 SWC 配置 | SWS_SoftwareComponentTemplate + SWS_Rte | SWC 类型 / 端口 / 内部行为 / 运行实体            |
| compswc          | 组合 SWC 配置 | SWS_SoftwareComponentTemplate + SWS_Rte | 组合类型 / 组件连接 / 端口委托                   |

## 2. A1 导入映射扩展：SWC 层元素 ↔ AUTOSAR 概念

> 来源：`@yuletech/core/arxml-import`（commit
> e5ad2c90）导入的元素 → 规范概念对照，承接 A1 导入映射表，覆盖 SWC/端口/接口/数据类型/CompuMethod 层。

| Configurator 模型（arxml-import）         | ARXML 元素（AUTOSAR）                                                                                    | AUTOSAR 规范文档                                               | 说明                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| `RteSwcInfo` (ApplicationSwComponentType) | APPLICATION-SW-COMPONENT-TYPE                                                                            | SWS_SoftwareComponentTemplate                                  | 应用 SWC 类型（§SWC 类型）           |
| CompositionSwComponentType                | COMPOSITION-SW-COMPONENT-TYPE                                                                            | SWS_SoftwareComponentTemplate                                  | 组合 SWC（组件嵌套/连接）            |
| `RtePortInfo` (PortPrototype)             | P-PORT-PROTOTYPE / R-PORT-PROTOTYPE                                                                      | SWS_SoftwareComponentTemplate（端口原型）+ SWS_Rte（端口 API） | 提供/需求端口                        |
| `RteRunnableInfo` (RunnableEntity)        | RUNNABLE-ENTITY                                                                                          | SWS_SoftwareComponentTemplate（内部行为）+ SWS_Rte（调度）     | 运行实体                             |
| SenderReceiverInterface                   | SENDER-RECEIVER-INTERFACE                                                                                | SWS_SoftwareComponentTemplate（接口定义）                      | 数据/事件接口                        |
| ClientServerInterface                     | CLIENT-SERVER-INTERFACE                                                                                  | SWS_SoftwareComponentTemplate（接口定义）                      | 操作接口                             |
| ApplicationDataType                       | APPLICATION-PRIMITIVE-DATA-TYPE                                                                          | SWS_DataTypes                                                  | 应用数据类型                         |
| ImplementationDataType                    | IMPLEMENTATION-DATA-TYPE                                                                                 | SWS_DataTypes                                                  | 实现数据类型（含 SW-BASE-TYPE 引用） |
| CompuMethod                               | COMPU-METHOD                                                                                             | SWS_DataTypes（CompuMethod）                                   | 线性/文本表/比例换算                 |
| SwBaseType                                | SW-BASE-TYPE                                                                                             | SWS_DataTypes                                                  | 底层基础类型                         |
| runnable 互斥区引用                       | CAN-ENTER-EXCLUSIVE-AREA-REFS / RUNS-INSIDE-EXCLUSIVE-AREA-REFS（<50）；CAN-ENTERS / RUNS-INSIDES（≥50） | SWS_Rte（互斥区）                                              | 版本差异见 §3 GATE-002               |

## 3. 版本差异速查（48–51）

| schema 版本 | AUTOSAR 发布    | XSD 文件          | 关键差异（VERSION_GATES）                                    |
| ----------- | --------------- | ----------------- | ------------------------------------------------------------ |
| 48          | R19-11（4.4.0） | AUTOSAR_00048.xsd | GATE-002 旧元素名：…-EXCLUSIVE-AREA-REFS                     |
| 49          | R20-11（4.4.0） | AUTOSAR_00049.xsd | GATE-002 旧元素名：…-EXCLUSIVE-AREA-REFS                     |
| 50          | R21-11（4.5.0） | AUTOSAR_00050.xsd | GATE-002 新元素名：CAN-ENTERS / RUNS-INSIDES                 |
| 51          | R22-11（4.5.0） | AUTOSAR_00051.xsd | GATE-002 新元素名：CAN-ENTERS / RUNS-INSIDES（默认导出版本） |

差异登记表（唯一事实来源）：`packages/@yuletech/core/src/arxml-export/version-gates.ts`（VERSION_GATES）。新增版本差异点 → 在该表追加一条登记，**不要**在序列化代码里散落 if。

## 4. 非标准模块说明（诚实标注）

以下模块无对应 AUTOSAR 标准 SWS 文档，映射为 "—"：

- **Ble**（BLE 驱动）、**Arti**（ARTI 运行时接口）、**Mcl**（微控制器驱动库）：yuleASR 自研扩展，规范依据为 yuleASR 内部设计文档；
- **Sbc**（系统基础芯片）：AUTOSAR 无独立 SBC
  SWS，通常由 MCAL 厂商驱动包提供（如 NXP/Infineon 手册）；
- **Uart /
  I2c**：AUTOSAR 标准文档集无 UART/I2C 独立 SWS（Classic 平台未标准化），通常由厂商 MCAL 或经 Spi/Lin 封装实现，映射到厂商手册。

## 5. 技术债记录

1. **`x-layer` 字段与标准分层不一致**：`schema/generated/*.json` 中
   `can/dio/port/mcu/adc/spi` 等标记为 `Service`，标准 AUTOSAR 分层应为 MCAL；
   `cannm/cansm/cantp/lin` 等标记为
   `ECUAL`，标准应为 Service/MCAL。本文以标准分层为准；修正 `x-layer`
   需同步 schema 生成管线与 Dashboard 分层统计，单独排期。
2. **SWS 章节号未逐版本核对**：本文给出文档名与章节主题，精确章节号随 AUTOSAR 版本漂移，对接 OEM 工具时以对应版本 PDF 为准。

## 6. 维护约定

- 新增 BSW 模块 → 同步更新 §1 表格 + `schema/generated/<module>.json`；
- 新增 ARXML 导入元素（A1 侧）→ 同步更新 §2 表格；
- 新增版本差异 → 登记 `VERSION_GATES`（core
  `arxml-export/version-gates.ts`）+ 更新 §3；
- 本表与 CHANGELOG 同步维护（每次发布核对一次）。

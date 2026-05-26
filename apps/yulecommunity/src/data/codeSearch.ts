/**
 * 代码搜索数据
 * 模拟代码结构用于搜索
 */

export interface SearchResult {
  id: string;
  type: 'function' | 'variable' | 'macro' | 'module' | 'struct';
  name: string;
  module: string;
  description: string;
  signature?: string;
  code: string;
  lineNumber: number;
  filePath: string;
}

export const codeSearchData: SearchResult[] = [
  // MCAL 层
  {
    id: '1',
    type: 'function',
    name: 'Can_Init',
    module: 'Can',
    description: '初始化 CAN 控制器',
    signature: 'void Can_Init(const Can_ConfigType* Config)',
    code: `void Can_Init(const Can_ConfigType* Config) {
  /* 禁止 CAN 控制器 */
  CAN->MCR |= CAN_MCR_HALT;
  
  /* 配置波特率: 500Kbps @ 80MHz */
  CAN->CBT = 0x000A1303;
  
  /* 初始化邮箱 */
  for (uint8 i = 0; i < CAN_MAX_MAILBOX; i++) {
    CAN->MB[i].CS = 0;
  }
  
  /* 启动 CAN */
  CAN->MCR &= ~CAN_MCR_HALT;
}`,
    lineNumber: 45,
    filePath: 'Mcal/Can/src/Can.c'
  },
  {
    id: '2',
    type: 'function',
    name: 'Can_Write',
    module: 'Can',
    description: '发送 CAN 消息',
    signature: 'Std_ReturnType Can_Write(Can_HwHandleType Hth, const Can_PduType* PduInfo)',
    code: `Std_ReturnType Can_Write(Can_HwHandleType Hth, const Can_PduType* PduInfo) {
  Can_MailboxType* mb = &Can_Mailboxes[Hth];
  
  if (mb->State != CAN_MB_EMPTY) {
    return CAN_BUSY;
  }
  
  /* 复制数据到邮箱 */
  mb->ID = PduInfo->id;
  mb->DLC = PduInfo->length;
  memcpy(mb->Data, PduInfo->sdu, PduInfo->length);
  
  /* 触发发送 */
  mb->CS = CAN_CS_CODE(CAN_CS_CODE_TX_ONCE);
  
  return E_OK;
}`,
    lineNumber: 128,
    filePath: 'Mcal/Can/src/Can.c'
  },
  {
    id: '3',
    type: 'function',
    name: 'Mcu_InitClock',
    module: 'Mcu',
    description: '初始化 MCU 时钟',
    signature: 'void Mcu_InitClock(const Mcu_ClockConfigType* ClockCfg)',
    code: `void Mcu_InitClock(const Mcu_ClockConfigType* ClockCfg) {
  /* 使能 HSI 时钟 */
  RCC->CR |= RCC_CR_HSION;
  while (!(RCC->CR & RCC_CR_HSIRDY));
  
  /* 配置 PLL: HSI * 10 = 160MHz */
  RCC->PLLCFGR = (10 << RCC_PLLCFGR_PLLN_Pos) |
                 (RCC_PLLCFGR_PLLSRC_HSI);
  
  /* 切换到 PLL */
  RCC->CFGR |= RCC_CFGR_SW_PLL;
  while ((RCC->CFGR & RCC_CFGR_SWS) != RCC_CFGR_SWS_PLL);
}`,
    lineNumber: 72,
    filePath: 'Mcal/Mcu/src/Mcu.c'
  },
  {
    id: '4',
    type: 'macro',
    name: 'CAN_MCR_HALT',
    module: 'Can',
    description: 'CAN 模式寄存器停止位',
    code: `#define CAN_MCR_HALT    (0x1u << 28)  /* Halt mode */`,
    lineNumber: 32,
    filePath: 'Mcal/Can/include/Can_Reg.h'
  },
  {
    id: '5',
    type: 'struct',
    name: 'Can_PduType',
    module: 'Can',
    description: 'CAN PDU 数据结构',
    code: `typedef struct {
  Can_IdType id;           /* 消息 ID */
  uint8 length;            /* 数据长度 */
  uint8* sdu;              /* 数据指针 */
  uint8 swPduHandle;       /* PDU 句柄 */
} Can_PduType;`,
    lineNumber: 45,
    filePath: 'Mcal/Can/include/Can_Types.h'
  },
  // ECUAL 层
  {
    id: '6',
    type: 'function',
    name: 'CanIf_Transmit',
    module: 'CanIf',
    description: 'CanIf 发送接口',
    signature: 'Std_ReturnType CanIf_Transmit(PduIdType TxPduId, const PduInfoType* PduInfoPtr)',
    code: `Std_ReturnType CanIf_Transmit(PduIdType TxPduId, const PduInfoType* PduInfoPtr) {
  const CanIf_TxPduConfigType* txPduConfig = &CanIf_TxPduConfig[TxPduId];
  Can_HwHandleType hth = txPduConfig->CanIfTxPduCanId;
  
  Can_PduType canPdu;
  canPdu.id = txPduConfig->CanIfTxPduCanId;
  canPdu.length = PduInfoPtr->SduLength;
  canPdu.sdu = PduInfoPtr->SduDataPtr;
  
  return Can_Write(hth, &canPdu);
}`,
    lineNumber: 89,
    filePath: 'Ecual/CanIf/src/CanIf.c'
  },
  {
    id: '7',
    type: 'function',
    name: 'PduR_ComTransmit',
    module: 'PduR',
    description: 'PduR 向 Com 层发送',
    signature: 'Std_ReturnType PduR_ComTransmit(PduIdType TxPduId, const PduInfoType* PduInfoPtr)',
    code: `Std_ReturnType PduR_ComTransmit(PduIdType TxPduId, const PduInfoType* PduInfoPtr) {
  PduR_RoutingPathType* path = &PduR_RoutingPaths[TxPduId];
  
  for (uint8 i = 0; i < path->NumDestinations; i++) {
    PduR_DestinationType* dest = &path->Destinations[i];
    dest->Transmit(dest->TargetPduId, PduInfoPtr);
  }
  
  return E_OK;
}`,
    lineNumber: 156,
    filePath: 'Ecual/PduR/src/PduR_Com.c'
  },
  // Service 层
  {
    id: '8',
    type: 'function',
    name: 'Com_SendSignal',
    module: 'Com',
    description: '发送 Com 信号',
    signature: 'Std_ReturnType Com_SendSignal(Com_SignalIdType SignalId, const void* SignalDataPtr)',
    code: `Std_ReturnType Com_SendSignal(Com_SignalIdType SignalId, const void* SignalDataPtr) {
  const ComSignal_type* sig = &ComSignals[SignalId];
  uint8* pduData = &ComPduData[sig->ComPduId];
  
  /* 将数据复制到 PDU 缓冲区 */
  memcpy(
    pduData + sig->ComBitPosition / 8,
    SignalDataPtr,
    sig->ComSignalLength / 8
  );
  
  /* 触发发送 */
  Com_TriggerIPDUSend(sig->ComPduId);
  return E_OK;
}`,
    lineNumber: 78,
    filePath: 'Service/Com/src/Com.c'
  },
  {
    id: '9',
    type: 'function',
    name: 'Com_ReceiveSignal',
    module: 'Com',
    description: '接收 Com 信号',
    signature: 'Std_ReturnType Com_ReceiveSignal(Com_SignalIdType SignalId, void* SignalDataPtr)',
    code: `Std_ReturnType Com_ReceiveSignal(Com_SignalIdType SignalId, void* SignalDataPtr) {
  const ComSignal_type* sig = &ComSignals[SignalId];
  const uint8* pduData = &ComPduData[sig->ComPduId];
  
  /* 从 PDU 缓冲区复制数据 */
  memcpy(
    SignalDataPtr,
    pduData + sig->ComBitPosition / 8,
    sig->ComSignalLength / 8
  );
  
  return E_OK;
}`,
    lineNumber: 112,
    filePath: 'Service/Com/src/Com.c'
  },
  {
    id: '10',
    type: 'function',
    name: 'NvM_ReadBlock',
    module: 'NvM',
    description: '从非易失性存储读取数据块',
    signature: 'Std_ReturnType NvM_ReadBlock(NvM_BlockIdType BlockId, void* DstPtr)',
    code: `Std_ReturnType NvM_ReadBlock(NvM_BlockIdType BlockId, void* DstPtr) {
  NvM_BlockDescriptor_type* block = &NvM_Blocks[BlockId];
  
  if (block->MemIf.Status == MEMIF_IDLE) {
    MemIf_Read(
      block->MemIf.DeviceId,
      block->MemIf.BlockNumber,
      0,
      DstPtr,
      block->BlockSize
    );
    block->MemIf.Status = MEMIF_BUSY;
    return E_OK;
  }
  return E_NOT_OK;
}`,
    lineNumber: 95,
    filePath: 'Service/NvM/src/NvM.c'
  },
  {
    id: '11',
    type: 'function',
    name: 'Dem_SetEventStatus',
    module: 'Dem',
    description: '设置故障事件状态',
    signature: 'Std_ReturnType Dem_SetEventStatus(Dem_EventIdType EventId, Dem_EventStatusType EventStatus)',
    code: `Std_ReturnType Dem_SetEventStatus(Dem_EventIdType EventId, Dem_EventStatusType EventStatus) {
  Dem_EventParameter_type* event = &Dem_Events[EventId];
  
  if (EventStatus == DEM_EVENT_STATUS_FAILED) {
    event->FailureCounter++;
    if (event->FailureCounter >= event->Threshold) {
      event->EventStatus = DEM_UDS_STATUS_TF;
      DtcStatus[EventId] = DEM_DTC_ACTIVE;
    }
  } else {
    event->FailureCounter = 0;
  }
  return E_OK;
}`,
    lineNumber: 134,
    filePath: 'Service/Dem/src/Dem.c'
  },
  // RTE 层
  {
    id: '12',
    type: 'function',
    name: 'Rte_Write_VehicleSpeed',
    module: 'Rte',
    description: 'RTE 写车速信号',
    signature: 'Std_ReturnType Rte_Write_VehicleSpeed(uint16 speed)',
    code: `Std_ReturnType Rte_Write_VehicleSpeed(uint16 speed) {
  if (speed > 300) {
    return RTE_E_INVALID;
  }
  Rte_VehicleSpeed = speed;
  Rte_Trigger_VehicleSpeed_Update();
  return RTE_E_OK;
}`,
    lineNumber: 45,
    filePath: 'Rte/src/Rte.c'
  },
  {
    id: '13',
    type: 'macro',
    name: 'RTE_E_OK',
    module: 'Rte',
    description: 'RTE 成功返回码',
    code: `#define RTE_E_OK        0
#define RTE_E_INVALID   1
#define RTE_E_UNCONNECTED   2
#define RTE_E_NEVER_RECEIVED    3`,
    lineNumber: 28,
    filePath: 'Rte/include/Rte_Types.h'
  },
  {
    id: '14',
    type: 'variable',
    name: 'Rte_VehicleSpeed',
    module: 'Rte',
    description: '车速全局变量',
    code: `static uint16 Rte_VehicleSpeed = 0;
static uint16 Rte_EngineSpeed = 0;
static uint8 Rte_GearPosition = 0;`,
    lineNumber: 15,
    filePath: 'Rte/src/Rte.c'
  },
  // Dio 模块
  {
    id: '15',
    type: 'function',
    name: 'Dio_ReadChannel',
    module: 'Dio',
    description: '读取数字 IO 通道',
    signature: 'Dio_LevelType Dio_ReadChannel(Dio_ChannelType ChannelId)',
    code: `Dio_LevelType Dio_ReadChannel(Dio_ChannelType ChannelId) {
  Dio_PortType port = ChannelId / 16;
  Dio_ChannelType pin = ChannelId % 16;
  
  return (Dio_PortRegs[port]->IDR >> pin) & 0x01;
}`,
    lineNumber: 52,
    filePath: 'Mcal/Dio/src/Dio.c'
  },
  {
    id: '16',
    type: 'function',
    name: 'Dio_WriteChannel',
    module: 'Dio',
    description: '写数字 IO 通道',
    signature: 'void Dio_WriteChannel(Dio_ChannelType ChannelId, Dio_LevelType Level)',
    code: `void Dio_WriteChannel(Dio_ChannelType ChannelId, Dio_LevelType Level) {
  Dio_PortType port = ChannelId / 16;
  Dio_ChannelType pin = ChannelId % 16;
  
  if (Level == STD_HIGH) {
    Dio_PortRegs[port]->BSRR = (1 << pin);
  } else {
    Dio_PortRegs[port]->BSRR = (1 << (pin + 16));
  }
}`,
    lineNumber: 68,
    filePath: 'Mcal/Dio/src/Dio.c'
  },
  // Port 模块
  {
    id: '17',
    type: 'function',
    name: 'Port_Init',
    module: 'Port',
    description: '初始化 Port 引脚',
    signature: 'void Port_Init(const Port_ConfigType* ConfigPtr)',
    code: `void Port_Init(const Port_ConfigType* ConfigPtr) {
  for (uint8 i = 0; i < PORT_PIN_COUNT; i++) {
    const Port_PinConfigType* pinConfig = &ConfigPtr->PinConfig[i];
    GPIO_TypeDef* port = pinConfig->Port;
    uint8 pin = pinConfig->Pin;
    
    /* 配置模式 */
    port->MODER &= ~(3 << (pin * 2));
    port->MODER |= (pinConfig->Mode << (pin * 2));
    
    /* 配置上下拉 */
    port->PUPDR &= ~(3 << (pin * 2));
    port->PUPDR |= (pinConfig->Pull << (pin * 2));
  }
}`,
    lineNumber: 42,
    filePath: 'Mcal/Port/src/Port.c'
  },
  // SPI 模块
  {
    id: '18',
    type: 'function',
    name: 'Spi_Init',
    module: 'Spi',
    description: '初始化 SPI',
    signature: 'void Spi_Init(const Spi_ConfigType* Config)',
    code: `void Spi_Init(const Spi_ConfigType* Config) {
  /* 使能 SPI 时钟 */
  RCC->APB2ENR |= RCC_APB2ENR_SPI1EN;
  
  /* 配置 SPI */
  SPI1->CR1 = SPI_CR1_MSTR |    /* 主模式 */
              SPI_CR1_SSM |     /* 软件从机管理 */
              SPI_CR1_SSI |     /* 内部从机选择 */
              SPI_CR1_SPE;      /* 使能 SPI */
  
  /* 配置波特率: fPCLK/256 */
  SPI1->CR1 |= SPI_CR1_BR_0 | SPI_CR1_BR_1 | SPI_CR1_BR_2;
}`,
    lineNumber: 38,
    filePath: 'Mcal/Spi/src/Spi.c'
  },
  // GPT 模块
  {
    id: '19',
    type: 'function',
    name: 'Gpt_StartTimer',
    module: 'Gpt',
    description: '启动 GPT 定时器',
    signature: 'void Gpt_StartTimer(Gpt_ChannelType Channel, Gpt_ValueType Value)',
    code: `void Gpt_StartTimer(Gpt_ChannelType Channel, Gpt_ValueType Value) {
  TIM_TypeDef* tim = Gpt_Channels[Channel].TimBase;
  
  /* 设置重装值 */
  tim->ARR = Value;
  tim->CNT = 0;
  
  /* 清除中断标志 */
  tim->SR = 0;
  
  /* 启动定时器 */
  tim->CR1 |= TIM_CR1_CEN;
}`,
    lineNumber: 87,
    filePath: 'Mcal/Gpt/src/Gpt.c'
  },
  // ADC 模块
  {
    id: '20',
    type: 'function',
    name: 'Adc_ReadGroup',
    module: 'Adc',
    description: '读取 ADC 组',
    signature: 'Std_ReturnType Adc_ReadGroup(Adc_GroupType Group, Adc_ValueGroupType* DataBufferPtr)',
    code: `Std_ReturnType Adc_ReadGroup(Adc_GroupType Group, Adc_ValueGroupType* DataBufferPtr) {
  Adc_GroupConfigType* group = &Adc_Groups[Group];
  
  /* 检查状态 */
  if (group->Status != ADC_STREAM_COMPLETED) {
    return ADC_E_BUSY;
  }
  
  /* 复制结果 */
  for (uint8 i = 0; i < group->ChannelCount; i++) {
    DataBufferPtr[i] = group->ResultBuffer[i];
  }
  
  return E_OK;
}`,
    lineNumber: 112,
    filePath: 'Mcal/Adc/src/Adc.c'
  }
];

/**
 * 模糊搜索函数
 */
export function searchCode(query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: Array<SearchResult & { score: number }> = [];
  
  for (const item of codeSearchData) {
    // 匹配名称
    if (item.name.toLowerCase().includes(lowerQuery)) {
      results.push({ ...item, score: 100 });
      continue;
    }
    
    // 匹配模块
    if (item.module.toLowerCase().includes(lowerQuery)) {
      results.push({ ...item, score: 80 });
      continue;
    }
    
    // 匹配描述
    if (item.description.toLowerCase().includes(lowerQuery)) {
      results.push({ ...item, score: 60 });
      continue;
    }
    
    // 匹配代码内容
    if (item.code.toLowerCase().includes(lowerQuery)) {
      results.push({ ...item, score: 40 });
      continue;
    }
  }
  
  // 按分数排序
  results.sort((a, b) => b.score - a.score);
  
  // 返回不包含score的结果
  return results.map(({ score, ...item }) => item).slice(0, 10);
}

/**
 * 获取模块列表
 */
export function getModuleList(): string[] {
  const modules = new Set(codeSearchData.map(item => item.module));
  return Array.from(modules).sort();
}

/**
 * 按模块过滤
 */
export function filterByModule(moduleName: string): SearchResult[] {
  return codeSearchData.filter(item => item.module === moduleName);
}

/**
 * 获取类型图标
 */
export function getTypeIcon(type: SearchResult['type']): string {
  switch (type) {
    case 'function':
      return '🔢';
    case 'variable':
      return '📦';
    case 'macro':
      return '🛠️';
    case 'struct':
      return '📠';
    case 'module':
      return '📤';
    default:
      return '📝';
  }
}

/**
 * 获取类型名称
 */
export function getTypeName(type: SearchResult['type']): string {
  switch (type) {
    case 'function':
      return '函数';
    case 'variable':
      return '变量';
    case 'macro':
      return '宏定义';
    case 'struct':
      return '结构体';
    case 'module':
      return '模块';
    default:
      return type;
  }
}

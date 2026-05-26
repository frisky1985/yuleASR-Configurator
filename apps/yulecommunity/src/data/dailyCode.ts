export interface DailyCodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  explanation: string;
  module: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const dailyCodeSnippets: DailyCodeSnippet[] = [
  {
    id: '1',
    title: 'CAN 初始化配置',
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
    language: 'c',
    explanation: 'CAN 控制器初始化的标准流程：禁止控制器 → 配置波特率 → 清空邮箱 → 启动',
    module: 'Can',
    difficulty: 'beginner'
  },
  {
    id: '2',
    title: 'PDU 路由配置',
    code: `const PduRRoutingPath_type PduRRoutingPaths[] = {
  {
    .PduRSrcPduRRef = &CanIfPdu_CanTx,
    .PduRDestPduRRef = &ComPdu_ComRx,
    .PduRDestNum = 1,
    .PduRTransmissionConfirmation = TRUE
  },
  {
    .PduRSrcPduRRef = &ComPdu_ComTx,
    .PduRDestPduRRef = &CanIfPdu_CanRx,
    .PduRDestNum = 1,
    .PduRTransmissionConfirmation = FALSE
  }
};`,
    language: 'c',
    explanation: 'PduR 负责在不同通信接口之间转发 PDU，如 CAN 到 Com 的数据路由',
    module: 'PduR',
    difficulty: 'intermediate'
  },
  {
    id: '3',
    title: 'RTE 接口声明',
    code: `#define RTE_E_OK 0
#define RTE_E_INVALID 1

Std_ReturnType Rte_Write_VehicleSpeed(uint16 speed) {
  if (speed > 300) {
    return RTE_E_INVALID;
  }
  Rte_VehicleSpeed = speed;
  Rte_Trigger_VehicleSpeed_Update();
  return RTE_E_OK;
}

uint16 Rte_Read_VehicleSpeed(void) {
  return Rte_VehicleSpeed;
}`,
    language: 'c',
    explanation: 'RTE 提供组件间通信的标准化接口，包含写操作、读操作和数据校验',
    module: 'Rte',
    difficulty: 'intermediate'
  },
  {
    id: '4',
    title: 'MCU 时钟配置',
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
    language: 'c',
    explanation: 'MCU 时钟初始化关键步骤：启动 HSI → 配置 PLL 倍额 → 切换时钟源',
    module: 'Mcu',
    difficulty: 'advanced'
  },
  {
    id: '5',
    title: 'Com 信号发送',
    code: `Std_ReturnType Com_SendSignal(
  Com_SignalIdType SignalId,
  const void* SignalDataPtr
) {
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
    language: 'c',
    explanation: 'Com 层将应用层的信号映射到 PDU，处理字段偏移和长度，然后触发发送',
    module: 'Com',
    difficulty: 'intermediate'
  },
  {
    id: '6',
    title: 'Dio 端口读写',
    code: `Dio_LevelType Dio_ReadChannel(Dio_ChannelType ChannelId) {
  Dio_PortType port = ChannelId / 16;
  Dio_ChannelType pin = ChannelId % 16;
  
  return (Dio_PortRegs[port]->IDR >> pin) & 0x01;
}

void Dio_WriteChannel(
  Dio_ChannelType ChannelId,
  Dio_LevelType Level
) {
  Dio_PortType port = ChannelId / 16;
  Dio_ChannelType pin = ChannelId % 16;
  
  if (Level == STD_HIGH) {
    Dio_PortRegs[port]->BSRR = (1 << pin);
  } else {
    Dio_PortRegs[port]->BSRR = (1 << (pin + 16));
  }
}`,
    language: 'c',
    explanation: 'Dio 提供数字 IO 端口的基本读写操作，通过端口和引脚编号计算寄存器位置',
    module: 'Dio',
    difficulty: 'beginner'
  },
  {
    id: '7',
    title: 'NvM 数据读写',
    code: `Std_ReturnType NvM_ReadBlock(
  NvM_BlockIdType BlockId,
  void* DstPtr
) {
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
    language: 'c',
    explanation: 'NvM 管理非易失性数据的存储，通过 MemIf 抽象层访问 Flash/EEPROM',
    module: 'NvM',
    difficulty: 'advanced'
  },
  {
    id: '8',
    title: 'Dem 故障诊断',
    code: `Std_ReturnType Dem_SetEventStatus(
  Dem_EventIdType EventId,
  Dem_EventStatusType EventStatus
) {
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
    language: 'c',
    explanation: 'Dem 负责诊断事件管理，实现故障计数器和 DTC 状态机',
    module: 'Dem',
    difficulty: 'advanced'
  }
];

/**
 * 获取今日代码片段
 * 基于日期计算，确保每天显示不同内容
 */
export function getTodaySnippet(): DailyCodeSnippet {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % dailyCodeSnippets.length;
  return dailyCodeSnippets[index];
}

/**
 * 获取下一个代码片段
 */
export function getNextSnippet(currentId: string): DailyCodeSnippet {
  const currentIndex = dailyCodeSnippets.findIndex(s => s.id === currentId);
  const nextIndex = (currentIndex + 1) % dailyCodeSnippets.length;
  return dailyCodeSnippets[nextIndex];
}

/**
 * 获取上一个代码片段
 */
export function getPrevSnippet(currentId: string): DailyCodeSnippet {
  const currentIndex = dailyCodeSnippets.findIndex(s => s.id === currentId);
  const prevIndex = (currentIndex - 1 + dailyCodeSnippets.length) % dailyCodeSnippets.length;
  return dailyCodeSnippets[prevIndex];
}

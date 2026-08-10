/**
 * crossReferences 映射表（宏名版重写，2026-08-10）
 *
 * 背景：手写 generated/*.json 的 22 条 crossReferences 使用 ARXML 标准参数名
 * （如 WdgMExpectedAliveIndications），与宏名版 schema（extracted-cfgh，参数名即
 * yuleASR 手写头宏名，如 WDGM_CFG_MAX_SUPERVISED_ENTITIES）零对齐，不能直接合并。
 *
 * 本表按宏名版实际参数名重写规则，F1 提取器（extract-schemas-from-cfgh.ts）读取后
 * 注入 extracted-cfgh/*.json，使 110 模块配置链路具备跨模块依赖校验。
 *
 * 每条：sourceModule/sourceParam（宏名版）→ targetModule/targetParam（宏名版）
 * + relation（equals|less_than|greater_than|in_range|in_enum）+ severity + description。
 */
export interface CrossrefRule {
  sourceModule: string;
  sourceParam: string;
  targetModule: string;
  targetParam: string;
  relation: 'equals' | 'less_than' | 'greater_than' | 'in_range' | 'in_enum';
  severity: 'error' | 'warning';
  description: string;
}

export const CROSSREF_RULES: CrossrefRule[] = [
  // ── 可直接落地（源/目标宏名版参数名均已验证存在）──
  {
    sourceModule: 'Can',
    sourceParam: 'CAN_BAUDRATE_500K',
    targetModule: 'CanTrcv',
    targetParam: 'CANTRCV_MAX_TRANSCEIVERS',
    relation: 'less_than',
    severity: 'warning',
    description: 'CAN 波特率配置应与收发器支持能力匹配',
  },
  {
    sourceModule: 'Fee',
    sourceParam: 'FEE_BLOCK_SIZE_512',
    targetModule: 'Fls',
    targetParam: 'FLS_MAX_READ_NORMAL_MODE',
    relation: 'less_than',
    severity: 'warning',
    description: 'Fee 块大小不应超过 Fls 支持的最大读取大小',
  },
  {
    sourceModule: 'NvM',
    sourceParam: 'NVM_NUM_OF_NVRAM_BLOCKS',
    targetModule: 'Fee',
    targetParam: 'FEE_NUM_BLOCKS',
    relation: 'less_than',
    severity: 'warning',
    description: 'NvM 块数不应超过 Fee 可配置块数',
  },
  {
    sourceModule: 'Crypto',
    sourceParam: 'CRYPTO_CFG_MAX_CHANNELS',
    targetModule: 'CryIf',
    targetParam: 'CRYIF_CFG_MAX_CHANNEL_COUNT',
    relation: 'less_than',
    severity: 'warning',
    description: 'Crypto 通道数不应超过 CryIf 可用通道数',
  },
  {
    sourceModule: 'Ea',
    sourceParam: 'EA_NUM_BLOCKS',
    targetModule: 'Eep',
    targetParam: 'EEP_SIZE',
    relation: 'less_than',
    severity: 'warning',
    description: 'Ea 块数应与 Eep 存储容量匹配',
  },

  // ── 参数名微调适配（源/目标宏名版实际参数名）──
  {
    sourceModule: 'LinIf',
    sourceParam: 'LINIF_MAX_CHANNELS',
    targetModule: 'Lin',
    targetParam: 'LIN_MAX_CHANNELS',
    relation: 'less_than',
    severity: 'warning',
    description: 'LinIf 通道数不应超过 Lin 可用通道数',
  },
  {
    sourceModule: 'WdgM',
    sourceParam: 'WDGM_CFG_MAX_SUPERVISED_ENTITIES',
    targetModule: 'WdgIf',
    targetParam: 'WDGIF_NUMBER_OF_DEVICES',
    relation: 'less_than',
    severity: 'warning',
    description: 'WdgM 监控实体数不应超过 WdgIf 设备数',
  },
  {
    sourceModule: 'Dem',
    sourceParam: 'DEM_NUM_DTCS',
    targetModule: 'Dcm',
    targetParam: 'DCM_NUM_PROTOCOLS',
    relation: 'in_range',
    severity: 'warning',
    description: 'Dem DTC 数量应与 Dcm 诊断协议容量匹配',
  },
  {
    sourceModule: 'Com',
    sourceParam: 'COM_MAX_IPDUS',
    targetModule: 'PduR',
    targetParam: 'PDUR_NUMBER_OF_ROUTING_PATHS',
    relation: 'less_than',
    severity: 'warning',
    description: 'Com IPDU 数不应超过 PduR 路由路径数',
  },
  {
    sourceModule: 'Xcp',
    sourceParam: 'XCP_CAN_BAUDRATE',
    targetModule: 'Can',
    targetParam: 'CAN_BAUDRATE_500K',
    relation: 'less_than',
    severity: 'warning',
    description: 'Xcp CAN 波特率不应超过 Can 控制器波特率',
  },

  // ── 待 T3 补充的高频依赖（占位，验证后可扩充）──
  {
    sourceModule: 'CanIf',
    sourceParam: 'CANIF_NUM_TX_PDUS',
    targetModule: 'Can',
    targetParam: 'CAN_NUM_HOH',
    relation: 'less_than',
    severity: 'warning',
    description: 'CanIf 发送 PDU 数不应超过 Can 硬件对象数',
  },
  {
    sourceModule: 'NvM',
    sourceParam: 'NVM_NUM_OF_ROM_BLOCKS',
    targetModule: 'Ea',
    targetParam: 'EA_NUM_BLOCKS',
    relation: 'less_than',
    severity: 'warning',
    description: 'NvM ROM 块数不应超过 Ea 块数',
  },

  // ── T3 补充高频依赖（2026-08-10，参数名已验证存在）──
  {
    sourceModule: 'CanTp',
    sourceParam: 'CANTP_NUM_CHANNELS',
    targetModule: 'Can',
    targetParam: 'CAN_NUM_CONTROLLERS',
    relation: 'less_than',
    severity: 'warning',
    description: 'CanTp 通道数不应超过 Can 控制器数',
  },
  {
    sourceModule: 'CanSm',
    sourceParam: 'CANSM_NUM_NETWORKS',
    targetModule: 'Can',
    targetParam: 'CAN_NUM_CONTROLLERS',
    relation: 'less_than',
    severity: 'warning',
    description: 'CanSm 网络数不应超过 Can 控制器数',
  },
  {
    sourceModule: 'Eth',
    sourceParam: 'ETH_MAX_CONTROLLERS',
    targetModule: 'EthIf',
    targetParam: 'ETHIF_NUM_CONTROLLERS',
    relation: 'less_than',
    severity: 'warning',
    description: 'Eth 控制器数应匹配 EthIf',
  },
  {
    sourceModule: 'Fls',
    sourceParam: 'FLS_MAX_READ_NORMAL_MODE',
    targetModule: 'Eep',
    targetParam: 'EEP_SIZE',
    relation: 'less_than',
    severity: 'warning',
    description: 'Fls 读取大小不应超过 Eep 容量',
  },
  {
    sourceModule: 'WdgM',
    sourceParam: 'WDGM_CFG_DEM_INTEGRATION',
    targetModule: 'Dem',
    targetParam: 'DEM_NUM_DTCS',
    relation: 'in_range',
    severity: 'warning',
    description: 'WdgM DEM 集成事件应在 Dem DTC 范围内',
  },
  {
    sourceModule: 'Gpt',
    sourceParam: 'GPT_NUM_CHANNELS',
    targetModule: 'Mcu',
    targetParam: 'MCU_NUM_CLOCK_CONFIGS',
    relation: 'less_than',
    severity: 'warning',
    description: 'Gpt 通道数应匹配 Mcu 时钟配置',
  },
  {
    sourceModule: 'Com',
    sourceParam: 'COM_MAX_SIGNALS',
    targetModule: 'PduR',
    targetParam: 'PDUR_NUMBER_OF_ROUTING_PATHS',
    relation: 'less_than',
    severity: 'warning',
    description: 'Com 信号数不应超过 PduR 路由路径数',
  },
  {
    sourceModule: 'Dcm',
    sourceParam: 'DCM_NUM_CONNECTIONS',
    targetModule: 'PduR',
    targetParam: 'PDUR_NUMBER_OF_ROUTING_PATHS',
    relation: 'less_than',
    severity: 'warning',
    description: 'Dcm 连接数不应超过 PduR 路由路径数',
  },
  {
    sourceModule: 'CanIf',
    sourceParam: 'CANIF_NUM_RX_PDUS',
    targetModule: 'Can',
    targetParam: 'CAN_NUM_HOH',
    relation: 'less_than',
    severity: 'warning',
    description: 'CanIf 接收 PDU 数不应超过 Can 硬件对象数',
  },

  // ── T6 第二批高频依赖（2026-08-10，传输/存储/看门狗/诊断链，参数名已验证）──
  {
    sourceModule: 'CanTp',
    sourceParam: 'CANTP_NUM_CHANNELS',
    targetModule: 'PduR',
    targetParam: 'PDUR_NUMBER_OF_ROUTING_PATHS',
    relation: 'less_than',
    severity: 'warning',
    description: 'CanTp 通道数不应超过 PduR 路由路径数',
  },
  {
    sourceModule: 'PduR',
    sourceParam: 'PDUR_NUMBER_OF_ROUTING_PATHS',
    targetModule: 'CanIf',
    targetParam: 'CANIF_NUM_RX_PDUS',
    relation: 'less_than',
    severity: 'warning',
    description: 'PduR 路由路径数不应超过 CanIf 接收 PDU 数',
  },
  {
    sourceModule: 'NvM',
    sourceParam: 'NVM_NUM_OF_NVRAM_BLOCKS',
    targetModule: 'MemIf',
    targetParam: 'MEMIF_NUMBER_OF_DEVICES',
    relation: 'less_than',
    severity: 'warning',
    description: 'NvM 块数应匹配 MemIf 设备数',
  },
  {
    sourceModule: 'Fee',
    sourceParam: 'FEE_NUM_BLOCKS',
    targetModule: 'MemIf',
    targetParam: 'MEMIF_NUMBER_OF_DEVICES',
    relation: 'less_than',
    severity: 'warning',
    description: 'Fee 块数应匹配 MemIf 设备数',
  },
  {
    sourceModule: 'Ea',
    sourceParam: 'EA_NUM_BLOCKS',
    targetModule: 'MemIf',
    targetParam: 'MEMIF_NUMBER_OF_DEVICES',
    relation: 'less_than',
    severity: 'warning',
    description: 'Ea 块数应匹配 MemIf 设备数',
  },
  {
    sourceModule: 'FiM',
    sourceParam: 'FIM_NUM_FUNCTIONS',
    targetModule: 'Dem',
    targetParam: 'DEM_NUM_DTCS',
    relation: 'less_than',
    severity: 'warning',
    description: 'FiM 功能数不应超过 Dem DTC 数',
  },
  {
    sourceModule: 'WdgIf',
    sourceParam: 'WDGIF_NUMBER_OF_DEVICES',
    targetModule: 'WdgM',
    targetParam: 'WDGM_CFG_MAX_SUPERVISED_ENTITIES',
    relation: 'less_than',
    severity: 'warning',
    description: 'WdgIf 设备数不应超过 WdgM 监督实体数',
  },
  {
    sourceModule: 'Dcm',
    sourceParam: 'DCM_NUM_CONNECTIONS',
    targetModule: 'CanTp',
    targetParam: 'CANTP_NUM_CHANNELS',
    relation: 'less_than',
    severity: 'warning',
    description: 'Dcm 连接数不应超过 CanTp 通道数',
  },
  {
    sourceModule: 'EthIf',
    sourceParam: 'ETHIF_NUM_FRAME_OWNERS',
    targetModule: 'Eth',
    targetParam: 'ETH_MAX_CONTROLLERS',
    relation: 'less_than',
    severity: 'warning',
    description: 'EthIf 帧属主数不应超过 Eth 控制器数',
  },
  {
    sourceModule: 'LinIf',
    sourceParam: 'LINIF_MAX_CHANNELS',
    targetModule: 'Lin',
    targetParam: 'LIN_MAX_CHANNELS',
    relation: 'less_than',
    severity: 'warning',
    description: 'LinIf 通道数不应超过 Lin 通道数',
  },
];

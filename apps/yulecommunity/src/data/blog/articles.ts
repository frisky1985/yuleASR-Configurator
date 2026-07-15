/**
 * 博客文章数据
 * @description 技术博客系统示例文章数据
 */

import type { BlogArticle, BlogComment, BlogTag } from '@/types/blog';

/** 示例作者 */
const authors = {
  zhangsan: {
    id: '1',
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    role: '高级 AutoSAR 工程师',
    bio: '从事汽车软件开发10年，精通 MCAL 和 BSW 配置',
  },
  lisi: {
    id: '2',
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    role: '架构师',
    bio: '专注于汽车电子架构设计和功能安全',
  },
  wangwu: {
    id: '3',
    name: '王五',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    role: '工具链专家',
    bio: '深耕汽车软件开发工具链，擅长构建高效的 CI/CD 流水线',
  },
};

/** 示例文章 */
export const articles: BlogArticle[] = [
  {
    id: '1',
    title: 'AutoSAR BSW 分层架构详解',
    slug: 'autosar-bsw-layered-architecture',
    description: '深入解析 AutoSAR 基础软件 (BSW) 的分层架构设计原理，包括 MCAL、ECUAL、Service 层的职责划分与交互机制。',
    content: `# AutoSAR BSW 分层架构详解

## 概述

AutoSAR (汽车领域系统架构) 基础软件 (BSW) 采用分层架构设计，将硬件抽象与应用软件分离，从而实现软件的可移植性和可复用性。

## 架构分层

### 1. 微控制驱动层 (MCAL)

MCAL (Microcontroller Driver Layer) 是最底层的硬件抽象层：

- **主要职责**
  - 微控制器驱动程序开发
  - 寄存器配置
  - 中断管理

- **关键特性**
  - 高度依赖于具体芯片型号
  - 需要芯片厂商提供驱动

\`\`\`c
// MCAL 中断使能示例
void Mcal_EnableIRQ(uint32_t irqId)
{
    // 检查中断号有效性
    if (irqId >= MAX_IRQ_NUM) {
        return;
    }
    
    // 设置中断使能寄存器
    NVIC->ISER[irqId / 32] = (1U << (irqId % 32));
}
\`\`\`

### 2. ECU 抽象层 (ECUAL)

ECUAL (ECU Abstraction Layer) 提供对外设的标准接口：

- **主要组件**
  - ADC 驱动
  - PWM 驱动
  - SPI/I2C/CAN 通信驱动

- **核心价值**
  - 隔离硬件变化
  - 提供统一 API 接口

### 3. 服务层 (Service Layer)

服务层提供高层功能服务：

| 服务模块 | 功能描述 |
|---------|---------|
| NVRAM Manager | 非易失性数据管理 |
| Diagnostic Event Manager | 故障诊断管理 |
| Communication Manager | 通信管理 |

## 层间交互

\`\`\`
┌──────────────────────────┐
│    Application Layer (ASW)   │
├──────────────────────────┤
│       RTE (运行时环境)      │
├──────────────────────────┤
│       Service Layer          │
├──────────────────────────┤
│       ECU Abstraction Layer  │
├──────────────────────────┤
│       Microcontroller Driver │
└──────────────────────────┘
├──────────────────────────┤
│       Microcontroller HW     │
└──────────────────────────┘
\`\`\`

## 最佳实践

1. **层次清晰** - 严格遵守层次调用规范
2. **接口稳定** - 保持层间接口的稳定性
3. **可配置性** - 充分利用 AutoSAR 配置工具

## 总结

BSW 分层架构是 AutoSAR 的核心设计理念，通过明确的层次划分实现了软件的模块化和可移植性。
`,
    author: authors.zhangsan,
    publishDate: '2025-04-20T08:00:00Z',
    updatedAt: '2025-04-25T10:30:00Z',
    readTime: 15,
    viewCount: 1234,
    likeCount: 89,
    commentCount: 12,
    tags: ['AutoSAR', 'BSW', 'MCAL', '架构设计'],
    category: '架构设计',
    isHot: true,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    seo: {
      title: 'AutoSAR BSW 分层架构详解 - YuleTech 技术博客',
      description: '深入解析 AutoSAR 基础软件 (BSW) 的分层架构设计原理',
      keywords: ['AutoSAR', 'BSW', 'MCAL', 'ECUAL', 'Service Layer', '汽车软件'],
    },
  },
  {
    id: '2',
    title: 'CAN 通信协议与 AutoSAR Com 模块配置',
    slug: 'can-protocol-autosar-com-configuration',
    description: '详细介绍 CAN 通信协议原理，以及如何在 AutoSAR 中配置 Communication (Com) 模块实现数据发送与接收。',
    content: `# CAN 通信协议与 AutoSAR Com 模块配置

## CAN 协议基础

CAN (Controller Area Network) 是汽车领域广泛使用的串行通信协议。

### 数据帧结构

\`\`\`
┌─────────┬──────────────────────────────────────┐
│ 字段   │            说明                    │
├─────────┼──────────────────────────────────────┤
│ SOF    │ 起始位，一个显性位                    │
├─────────┼──────────────────────────────────────┤
│ ID     │ 标识符，标准 CAN 为 11 位            │
├─────────┼──────────────────────────────────────┤
│ DLC    │ 数据长度码，表示数据字节数量        │
├─────────┼──────────────────────────────────────┤
│ Data   │ 数据字段，最多 8 字节                │
├─────────┼──────────────────────────────────────┤
│ CRC    │ 循环冗余校验                        │
├─────────┼──────────────────────────────────────┤
│ ACK    │ 应答帐                              │
└─────────┴──────────────────────────────────────┘
\`\`\`

## AutoSAR Com 模块

Com 模块负责数据的发送和接收管理。

\`\`\`c
// Com 发送信号示例
Std_ReturnType Com_SendSignal(
    Com_SignalIdType SignalId,
    const void* SignalDataPtr
)
{
    Std_ReturnType status = E_OK;
    
    // 检查信号 ID 有效性
    if (SignalId >= ComConfig->NumSignals) {
        return E_NOT_OK;
    }
    
    // 复制数据到缓冲区
    memcpy(
        &ComSignalBuffer[SignalId],
        SignalDataPtr,
        ComConfig->Signals[SignalId].Length
    );
    
    return status;
}
\`\`\`

## 配置步骤

1. 定义信号 (Signal)
2. 定义报文 (PDU)
3. 配置发送周期
4. 设置过滤规则

## 常见问题

- 信号更新频率与报文发送周期不匹配
- 数据长度超出配置限制
- 未正确配置过滤规则

## 总结

Com 模块是 AutoSAR 通信架构的核心，正确的配置对系统性能至关重要。
`,
    author: authors.lisi,
    publishDate: '2025-04-18T10:00:00Z',
    updatedAt: '2025-04-22T14:20:00Z',
    readTime: 12,
    viewCount: 987,
    likeCount: 76,
    commentCount: 8,
    tags: ['CAN', '通信协议', 'COM', 'ECUAL'],
    category: 'ECUAL',
    isHot: true,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
    seo: {
      title: 'CAN 通信协议与 AutoSAR Com 配置指南',
      description: '详细介绍 CAN 通信协议和 AutoSAR Com 模块配置',
      keywords: ['CAN', '通信', 'AutoSAR', 'Com', '汽车网络'],
    },
  },
  {
    id: '3',
    title: 'NXP S32K3 芯片 MCAL 配置实战',
    slug: 'nxp-s32k3-mcal-configuration-guide',
    description: '基于 NXP S32K3 系列芯片的 MCAL 配置实战，包括 ADC、PWM、GPIO 等模块的详细配置步骤。',
    content: `# NXP S32K3 芯片 MCAL 配置实战

## 硬件平台

S32K3 是 NXP 针对汽车应用推出的高性能微控制器系列。

### 芯片特性

- ARM Cortex-M7 核心，最高 240MHz
- 支持 ASIL-D 功能安全等级
- 丰富的外设接口

## MCAL 配置流程

### 1. 环境准备

\`\`\`
1. 安装 S32 Design Studio
2. 导入 MCAL 包
3. 配置 EB tresos
\`\`\`

### 2. ADC 配置

\`\`\`c
// ADC 通道配置
const Adc_ChannelConfigType AdcChannelConfig[] = {
    {
        .ChannelId = 0,
        .ChannelInputMode = ADC_INPUT_MODE_SINGLE,
        .ChannelRange = ADC_RANGE_UNDER_OVER_VOLTAGE,
        .ChannelResolution = ADC_RESOLUTION_12BIT
    }
};
\`\`\`

### 3. PWM 配置

\`\`\`c
// PWM 模块配置
const Pwm_ChannelConfigType PwmChannelConfig[] = {
    {
        .ChannelId = 0,
        .Frequency = 1000,  // 1kHz
        .DutyCycle = 5000,  // 50%
        .Polarity = PWM_HIGH
    }
};
\`\`\`

## 调试技巧

- 使用 Lauterbach 调试器
- 配置 TRACE 输出
- 监控寄存器状态

## 常见问题

1. 时钟配置错误导致外设工作异常
2. 中断优先级配置不当
3. DMA 通道冲突

## 总结

S32K3 的 MCAL 配置需要深入理解芯片硬件特性，建议从简单模块开始逐步练习。
`,
    author: authors.zhangsan,
    publishDate: '2025-04-15T09:30:00Z',
    updatedAt: '2025-04-20T11:00:00Z',
    readTime: 20,
    viewCount: 1567,
    likeCount: 112,
    commentCount: 23,
    tags: ['NXP', 'S32K3', 'MCAL', '芯片配置'],
    category: 'MCAL',
    isHot: true,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
    seo: {
      title: 'NXP S32K3 MCAL 配置实战指南',
      description: '基于 NXP S32K3 芯片的 MCAL 配置实战教程',
      keywords: ['NXP', 'S32K3', 'MCAL', 'ADC', 'PWM', '汽车芯片'],
    },
  },
  {
    id: '4',
    title: '构建汽车软件 CI/CD 流水线',
    slug: 'automotive-software-ci-cd-pipeline',
    description: '使用 Jenkins、Docker 和静态代码分析工具构建完整的汽车软件持续集成/持续部署流水线。',
    content: `# 构建汽车软件 CI/CD 流水线

## CI/CD 在汽车软件中的重要性

汽车软件的复杂性和安全要求使得 CI/CD 成为必须。

## 技术栈

\`\`\`
┌────────────────────────────────┐
│     源代码管理 (Git/GitLab)      │
├────────────────────────────────┤
│      构建工具 (Jenkins)           │
├────────────────────────────────┤
│    静态分析 (SonarQube/Polyspace)   │
├────────────────────────────────┤
│      测试执行 (Unit/HIL 测试)      │
├────────────────────────────────┤
│     文档生成 (Doxygen)             │
├────────────────────────────────┤
│     部署发布 (OTA/刷写工具)       │
└────────────────────────────────┘
\`\`\`

## Jenkins Pipeline 示例

\`\`\`groovy
pipeline {
    agent { docker 'autosar-build-env:latest' }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Static Analysis') {
            steps {
                sh 'polyspace-bug-finder -config ps_config.txt'
            }
        }
        
        stage('Build') {
            steps {
                sh 'make BSW_CONFIG=Release'
            }
        }
        
        stage('Unit Test') {
            steps {
                sh 'ctest -T test --output-on-failure'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'build/Testing/**/*.xml'
                }
            }
        }
        
        stage('Code Coverage') {
            steps {
                sh 'gcovr -r . --html --html-details -o coverage.html'
            }
        }
    }
}
\`\`\`

## 静态代码分析

### MISRA C 规则检查

- 必须遵守 MISRA C:2012 编码规范
- 使用 SonarQube 进行持续检查

### 功能安全分析

- 使用 Polyspace 进行运行时错误检测
- 证明无运行时异常

## 测试策略

1. **单元测试** - Tessy/VectorCAST
2. **软件在环 (SIL) 测试** - PC 仿真
3. **硬件在环 (HIL) 测试** - dSPACE/NI

## 总结

CI/CD 是提高汽车软件质量的关键，需要结合功能安全和 ASPICE 要求进行设计。
`,
    author: authors.wangwu,
    publishDate: '2025-04-10T14:00:00Z',
    updatedAt: '2025-04-18T16:30:00Z',
    readTime: 18,
    viewCount: 2345,
    likeCount: 156,
    commentCount: 31,
    tags: ['CI/CD', 'Jenkins', '工具链', '自动化'],
    category: '工具链',
    isHot: true,
    coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop',
    seo: {
      title: '汽车软件 CI/CD 流水线构建指南',
      description: '使用 Jenkins、Docker 构建汽车软件持续集成流水线',
      keywords: ['CI/CD', 'Jenkins', '汽车软件', '持续集成', '自动化'],
    },
  },
  {
    id: '5',
    title: 'ISO 26262 功能安全实现要点',
    slug: 'iso-26262-functional-safety-implementation',
    description: '从标准角度解读 ISO 26262 功能安全要求，并分享在 AutoSAR 项目中的实际应用经验。',
    content: `# ISO 26262 功能安全实现要点

## ISO 26262 概述

ISO 26262 是汽车电气/电子系统的功能安全国际标准。

## ASIL 等级

| ASIL | 风险程度 | 示例系统 |
|------|---------|----------|
| ASIL-A | 最低 | 后视镜调节 |
| ASIL-B | 低 | 头灯控制 |
| ASIL-C | 中 | 空调系统 |
| ASIL-D | 最高 | 制动系统 |

## 安全要求

### 1. 安全分析

\`\`\`
HAZOP 分析 → FMEA 分析 → FTA 分析
└─────────────────────────────────────┘
          ↓
    安全目标 (Safety Goals)
          ↓
    技术安全要求 (TSR)
          ↓
    软件安全要求 (SSR)
\`\`\`

### 2. E2E 保护

\`\`\`c
// E2E 保护示例
#include "E2E_P01.h"

E2E_P01CheckStatusType E2E_CheckData(
    const E2E_P01ConfigType* Config,
    E2E_P01CheckStateType* State,
    const uint8_t* Data
)
{
    // CRC 校验
    uint8_t crc = Crc_CalculateCRC8(
        Data + 1,  // 跳过 CRC 字节
        Config->DataLength - 1,
        0xFF,
        FALSE
    );
    
    if (crc != Data[0]) {
        return E2E_P01STATUS_ERROR;
    }
    
    // 序号检查
    uint8_t receivedCounter = Data[Config->CounterOffset];
    // ... 计算期望的序号
    
    return E2E_P01STATUS_OK;
}
\`\`\`

### 3. 安全监视

\`\`\`c
// WdgM 监视示例
void WdgM_CheckpointReached(
    WdgM_SupervisedEntityIdType SEID,
    WdgM_CheckpointIdType CheckpointID
)
{
    // 更新监视实体状态
    WdgM_SEStatus[SEID].LastCheckpoint = CheckpointID;
    WdgM_SEStatus[SEID].Timestamp = GetCurrentTime();
    
    // 检查活动监视
    if (WdgM_IsAliveSupervisionEnabled(SEID)) {
        WdgM_CheckAliveSupervision(SEID);
    }
}
\`\`\`

## 开发流程

1. 安全分析阶段
2. 架构设计阶段
3. 软件实现阶段
4. 测试验证阶段
5. 确认评估阶段

## 工具链

- **Polyspace** - 静态代码分析
- **Tessy** - 单元测试
- **BTC** - 覆盖率测试

## 总结

ISO 26262 是确保汽车软件安全的基础，需要全生命周期的對待。
`,
    author: authors.lisi,
    publishDate: '2025-04-08T11:00:00Z',
    updatedAt: '2025-04-15T09:00:00Z',
    readTime: 25,
    viewCount: 876,
    likeCount: 67,
    commentCount: 15,
    tags: ['ISO 26262', '功能安全', 'ASIL', 'E2E'],
    category: '功能安全',
    isHot: false,
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop',
    seo: {
      title: 'ISO 26262 功能安全实现要点 - YuleTech 技术博客',
      description: '从标准角度解读 ISO 26262 功能安全要求和实践经验',
      keywords: ['ISO 26262', '功能安全', 'ASIL', 'E2E', '汽车安全'],
    },
  },
  {
    id: '6',
    title: 'AutoSAR NVM 模块数据管理深度解析',
    slug: 'autosar-nvm-data-management',
    description: '深入探讨 AutoSAR NVM (Non-Volatile Memory) 模块的数据管理机制，包括数据块配置、写入策略和损耗均衡算法。',
    content: `# AutoSAR NVM 模块数据管理深度解析

## NVM 架构概述

NVM (Non-Volatile Memory Manager) 负责管理非易失性数据的存储。

\`\`\`
┌────────────────────────────────┐
│       RTE / Application          │
├────────────────────────────────┤
│         NvM (Manager)            │
├────────────────────────────────┤
│   MemIf (Memory Interface)       │
├────────────────────────────────┤
│  Fee (Flash) / Ea (EEPROM)      │
├────────────────────────────────┤
│    Flash Driver / Eep Driver    │
└────────────────────────────────┘
\`\`\`

## 数据块类型

### Native Block

\`\`\`c
// 原生数据块配置
const NvM_BlockDescriptorType NvM_BlockDescriptor_Native = {
    .BlockManagementType = NVM_BLOCK_NATIVE,
    .BlockJobPriority = 1,
    .BlockCrcType = NVM_CRC_32,
    .NvBlockNum = 1,  // 单个备份
    .RomBlockNum = 1,
    .NvBlockLength = 64
};
\`\`\`

### Redundant Block

\`\`\`c
// 冗余数据块配置
const NvM_BlockDescriptorType NvM_BlockDescriptor_Redundant = {
    .BlockManagementType = NVM_BLOCK_REDUNDANT,
    .NvBlockNum = 2,  // 双份备份
    .RomBlockNum = 1,
    .NvBlockLength = 32
};
\`\`\`

## 写入策略

### 立即写入

\`\`\`c
// 显式写入 API
Std_ReturnType NvM_WriteBlock(
    NvM_BlockIdType BlockId,
    const void* NvM_SrcPtr
);
\`\`\`

### 定时写入

\`\`\`c
// 定时写入任务
void NvM_MainFunction(void)
{
    // 检查写队列
    if (NvM_WriteQueueNotEmpty()) {
        NvM_ProcessWriteRequest();
    }
    
    // 处理定时写入
    for (uint8 i = 0; i < NUM_BLOCKS; i++) {
        if (NvM_IsWriteTimerExpired(i)) {
            NvM_TriggerBlockWrite(i);
        }
    }
}
\`\`\`

## 损耗均衡

### 算法原理

1. 追踪每个块的操作次数
2. 动态迁移数据到低损耗区域
3. 保证整体写入次数均衡

\`\`\`c
// 简化的均衡算法
void Fee_WearLeveling(void)
{
    uint32 minEraseCount = FindMinEraseCount();
    uint32 maxEraseCount = FindMaxEraseCount();
    
    if ((maxEraseCount - minEraseCount) > WEAR_THRESHOLD) {
        // 执行数据迁移
        Fee_MigrateData(maxEraseCountBlock, minEraseCountBlock);
    }
}
\`\`\`

## 使用示例

\`\`\`c
// 初始化
void NvM_Init(void)
{
    NvM_ReadAll();  // 从 NV 读取所有数据
}

// 应用使用
void SaveVehicleConfig(void)
{
    // 更新数据
    memcpy(&vehicleConfig, &newConfig, sizeof(VehicleConfigType));
    
    // 触发定时写入
    NvM_SetRamBlockStatus(NVM_BLOCK_VEHICLE_CONFIG, TRUE);
}
\`\`\`

## 常见问题

1. **CRC 校验失败** - 数据损坏
2. **写入时间过长** - 阻塞其他任务
3. **块互斥** - 多任务冲突

## 总结

NVM 是 AutoSAR 中关键的数据管理模块，正确的配置和使用对系统稳定性至关重要。
`,
    author: authors.zhangsan,
    publishDate: '2025-04-05T08:30:00Z',
    updatedAt: '2025-04-12T10:00:00Z',
    readTime: 22,
    viewCount: 1123,
    likeCount: 91,
    commentCount: 19,
    tags: ['NVM', 'Service', '数据管理', 'Flash'],
    category: 'Service',
    isHot: false,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
    seo: {
      title: 'AutoSAR NVM 模块数据管理深度解析',
      description: '深入探讨 AutoSAR NVM 模块的数据管理机制和配置',
      keywords: ['AutoSAR', 'NVM', '数据管理', 'Flash', 'EEPROM'],
    },
  },
];

/** 示例评论 */
export const comments: BlogComment[] = [
  {
    id: '1',
    articleId: '1',
    content: '非常详细的文章，对 BSW 架构的讲解很到位！',
    author: {
      id: 'user1',
      name: '读者A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    },
    likes: 12,
    likedBy: ['user2', 'user3'],
    createdAt: '2025-04-21T10:00:00Z',
  },
  {
    id: '2',
    articleId: '1',
    content: '请问有关于 Service 层和 ECUAL 层交互的更多细节吗？',
    author: {
      id: 'user2',
      name: '读者B',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    },
    likes: 5,
    likedBy: [],
    parentId: '1',
    createdAt: '2025-04-21T14:30:00Z',
  },
  {
    id: '3',
    articleId: '2',
    content: 'CAN 配置部分讲得很清晰，收益匪浅！',
    author: {
      id: 'user3',
      name: '读者C',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    },
    likes: 8,
    likedBy: ['user1'],
    createdAt: '2025-04-19T09:00:00Z',
  },
];

/** 示例标签 */
export const tags: BlogTag[] = [
  { name: 'AutoSAR', articleCount: 4, color: '#3b82f6' },
  { name: 'MCAL', articleCount: 2, color: '#10b981' },
  { name: 'BSW', articleCount: 3, color: '#8b5cf6' },
  { name: 'CAN', articleCount: 1, color: '#f59e0b' },
  { name: '架构设计', articleCount: 2, color: '#ef4444' },
  { name: 'NXP', articleCount: 1, color: '#6366f1' },
  { name: 'CI/CD', articleCount: 1, color: '#14b8a6' },
  { name: 'ISO 26262', articleCount: 1, color: '#ec4899' },
  { name: '功能安全', articleCount: 1, color: '#f97316' },
  { name: '工具链', articleCount: 1, color: '#84cc16' },
  { name: 'Service', articleCount: 1, color: '#06b6d4' },
  { name: 'ECUAL', articleCount: 2, color: '#a855f7' },
];

/** 获取所有文章 */
export function getAllArticles(): BlogArticle[] {
  return articles;
}

/** 根据 ID 获取文章 */
export function getArticleById(id: string): BlogArticle | undefined {
  return articles.find(article => article.id === id);
}

/** 根据 slug 获取文章 */
export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return articles.find(article => article.slug === slug);
}

/** 获取热门文章 */
export function getHotArticles(limit: number = 5): BlogArticle[] {
  return articles
    .filter(article => article.isHot)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

/** 获取相关文章 */
export function getRelatedArticles(articleId: string, limit: number = 3): BlogArticle[] {
  const currentArticle = getArticleById(articleId);
  if (!currentArticle) return [];
  
  return articles
    .filter(article => 
      article.id !== articleId && 
      (article.category === currentArticle.category || 
       article.tags.some(tag => currentArticle.tags.includes(tag)))
    )
    .slice(0, limit);
}

/** 获取所有标签 */
export function getAllTags(): BlogTag[] {
  return tags;
}

/** 获取热门标签 */
export function getHotTags(limit: number = 10): BlogTag[] {
  return [...tags]
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, limit);
}

/** 根据标签获取文章 */
export function getArticlesByTag(tagName: string): BlogArticle[] {
  return articles.filter(article => 
    article.tags.some(tag => tag.toLowerCase() === tagName.toLowerCase())
  );
}

/** 根据分类获取文章 */
export function getArticlesByCategory(category: string): BlogArticle[] {
  if (category === '全部') return articles;
  return articles.filter(article => article.category === category);
}

/** 搜索文章 */
export function searchArticles(query: string): BlogArticle[] {
  const lowercaseQuery = query.toLowerCase();
  return articles.filter(article =>
    article.title.toLowerCase().includes(lowercaseQuery) ||
    article.description.toLowerCase().includes(lowercaseQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

/** 获取文章评论 */
export function getCommentsByArticleId(articleId: string): BlogComment[] {
  return comments.filter(comment => comment.articleId === articleId);
}

/** 博客示例文章（用于社区博客页面展示） */
export const articlesData = [
  {
    id: 'blog-1',
    title: 'AutoSAR BSW 分层架构深度解析：从 MCAL 到 RTE 的完整数据流',
    desc: '本文深入剖析 AutoSAR Classic Platform 的软件分层架构，详细讲解从微控制器驱动层（MCAL）到运行时环境（RTE）的完整数据流动路径，结合 YuleTech 开源实现进行代码级解读。',
    author: '李架构',
    avatar: '李架',
    role: '首席架构师',
    date: '2026-04-20',
    readTime: '15 分钟',
    views: 3420,
    likes: 128,
    comments: 36,
    tags: ['架构设计', 'AutoSAR', 'BSW'],
    category: '架构设计',
    hot: true,
    content: `AutoSAR Classic Platform 采用严格的分层软件架构，从底层硬件到上层应用，每一层都有明确的职责和接口定义。\n\n## 1. 软件分层概览\n\nAutoSAR BSW 栈从上到下依次为：\n- RTE（运行时环境）\n- Service 层（Com, PduR, NvM, Dcm, Dem）\n- ECUAL 层（CanIf, IoHwAb, CanTp 等）\n- MCAL 层（Mcu, Port, Dio, Can, Spi 等）\n- 微控制器硬件\n\n## 2. 数据流分析\n\n以 CAN 信号发送为例，完整的数据流路径为：\n\nASW (SWC) → RTE → Com → PduR → CanIf → Can (MCAL) → FlexCAN (Hardware)\n\n每一层都通过标准化的接口进行数据交换，确保软件组件的可移植性和可替换性。`,
  },
  {
    id: 'blog-2',
    title: 'CAN FD 驱动开发实战：从寄存器到 AutoSAR 接口',
    desc: '手把手讲解如何实现 CAN FD 驱动，从 FlexCAN 寄存器配置到 AutoSAR Can 模块的完整对接流程。',
    author: '张明',
    avatar: '张明',
    role: '嵌入式工程师',
    date: '2026-04-19',
    readTime: '12 分钟',
    views: 1860,
    likes: 72,
    comments: 18,
    tags: ['MCAL', 'CAN', 'i.MX8M'],
    category: 'MCAL',
    hot: true,
    content: '本平台集成了 FlexCAN 模块，支持经典 CAN 和 CAN FD 两种模式。本文将详细介绍从寄存器配置到 AutoSAR Can 模块接口的完整实现。',
  },
  {
    id: 'blog-3',
    title: 'CanIf 模块配置最佳实践：信号路由与 PDU 映射',
    desc: '总结 CanIf 模块在实际项目中的配置经验，包括 HOH 配置、PDU 路由表设计、以及 Upper Layer 接口对接要点。',
    author: '李华',
    avatar: '李华',
    role: '软件架构师',
    date: '2026-04-18',
    readTime: '10 分钟',
    views: 1540,
    likes: 58,
    comments: 14,
    tags: ['ECUAL', 'CanIf', '配置'],
    category: 'ECUAL',
    hot: true,
    content: 'CanIf（CAN Interface）是 ECUAL 层的关键模块，负责为上层的 PduR 和 Com 提供与硬件无关的 CAN 通信接口。',
  },
  {
    id: 'blog-4',
    title: 'AutoSAR Com 模块信号打包与解包机制详解',
    desc: '深入讲解 Com 模块的信号（Signal）和信号组（Signal Group）打包机制，包括字节序、对齐方式和更新位处理。',
    author: '王强',
    avatar: '王强',
    role: '通信工程师',
    date: '2026-04-17',
    readTime: '18 分钟',
    views: 1200,
    likes: 45,
    comments: 9,
    tags: ['Service', 'Com', '通信'],
    category: 'Service',
    hot: false,
    content: 'Com 模块是 AutoSAR 通信栈的核心，负责将应用层的信号数据打包成 PDU，以及将接收到的 PDU 解包成信号数据。',
  },
  {
    id: 'blog-5',
    title: 'YuleConfig 工具链插件开发入门指南',
    desc: '介绍 YuleTech 配置工具链的插件架构，如何开发自定义模块配置界面和代码生成器。',
    author: '刘洋',
    avatar: '刘洋',
    role: 'DevOps工程师',
    date: '2026-04-16',
    readTime: '8 分钟',
    views: 980,
    likes: 38,
    comments: 7,
    tags: ['工具链', 'YuleConfig', '插件'],
    category: '工具链',
    hot: false,
    content: 'YuleConfig 是 YuleTech 开源的 AutoSAR BSW 配置工具链，采用插件化架构，支持自定义模块配置界面和代码生成器开发。',
  },
  {
    id: 'blog-6',
    title: 'ISO 26262 功能安全在 AutoSAR BSW 中的实现要点',
    desc: '从 ASIL 等级划分到 E2E 保护，系统讲解功能安全要求在基础软件各层级的实现策略。',
    author: '陈工',
    avatar: '陈工',
    role: '功能安全工程师',
    date: '2026-04-15',
    readTime: '20 分钟',
    views: 2100,
    likes: 89,
    comments: 22,
    tags: ['功能安全', 'ISO 26262', 'E2E'],
    category: '功能安全',
    hot: true,
    content: 'ISO 26262 是汽车功能安全的国际标准，AutoSAR BSW 作为基础软件，需要在架构设计和代码实现中充分考虑功能安全要求。',
  },
  {
    id: 'blog-7',
    title: '从 0 到 1：搭建 AutoSAR BSW 持续集成流水线',
    desc: '基于 GitHub Actions 和 Docker 搭建完整的 BSW 编译、静态分析和单元测试流水线。',
    author: '赵敏',
    avatar: '赵敏',
    role: 'CI/CD工程师',
    date: '2026-04-14',
    readTime: '14 分钟',
    views: 1120,
    likes: 41,
    comments: 11,
    tags: ['工具链', 'CI/CD', 'Docker'],
    category: '工具链',
    hot: false,
    content: '持续集成是现代软件开发的标准实践，对于 AutoSAR BSW 这种对质量要求极高的嵌入式软件尤为重要。',
  },
  {
    id: 'blog-8',
    title: 'PduR 模块路由策略设计与性能优化',
    desc: 'PduR 作为 PDU 路由的核心模块，本文分析其路由表设计、缓冲策略和性能优化技巧。',
    author: '孙博',
    avatar: '孙博',
    role: '高级软件工程师',
    date: '2026-04-13',
    readTime: '16 分钟',
    views: 890,
    likes: 33,
    comments: 6,
    tags: ['Service', 'PduR', '性能优化'],
    category: 'Service',
    hot: false,
    content: 'PduR（PDU Router）是 Service 层的关键模块，负责在不同通信接口之间路由 PDU 数据。',
  },
  {
    id: 'blog-9',
    title: 'AutoSAR RTE 层接口生成原理与代码分析',
    desc: '解析 RTE 生成器的工作原理，从 ARXML 描述到 C 语言接口代码的完整转换流程。',
    author: '李架构',
    avatar: '李架',
    role: '首席架构师',
    date: '2026-04-12',
    readTime: '22 分钟',
    views: 1650,
    likes: 67,
    comments: 15,
    tags: ['架构设计', 'RTE', '代码生成'],
    category: '架构设计',
    hot: true,
    content: 'RTE（Runtime Environment）是 AutoSAR 软件组件之间的通信接口层，其代码通常由 RTE 生成器根据 ARXML 配置自动生成。',
  },
  {
    id: 'blog-10',
    title: 'MISRA C:2012 规则在汽车软件中的实践应用',
    desc: '结合实际代码案例讲解 MISRA C:2012 中最常被触发的规则，以及如何在开发中避免违规。',
    author: '周审',
    avatar: '周审',
    role: '质量工程师',
    date: '2026-04-11',
    readTime: '11 分钟',
    views: 1340,
    likes: 52,
    comments: 10,
    tags: ['工具链', 'MISRA', '代码质量'],
    category: '工具链',
    hot: false,
    content: 'MISRA C:2012 是汽车嵌入式软件开发中最广泛使用的编码规范，遵循 MISRA 规则可以显著提高代码的安全性和可维护性。',
  },
];

/** 所有分类 */
export const categories = [
  '全部',
  'MCAL',
  'ECUAL',
  'Service',
  '工具链',
  '功能安全',
  '架构设计',
] as const;

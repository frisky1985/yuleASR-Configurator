import type { AutosarApi } from './types';

export const SPI_APIS: AutosarApi[] = [
  {
    id: 'Spi_Init',
    name: 'Spi_Init',
    signature: 'void Spi_Init(const Spi_ConfigType* ConfigPtr)',
    brief: '初始化 SPI 驱动模块',
    description: '初始化 SPI 驱动模块，配置通道、序列、作业和传输模式。必须在任何 SPI 操作前调用，且只能调用一次。',
    params: [
      { name: 'ConfigPtr', type: 'const Spi_ConfigType*', direction: 'in', description: 'SPI 配置表指针，包含所有通道和作业配置' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_Init 初始化 SPI */
#include "Spi.h"

void Spi_InitExample(void) {
    Spi_Init(&Spi_Config);
}`,
    seeAlso: ['Spi_DeInit', 'Spi_SetupEB', 'Spi_GetStatus'],
    status: 'standard',
  },
  {
    id: 'Spi_DeInit',
    name: 'Spi_DeInit',
    signature: 'void Spi_DeInit(void)',
    brief: '反初始化 SPI 驱动模块',
    description: '关闭 SPI 驱动模块，释放所有资源。调用后 SPI 模块恢复到未初始化状态。',
    params: [],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_DeInit 关闭 SPI */
#include "Spi.h"

void Spi_Shutdown(void) {
    Spi_DeInit();
}`,
    seeAlso: ['Spi_Init'],
    status: 'standard',
  },
  {
    id: 'Spi_WriteIB',
    name: 'Spi_WriteIB',
    signature: 'Std_ReturnType Spi_WriteIB(Spi_ChannelType Channel, const Spi_DataBufferType* DataBufferPtr)',
    brief: '向通道写入数据到内部缓冲区',
    description: '将数据写入指定通道的内部缓冲区。数据在 Spi_AsyncTransmit 或同步传输时发送到外设。支持跨作业的数据传输。',
    params: [
      { name: 'Channel', type: 'Spi_ChannelType', direction: 'in', description: '目标通道 ID' },
      { name: 'DataBufferPtr', type: 'const Spi_DataBufferType*', direction: 'in', description: '指向待发送数据的缓冲区指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 写入成功；E_NOT_OK: 通道无效或缓冲区错误',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_WriteIB 写入发送缓冲区 */
#include "Spi.h"

void Spi_PrepareData(void) {
    Spi_DataBufferType data = 0xA5;
    Spi_WriteIB(SPI_CHANNEL_0, &data);
    /* 随后调用 Spi_AsyncTransmit 发送 */
}`,
    seeAlso: ['Spi_ReadIB', 'Spi_AsyncTransmit', 'Spi_SyncTransmit'],
    status: 'standard',
  },
  {
    id: 'Spi_ReadIB',
    name: 'Spi_ReadIB',
    signature: 'Std_ReturnType Spi_ReadIB(Spi_ChannelType Channel, Spi_DataBufferType* DataBufferPtr)',
    brief: '从通道内部缓冲区读取接收数据',
    description: '从指定通道的内部缓冲区读取已接收的数据。通常在传输完成后调用以获取接收结果。',
    params: [
      { name: 'Channel', type: 'Spi_ChannelType', direction: 'in', description: '目标通道 ID' },
      { name: 'DataBufferPtr', type: 'Spi_DataBufferType*', direction: 'out', description: '接收数据缓冲区指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 读取成功；E_NOT_OK: 通道无效或数据不可用',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_ReadIB 读取接收数据 */
#include "Spi.h"

void Spi_ReadReceived(void) {
    Spi_DataBufferType rxData;
    Spi_ReadIB(SPI_CHANNEL_0, &rxData);
}`,
    seeAlso: ['Spi_WriteIB', 'Spi_AsyncTransmit', 'Spi_SyncTransmit'],
    status: 'standard',
  },
  {
    id: 'Spi_AsyncTransmit',
    name: 'Spi_AsyncTransmit',
    signature: 'Std_ReturnType Spi_AsyncTransmit(Spi_SequenceType Sequence)',
    brief: '启动异步 SPI 传输序列',
    description: '以非阻塞方式启动指定序列的 SPI 传输。传输完成后通过回调函数通知上层。传输期间 CPU 可执行其他任务。',
    params: [
      { name: 'Sequence', type: 'Spi_SequenceType', direction: 'in', description: '要执行的序列 ID' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 传输已启动；E_NOT_OK: 序列无效或硬件忙',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_AsyncTransmit 异步传输 */
#include "Spi.h"

void Spi_StartTransfer(void) {
    Std_ReturnType ret = Spi_AsyncTransmit(SPI_SEQUENCE_0);
    if (ret == E_OK) {
        /* 传输已启动，等待回调通知 */
    }
}`,
    seeAlso: ['Spi_SyncTransmit', 'Spi_GetJobResult', 'Spi_SetAsyncMode'],
    status: 'standard',
  },
  {
    id: 'Spi_SyncTransmit',
    name: 'Spi_SyncTransmit',
    signature: 'Std_ReturnType Spi_SyncTransmit(Spi_SequenceType Sequence)',
    brief: '启动同步 SPI 传输序列',
    description: '以阻塞方式启动指定序列的 SPI 传输。函数在传输完成后返回，期间 CPU 忙等待或阻塞。适用于短数据传输或时序关键场景。',
    params: [
      { name: 'Sequence', type: 'Spi_SequenceType', direction: 'in', description: '要执行的序列 ID' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 传输成功；E_NOT_OK: 序列无效或传输失败',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_SyncTransmit 同步传输 */
#include "Spi.h"

void Spi_ReadRegister(uint8 regAddr) {
    Spi_DataBufferType txData = regAddr;
    Spi_DataBufferType rxData;

    Spi_WriteIB(SPI_CHANNEL_0, &txData);
    Spi_SyncTransmit(SPI_SEQUENCE_0);
    Spi_ReadIB(SPI_CHANNEL_0, &rxData);

    /* rxData 包含寄存器值 */
}`,
    seeAlso: ['Spi_AsyncTransmit', 'Spi_WriteIB', 'Spi_ReadIB'],
    status: 'standard',
    timing: '执行时间取决于传输数据量，同步模式下阻塞等待',
  },
  {
    id: 'Spi_SetupEB',
    name: 'Spi_SetupEB',
    signature: 'void Spi_SetupEB(Spi_ChannelType Channel, const Spi_EBType* EBConfigPtr)',
    brief: '配置外部缓冲区用于数据传输',
    description: '将外部缓冲区绑定到指定通道。启用外部缓冲区后，SPI 数据直接从外部缓冲区读写，绕过内部缓冲区，适用于大数据块传输。',
    params: [
      { name: 'Channel', type: 'Spi_ChannelType', direction: 'in', description: '目标通道 ID' },
      { name: 'EBConfigPtr', type: 'const Spi_EBType*', direction: 'in', description: '外部缓冲区配置指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_SetupEB 配置外部缓冲区 */
#include "Spi.h"

Spi_EBType extBuf = {
    .srcBuffer = txBuffer,
    .destBuffer = rxBuffer,
    .length = 256
};

void Spi_SetupExtBuf(void) {
    Spi_SetupEB(SPI_CHANNEL_0, &extBuf);
}`,
    seeAlso: ['Spi_WriteIB', 'Spi_ReadIB'],
    status: 'standard',
  },
  {
    id: 'Spi_GetStatus',
    name: 'Spi_GetStatus',
    signature: 'Spi_StatusType Spi_GetStatus(void)',
    brief: '获取 SPI 驱动模块状态',
    description: '返回 SPI 驱动模块的当前状态：SPI_UNINIT（未初始化）、SPI_IDLE（空闲）、SPI_BUSY（忙）。',
    params: [],
    returnType: 'Spi_StatusType',
    returnDescription: '当前状态：SPI_UNINIT / SPI_IDLE / SPI_BUSY',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_GetStatus 检查状态 */
#include "Spi.h"

void Spi_CheckReady(void) {
    if (Spi_GetStatus() == SPI_IDLE) {
        /* SPI 空闲，可以启动传输 */
    }
}`,
    seeAlso: ['Spi_GetJobResult', 'Spi_GetSequenceResult'],
    status: 'standard',
  },
  {
    id: 'Spi_GetJobResult',
    name: 'Spi_GetJobResult',
    signature: 'Spi_JobResultType Spi_GetJobResult(Spi_JobType Job)',
    brief: '获取指定作业的执行结果',
    description: '返回指定 SPI 作业的执行状态：SPI_JOB_OK（成功）、SPI_JOB_PENDING（进行中）、SPI_JOB_FAILED（失败）等。',
    params: [
      { name: 'Job', type: 'Spi_JobType', direction: 'in', description: '要查询的作业 ID' },
    ],
    returnType: 'Spi_JobResultType',
    returnDescription: '作业执行结果',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_GetJobResult 检查作业状态 */
#include "Spi.h"

void Spi_WaitJobDone(Spi_JobType job) {
    while (Spi_GetJobResult(job) == SPI_JOB_PENDING) {
        /* 等待作业完成 */
    }
}`,
    seeAlso: ['Spi_GetSequenceResult', 'Spi_GetStatus'],
    status: 'standard',
  },
  {
    id: 'Spi_GetSequenceResult',
    name: 'Spi_GetSequenceResult',
    signature: 'Spi_SeqResultType Spi_GetSequenceResult(Spi_SequenceType Sequence)',
    brief: '获取指定序列的执行结果',
    description: '返回指定 SPI 序列的执行状态，包括序列中所有作业的总体结果。',
    params: [
      { name: 'Sequence', type: 'Spi_SequenceType', direction: 'in', description: '要查询的序列 ID' },
    ],
    returnType: 'Spi_SeqResultType',
    returnDescription: '序列执行结果',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_GetSequenceResult 检查序列状态 */
#include "Spi.h"

void Spi_CheckSeq(void) {
    Spi_SeqResultType result = Spi_GetSequenceResult(SPI_SEQUENCE_0);
    if (result == SPI_SEQ_OK) {
        /* 序列执行成功 */
    }
}`,
    seeAlso: ['Spi_GetJobResult', 'Spi_AsyncTransmit'],
    status: 'standard',
  },
  {
    id: 'Spi_Cancel',
    name: 'Spi_Cancel',
    signature: 'void Spi_Cancel(Spi_SequenceType Sequence)',
    brief: '取消正在执行的 SPI 序列',
    description: '取消指定 SPI 序列的执行。如果序列正在传输，将终止当前和后续所有作业。适用于超时或错误恢复场景。',
    params: [
      { name: 'Sequence', type: 'Spi_SequenceType', direction: 'in', description: '要取消的序列 ID' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_Cancel 取消传输 */
#include "Spi.h"

void Spi_AbortTransfer(void) {
    Spi_Cancel(SPI_SEQUENCE_0);
}`,
    seeAlso: ['Spi_AsyncTransmit', 'Spi_SyncTransmit'],
    status: 'standard',
  },
  {
    id: 'Spi_SetAsyncMode',
    name: 'Spi_SetAsyncMode',
    signature: 'void Spi_SetAsyncMode(Spi_AsyncModeType Mode)',
    brief: '设置 SPI 异步传输模式',
    description: '配置 SPI 异步传输的完成通知方式：轮询模式（无回调）或中断模式（触发回调函数）。',
    params: [
      { name: 'Mode', type: 'Spi_AsyncModeType', direction: 'in', description: '异步模式：SPI_POLLING_MODE 或 SPI_INTERRUPT_MODE' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_SetAsyncMode 设置回调模式 */
#include "Spi.h"

void Spi_EnableInterrupt(void) {
    Spi_SetAsyncMode(SPI_INTERRUPT_MODE);
}`,
    seeAlso: ['Spi_AsyncTransmit', 'Spi_GetJobResult'],
    status: 'standard',
  },
  {
    id: 'Spi_SetDataWidth',
    name: 'Spi_SetDataWidth',
    signature: 'Std_ReturnType Spi_SetDataWidth(Spi_ChannelType Channel, Spi_DataWidthType DataWidth)',
    brief: '设置 SPI 数据宽度',
    description: '配置指定 SPI 通道的数据位宽（如 8 位、16 位、32 位）。不同的 SPI 外设可能要求不同的数据宽度。',
    params: [
      { name: 'Channel', type: 'Spi_ChannelType', direction: 'in', description: '目标通道 ID' },
      { name: 'DataWidth', type: 'Spi_DataWidthType', direction: 'in', description: '数据宽度（位）' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 设置成功；E_NOT_OK: 不支持的数据宽度',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_SetDataWidth 设置 16 位模式 */
#include "Spi.h"

void Spi_16BitMode(void) {
    Spi_SetDataWidth(SPI_CHANNEL_0, SPI_DATA_WIDTH_16);
}`,
    seeAlso: ['Spi_WriteIB', 'Spi_ReadIB'],
    status: 'optional',
  },
  {
    id: 'Spi_SetBitRate',
    name: 'Spi_SetBitRate',
    signature: 'Std_ReturnType Spi_SetBitRate(Spi_ChannelType Channel, Spi_BitRateType BitRate)',
    brief: '设置 SPI 通信波特率',
    description: '动态改变指定 SPI 通道的通信速率。用于在运行时适配不同速度的 SPI 外设。',
    params: [
      { name: 'Channel', type: 'Spi_ChannelType', direction: 'in', description: '目标通道 ID' },
      { name: 'BitRate', type: 'Spi_BitRateType', direction: 'in', description: '目标波特率（Hz）' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 设置成功；E_NOT_OK: 不支持的波特率',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_SetBitRate 切换速率 */
#include "Spi.h"

void Spi_SlowSpeed(void) {
    Spi_SetBitRate(SPI_CHANNEL_0, 100000); /* 100 kHz */
}`,
    seeAlso: ['Spi_SetDataWidth', 'Spi_SetAsyncMode'],
    status: 'optional',
  },
  {
    id: 'Spi_GetHardwareResult',
    name: 'Spi_GetHardwareResult',
    signature: 'Spi_HWResultType Spi_GetHardwareResult(Spi_ChannelType Channel)',
    brief: '获取 SPI 硬件传输结果',
    description: '返回 SPI 硬件层面的传输结果，包括错误标志、超时状态等底层信息。用于诊断 SPI 通信故障。',
    params: [
      { name: 'Channel', type: 'Spi_ChannelType', direction: 'in', description: '目标通道 ID' },
    ],
    returnType: 'Spi_HWResultType',
    returnDescription: '硬件传输结果和状态标志',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_GetHardwareResult 硬件诊断 */
#include "Spi.h"

void Spi_CheckHwError(void) {
    Spi_HWResultType hwResult = Spi_GetHardwareResult(SPI_CHANNEL_0);
    if (hwResult & SPI_HW_ERROR_MODE_FAULT) {
        /* SPI 通信错误处理 */
    }
}`,
    seeAlso: ['Spi_GetJobResult', 'Spi_GetStatus'],
    status: 'optional',
  },
  {
    id: 'Spi_SetCsPolarity',
    name: 'Spi_SetCsPolarity',
    signature: 'Std_ReturnType Spi_SetCsPolarity(Spi_ChannelType Channel, Spi_CsPolarityType Polarity)',
    brief: '设置片选信号极性',
    description: '配置指定 SPI 通道的片选（CS）信号极性，支持低电平有效或高电平有效。',
    params: [
      { name: 'Channel', type: 'Spi_ChannelType', direction: 'in', description: '目标通道 ID' },
      { name: 'Polarity', type: 'Spi_CsPolarityType', direction: 'in', description: 'CS 极性：低电平有效或高电平有效' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 设置成功；E_NOT_OK: 不支持的极性配置',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_SetCsPolarity 设置 CS 极性 */
#include "Spi.h"

void Spi_ConfigCs(void) {
    Spi_SetCsPolarity(SPI_CHANNEL_0, SPI_CS_POLARITY_LOW);
}`,
    seeAlso: ['Spi_Init', 'Spi_SetBitRate'],
    status: 'optional',
  },
  {
    id: 'Spi_Exchange',
    name: 'Spi_Exchange',
    signature: 'Std_ReturnType Spi_Exchange(Spi_ChannelType Channel, Spi_DataBufferType* DataBufferPtr, uint16 Length)',
    brief: '全双工同步数据交换',
    description: '执行全双工 SPI 数据交换：在发送数据的同时接收数据。适用于需要同时发送和接收的场景，如读取 SPI 寄存器。',
    params: [
      { name: 'Channel', type: 'Spi_ChannelType', direction: 'in', description: '目标通道 ID' },
      { name: 'DataBufferPtr', type: 'Spi_DataBufferType*', direction: 'inout', description: '发送数据并接收数据的缓冲区指针' },
      { name: 'Length', type: 'uint16', direction: 'in', description: '数据长度（字节）' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 交换成功；E_NOT_OK: 交换失败',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_Exchange 读写寄存器 */
#include "Spi.h"

uint8 Spi_ReadRegister(uint8 regAddr) {
    uint8 buffer[2] = { regAddr, 0 };
    Spi_Exchange(SPI_CHANNEL_0, buffer, 2);
    return buffer[1]; /* 返回读取的寄存器值 */
}`,
    seeAlso: ['Spi_SyncTransmit', 'Spi_WriteIB', 'Spi_ReadIB'],
    status: 'standard',
  },
  {
    id: 'Spi_GetVersionInfo',
    name: 'Spi_GetVersionInfo',
    signature: 'void Spi_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 SPI 驱动模块版本信息',
    description: '返回 SPI 驱动模块的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'Spi',
    layerId: 'MCAL',
    version: '4.4',
    example: `/* Spi_GetVersionInfo 示例 */
#include "Spi.h"

void Spi_PrintVersion(void) {
    Std_VersionInfoType ver;
    Spi_GetVersionInfo(&ver);
}`,
    seeAlso: [],
    status: 'standard',
  },
];

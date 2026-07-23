import type { AutosarApi } from './types';

export const NVM_APIS: AutosarApi[] = [
  {
    id: 'NvM_Init',
    name: 'NvM_Init',
    signature: 'void NvM_Init(const NvM_ConfigType* ConfigPtr)',
    brief: '初始化 NvM 模块',
    description: '初始化 NvM 模块，加载 NVRAM 管理器配置，包括块布局、存储介质、校验和算法等。必须在任何 NvM 操作之前调用。',
    params: [
      { name: 'ConfigPtr', type: 'const NvM_ConfigType*', direction: 'in', description: 'NvM 配置指针，包含所有 NVRAM 块和存储设备配置' },
    ],
    returnType: 'void',
    returnDescription: '无返回值',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_Init 初始化 NVRAM 管理器 */
#include "NvM.h"

void NvM_InitExample(void) {
    NvM_Init(&NvM_Config);
    /* NVRAM 管理器已初始化，各块状态可用 */
}`,
    seeAlso: ['NvM_ReadBlock', 'NvM_WriteBlock', 'NvM_GetVersionInfo'],
    configParams: [
      { paramName: 'NvMConfig', configModule: 'NvM', path: 'NvM/NvMConfig' },
    ],
    status: 'standard',
  },
  {
    id: 'NvM_ReadBlock',
    name: 'NvM_ReadBlock',
    signature: 'Std_ReturnType NvM_ReadBlock(NvM_BlockIdType BlockId, void* DataBufferPtr)',
    brief: '从 NVRAM 读取指定块的数据',
    description: '从非易失性存储器中读取指定 NVRAM 块的数据到提供的缓冲区。支持同步和异步模式，异步模式下通过回调通知完成。',
    params: [
      { name: 'BlockId', type: 'NvM_BlockIdType', direction: 'in', description: 'NVRAM 块 ID' },
      { name: 'DataBufferPtr', type: 'void*', direction: 'out', description: '数据输出缓冲区指针，用于存放读取的数据' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 读取成功；E_NOT_OK: 读取失败；NVM_REQ_BUSY: 模块忙',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_ReadBlock 读取校准参数 */
#include "NvM.h"

typedef struct {
    uint16 param1;
    uint16 param2;
    uint8  param3;
} CalibParams;

void NvM_ReadCalibration(void) {
    CalibParams calibData;
    Std_ReturnType ret = NvM_ReadBlock(NVM_BLOCK_CALIBRATION, &calibData);
    if (ret == E_OK) {
        /* calibData 包含校准参数 */
    }
}`,
    exampleDescription: '从 NVRAM 读取校准参数块',
    seeAlso: ['NvM_WriteBlock', 'NvM_ReadAll', 'NvM_GetErrorStatus'],
    status: 'standard',
  },
  {
    id: 'NvM_WriteBlock',
    name: 'NvM_WriteBlock',
    signature: 'Std_ReturnType NvM_WriteBlock(NvM_BlockIdType BlockId, const void* DataBufferPtr)',
    brief: '写入数据到 NVRAM 指定块',
    description: '将缓冲区中的数据写入非易失性存储器中的指定 NVRAM 块。写入操作在后台执行，完成后通过回调通知上层。',
    params: [
      { name: 'BlockId', type: 'NvM_BlockIdType', direction: 'in', description: 'NVRAM 块 ID' },
      { name: 'DataBufferPtr', type: 'const void*', direction: 'in', description: '待写入数据缓冲区指针' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 写入请求已提交；E_NOT_OK: 写入失败；NVM_REQ_BUSY: 模块忙',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_WriteBlock 保存校准参数 */
#include "NvM.h"

typedef struct {
    uint16 param1;
    uint16 param2;
    uint8  param3;
} CalibParams;

void NvM_SaveCalibration(void) {
    CalibParams calibData = {
        .param1 = 1000,
        .param2 = 2000,
        .param3 = 50
    };
    Std_ReturnType ret = NvM_WriteBlock(NVM_BLOCK_CALIBRATION, &calibData);
    if (ret == E_OK) {
        /* 写入请求已提交到后台 */
    }
}`,
    exampleDescription: '保存校准参数到 NVRAM',
    seeAlso: ['NvM_ReadBlock', 'NvM_WriteAll', 'NvM_RestoreBlockDefaults'],
    status: 'standard',
  },
  {
    id: 'NvM_EraseBlock',
    name: 'NvM_EraseBlock',
    signature: 'Std_ReturnType NvM_EraseBlock(NvM_BlockIdType BlockId)',
    brief: '擦除 NVRAM 指定块的数据',
    description: '擦除非易失性存储器中指定 NVRAM 块的数据。擦除后块数据恢复到未初始化状态（通常为全 0xFF 或配置的默认值）。',
    params: [
      { name: 'BlockId', type: 'NvM_BlockIdType', direction: 'in', description: '要擦除的 NVRAM 块 ID' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 擦除成功；E_NOT_OK: 擦除失败',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_EraseBlock 擦除 NVRAM 块 */
#include "NvM.h"

void NvM_ResetToFactory(void) {
    Std_ReturnType ret = NvM_EraseBlock(NVM_BLOCK_CALIBRATION);
    if (ret == E_OK) {
        /* 校准参数块已擦除 */
    }
}`,
    exampleDescription: '擦除校准参数块恢复出厂状态',
    seeAlso: ['NvM_RestoreBlockDefaults', 'NvM_WriteBlock'],
    status: 'standard',
  },
  {
    id: 'NvM_GetVersionInfo',
    name: 'NvM_GetVersionInfo',
    signature: 'void NvM_GetVersionInfo(Std_VersionInfoType* VersionInfo)',
    brief: '获取 NvM 模块版本信息',
    description: '返回 NvM 模块的厂商 ID、模块 ID、软件版本号等版本信息。',
    params: [
      { name: 'VersionInfo', type: 'Std_VersionInfoType*', direction: 'out', description: '版本信息输出结构体指针' },
    ],
    returnType: 'void',
    returnDescription: '无返回值，版本信息通过 VersionInfo 指针返回',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_GetVersionInfo 示例 */
#include "NvM.h"

void NvM_PrintVersion(void) {
    Std_VersionInfoType ver;
    NvM_GetVersionInfo(&ver);
}`,
    seeAlso: [],
    status: 'standard',
  },
  {
    id: 'NvM_ReadAll',
    name: 'NvM_ReadAll',
    signature: 'Std_ReturnType NvM_ReadAll(void)',
    brief: '批量读取所有 NVRAM 块',
    description: '启动读取所有配置为自动读取的 NVRAM 块的批量操作。通常在系统启动后调用，一次性从非易失性存储器加载所有持久化数据。',
    params: [],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 读取已启动；E_NOT_OK: 启动失败',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_ReadAll 批量加载 NVRAM 数据 */
#include "NvM.h"

void NvM_LoadAllBlocks(void) {
    Std_ReturnType ret = NvM_ReadAll();
    if (ret == E_OK) {
        /* 后台开始读取所有自动加载的块 */
    }
}`,
    exampleDescription: '系统启动时批量加载所有 NVRAM 块',
    seeAlso: ['NvM_WriteAll', 'NvM_ReadBlock', 'NvM_CancelReadAll'],
    status: 'standard',
  },
  {
    id: 'NvM_WriteAll',
    name: 'NvM_WriteAll',
    signature: 'Std_ReturnType NvM_WriteAll(void)',
    brief: '批量写入所有 NVRAM 块',
    description: '启动写入所有配置为自动写入的 NVRAM 块的批量操作。通常在系统关闭前调用，将所有需要持久化的数据一次性写入非易失性存储器。',
    params: [],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 写入已启动；E_NOT_OK: 启动失败',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_WriteAll 批量保存 NVRAM 数据 */
#include "NvM.h"

void NvM_SaveAllBeforeShutdown(void) {
    Std_ReturnType ret = NvM_WriteAll();
    if (ret == E_OK) {
        /* 后台开始写入所有自动保存的块 */
    }
}`,
    exampleDescription: '系统关闭前批量保存所有 NVRAM 块',
    seeAlso: ['NvM_ReadAll', 'NvM_WriteBlock', 'NvM_CancelWriteAll'],
    status: 'standard',
  },
  {
    id: 'NvM_CancelWriteAll',
    name: 'NvM_CancelWriteAll',
    signature: 'Std_ReturnType NvM_CancelWriteAll(void)',
    brief: '取消批量写入操作',
    description: '取消正在进行的 NvM_WriteAll 批量写入操作。部分已写入的块可能已完成写入，部分可能未写入。',
    params: [],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 取消成功；E_NOT_OK: 无正在进行的批量写入',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_CancelWriteAll 取消批量写入 */
#include "NvM.h"

void NvM_AbortSave(void) {
    Std_ReturnType ret = NvM_CancelWriteAll();
    if (ret == E_OK) {
        /* 批量写入操作已取消 */
    }
}`,
    exampleDescription: '取消正在进行的批量写入操作',
    seeAlso: ['NvM_WriteAll', 'NvM_CancelReadAll'],
    status: 'standard',
  },
  {
    id: 'NvM_CancelReadAll',
    name: 'NvM_CancelReadAll',
    signature: 'Std_ReturnType NvM_CancelReadAll(void)',
    brief: '取消批量读取操作',
    description: '取消正在进行的 NvM_ReadAll 批量读取操作。部分已读取的块数据可能已可用。',
    params: [],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 取消成功；E_NOT_OK: 无正在进行的批量读取',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_CancelReadAll 取消批量读取 */
#include "NvM.h"

void NvM_AbortLoad(void) {
    Std_ReturnType ret = NvM_CancelReadAll();
    if (ret == E_OK) {
        /* 批量读取操作已取消 */
    }
}`,
    exampleDescription: '取消正在进行的批量读取操作',
    seeAlso: ['NvM_ReadAll', 'NvM_CancelWriteAll'],
    status: 'standard',
  },
  {
    id: 'NvM_RestoreBlockDefaults',
    name: 'NvM_RestoreBlockDefaults',
    signature: 'Std_ReturnType NvM_RestoreBlockDefaults(NvM_BlockIdType BlockId)',
    brief: '恢复 NVRAM 块的默认值',
    description: '将指定 NVRAM 块的数据恢复为配置中定义的默认值。块数据在内存中被重置为默认值，并在下次写入时持久化。',
    params: [
      { name: 'BlockId', type: 'NvM_BlockIdType', direction: 'in', description: '要恢复默认值的 NVRAM 块 ID' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 恢复成功；E_NOT_OK: 块 ID 无效',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_RestoreBlockDefaults 恢复默认值 */
#include "NvM.h"

void NvM_ResetToDefaults(void) {
    Std_ReturnType ret = NvM_RestoreBlockDefaults(NVM_BLOCK_CALIBRATION);
    if (ret == E_OK) {
        /* 校准参数已恢复为默认值 */
    }
}`,
    exampleDescription: '恢复校准参数块为出厂默认值',
    seeAlso: ['NvM_EraseBlock', 'NvM_WriteBlock'],
    status: 'standard',
  },
  {
    id: 'NvM_GetErrorStatus',
    name: 'NvM_GetErrorStatus',
    signature: 'NvM_RequestResultType NvM_GetErrorStatus(NvM_BlockIdType BlockId)',
    brief: '获取指定块的错误状态',
    description: '返回指定 NVRAM 块最近一次操作的结果状态，包括成功、失败、数据损坏或校验和错误等信息。',
    params: [
      { name: 'BlockId', type: 'NvM_BlockIdType', direction: 'in', description: '要查询的 NVRAM 块 ID' },
    ],
    returnType: 'NvM_RequestResultType',
    returnDescription: '块操作结果状态：NVM_REQ_OK / NVM_REQ_NOT_OK / NVM_REQ_INTEGRITY_FAILED 等',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_GetErrorStatus 检查块状态 */
#include "NvM.h"

void NvM_CheckBlockHealth(void) {
    NvM_RequestResultType status = NvM_GetErrorStatus(NVM_BLOCK_CALIBRATION);
    if (status == NVM_REQ_OK) {
        /* 块数据完好 */
    } else if (status == NVM_REQ_INTEGRITY_FAILED) {
        /* 块数据校验和错误 */
    }
}`,
    exampleDescription: '检查 NVRAM 块数据完整性状态',
    seeAlso: ['NvM_ReadBlock', 'NvM_WriteBlock'],
    status: 'standard',
  },
  {
    id: 'NvM_SetBlockLockStatus',
    name: 'NvM_SetBlockLockStatus',
    signature: 'Std_ReturnType NvM_SetBlockLockStatus(NvM_BlockIdType BlockId, NvM_LockStatusType LockStatus)',
    brief: '设置 NVRAM 块的锁定状态',
    description: '锁定或解锁指定的 NVRAM 块。锁定后该块无法被写入或擦除，用于防止意外修改关键数据。解锁后恢复正常访问。',
    params: [
      { name: 'BlockId', type: 'NvM_BlockIdType', direction: 'in', description: 'NVRAM 块 ID' },
      { name: 'LockStatus', type: 'NvM_LockStatusType', direction: 'in', description: '锁定状态：NVM_LOCKED / NVM_UNLOCKED' },
    ],
    returnType: 'Std_ReturnType',
    returnDescription: 'E_OK: 设置成功；E_NOT_OK: 块 ID 无效',
    moduleId: 'NvM',
    layerId: 'Service',
    version: '4.4',
    example: `/* NvM_SetBlockLockStatus 锁定关键数据块 */
#include "NvM.h"

void NvM_ProtectCriticalBlock(void) {
    Std_ReturnType ret = NvM_SetBlockLockStatus(NVM_BLOCK_BOOT_PARAMS, NVM_LOCKED);
    if (ret == E_OK) {
        /* 启动参数块已锁定，防止误修改 */
    }
}`,
    exampleDescription: '锁定启动参数块防止意外写入',
    seeAlso: ['NvM_WriteBlock', 'NvM_EraseBlock'],
    status: 'standard',
  },
];

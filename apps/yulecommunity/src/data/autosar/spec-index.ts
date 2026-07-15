import type { AutosarModule, AutosarLayer, AutosarVersion, ApiIndexEntry, AutosarApi } from './types';
import { CAN_APIS } from './can-spec';
import { DIO_APIS } from './dio-spec';
import { PORT_APIS } from './port-spec';
import { MCU_APIS } from './mcu-spec';
import { SPI_APIS } from './spi-spec';
import { COM_APIS } from './com-spec';
import { PDUR_APIS } from './pdur-spec';
import { CANIF_APIS } from './canif-spec';
import { NVM_APIS } from './nvm-spec';
import { ECUM_APIS } from './ecum-spec';
import { RTE_APIS } from './rte-spec';

/** 后端 API 基础地址 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/** 后端的 API spec JSON 结构 */
interface ApiSpecRow {
  id: string;
  module_id: string;
  layer_id: string;
  name: string;
  signature: string;
  brief: string;
  brief_cn?: string;
  description: string;
  description_cn?: string;
  params: Array<{ name: string; type: string; direction: string; description: string; range?: string }>;
  return_type: string;
  return_description: string;
  version: string;
  example: string;
  example_description: string;
  see_also: string[];
  config_params: Array<{ paramName: string; configModule: string; path: string }>;
  timing: string;
  status: string;
}

/** 将后端行转成 AutosarApi */
function rowToApi(row: ApiSpecRow): AutosarApi {
  return {
    id: row.id,
    name: row.name,
    signature: row.signature,
    brief: row.brief,
    description: row.description,
    params: row.params,
    returnType: row.return_type,
    returnDescription: row.return_description,
    moduleId: row.module_id,
    layerId: row.layer_id as AutosarApi['layerId'],
    version: row.version,
    example: row.example,
    exampleDescription: row.example_description,
    seeAlso: row.see_also || [],
    configParams: row.config_params || [],
    timing: row.timing,
    status: row.status as AutosarApi['status'],
  };
}

/** 缓存: 按模块 id 缓存的 API 列表 (避免反复请求) */
let _moduleCache: Map<string, AutosarApi[]> = new Map();

/**
 * 从后端加载指定模块的 APIs
 */
export async function fetchModuleApis(moduleId: string): Promise<AutosarApi[] | null> {
  if (_moduleCache.has(moduleId)) return _moduleCache.get(moduleId)!;
  try {
    const res = await fetch(`${API_BASE}/api/specs?module=${moduleId}&limit=100`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error('invalid response');
    const apis = json.data.map(rowToApi);
    _moduleCache.set(moduleId, apis);
    return apis;
  } catch {
    return null; // caller 应降级到本地
  }
}

/** 清空模块缓存 */
export function clearSpecCache() {
  _moduleCache.clear();
}

/**
 * 尝试从后端批量获取所有模块的 API 索引（模块列表页面用）
 */
export async function fetchModuleIndex(): Promise<{ id: string; name: string; layer: string; apiCount: number }[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/specs/modules`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error('invalid response');
    return json.data.map((m: any) => ({
      id: m.id, name: m.name, layer: m.layer_id, apiCount: m.api_count,
    }));
  } catch {
    return null;
  }
}

/**
 * 后台预加载所有模块的 API 数据（不阻塞渲染，失败时自动降级到本地数据）
 * 在应用入口调用
 */
export function preloadSpecData(): void {
  // 所有模块列表
  const modules = ['Can', 'Dio', 'Port', 'Mcu', 'Spi', 'CanIf', 'Com', 'PduR', 'NvM', 'EcuM', 'Rte'];
  // 静默加载，不关心结果
  for (const mod of modules) {
    fetchModuleApis(mod).catch(() => {});
  }
}

export const SPEC_VERSIONS: AutosarVersion[] = [
  { id: '4.4', label: 'AUTOSAR 4.4', releaseDate: '2020-12', status: 'active' },
  { id: '4.6', label: 'AUTOSAR 4.6', releaseDate: '2022-06', status: 'active' },
  { id: 'R21-11', label: 'AUTOSAR R21-11', releaseDate: '2023-11', status: 'active' },
];

export const LAYERS: { id: string; name: string; description: string; color: string }[] = [
  { id: 'MCAL', name: 'MCAL', description: '微控制器驱动层 - 直接操作硬件寄存器', color: 'blue' },
  { id: 'ECUAL', name: 'ECUAL', description: 'ECU 抽象层 - 硬件无关的封装接口', color: 'cyan' },
  { id: 'Service', name: 'Service', description: '服务层 - 系统级服务与管理', color: 'teal' },
  { id: 'RTE_ASW', name: 'RTE + ASW', description: '运行时环境与应用层', color: 'emerald' },
];

// Demo-mode: we load all module specs here. For full prod, each module goes in its own file
function getModuleApis(moduleId: string): AutosarApi[] {
  const registry: Record<string, AutosarApi[]> = {
    Can: CAN_APIS,
    Dio: DIO_APIS,
    Port: PORT_APIS,
    Mcu: MCU_APIS,
    Spi: SPI_APIS,
    Com: COM_APIS,
    PduR: PDUR_APIS,
    CanIf: CANIF_APIS,
    NvM: NVM_APIS,
    EcuM: ECUM_APIS,
    Rte: RTE_APIS,
  };
  return registry[moduleId] || [];
}

export function getAllModules(): AutosarModule[] {
  return [
    {
      id: 'Can', name: 'Can', layer: 'MCAL',
      description: 'CAN 通信驱动，支持 CAN 2.0B 和 CAN-FD，提供消息发送、接收、波特率配置等功能',
      versionIntroduced: '4.0',
      apis: getModuleApis('Can'),
    },
    {
      id: 'Dio', name: 'Dio', layer: 'MCAL',
      description: '数字 I/O 驱动，提供引脚电平的读写和翻转操作',
      versionIntroduced: '4.0',
      apis: getModuleApis('Dio'),
    },
    {
      id: 'Port', name: 'Port', layer: 'MCAL',
      description: '端口驱动，配置引脚功能复用和方向',
      versionIntroduced: '4.0',
      apis: getModuleApis('Port'),
    },
    {
      id: 'Mcu', name: 'Mcu', layer: 'MCAL',
      description: '微控制器驱动，负责时钟、复位和功耗管理',
      versionIntroduced: '4.0',
      apis: getModuleApis('Mcu'),
    },
    {
      id: 'Spi', name: 'Spi', layer: 'MCAL',
      description: 'SPI 通信驱动，支持主从模式和数据传输',
      versionIntroduced: '4.0',
      apis: getModuleApis('Spi'),
    },
    {
      id: 'CanIf', name: 'CanIf', layer: 'ECUAL',
      description: 'CAN 接口模块，为上层提供与硬件无关的 CAN 通信抽象接口',
      versionIntroduced: '4.0',
      apis: getModuleApis('CanIf'),
    },
    {
      id: 'Com', name: 'Com', layer: 'ECUAL',
      description: '信号级通信模块，提供信号打包/解包和路由',
      versionIntroduced: '4.0',
      apis: getModuleApis('Com'),
    },
    {
      id: 'PduR', name: 'PduR', layer: 'ECUAL',
      description: 'PDU 路由器，实现 PDU 路由和网关功能',
      versionIntroduced: '4.0',
      apis: getModuleApis('PduR'),
    },
    {
      id: 'NvM', name: 'NvM', layer: 'Service',
      description: '非易失性存储器管理，提供数据持久化服务',
      versionIntroduced: '4.0',
      apis: getModuleApis('NvM'),
    },
    {
      id: 'EcuM', name: 'EcuM', layer: 'Service',
      description: 'ECU 状态管理，控制 ECU 启动/关闭和功耗模式',
      versionIntroduced: '4.0',
      apis: getModuleApis('EcuM'),
    },
    {
      id: 'Rte', name: 'Rte', layer: 'RTE_ASW',
      description: '运行时环境，连接应用层与 BSW 的通信桥梁',
      versionIntroduced: '4.0',
      apis: getModuleApis('Rte'),
    },
  ];
}

export function getLayers(): AutosarLayer[] {
  const modules = getAllModules();
  const layerMap: Record<string, AutosarModule[]> = {};
  for (const mod of modules) {
    if (!layerMap[mod.layer]) layerMap[mod.layer] = [];
    layerMap[mod.layer].push(mod);
  }
  return LAYERS.map(l => ({
    id: l.id as AutosarLayer['id'],
    name: l.name,
    modules: layerMap[l.id] || [],
  }));
}

export function buildSearchIndex(): ApiIndexEntry[] {
  const entries: ApiIndexEntry[] = [];
  for (const mod of getAllModules()) {
    for (const api of mod.apis) {
      entries.push({
        id: api.id,
        name: api.name,
        signature: api.signature,
        moduleId: api.moduleId,
        layerId: api.layerId,
        brief: api.brief,
      });
    }
  }
  return entries;
}

export function findApiById(apiId: string): AutosarApi | undefined {
  for (const mod of getAllModules()) {
    for (const api of mod.apis) {
      if (api.id === apiId) return api;
    }
  }
  return undefined;
}

export function findModuleById(moduleId: string): AutosarModule | undefined {
  return getAllModules().find(m => m.id === moduleId);
}

export function getModuleIndex(): { id: string; name: string; layer: string; apiCount: number }[] {
  return getAllModules().map(m => ({
    id: m.id, name: m.name, layer: m.layer, apiCount: m.apis.length,
  }));
}

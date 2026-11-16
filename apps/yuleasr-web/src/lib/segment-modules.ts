import type { WorkbenchSegment } from '@/stores/settingsStore';
import type { ConfigFile } from '@/types';

type ConfigModule = ConfigFile['modules'][number];

export const WORKBENCH_SEGMENTS: Array<{ id: WorkbenchSegment; label: string }> = [
  { id: 'basic', label: 'Basic Editor' },
  { id: 'bsw', label: 'BSW 管理' },
  { id: 'communication', label: '通信' },
  { id: 'diagnostics', label: '诊断' },
  { id: 'generate', label: '生成' },
];

const COMMUNICATION_MODULES = new Set([
  'Can',
  'CanIf',
  'CanTp',
  'CanNm',
  'Com',
  'ComM',
  'PduR',
  'Lin',
  'LinIf',
  'Fr',
  'FrIf',
  'Eth',
  'EthIf',
  'SoAd',
  'DoIP',
  'IpduM',
  'Nm',
]);

const DIAGNOSTIC_MODULES = new Set(['Dem', 'Dcm', 'FiM', 'Det']);

/** 按顶栏段标签过滤树中的模块；generate 不过滤（只切换底部面板） */
export function modulesForSegment(config: ConfigFile, segment: WorkbenchSegment): ConfigModule[] {
  switch (segment) {
    case 'basic':
    case 'generate':
      return config.modules;
    case 'bsw':
      return config.modules.filter(
        m => m.layer === 'ECUAL' || m.layer === 'Service' || m.layer === 'OS'
      );
    case 'communication':
      return config.modules.filter(m => COMMUNICATION_MODULES.has(m.name));
    case 'diagnostics':
      return config.modules.filter(m => DIAGNOSTIC_MODULES.has(m.name));
  }
}

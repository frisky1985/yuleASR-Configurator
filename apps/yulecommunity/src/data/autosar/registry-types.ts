export interface RegistryStats {
  downloads: number;
  rating: number;
  reviewCount: number;
}

export interface RegistryCompatibility {
  mcu: string[];
  os: string[];
  compiler: string[];
}

export interface RegistryModuleDependency {
  name: string;
  version: string;
  optional: boolean;
}

export interface RegistryModule {
  id: string;
  name: string;
  version: string;
  layer: 'MCAL' | 'ECUAL' | 'Service' | 'RTE_ASW' | 'Complex' | 'System';
  description: string;
  tags: string[];
  author: string;
  configData: string;
  compatibility: RegistryCompatibility;
  dependencies: RegistryModuleDependency[];
  stats: RegistryStats;
  status: 'published' | 'draft' | 'deprecated' | 'review';
  timestamps: {
    created: string;
    updated: string;
    published?: string;
  };
}

export interface RegistryFilter {
  search: string;
  layer: string;
  mcu: string;
  os: string;
  sort: 'downloads' | 'rating' | 'newest' | 'name';
}

export const LAYER_OPTIONS = [
  { value: 'MCAL', label: 'MCAL', description: '微控制器抽象层' },
  { value: 'ECUAL', label: 'ECUAL', description: 'ECU 抽象层' },
  { value: 'Service', label: 'Service', description: '服务层' },
  { value: 'RTE_ASW', label: 'RTE/ASW', description: '运行时环境/应用层' },
  { value: 'Complex', label: 'Complex', description: '复杂驱动' },
  { value: 'System', label: 'System', description: '系统模块' },
] as const;

export const MCU_OPTIONS = [
  'S32K144',
  'S32K344',
  'S32G274A',
  'i.MX8M Mini',
  'i.MX8M Plus',
  'i.MX6UL',
  'TC397',
  'TC212',
  'TC334',
  'STM32H743',
  'STM32F407',
  'STM32G474',
  'TMS320F28379D',
  'TMS320F280049',
  'RH850/U2A',
  'RH850/F1KM',
] as const;

export const OS_OPTIONS = [
  'FreeRTOS',
  'ThreadX',
  'Zephyr',
  'QNX',
  'Linux (PREEMPT_RT)',
  'AUTOSAR OS',
  'Bare-metal',
] as const;

export const COMPILER_OPTIONS = [
  'GCC ARM Embedded',
  'IAR Embedded Workbench',
  'ARM Compiler 6',
  'Green Hills MULTI',
  'Tasking TriCore',
  'Renesas CC-RH',
  'TI Code Composer Studio',
] as const;

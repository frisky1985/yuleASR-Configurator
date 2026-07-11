/**
 * @yuletech/core - C Code Generation Utilities
 * Shared utility functions for generating AUTOSAR C code
 */

/** Convert a filename to an include guard name (e.g., "Adc_Cfg.h" → "ADC_CFG_H") */
export function toGuardName(filename: string): string {
  return filename.replace(/\./g, '_').toUpperCase();
}

/** Convert a camelCase name to a UPPER_SNAKE_CASE macro name */
export function toDefineName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toUpperCase();
}

/** Format a JavaScript value as an AUTOSAR C literal */
export function formatCValue(value: unknown, type?: string): string {
  switch (type) {
    case 'boolean':
      return value === true ? 'STD_ON' : 'STD_OFF';
    case 'integer':
      if (typeof value === 'number') {
        if (value >= 0 && value <= 0xFFFF) {
          return `((uint16)${value}U)`;
        }
        return `((uint32)${value}U)`;
      }
      return String(value);
    case 'float':
      return `${value}f`;
    case 'string':
      return `"${value}"`;
    case 'enum':
      return String(value);
    case 'array':
      if (Array.isArray(value)) {
        const items = value.map((v: unknown) => formatPrimitiveValue(v)).join(', ');
        return `{ ${items} }`;
      }
      return '{ 0 }';
    case 'reference':
      return `&${value}`;
    default:
      return String(value);
  }
}

/** Format a primitive JS value as a C literal (for array/struct initializers) */
export function formatPrimitiveValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return Number.isInteger(value) ? `${value}` : `${value}f`;
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

/** Map a parameter type string to an AUTOSAR C type name */
export function getCType(type: string): string {
  switch (type) {
    case 'boolean': return 'boolean';
    case 'integer': return 'uint32';
    case 'float': return 'float32';
    case 'string': return 'const char*';
    case 'enum': return 'uint8';
    case 'array': return 'const void*';
    case 'reference': return 'const void*';
    default: return 'uint32';
  }
}

/** Convert a number to a zero-padded 4-digit hex string */
export function toHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(4, '0');
}

/** Parse a semver string into { major, minor, patch } */
export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] || 4,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

/** AUTOSAR 标准 Module IDs (BSW Module ID Table per AUTOSAR spec) */
export const AUTOSAR_MODULE_IDS: Record<string, number> = {
  // MCAL
  Mcu: 43, Port: 42, Dio: 41, Can: 80, Spi: 122,
  Icu: 120, Gpt: 121, Pwm: 123, Adc: 44, Wdg: 45,
  Lin: 183, Fr: 46, Eth: 47,
  // ECUAL
  CanIf: 81, LinIf: 187, FrIf: 48, EthIf: 49,
  CanTp: 82, LinTp: 188, FrTp: 50, CanTrcv: 83,
  Fee: 133, Ea: 134, MemIf: 135, IoHwAb: 140,
  // Service
  Com: 84, PduR: 85, NvM: 150, Dcm: 86, Dem: 87,
  EcuM: 151, BswM: 152, WdgM: 153, CanNm: 88,
  CanSm: 89, CanTSyn: 90, Xcp: 91,
  // RTE / OS
  Rte: 16, Os: 1,
};

/** Get the AUTOSAR standard Module ID for a module name */
export function getModuleId(moduleName: string): number {
  return AUTOSAR_MODULE_IDS[moduleName] || 0xFFFF;
}

/** AUTOSAR standard configuration header file names */
export const MODULE_HEADER_NAMES: Record<string, string> = {
  Can: 'Can_Cfg.h',
  Mcu: 'Mcu_Cfg.h',
  Port: 'Port_Cfg.h',
  Dio: 'Dio_Cfg.h',
  Adc: 'Adc_Cfg.h',
  Icu: 'Icu_Cfg.h',
  Gpt: 'Gpt_Cfg.h',
  Pwm: 'Pwm_Cfg.h',
  Wdg: 'Wdg_Cfg.h',
  Lin: 'Lin_Cfg.h',
  Spi: 'Spi_Cfg.h',
  Fr: 'Fr_Cfg.h',
  Eth: 'Eth_Cfg.h',
};

/** Get the standard header filename for a module */
export function getModuleHeaderName(moduleName: string): string {
  return MODULE_HEADER_NAMES[moduleName] || `${moduleName}_Cfg.h`;
}

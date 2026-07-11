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

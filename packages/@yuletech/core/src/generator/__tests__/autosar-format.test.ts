import { describe, it, expect } from 'vitest';

import {
  toGuardName,
  toDefineName,
  formatCValue,
  formatPrimitiveValue,
  getCType,
  toHex,
  parseVersion,
  AUTOSAR_MODULE_IDS,
  getModuleId,
  getModuleHeaderName,
} from '../autosar-format';

describe('autosar-format', () => {
  describe('toGuardName', () => {
    it('should convert filename to include guard', () => {
      expect(toGuardName('Adc_Cfg.h')).toBe('ADC_CFG_H');
      expect(toGuardName('Ecuc_Can.h')).toBe('ECUC_CAN_H');
      expect(toGuardName('Rte.h')).toBe('RTE_H');
    });

    it('should handle paths', () => {
      expect(toGuardName('src/out/Cfg.h')).toBe('SRC/OUT/CFG_H');
    });
  });

  describe('toDefineName', () => {
    it('should convert camelCase to UPPER_SNAKE_CASE', () => {
      expect(toDefineName('canBaudrate')).toBe('CAN_BAUDRATE');
      expect(toDefineName('devErrorDetect')).toBe('DEV_ERROR_DETECT');
      expect(toDefineName('hwUnitId')).toBe('HW_UNIT_ID');
    });

    it('should handle acronyms', () => {
      expect(toDefineName('GPIOConfig')).toBe('GPIO_CONFIG');
      expect(toDefineName('ADCResolution')).toBe('ADC_RESOLUTION');
    });
  });

  describe('formatCValue', () => {
    it('should format booleans as STD_ON/STD_OFF (AUTOSAR convention)', () => {
      expect(formatCValue(true, 'boolean')).toBe('STD_ON');
      expect(formatCValue(false, 'boolean')).toBe('STD_OFF');
    });

    it('should format integers with AUTOSAR casts', () => {
      expect(formatCValue(42, 'integer')).toBe('((uint16)42U)');
      expect(formatCValue(500000, 'integer')).toBe('((uint32)500000U)');
      expect(formatCValue(0, 'integer')).toBe('((uint16)0U)');
    });

    it('should format floats', () => {
      expect(formatCValue(3.14, 'float')).toBe('3.14f');
    });

    it('should format strings with quotes', () => {
      expect(formatCValue('hello', 'string')).toBe('"hello"');
    });

    it('should format enums as plain strings', () => {
      expect(formatCValue('BITS_12', 'enum')).toBe('BITS_12');
    });

    it('should format references with & prefix', () => {
      expect(formatCValue('Mcu_Config', 'reference')).toBe('&Mcu_Config');
    });

    it('should format arrays as initializer lists', () => {
      expect(formatCValue([1, 2, 3], 'array')).toBe('{ 1, 2, 3 }');
    });

    it('should handle unknown types gracefully', () => {
      expect(formatCValue('whatever')).toBe('whatever');
    });
  });

  describe('formatPrimitiveValue', () => {
    it('should format booleans', () => {
      expect(formatPrimitiveValue(true)).toBe('TRUE');
      expect(formatPrimitiveValue(false)).toBe('FALSE');
    });

    it('should format integers without suffix', () => {
      expect(formatPrimitiveValue(42)).toBe('42');
    });

    it('should format floats', () => {
      expect(formatPrimitiveValue(3.14)).toBe('3.14f');
    });

    it('should format strings with quotes', () => {
      expect(formatPrimitiveValue('hello')).toBe('"hello"');
    });
  });

  describe('getCType', () => {
    it('should map parameter types to C types', () => {
      expect(getCType('boolean')).toBe('boolean');
      expect(getCType('integer')).toBe('uint32');
      expect(getCType('float')).toBe('float32');
      expect(getCType('string')).toBe('const char*');
      expect(getCType('enum')).toBe('uint8');
      expect(getCType('array')).toBe('const void*');
      expect(getCType('reference')).toBe('const void*');
    });

    it('should default to uint32 for unknown types', () => {
      expect(getCType('unknown')).toBe('uint32');
    });
  });

  describe('toHex', () => {
    it('should format numbers as 4-digit hex', () => {
      expect(toHex(0)).toBe('0000');
      expect(toHex(255)).toBe('00FF');
      expect(toHex(4660)).toBe('1234');
      expect(toHex(65535)).toBe('FFFF');
    });
  });

  describe('parseVersion', () => {
    it('should parse semver strings', () => {
      expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
      expect(parseVersion('4.0.0')).toEqual({ major: 4, minor: 0, patch: 0 });
    });

    it('should handle partial versions', () => {
      expect(parseVersion('1')).toEqual({ major: 1, minor: 0, patch: 0 });
      expect(parseVersion('2.5')).toEqual({ major: 2, minor: 5, patch: 0 });
    });

    it('should default empty version to 4.0.0', () => {
      expect(parseVersion('')).toEqual({ major: 4, minor: 0, patch: 0 });
    });
  });

  describe('AUTOSAR_MODULE_IDS', () => {
    it('should contain standard MCAL module IDs', () => {
      expect(AUTOSAR_MODULE_IDS['Can']).toBe(80);
      expect(AUTOSAR_MODULE_IDS['Mcu']).toBe(43);
      expect(AUTOSAR_MODULE_IDS['Port']).toBe(42);
      expect(AUTOSAR_MODULE_IDS['Dio']).toBe(41);
      expect(AUTOSAR_MODULE_IDS['Adc']).toBe(44);
    });

    it('should contain service layer module IDs', () => {
      expect(AUTOSAR_MODULE_IDS['Com']).toBe(84);
      expect(AUTOSAR_MODULE_IDS['NvM']).toBe(150);
      expect(AUTOSAR_MODULE_IDS['Dcm']).toBe(86);
      expect(AUTOSAR_MODULE_IDS['EcuM']).toBe(151);
    });
  });

  describe('getModuleId', () => {
    it('should return correct ID for known modules', () => {
      expect(getModuleId('Can')).toBe(80);
      expect(getModuleId('Os')).toBe(1);
      expect(getModuleId('Rte')).toBe(16);
    });

    it('should return fallback for unknown modules', () => {
      expect(getModuleId('Unknown')).toBe(0xffff);
    });
  });

  describe('getModuleHeaderName', () => {
    it('should return ECUC standard header names with Ecuc_ prefix', () => {
      expect(getModuleHeaderName('Can')).toBe('Ecuc_Can_Cfg.h');
      expect(getModuleHeaderName('Mcu')).toBe('Ecuc_Mcu_Cfg.h');
      expect(getModuleHeaderName('Port')).toBe('Ecuc_Port_Cfg.h');
    });

    it('should fallback to pattern for unknown modules', () => {
      expect(getModuleHeaderName('Unknown')).toBe('Ecuc_Unknown_Cfg.h');
    });
  });
});

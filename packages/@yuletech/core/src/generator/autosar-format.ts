/**
 * @yuletech/core - C Code Generation Utilities
 * Shared utility functions for generating AUTOSAR C code
 *
 * Implements AUTOSAR 4.4 standard formatting and conventions
 */

import type { CompilerType } from './index';

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
        if (value >= 0 && value <= 0xffff) {
          return `((uint16)${value}U)`;
        }
        return `((uint32)${value}U)`;
      }
      return String(value);
    case 'float': {
      const n = Number(value);
      return Number.isInteger(n) ? `${n}.0f` : `${n}f`;
    }
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
    case 'boolean':
      return 'boolean';
    case 'integer':
      return 'uint32';
    case 'float':
      return 'float32';
    case 'string':
      return 'const char*';
    case 'enum':
      return 'uint8';
    case 'array':
      return 'const void*';
    case 'reference':
      return 'const void*';
    default:
      return 'uint32';
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

// =========================================================================
// Multi-Compiler Abstraction
// =========================================================================

/**
 * CompilerAbstraction interface
 * Provides compiler-specific syntax for AUTOSAR C code generation.
 * Supports: GCC, IAR Embedded Workbench, Tasking (Tricore), Green Hills (GHS)
 */
export interface CompilerAbstraction {
  /** Compiler identifier */
  readonly compiler: CompilerType;

  /**
   * Get the interrupt function attribute prefix
   * @param irqNumber Optional IRQ vector number
   */
  interruptAttribute(irqNumber?: number): string;

  /**
   * Get the attribute for placing a variable at a specific memory address
   * @param address Target memory address
   */
  addressAttribute(address: number): string;

  /**
   * Get the memory section attribute/pragma for a variable/function placement
   * @param section Section name (e.g., ".text", ".data")
   */
  sectionAttribute(section: string): string;

  /**
   * Get the register qualifier for a specific direction
   * @param direction Register direction
   */
  registerQualifier(direction: 'in' | 'out' | 'inout'): string;

  /**
   * Get the no-initialization attribute for uninitialized RAM variables
   */
  noInitAttribute(): string;

  /**
   * Get the root/retain attribute to prevent linker from discarding the symbol
   */
  rootAttribute(): string;

  /**
   * Wrap a code block with MemMap.h section markers
   * @param moduleName Module name (e.g., "Can")
   * @param section Section type (e.g., "CONST_UNSPECIFIED", "CODE", "VAR_INIT")
   * @param body Code to wrap
   */
  wrapMemMapSection(moduleName: string, section: string, body: string): string;

  /**
   * Generate the start pragma for a section
   * @param moduleName Module name
   * @param section Section type
   */
  sectionStartPragma(moduleName: string, section: string): string;

  /**
   * Generate the stop pragma for a section
   * @param moduleName Module name
   * @param section Section type
   */
  sectionStopPragma(moduleName: string, section: string): string;
}

/**
 * Get the CompilerAbstraction instance for the given compiler type
 * Falls back to GCC if compiler is undefined or unrecognized
 */
export function getCompilerAbstraction(compiler?: CompilerType): CompilerAbstraction {
  switch (compiler) {
    case 'iar':
      return new IarCompilerAbstraction();
    case 'tasking':
      return new TaskingCompilerAbstraction();
    case 'ghs':
      return new GhsCompilerAbstraction();
    case 'gcc':
    default:
      return new GccCompilerAbstraction();
  }
}

// -------------------------------------------------------------------------
// GCC Compiler Abstraction (default)
// -------------------------------------------------------------------------

/**
 * GCC Compiler Abstraction
 * Uses __attribute__ syntax for section placement and interrupt declarations.
 * MemMap.h uses AUTOSAR standard #define/#include pattern.
 */
export class GccCompilerAbstraction implements CompilerAbstraction {
  readonly compiler: CompilerType = 'gcc';

  interruptAttribute(_irqNumber?: number): string {
    return '__attribute__((interrupt()))';
  }

  addressAttribute(address: number): string {
    return `__attribute__((section(".data"))) __attribute__((at(0x${address.toString(16)})))`;
  }

  sectionAttribute(section: string): string {
    return `__attribute__((section("${section}")))`;
  }

  registerQualifier(direction: 'in' | 'out' | 'inout'): string {
    switch (direction) {
      case 'in':
        return 'const volatile';
      case 'out':
        return 'volatile';
      case 'inout':
        return 'volatile';
    }
  }

  noInitAttribute(): string {
    return '__attribute__((section(".noinit")))';
  }

  rootAttribute(): string {
    return '__attribute__((used))';
  }

  sectionStartPragma(moduleName: string, section: string): string {
    return `#define ${moduleName.toUpperCase()}_START_SEC_${section}\n#include "MemMap.h"`;
  }

  sectionStopPragma(moduleName: string, section: string): string {
    return `#define ${moduleName.toUpperCase()}_STOP_SEC_${section}\n#include "MemMap.h"`;
  }

  wrapMemMapSection(moduleName: string, section: string, body: string): string {
    return (
      `#define ${moduleName.toUpperCase()}_START_SEC_${section}\n` +
      `#include "MemMap.h"\n` +
      `${body}\n` +
      `#define ${moduleName.toUpperCase()}_STOP_SEC_${section}\n` +
      `#include "MemMap.h"\n`
    );
  }
}

// -------------------------------------------------------------------------
// IAR Compiler Abstraction
// -------------------------------------------------------------------------

/**
 * IAR Embedded Workbench Compiler Abstraction
 * Uses #pragma syntax for section placement and __interrupt/__irq for ISRs.
 * Address placement uses @ operator.
 * Memory qualifiers: __no_init, __root
 * Register qualifiers: __IO, __I, __O
 */
export class IarCompilerAbstraction implements CompilerAbstraction {
  readonly compiler: CompilerType = 'iar';

  interruptAttribute(irqNumber?: number): string {
    return irqNumber !== undefined ? `__interrupt __irq` : `__interrupt`;
  }

  addressAttribute(address: number): string {
    return `@ 0x${address.toString(16)}`;
  }

  sectionAttribute(section: string): string {
    return `@ "${section}"`;
  }

  registerQualifier(direction: 'in' | 'out' | 'inout'): string {
    switch (direction) {
      case 'in':
        return '__I';
      case 'out':
        return '__O';
      case 'inout':
        return '__IO';
    }
  }

  noInitAttribute(): string {
    return '__no_init';
  }

  rootAttribute(): string {
    return '__root';
  }

  sectionStartPragma(_moduleName: string, _section: string): string {
    return '#pragma diag_suppress=Pe999'; /* Placeholder — IAR uses MemMap.h sections */
  }

  sectionStopPragma(_moduleName: string, _section: string): string {
    return '#pragma diag_default=Pe999';
  }

  wrapMemMapSection(moduleName: string, section: string, body: string): string {
    return (
      `/* IAR: MemMap section ${moduleName}_START_SEC_${section} */\n` +
      `#pragma section = "${section}"\n` +
      `#pragma location = "${section}"\n` +
      `${body}\n` +
      `/* IAR: MemMap section ${moduleName}_STOP_SEC_${section} */\n`
    );
  }
}

// -------------------------------------------------------------------------
// Tasking Compiler Abstraction
// -------------------------------------------------------------------------

/**
 * Tasking (Tricore) Compiler Abstraction
 * Uses #pragma section for memory placement.
 * ISR() macro for interrupt service routines.
 * __near / __far / __at() for address placement.
 */
export class TaskingCompilerAbstraction implements CompilerAbstraction {
  readonly compiler: CompilerType = 'tasking';

  interruptAttribute(irqNumber?: number): string {
    return irqNumber !== undefined ? `ISR(${irqNumber})` : `ISR(0)`;
  }

  addressAttribute(address: number): string {
    return `__at(0x${address.toString(16)})`;
  }

  sectionAttribute(section: string): string {
    if (section.includes('.text') || section.includes('CODE')) {
      return `__far`;
    }
    if (section.includes('.bss') || section.includes('NOINIT')) {
      return `__near`;
    }
    return `__far`;
  }

  registerQualifier(direction: 'in' | 'out' | 'inout'): string {
    switch (direction) {
      case 'in':
        return '__far const';
      case 'out':
        return '__far';
      case 'inout':
        return '__far';
    }
  }

  noInitAttribute(): string {
    return '__near';
  }

  rootAttribute(): string {
    return '#pragma section farrom'; /* Keeps symbol in ROM */
  }

  sectionStartPragma(moduleName: string, section: string): string {
    return `#pragma section farrom "${moduleName}_${section}"`;
  }

  sectionStopPragma(moduleName: string, section: string): string {
    return `#pragma section farrom restore`;
  }

  wrapMemMapSection(moduleName: string, section: string, body: string): string {
    return (
      `/* Tasking: MemMap section ${moduleName}_START_SEC_${section} */\n` +
      `#pragma section farrom "${moduleName.toUpperCase()}_${section}"\n` +
      `${body}\n` +
      `/* Tasking: MemMap section ${moduleName}_STOP_SEC_${section} */\n` +
      `#pragma section farrom restore\n`
    );
  }
}

// -------------------------------------------------------------------------
// GHS (Green Hills) Compiler Abstraction
// -------------------------------------------------------------------------

/**
 * Green Hills (GHS) Compiler Abstraction
 * Uses #pragma ghs section for memory placement.
 * __interrupt keyword for ISR declarations.
 * __attribute__((section())) for GCC-compatible section placement.
 */
export class GhsCompilerAbstraction implements CompilerAbstraction {
  readonly compiler: CompilerType = 'ghs';

  interruptAttribute(_irqNumber?: number): string {
    return '__interrupt';
  }

  addressAttribute(address: number): string {
    return `__attribute__((at(0x${address.toString(16)})))`;
  }

  sectionAttribute(section: string): string {
    return `__attribute__((section("${section}")))`;
  }

  registerQualifier(direction: 'in' | 'out' | 'inout'): string {
    switch (direction) {
      case 'in':
        return 'const volatile';
      case 'out':
        return 'volatile';
      case 'inout':
        return 'volatile';
    }
  }

  noInitAttribute(): string {
    return '__attribute__((section(".noinit")))';
  }

  rootAttribute(): string {
    return '__attribute__((used))';
  }

  sectionStartPragma(moduleName: string, section: string): string {
    return `#pragma ghs section text="${moduleName}_${section}"`;
  }

  sectionStopPragma(moduleName: string, section: string): string {
    return `#pragma ghs section text=default`;
  }

  wrapMemMapSection(moduleName: string, section: string, body: string): string {
    return (
      `/* GHS: MemMap section ${moduleName}_START_SEC_${section} */\n` +
      `#pragma ghs section text="${moduleName.toUpperCase()}_${section}"\n` +
      `${body}\n` +
      `/* GHS: MemMap section ${moduleName}_STOP_SEC_${section} */\n` +
      `#pragma ghs section text=default\n`
    );
  }
}

// =========================================================================
// End of Compiler Abstraction
// =========================================================================

/** AUTOSAR 标准 Module IDs (BSW Module ID Table per AUTOSAR spec 4.4) */
export const AUTOSAR_MODULE_IDS: Record<string, number> = {
  // MCAL
  Mcu: 43,
  Port: 42,
  Dio: 41,
  Can: 80,
  Spi: 122,
  Icu: 120,
  Gpt: 121,
  Pwm: 123,
  Adc: 44,
  Wdg: 45,
  Lin: 183,
  Fr: 46,
  Eth: 47,
  // ECUAL
  CanIf: 81,
  LinIf: 187,
  FrIf: 48,
  EthIf: 49,
  CanTp: 82,
  LinTp: 188,
  FrTp: 50,
  CanTrcv: 83,
  Fee: 133,
  Ea: 134,
  MemIf: 135,
  IoHwAb: 140,
  // Service
  Com: 84,
  PduR: 85,
  NvM: 150,
  Dcm: 86,
  Dem: 87,
  EcuM: 151,
  BswM: 152,
  WdgM: 153,
  CanNm: 88,
  CanSm: 89,
  CanTSyn: 90,
  Xcp: 91,
  // RTE / OS
  Rte: 16,
  Os: 1,
};

/** Get the AUTOSAR standard Module ID for a module name */
export function getModuleId(moduleName: string): number {
  return AUTOSAR_MODULE_IDS[moduleName] || 0xffff;
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
  Os: 'Os_Cfg.h',
};

/** Get the standard header filename for a module */
export function getModuleHeaderName(moduleName: string): string {
  return MODULE_HEADER_NAMES[moduleName] || `${moduleName}_Cfg.h`;
}

/**
 * AUTOSAR standard service IDs for DET error reporting (per SWS_Det)
 * Each module defines its own API service IDs starting from 0x01 per module
 */
export const DET_MODULE_ID: number = 15; // Default Error Tracer module ID per AUTOSAR

/**
 * Standard AUTOSAR development error codes for Det_ReportError
 * SWS_Det_00400 - Definition of development error codes
 */
export enum DetErrorCode {
  DET_E_PARAM_POINTER = 0x01 /**< Invalid pointer parameter detected */,
  DET_E_PARAM_CONFIG = 0x02 /**< Invalid configuration parameter */,
  DET_E_PARAM_DATA = 0x03 /**< Invalid data parameter */,
  DET_E_PARAM_HANDLE = 0x04 /**< Invalid handle */,
  DET_E_UNINIT = 0x05 /**< Module not initialized */,
  DET_E_INIT_FAILED = 0x06 /**< Module initialization failed */,
  DET_E_TIMEOUT = 0x07 /**< Operation timeout */,
  DET_E_WRONG_STATE = 0x08 /**< Module in wrong state */,
  DET_E_BUFFER_OVERFLOW = 0x09 /**< Buffer overflow */,
  DET_E_PARAM_VALUE = 0x0a /**< Invalid parameter value */,
}

/**
 * Generate an AUTOSAR 4.4 compliant Doxygen file header
 *
 * @param fileName - The C source/header file name (e.g., "Can_Cfg.h")
 * @param moduleName - The AUTOSAR BSW module name (e.g., "Can")
 * @param moduleId - The AUTOSAR module ID number
 * @param vendorId - The vendor ID (default: 0x1234)
 * @param description - File description / brief
 * @returns Complete Doxygen file header block
 */
export function generateAutosarFileHeader(
  fileName: string,
  moduleName: string,
  moduleId: number,
  vendorId: number = 0x1234,
  description?: string
): string {
  const timestamp = new Date().toISOString();
  const arMajor = 4;
  const arMinor = 4;
  const arRevision = 0;
  const swMajor = 1;
  const swMinor = 0;
  const swPatch = 0;

  return `/**
 * @file    ${fileName}
 * @brief   AUTOSAR ${moduleName} - ${description || 'Configuration and implementation'}
 * @details This file contains the AUTOSAR 4.4 compliant ${moduleName} module
 *          configuration data structures, type definitions, and function declarations.
 *          It is part of the ${moduleName} BSW module implementation.
 *
 * @module     ${moduleName}
 * @moduleId   ${moduleId}
 * @vendorId   0x${toHex(vendorId)}
 * @copyright  Copyright (c) ${new Date().getFullYear()} YuleTech. All rights reserved.
 *
 * AUTOSAR Version Information:
 * @arVersion   ${arMajor}.${arMinor}.${arRevision}
 * @swVersion   ${swMajor}.${swMinor}.${swPatch}
 *
 * @note  This file is auto-generated by yuleASR Configurator.
 *        DO NOT EDIT THIS FILE MANUALLY.
 * @date  ${timestamp}
 */
/*==============================================================================
 *                                           C O N F I D E N T I A L
 *==============================================================================
 * This file contains confidential and proprietary information of YuleTech.
 * Unauthorized copying or distribution of this file is prohibited.
 *============================================================================*/
`;
}

/**
 * Generate a standard AUTOSAR Doxygen function header
 *
 * @param brief - Brief function description
 * @param params - Array of {name, direction, description} tuples
 * @param returns - Return value description
 * @param preconditions - Pre-conditions for calling this function
 * @param postconditions - Post-conditions after function execution
 * @returns Function Doxygen comment block
 */
export function generateAutosarFunctionHeader(
  brief: string,
  params?: Array<{ name: string; direction?: 'in' | 'out' | 'inout'; description: string }>,
  returns?: string,
  preconditions?: string[],
  postconditions?: string[]
): string {
  let doxy = '/**\n';
  doxy += ` * @brief ${brief}\n`;

  if (params && params.length > 0) {
    doxy += ' *\n';
    for (const p of params) {
      const dir = p.direction ? `[${p.direction}]` : '';
      doxy += ` * @param${dir ? ` ${dir}` : ''} ${p.name}  ${p.description}\n`;
    }
  }

  if (preconditions && preconditions.length > 0) {
    doxy += ' *\n';
    for (const pre of preconditions) {
      doxy += ` * @pre  ${pre}\n`;
    }
  }

  if (postconditions && postconditions.length > 0) {
    doxy += ' *\n';
    for (const post of postconditions) {
      doxy += ` * @post ${post}\n`;
    }
  }

  if (returns) {
    doxy += ' *\n';
    doxy += ` * @return ${returns}\n`;
  }

  doxy += ' */\n';
  return doxy;
}

/**
 * Generate Det_ReportError call block, guarded by DEV_ERROR_DETECT
 *
 * @param moduleId - AUTOSAR module ID
 * @param instanceId - Instance ID (usually 0)
 * @param serviceId - Service ID for the API that detected the error
 * @param errorCode - AUTOSAR development error code
 * @param errorMessage - Human-readable error description (comment)
 * @returns C code block with Det_ReportError call
 */
export function generateDetReportError(
  moduleId: number,
  instanceId: number,
  serviceId: number,
  errorCode: number,
  errorMessage: string
): string {
  return `\
#if (DEV_ERROR_DETECT == STD_ON)
        /* ${errorMessage} */
        (void)Det_ReportError(
            (uint16)${moduleId},       /* ModuleId */
            (uint8)${instanceId},      /* InstanceId */
            (uint8)${serviceId},       /* ApiServiceId */
            (uint8)${errorCode}        /* ErrorCode */
        );
#endif /* DEV_ERROR_DETECT */`;
}

/**
 * Generate the standard AUTOSAR version info macro block for a module header
 *
 * @param moduleName - Module name in original case (e.g. "Can")
 * @param swMajor - Software major version (1)
 * @param swMinor - Software minor version (0)
 * @param swPatch - Software patch version (0)
 * @param arMajor - AUTOSAR release major version (4)
 * @param arMinor - AUTOSAR release minor version (4)
 * @param arRevision - AUTOSAR release revision (0)
 * @returns C macro definitions block
 */
export function generateVersionInfoMacros(
  moduleName: string,
  swMajor: number = 1,
  swMinor: number = 0,
  swPatch: number = 0,
  arMajor: number = 4,
  arMinor: number = 4,
  arRevision: number = 0
): string {
  const prefix = moduleName.toUpperCase();
  return `\
/*==================[AUTOSAR version information]============================*/
/**
 * @brief ${moduleName} Software Version
 */
#define ${prefix}_SW_MAJOR_VERSION          ((uint8)${swMajor}U)
#define ${prefix}_SW_MINOR_VERSION          ((uint8)${swMinor}U)
#define ${prefix}_SW_PATCH_VERSION          ((uint8)${swPatch}U)

/**
 * @brief AUTOSAR Release Version
 */
#define ${prefix}_AR_RELEASE_MAJOR_VERSION  ((uint8)${arMajor}U)
#define ${prefix}_AR_RELEASE_MINOR_VERSION  ((uint8)${arMinor}U)
#define ${prefix}_AR_RELEASE_REVISION_VERSION ((uint8)${arRevision}U)

/**
 * @brief Module ID and Vendor ID
 */
#define ${prefix}_MODULE_ID                 ((uint16)0x${toHex(getModuleId(moduleName))})
#define ${prefix}_VENDOR_ID                 ((uint16)0x1234)

/**
 * @brief Development error detection switch
 */
#define ${prefix}_DEV_ERROR_DETECT          STD_OFF

`;
}

/**
 * Generate the standard DEV_ERROR_DETECT guard wrapper for a code block
 *
 * @param codeBlock - The C code to guard
 * @returns Code wrapped with DEV_ERROR_DETECT if/endif
 */
export function wrapDevErrorDetect(codeBlock: string): string {
  return `\
#if (DEV_ERROR_DETECT == STD_ON)
${codeBlock}
#endif /* DEV_ERROR_DETECT */
`;
}

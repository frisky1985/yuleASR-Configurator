/**
 * yuleASR C Code Generator (Web Layer)
 *
 * Generates macro-only `<Module>_Cfg.h` headers for yuleASR BSW integration.
 * These are pure pre-compile configuration headers (macros only),
 * NOT AUTOSAR ECUC headers (no type definitions or function declarations).
 *
 * References:
 * - yuleASR Can_Cfg.h (config/input/mcal/Can_Cfg.h) — pure macro style
 *
 * ECUC full code generation (types + functions) is handled separately
 * by the EcucCodeGenerator in @yuletech/core.
 */

// Fix 18/22: escapeCString / C_IDENTIFIER_RE 从 core 导出，单一实现（避免 web 私有转义分叉）
import { escapeCString, C_IDENTIFIER_RE } from '@yuletech/core';
import type { ModuleSchema, ModuleParameter } from '@yuletech/core';

import { loadPreferredSchemas } from './schemaSource';


export interface GeneratedFile {
  filename: string;
  content: string;
  language: 'c' | 'h';
  /** 生成期提示（如拼接降级警告），非致命错误 */
  warnings?: string[];
}

/**
 * Well-known module configuration header names.
 * Maps module ID → expected header filename.
 */
const MODULE_HEADERS: Record<string, string> = {
  can: 'Can_Cfg.h',
  mcu: 'Mcu_Cfg.h',
  port: 'Port_Cfg.h',
  dio: 'Dio_Cfg.h',
  adc: 'Adc_Cfg.h',
  icu: 'Icu_Cfg.h',
  gpt: 'Gpt_Cfg.h',
  pwm: 'Pwm_Cfg.h',
  wdg: 'Wdg_Cfg.h',
  lin: 'Lin_Cfg.h',
  spi: 'Spi_Cfg.h',
  fr: 'Fr_Cfg.h',
  eth: 'Eth_Cfg.h',
};

/**
 * Known AUTOSAR module name aliases for header lookup.
 */
const MODULE_IDS: Record<string, number> = {
  Mcu: 43,
  Port: 42,
  Dio: 41,
  Can: 80,
  Adc: 44,
  Icu: 120,
  Gpt: 121,
  Pwm: 123,
  Wdg: 45,
  Lin: 183,
  Spi: 122,
  Fr: 46,
  Eth: 47,
};

/**
 * Get the module short name from a ConfigModule.
 * Maps module 'id' to PascalCase name (e.g. 'can' → 'Can').
 */
function getModuleShortName(id: string): string {
  // Known modules
  const known: Record<string, string> = {
    can: 'Can',
    mcu: 'Mcu',
    port: 'Port',
    dio: 'Dio',
    adc: 'Adc',
    icu: 'Icu',
    gpt: 'Gpt',
    pwm: 'Pwm',
    wdg: 'Wdg',
    lin: 'Lin',
    spi: 'Spi',
    fr: 'Fr',
    eth: 'Eth',
    os: 'Os',
    rte: 'Rte',
    // F1 CfgH-extracted 模块别名（PascalCase 头文件名/宏前缀与 snake_case id 不同）
    boot: 'Boot',
    crypto: 'Crypto',
    e2e: 'E2E',
    flash: 'Flash',
    secoc: 'SecOC',
    someip: 'SomeIp',
    tcpip: 'TcpIp',
    udpnm: 'UdpNm',
  };
  return known[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

/**
 * Get the header filename for a module.
 */
function getHeaderFilename(moduleId: string): string {
  return MODULE_HEADERS[moduleId] || `${getModuleShortName(moduleId)}_Cfg.h`;
}

/**
 * Get AUTOSAR module ID number.
 */
function getModuleId(moduleName: string): number {
  return MODULE_IDS[moduleName] || 0xffff;
}

/**
 * ============================================================================
 * V3.2 — 混合头拼接（splice）
 *
 * 背景：部分 yuleASR 手写 *_Cfg.h 除宏段外还含非宏配置内容
 * （typedef / struct / extern 配置表，如 CanIf_Cfg.h 的 CanIf_HohCfgType /
 * CanIf_TxPduCfg[CANIF_TX_LPDU_CNT] 等）。纯宏生成头缺这些声明，直接替换
 * 手写头会导致编译失败（V3.1 demo 已证：拼接头 5/5 编译 0 error + ctest 45/45）。
 *
 * 本方案（V3.1 拼接方案的固化）：生成宏段 + #include "Std_Types.h"
 * + 手写非宏段（typedef/struct/extern）追加。顺序约束：宏段必须先行——
 * extern 数组尺寸引用宏段计数宏（CANIF_HOH_CNT 等）。
 *
 * 护栏：
 * 1. 探测规则（推荐）——扫描手写头源文件含 typedef|struct|extern 且非注释行；
 * 2. 已知混合头清单（KNOWN_MIXED_HEADERS）——明确已知需拼接的模块，
 *    拼接模式下缺手写头直接报错，绝不产出残缺纯宏头；
 * 3. 结构防呆——非宏段混入 #define（错误码/别名）或生成头缺 guard/#endif 时
 *    拒绝拼接并抛错。
 * ============================================================================
 */

/**
 * 已知混合头模块清单（手写头含 typedef/struct/extern 配置表）。
 * 拼接模式下（调用方提供 handwrittenHeaders），这些模块的手写头缺失/不可读时
 * 直接抛错（护栏兜底），而不是静默产出纯宏头。
 * 可随探测发现的模块追加；探测规则对清单外模块同样生效（自动拼接）。
 */
const KNOWN_MIXED_HEADERS = new Set(['canif']);

/**
 * 非宏内容探测正则：行首 typedef / struct / extern（extern 排除 extern "C" 链接声明）。
 */
const NON_MACRO_LINE_RE = /^\s*(?:typedef\b|struct\b|extern\b(?!\s*"))/;

/**
 * MemMap 段宏标记（无值段标记行）：`#define XXX_START_SEC[_suffix]` /
 * `#define XXX_STOP_SEC[_suffix]`（如 CSM_STOP_SEC_CODE、WDGM_START_SEC_CONFIG_DATA_UNSPECIFIED、
 * XXX_START_SEC_STRICT）。与 `#include "X_MemMap.h"` 成对控制 #pragma section 开合。
 * demo-fixA（A 类修复）：此类行豁免护栏（原样保留在非宏段，不剔除、不拒绝拼接）。
 */
const MEMMAP_SEGMENT_DEFINE_RE =
  /^#\s*define\s+[A-Za-z_][A-Za-z0-9_]*_(?:START|STOP)_SEC(?:_[A-Za-z0-9_]*)?\s*$/;

/** MemMap.h 包含行（与段标记成对出现，段开合边界用） */
const MEMMAP_INCLUDE_RE = /^\s*#\s*include\s+"[^"]*_MemMap\.h"/;

/** 判断一行是否为非宏内容（typedef/struct/extern 配置表），排除注释行 */
function isNonMacroLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.startsWith('*') || t.startsWith('/*') || t.startsWith('//')) return false;
  return NON_MACRO_LINE_RE.test(line);
}

/**
 * 混合头探测护栏（规则 1）：手写头是否含非宏内容（typedef/struct/extern 配置表）。
 * 探测到 → 走拼接路径；否则纯宏头即可。
 */
export function hasNonMacroContent(headerContent: string): boolean {
  return headerContent.split('\n').some(line => isNonMacroLine(line));
}

/** 非宏段提取结果 */
export interface NonMacroSegment {
  /** 原样行切片（含段内注释），首为首个非宏行，尾为末个非宏语句的完整闭合 */
  segment: string;
  /** 标量 typedef 数 */
  typedefs: number;
  /** typedef struct 数 */
  structs: number;
  /** extern 配置表数 */
  externs: number;
  /** 从切片剔除的 #define 宏名（生成头宏段提供同名宏，剔除防重复定义；MemMap 段宏不在此列） */
  droppedDefines: string[];
}

/** 行内花括号增量（忽略行尾 // 注释；Cfg.h 配置表无字符串内花括号场景） */
function braceDelta(line: string): number {
  const t = line.replace(/\/\/.*$/, '');
  let d = 0;
  for (const ch of t) {
    if (ch === '{') d++;
    else if (ch === '}') d--;
  }
  return d;
}

/** 行是否以 ; 结束语句（忽略行尾注释） */
function endsWithSemicolon(line: string): boolean {
  const t = line.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '').trimEnd();
  return t.endsWith(';');
}

/**
 * 从 startIdx 起扫描到「语句完整闭合」：brace 深度归零且以 ; 结尾
 * （多行 typedef struct/enum 的 }Type;、多行 extern 函数声明的 ); 均在此收敛）。
 * 未闭合（异常头）→ 取到文件尾。
 */
function findStatementEnd(lines: string[], startIdx: number): number {
  let depth = 0;
  for (let i = startIdx; i < lines.length; i++) {
    depth += braceDelta(lines[i]);
    if (depth <= 0 && endsWithSemicolon(lines[i])) return i;
  }
  return lines.length - 1;
}

/**
 * 提取手写头非宏段：从首个 typedef/struct/extern 行起，到「末个非宏语句完整闭合」的连续切片。
 *
 * demo-fixA（A 类 splice 修复，2026-08-10）：
 * 1. 语句闭合扩展（修截断）：原实现切片止于「末个非宏行」——若末个非宏行是多行
 *    `typedef struct {` 的开头行，切片截断（产物 `typedef struct {` 后直接 #endif）。
 *    现从末个非宏行向后扫描到语句完整闭合（多行 typedef struct/enum、多行 extern
 *    函数声明均完整保留），并纳入语句后的尾部 MemMap 段标记对（STOP/START +
 *    MemMap.h include，保证段 pragma 开合平衡）。
 * 2. MemMap 段宏豁免（修护栏）：切片内 `#define XXX_START_SEC/STOP_SEC[_*]` 段标记行
 *    原样保留（不剔除、不触发拒绝）；`#ifdef __cplusplus` 闭合块（裸 `}` 收尾的
 *    extern "C" 结尾）因缺少切片内的 `extern "C" {` 配对而剔除，避免悬空 `}`。
 * 3. 非段宏 #define 剔除：切片内其余 #define（配置宏/错误码/防重定义标记，如
 *    Linker 的 MPU_REGION_COUNT、Flash 的 FLASH_* 寄存器宏）从非宏段剔除——这些宏由
 *    生成头宏段提供（宏名版 schema 与手写头同名），剔除防重复定义；名单记录在
 *    droppedDefines 供诊断。护栏由「拒绝拼接」改为「剔除 + 记录」。
 *
 * 无非宏内容 → 返回 null（纯宏头，无需拼接）。
 */
export function extractNonMacroSegment(headerContent: string): NonMacroSegment | null {
  const lines = headerContent.split('\n');
  const idxs: number[] = [];
  lines.forEach((l, i) => {
    if (isNonMacroLine(l)) idxs.push(i);
  });
  if (idxs.length === 0) return null;

  // 末个非宏语句完整闭合（修截断）
  let end = findStatementEnd(lines, idxs[idxs.length - 1]);
  // 尾部 MemMap 段标记对（含其间空行）：保证切片内段 pragma 开合平衡
  while (end + 1 < lines.length) {
    const t = lines[end + 1].trim();
    if (!t || MEMMAP_SEGMENT_DEFINE_RE.test(t) || MEMMAP_INCLUDE_RE.test(t)) end++;
    else break;
  }
  // 条件编译平衡：切片内未闭合的 #if/#ifdef/#ifndef（如 Swc 的 #if (SWC_PB_CONFIG == STD_ON)）
  // → 前向补足配对 #endif，避免拼接产物 #if 悬空吞掉生成头尾部 #endif
  let cppBalance = 0;
  for (let i = idxs[0]; i <= end; i++) {
    const t = lines[i].trim();
    if (/^#\s*if(?:def|ndef)?\b/.test(t)) cppBalance++;
    else if (/^#\s*endif\b/.test(t)) cppBalance--;
  }
  while (cppBalance > 0 && end + 1 < lines.length) {
    end++;
    const t = lines[end].trim();
    if (/^#\s*if(?:def|ndef)?\b/.test(t)) cppBalance++;
    else if (/^#\s*endif\b/.test(t)) cppBalance--;
  }

  const slice = lines.slice(idxs[0], end + 1);

  // 剔除 extern "C" 闭合块：#ifdef __cplusplus 内含裸 `}`（其配对 extern "C" { 在切片外）
  // 以及悬空 #endif（配对 #if 在切片外，如切片起始于条件块内部）
  const dropLines = new Set<number>();
  {
    // 悬空 #endif 剔除
    let bal = 0;
    for (let i = 0; i < slice.length; i++) {
      const t = slice[i].trim();
      if (/^#\s*if(?:def|ndef)?\b/.test(t)) bal++;
      else if (/^#\s*endif\b/.test(t)) {
        if (bal === 0) dropLines.add(i);
        else bal--;
      }
    }
    // extern "C" 闭合块剔除
    let i = 0;
    while (i < slice.length) {
      const t = slice[i].trim();
      if (/^#\s*if(?:def\s+__cplusplus\b| defined\(__cplusplus\))/.test(t)) {
        let j = i + 1;
        let nest = 0;
        while (j < slice.length) {
          const tj = slice[j].trim();
          if (/^#\s*if(?:def|ndef)?\b/.test(tj)) nest++;
          else if (/^#\s*endif\b/.test(tj)) {
            if (nest === 0) break;
            nest--;
          }
          j++;
        }
        const block = slice.slice(i, Math.min(j + 1, slice.length));
        const hasBareClose = block.some(l => l.trim() === '}');
        const hasOpen = block.some(l => l.trim() === '{' || l.includes('extern "C" {'));
        if (hasBareClose && !hasOpen) {
          for (let k = i; k <= j && k < slice.length; k++) dropLines.add(k);
        }
        i = j + 1;
      } else {
        i++;
      }
    }
  }

  // 剔除非段宏 #define（MemMap 段宏保留）；记录剔除名单
  const kept: string[] = [];
  const droppedDefines: string[] = [];
  for (let i = 0; i < slice.length; i++) {
    if (dropLines.has(i)) continue;
    const t = slice[i].trim();
    if (/^#\s*define\b/.test(t)) {
      if (MEMMAP_SEGMENT_DEFINE_RE.test(t)) {
        kept.push(slice[i]); // MemMap 段标记：原样保留
      } else {
        const m = /^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)/.exec(t);
        if (m) droppedDefines.push(m[1]); // 配置宏：生成头宏段提供，剔除防重复定义
      }
      continue;
    }
    kept.push(slice[i]);
  }
  const segment = kept.join('\n').trim();

  return {
    segment,
    typedefs: kept.filter(l => /^\s*typedef\b/.test(l) && !/^\s*typedef\s+struct\b/.test(l)).length,
    structs: kept.filter(l => /^\s*typedef\s+struct\b/.test(l)).length,
    externs: kept.filter(l => /^\s*extern\b/.test(l)).length,
    droppedDefines,
  };
}

/** Std_Types.h 基础类型（非宏段依赖判定用） */
const STD_TYPES_TYPE_RE =
  /\b(?:uint8|uint16|uint32|uint64|sint8|sint16|sint32|sint64|boolean|float32|float64)\b/;

/**
 * 收集手写头「序部」类型 include（demo-fixA，A 类修复）：
 * 手写非宏段（typedef/struct/extern）可能依赖手写头顶部的类型头
 * （如 Csm_Cfg.h 的 Csm_Types.h、Os_TimingProtection_Cfg.h 的 Os.h），
 * 纯宏生成头不含这些 include → 拼接头缺类型定义。
 * 规则：首个非宏行之前出现的 #include "..." 原样携带，去重保序；
 * 排除 Std_Types.h（splice 按需添加）与 *_MemMap.h（段标记，切片内已含）。
 */
function collectHandwrittenPrologueIncludes(headerContent: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of headerContent.split('\n')) {
    const t = line.trim();
    if (isNonMacroLine(line)) break; // 首个非宏行：序部结束
    const m = /^#\s*include\s+"([^"]+)"/.exec(t);
    if (!m) continue;
    const name = m[1];
    if (name === 'Std_Types.h' || /_MemMap\.h$/.test(name)) continue;
    if (!seen.has(name)) {
      seen.add(name);
      out.push(line);
    }
  }
  return out;
}

/**
 * 拼接实现（V3.1 方案固化）：
 *   生成头（宏段）拆分为 head(文件头+guard) / macros / tail(#endif+文件尾)，
 *   在 guard 后插入 #include "Std_Types.h"（非宏段依赖 Std_Types 类型时）及
 *   手写头序部类型 include（Csm_Types.h/Os.h 等，demo-fixA），
 *   宏段之后追加手写非宏段（typedef/struct/extern），再拼回 tail。
 *
 * 顺序约束：宏段先行——extern 数组尺寸引用宏段计数宏。
 * 护栏（规则 3）：生成头缺 guard/#endif → 抛错，不产出残缺头。
 */
export function spliceGeneratedWithNonMacro(
  generatedContent: string,
  handwrittenContent: string,
  headerName: string
): string {
  const nonMacro = extractNonMacroSegment(handwrittenContent);
  if (!nonMacro) return generatedContent; // 纯宏头：无需拼接

  const guardName = headerName.replace(/\./g, '_').toUpperCase();
  const lines = generatedContent.split('\n');
  const guardIdx = lines.findIndex(l => l.trim() === `#define ${guardName}`);
  const endifIdx = lines.findIndex(l => l.trim().startsWith('#endif'));
  if (guardIdx < 0 || endifIdx < 0) {
    throw new Error(
      `[codegen] 生成头结构异常（找不到 guard/#endif），拒绝拼接: ${headerName}`
    );
  }

  const head = lines.slice(0, guardIdx + 1);
  const macros = lines.slice(guardIdx + 1, endifIdx);
  const tail = lines.slice(endifIdx);

  const include = STD_TYPES_TYPE_RE.test(nonMacro.segment)
    ? '#include "Std_Types.h"   /* 非宏段依赖 Std_Types 基础类型 (uint32/uint8/uint16/boolean 等)，生成宏段不含此 include */'
    : null;
  // demo-fixA：手写头序部类型 include（Csm_Types.h/Os.h 等）原样携带，非宏段类型依赖不丢
  const prologueIncludes = collectHandwrittenPrologueIncludes(handwrittenContent);

  const banner = [
    '/*==================================================================================================',
    '*  NON-MACRO SEGMENT (preserved from handwritten header, merged by codegen splice)',
    `*  typedef(${nonMacro.typedefs}) + struct(${nonMacro.structs}) + extern config tables(${nonMacro.externs}) — 依赖宏段计数宏, 故置于宏段之后`,
    ...(nonMacro.droppedDefines.length > 0
      ? [`*  剔除重复 #define: ${nonMacro.droppedDefines.join(', ')}（生成宏段提供同名宏）`]
      : []),
    '*================================================================================================*/',
  ];

  return [
    ...head,
    '',
    ...(include ? [include] : []),
    ...prologueIncludes,
    ...macros,
    '',
    ...banner,
    nonMacro.segment,
    ...tail,
  ].join('\n');
}

/**
 * 拼接模式选项（F2a/F2b 入口可选）：
 * 提供 handwrittenHeaders（filename → 手写头内容）后，codegen 对含非宏内容的
 * 手写头走拼接路径。浏览器环境无文件系统，由调用方（Node 侧 codegen-splice.ts）
 * 或测试读取手写头后传入。不提供 → 保持纯宏生成（既有行为，零回归）。
 */
export interface SpliceOptions {
  /** 手写头内容映射（文件名如 CanIf_Cfg.h → 手写头全文） */
  handwrittenHeaders?: Map<string, string>;
}

/**
 * Format a JS value as a C macro literal.
 */
function formatMacroValue(value: unknown): string {
  if (typeof value === 'boolean') {
    return value ? 'STD_ON' : 'STD_OFF';
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value <= 0xffff ? `(${value}U)` : `(${value}U)`;
    }
    return `${value}f`;
  }
  // Fix 18/22 (W5): 枚举标识符原样输出；自由文本加引号并转义，防止裸引号/换行注入 .h 文件
  if (typeof value === 'string') {
    return C_IDENTIFIER_RE.test(value) ? value : `"${escapeCString(value)}"`;
  }
  return String(value);
}

/**
 * Convert camelCase/snake_case to UPPER_SNAKE_CASE.
 */
function toUpperSnake(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toUpperCase();
}

/**
 * Generate a macro-only `<Module>_Cfg.h` header file
 * matching yuleASR existing config header style.
 *
 * Output format follows the yuleASR convention:
 * - Doxygen-style file comment
 * - Include guard
 * - Grouped section comments with "====" style
 * - #define macros only (no type defs, no function decls)
 * - U suffix on integer literals
 */
function generateMacroOnlyHeader(
  moduleId: string,
  moduleName: string,
  moduleDisplayName: string,
  version: string,
  parameters: Record<string, unknown>,
  options: { rawMacroNames?: boolean } = {}
): string {
  const headerName = getHeaderFilename(moduleId);
  const guardName = headerName.replace(/\./g, '_').toUpperCase();
  const shortName = getModuleShortName(moduleId);
  const prefix = shortName.toUpperCase();
  const swMajor = 1;
  const swMinor = 0;
  const swPatch = 0;

  let content = `/**\n`;
  content += ` * @file ${headerName}\n`;
  content += ` * @brief ${moduleDisplayName || moduleName} configuration header\n`;
  content += ` * @version ${swMajor}.${swMinor}.${swPatch}\n`;
  content += ` * @date ${new Date().toISOString().split('T')[0]}\n`;
  content += ` * @note AUTO-GENERATED by yuleASR Configurator\n`;
  content += ` */\n\n`;

  content += `#ifndef ${guardName}\n`;
  content += `#define ${guardName}\n\n`;

  content += `/*==================================================================================================\n`;
  content += `*                                    PRE-COMPILE CONFIGURATION\n`;
  content += `*================================================================================================*/\n`;

  // Group parameters into logical sections
  const sections: Record<string, { key: string; name: string; value: unknown }[]> = {
    general: [],
    counts: [],
    baudrate: [],
    processing: [],
    controller: [],
    hoh: [],
    timeout: [],
    other: [],
  };

  for (const [key, value] of Object.entries(parameters)) {
    const keyUpper = toUpperSnake(key);
    // rawMacroNames: schema 驱动模式 — 参数名已是最终宏名（CfgH 提取），不再叠加模块前缀
    const macro = options.rawMacroNames ? key : `${prefix}_${keyUpper}`;

    // Categorize based on key name patterns
    if (/dev.?error|version.?info|det|dev/i.test(key)) {
      sections.general.push({ key, name: macro, value });
    } else if (/num_|count/i.test(keyUpper)) {
      sections.counts.push({ key, name: macro, value });
    } else if (/baud/i.test(keyUpper)) {
      sections.baudrate.push({ key, name: macro, value });
    } else if (/process|poll|interrupt/i.test(keyUpper)) {
      sections.processing.push({ key, name: macro, value });
    } else if (/controller|idx/i.test(keyUpper)) {
      sections.controller.push({ key, name: macro, value });
    } else if (/hoh|rx|tx|handle/i.test(keyUpper)) {
      sections.hoh.push({ key, name: macro, value });
    } else if (/timeout|period/i.test(keyUpper)) {
      sections.timeout.push({ key, name: macro, value });
    } else {
      sections.other.push({ key, name: macro, value });
    }
  }

  // Generate sections
  const sectionConfig: [string, string, (typeof sections)['general']][] = [
    ['GENERAL', 'General Configuration', sections.general],
    ['COUNTS', 'Module Configuration Counts', sections.counts],
    ['BAUDRATE', 'Baudrate Configurations', sections.baudrate],
    ['PROCESSING', 'Processing Modes', sections.processing],
    ['CONTROLLER', 'Controller Definitions', sections.controller],
    ['HOH', 'Hardware Object Handles', sections.hoh],
    ['TIMEOUT', 'Timing Configuration', sections.timeout],
    ['OTHER', 'Other Configuration', sections.other],
  ];

  for (const [sectionId, sectionLabel, params] of sectionConfig) {
    if (params.length === 0) continue;
    content += `\n/*==================================================================================================\n`;
    content += `*                                    ${sectionLabel}\n`;
    content += `*================================================================================================*/\n`;
    for (const p of params) {
      content += `#define ${p.name}    ${formatMacroValue(p.value)}\n`;
    }
  }

  content += `\n#endif /* ${guardName} */\n\n`;
  content += `/*==================[end of file]===========================================*/\n`;

  return content;
}

/**
 * Schema 驱动（F2a）— 参数名 → 宏名解析。
 *
 * 规则（与 yuleASR 手写 Cfg.h 对齐）：
 * 1. CfgH 提取的参数名本身就是宏名（如 FLS_CFG_VENDOR_ID）→ 原样使用；
 * 2. ARXML 风格参数名（如 WdgDisableAllowed）→ 去除模块名前缀后叠加模块前缀 → WDG_DISABLE_ALLOWED。
 */
function schemaParamToMacroName(moduleShortName: string, param: ModuleParameter): string {
  const raw = param.name;
  // 已是 UPPER_SNAKE 宏名（CfgH-Extracted: 参数名即宏名）
  if (/^[A-Z][A-Z0-9_]*$/.test(raw)) return raw;
  // 去除 PascalCase 模块名前缀，避免 WDG_WDG_* 双重前缀
  let stripped = raw;
  if (stripped.startsWith(moduleShortName) && stripped.length > moduleShortName.length) {
    stripped = stripped.slice(moduleShortName.length);
  }
  return `${moduleShortName.toUpperCase()}_${toUpperSnake(stripped)}`;
}

/**
 * Schema 驱动 — 参数默认值解析（loader 将 Cfg.h 提取值放入 default）。
 * 无 default 时按类型回落，保证所有参数都能产出合法宏值。
 */
function schemaParamValue(param: ModuleParameter): unknown {
  if (param.default !== undefined) return param.default;
  switch (param.type) {
    case 'boolean':
      return false;
    case 'integer':
    case 'float':
      return 0;
    case 'enum':
      return param.options?.[0]?.value ?? '';
    default:
      return '';
  }
}

/**
 * Schema 驱动 — 将扁平 ModuleSchema.parameters（已含递归展平的容器参数）
 * 转为宏名 → 宏值的映射。
 */
function schemaToMacroParams(moduleShortName: string, schema: ModuleSchema): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const p of schema.parameters || []) {
    params[schemaParamToMacroName(moduleShortName, p)] = schemaParamValue(p);
  }
  return params;
}

/**
 * Generate a macro-only Can_Cfg.h tailored for the yuleASR CAN driver.
 * Uses well-known yuleASR macros matching the existing config/input/mcal/Can_Cfg.h.
 */
function generateCanMacroHeader(
  _moduleName: string,
  _version: string,
  parameters: Record<string, unknown>
): string {
  // Extract values from parameters or use defaults matching current yuleASR config
  const devErrorDetect = parameters.devErrorDetect !== undefined ? parameters.devErrorDetect : true;
  const versionInfoApi = parameters.versionInfoApi !== undefined ? parameters.versionInfoApi : true;
  const numControllers = parameters.numControllers ?? 2;
  const numHoh = parameters.numHoh ?? 16;
  const numBaudrateConfigs = parameters.numBaudrateConfigs ?? 3;
  const timeoutDuration = parameters.timeoutDuration ?? 10000;
  const mainFunctionPeriodMs = parameters.mainFunctionPeriodMs ?? 10;

  return `/**
 * @file Can_Cfg.h
 * @brief CAN Driver configuration header
 * @version 1.0.0
 * @date ${new Date().toISOString().split('T')[0]}
 * @note AUTO-GENERATED by yuleASR Configurator
 */

#ifndef CAN_CFG_H
#define CAN_CFG_H

/*==================================================================================================
*                                    PRE-COMPILE CONFIGURATION
*================================================================================================*/
#define CAN_DEV_ERROR_DETECT            ${devErrorDetect ? 'STD_ON' : 'STD_OFF'}
#define CAN_VERSION_INFO_API            ${versionInfoApi ? 'STD_ON' : 'STD_OFF'}

/*==================================================================================================
*                                    NUMBER OF CAN CONTROLLERS
*================================================================================================*/
#define CAN_NUM_CONTROLLERS             (${numControllers}U)

/*==================================================================================================
*                                    NUMBER OF HARDWARE OBJECTS
*================================================================================================*/
#define CAN_NUM_HOH                     (${numHoh}U)

/*==================================================================================================
*                                    BAUDRATE CONFIGURATIONS
*================================================================================================*/
#define CAN_NUM_BAUDRATE_CONFIGS        (${numBaudrateConfigs}U)

/* Baudrate Indexes */
#define CAN_BAUDRATE_500K               (0U)
#define CAN_BAUDRATE_250K               (1U)
#define CAN_BAUDRATE_125K               (2U)

/*==================================================================================================
*                                    PROCESSING MODES
*================================================================================================*/
#define CAN_PROCESSING_INTERRUPT        (0U)
#define CAN_PROCESSING_POLLING          (1U)

/*==================================================================================================
*                                    CONTROLLER DEFINITIONS
*================================================================================================*/
#define CAN_CONTROLLER_0                (0U)
#define CAN_CONTROLLER_1                (1U)

/*==================================================================================================
*                                    HARDWARE OBJECT HANDLES
*================================================================================================*/
#define CAN_HOH_RX_0                    ((Can_HwHandleType)0x0000U)
#define CAN_HOH_RX_1                    ((Can_HwHandleType)0x0001U)
#define CAN_HOH_RX_2                    ((Can_HwHandleType)0x0002U)
#define CAN_HOH_RX_3                    ((Can_HwHandleType)0x0003U)
#define CAN_HOH_TX_0                    ((Can_HwHandleType)0x0004U)
#define CAN_HOH_TX_1                    ((Can_HwHandleType)0x0005U)
#define CAN_HOH_TX_2                    ((Can_HwHandleType)0x0006U)
#define CAN_HOH_TX_3                    ((Can_HwHandleType)0x0007U)

/*==================================================================================================
*                                    TIMEOUT CONFIGURATION
*================================================================================================*/
#define CAN_TIMEOUT_DURATION            (${timeoutDuration}U)

/*==================================================================================================
*                                    MAIN FUNCTION PERIODS
*================================================================================================*/
#define CAN_MAIN_FUNCTION_PERIOD_MS     (${mainFunctionPeriodMs}U)

#endif /* CAN_CFG_H */
/*==================[end of file]===========================================*/
`;
}

/**
 * Generate all header files for enabled modules.
 * Returns an array of { filename, content, language } objects.
 */
export async function generateAllHeaders(
  modules: Array<{
    id: string;
    name: string;
    version: string;
    enabled: boolean;
    parameters?: Array<{ id: string; name: string; type: string; value: unknown }>;
    containers?: Array<{
      id: string;
      name: string;
      multiple?: boolean;
      parameters: Array<{ id: string; name: string; type: string; value: unknown }>;
      subContainers?: Array<{
        id: string;
        name: string;
        shortName?: string;
        parameters: Array<{ id: string; name: string; type: string; value: unknown }>;
      }>;
    }>;
    displayName?: string;
  }>
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  for (const module of modules) {
    if (!module.enabled) continue;

    // Extract module-level parameters as key-value pairs
    const params: Record<string, unknown> = {};
    if (module.parameters) {
      for (const p of module.parameters) {
        params[p.name] = p.value;
      }
    }

    const shortName = getModuleShortName(module.id);
    const filename = getHeaderFilename(module.id);
    let content: string;

    // Use specialized generator for CAN, else generic macro-only generator
    if (module.id === 'can') {
      content = generateCanMacroHeader(module.name, module.version, params);
    } else {
      content = generateMacroOnlyHeader(
        module.id,
        module.name,
        module.displayName || module.name,
        module.version,
        params
      );
    }

    files.push({
      filename,
      content,
      language: 'h',
    });
  }

  return files;
}

/**
 * Generate macro-only `<Module>_Cfg.h` headers from flat ModuleSchema[] (F2a).
 *
 * Schema 驱动全量生成：对任意 ModuleSchema（含 F1 从 yuleASR Cfg.h 提取的
 * 110 个模块）按 schema.parameters 生成宏头；container 参数已由 loader
 * （load-generated.ts）递归展平进 schema.parameters，生成 `PREFIX_NAME` 宏。
 *
 * 与 generateAllHeaders 的关系：
 * - generateAllHeaders 走 13 模块硬编码路径（存量，保持不变，can 仍走 generateCanMacroHeader）；
 * - 本函数走 schema 驱动路径（增量，V2.2 起 can 也走通用路径：宏名版 can.json
 *   参数名即 CAN_* 宏，rawMacroNames 原样输出，配置可流入）。
 * - ModuleSchema 无 enabled 字段，传入的 schema 全部生成。
 */
export async function generateHeadersFromSchemas(
  schemas: ModuleSchema[],
  options: SpliceOptions = {}
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  for (const schema of schemas) {
    const shortName = getModuleShortName(schema.name);
    const displayName = schema.label || schema.name;
    const filename = getHeaderFilename(schema.name);

    let content = generateMacroOnlyHeader(
      schema.name,
      schema.name,
      displayName,
      schema.version,
      schemaToMacroParams(shortName, schema),
      {
        rawMacroNames: true,
      }
    );

    const warnings: string[] = [];
    const moduleKey = schema.name.toLowerCase();
    const handwritten = options.handwrittenHeaders?.get(filename);
    if (handwritten !== undefined) {
      // 混合头探测护栏（规则 1）：手写头含 typedef/struct/extern 配置表 → 拼接路径
      if (hasNonMacroContent(handwritten)) {
        content = spliceGeneratedWithNonMacro(content, handwritten, filename);
      } else if (KNOWN_MIXED_HEADERS.has(moduleKey)) {
        warnings.push(
          `[codegen] ${filename} 已知混合头但手写头未探测到非宏内容，产物为纯宏头`
        );
      }
    } else if (options.handwrittenHeaders && KNOWN_MIXED_HEADERS.has(moduleKey)) {
      // 护栏兜底（规则 3）：拼接模式下已知混合头缺手写头 → 报错，不产出残缺头
      throw new Error(
        `[codegen] 已知混合头 ${filename} 缺少手写头内容（handwrittenHeaders 未提供），拒绝产出残缺纯宏头`
      );
    } else if (KNOWN_MIXED_HEADERS.has(moduleKey)) {
      // 非拼接模式（浏览器）：已知混合头无法拼接，附警告但保持既有行为
      warnings.push(
        `[codegen] ${filename} 手写头含非宏内容（typedef/struct/extern），未提供 handwrittenHeaders，产物为纯宏头（替换手写头前需启用拼接）`
      );
    }

    files.push({
      filename,
      content,
      language: 'h',
      ...(warnings.length > 0 ? { warnings } : {}),
    });
  }

  return files;
}

/**
 * UI 层可用的最小配置模块形状（F2b：Editor 配置数据 → schema 驱动生成）。
 * 与 types/config.ts 的 ConfigModule 结构化兼容（多余字段忽略）。
 */
export interface ConfigModuleLike {
  /** 模块 id（与 name 同义，可为 undefined） */
  id?: string;
  /** 模块短名（如 'Can' / 'flash'，与 schema.name 大小写不敏感匹配） */
  name: string;
  /** 模块是否启用：仅 enabled 模块的参数值参与覆盖；禁用模块回落 schema 默认值 */
  enabled: boolean;
  /** 模块级参数（name → value；与 schema 参数名精确匹配才覆盖） */
  parameters?: Array<{ name: string; value: unknown }>;
}

/** Schema 覆盖行（F2b：模块列表页 117 模块 schema 覆盖展示） */
export interface SchemaCoverageRow {
  /** 模块名（schema 名或配置独有模块名） */
  name: string;
  /** 显示标签 */
  label?: string;
  /** 层级（MCAL/ECUAL/Service/RTE/ASW；无 schema 时为空） */
  layer?: string;
  /** 参数数（schema.parameters 长度；无 schema 时为配置参数数） */
  paramCount: number;
  /** 容器数（schema.containers 长度；无 schema 时为 0） */
  containerCount: number;
  /** 是否有 schema（有 → 可配；无 → 仅展示） */
  hasSchema: boolean;
  /** 在当前配置中的状态 */
  configStatus: 'enabled' | 'disabled' | 'absent';
}

/** 覆盖统计（覆盖表头摘要用） */
export interface SchemaCoverageSummary {
  total: number;
  withSchema: number;
  withoutSchema: number;
  configured: number;
  enabled: number;
}

/**
 * 构建 117 模块 schema 覆盖行（F2b）。
 *
 * 语义：
 * - 有 schema 且配置中存在 → 「有 schema 可配」（configStatus 区分 enabled/disabled）；
 * - 有 schema 但配置未启用/未配置 → 可配但未用；
 * - 配置中存在但无 schema → 「无 schema 仅展示」（hasSchema=false）。
 *
 * @param configModules 当前配置模块列表（可为空数组：仅展示 schema 清单）
 * @param schemas 可选 schema 列表（默认 loadPreferredSchemas()，宏名版优先，117 个）
 */
export function buildSchemaCoverage(
  configModules: ConfigModuleLike[],
  schemas?: ModuleSchema[]
): { rows: SchemaCoverageRow[]; summary: SchemaCoverageSummary } {
  const allSchemas = schemas ?? loadPreferredSchemas();
  const configByName = new Map(
    configModules.map(m => [m.name.toLowerCase(), m])
  );

  const rows: SchemaCoverageRow[] = allSchemas.map(schema => {
    const cfg = configByName.get(schema.name.toLowerCase());
    return {
      name: schema.name,
      label: schema.label,
      layer: schema.layer,
      paramCount: schema.parameters?.length ?? 0,
      containerCount: schema.containers?.length ?? 0,
      hasSchema: true,
      configStatus: cfg ? (cfg.enabled ? 'enabled' : 'disabled') : 'absent',
    };
  });

  // 配置中无 schema 的模块（仅展示）
  const schemaNames = new Set(allSchemas.map(s => s.name.toLowerCase()));
  for (const cfg of configModules) {
    if (schemaNames.has(cfg.name.toLowerCase())) continue;
    rows.push({
      name: cfg.name,
      label: cfg.name,
      paramCount: cfg.parameters?.length ?? 0,
      containerCount: 0,
      hasSchema: false,
      configStatus: cfg.enabled ? 'enabled' : 'disabled',
    });
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));

  const summary: SchemaCoverageSummary = {
    total: rows.length,
    withSchema: rows.filter(r => r.hasSchema).length,
    withoutSchema: rows.filter(r => !r.hasSchema).length,
    configured: rows.filter(r => r.configStatus !== 'absent').length,
    enabled: rows.filter(r => r.configStatus === 'enabled').length,
  };

  return { rows, summary };
}

/**
 * 配置数据 → schema 驱动全量生成（F2b 主入口）。
 *
 * 将 Editor 配置模块的参数值覆盖到对应 schema 的 default 上（按参数名精确匹配），
 * 然后走 F2a 的 generateHeadersFromSchemas 生成全部模块 `<Module>_Cfg.h`。
 *
 * 规则（诚实声明）：
 * - 生成集合 = 全部 schema（117 个），不因配置未启用而跳过——yuleASR 构建需要全量头文件；
 * - 仅 enabled 配置模块的参数参与覆盖；disabled/未配置模块按 schema 默认值生成；
 * - 配置参数名与 schema 参数名精确匹配（区分大小写）；不匹配的参数不影响该模块生成；
 * - 配置中存在但 schema 缺失的模块不参与生成（无 schema 无法生成宏头，仅覆盖表展示）。
 *
 * V2.2（schema 源切换）：默认源改为 loadPreferredSchemas() —— 宏名版
 * （verification/extracted-cfgh/*.json，参数名即宏名）优先，无宏名版的模块回退
 * generated/（loadModuleSchemas）。宏名版默认值与 yuleASR 手写头一致，
 * 生成头可直接替换编译（V2 已验证 139/139）。
 *
 * @param configModules 当前配置模块
 * @param schemas 可选 schema 列表（默认 loadPreferredSchemas()，宏名版优先）
 * @returns 全部模块生成文件（与 schemas 等长）
 */
export async function generateHeadersFromConfig(
  configModules: ConfigModuleLike[],
  schemas?: ModuleSchema[],
  options: SpliceOptions = {}
): Promise<GeneratedFile[]> {
  const allSchemas = schemas ?? loadPreferredSchemas();
  const configByModule = new Map(
    configModules
      .filter(m => m.enabled)
      .map(m => [m.name.toLowerCase(), m])
  );

  const overridden = allSchemas.map(schema => {
    const cfg = configByModule.get(schema.name.toLowerCase());
    if (!cfg) return schema;
    const cfgParams = new Map((cfg.parameters ?? []).map(p => [p.name, p.value]));
    return {
      ...schema,
      parameters: (schema.parameters ?? []).map(p =>
        cfgParams.has(p.name) ? { ...p, default: cfgParams.get(p.name) } : p
      ),
    };
  });

  return generateHeadersFromSchemas(overridden, options);
}

/**
 * Generate a single module header file.
 * Returns null if the module is disabled.
 */
export async function generateHeader(
  module: {
    id: string;
    name: string;
    version: string;
    enabled: boolean;
    parameters?: Array<{ id: string; name: string; type: string; value: unknown }>;
    containers?: Array<{
      id: string;
      name: string;
      multiple?: boolean;
      parameters: Array<{ id: string; name: string; type: string; value: unknown }>;
      subContainers?: Array<{
        id: string;
        name: string;
        shortName?: string;
        parameters: Array<{ id: string; name: string; type: string; value: unknown }>;
      }>;
    }>;
    displayName?: string;
  }
): Promise<GeneratedFile | null> {
  if (!module.enabled) return null;

  const files = await generateAllHeaders([module]);
  return files[0] || null;
}

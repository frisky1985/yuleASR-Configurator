#!/usr/bin/env tsx
/**
 * F1 — Schema 自动提取器（yuleASR Cfg.h → ModuleSchema JSON）
 *
 * 从 yuleASR 仓库 src 下各 `*_Cfg.h` 的纯宏定义自动提取模块 Schema，
 * 输出到 `packages/@yuletech/core/src/schema/generated/`（与现有 54 个合并），
 * 并把全部 110 个提取结果另存到 `verification/extracted-cfgh/` 供审计/抽查。
 *
 * 用法:
 *   npx tsx scripts/extract-schemas-from-cfgh.ts [--yuleasr <yuleASR-repo-root>]
 *   YULEASR_SRC=<src-dir> npx tsx scripts/extract-schemas-from-cfgh.ts
 *
 * 提取规则:
 *   - 解析 `#define NAME VALUE`（兼容 (VALUE)、无括号、((Type)VALUE)、(Type)VALUE、带行尾注释）
 *   - 跳过: guard (`*_CFG_H`)、空宏、函数式宏、多行初始化宏（后者归为 object）
 *   - 类型推断: STD_ON/STD_OFF/TRUE/FALSE/STD_HIGH/STD_LOW → boolean;
 *     整型字面量(U/UL/hex) → integer(按 cast/数值取范围); 字符串 → string;
 *     标识符值 → enum(按前缀收集 options) 或别名解析; NULL_PTR → reference;
 *     表达式 → integer(描述记录原式); 多行初始化 → object
 *   - 分组保留: 头文件 `==== SECTION ====` 分节横幅 → 每参数 `x-section`
 *   - 每个 schema 附带 AUTOSAR 标准 CommonPublishedInformation 容器(8 字段)
 *
 * 合并策略（同名去重）: 与现有 generated/*.json 重名的模块保留现有更完整者
 * （现有 schema 带手写容器/crossReferences，被 validator 测试消费）；
 * 提取版全量存 verification/extracted-cfgh/ 保证 110 模块可审计。
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------ */
/* 常量                                                               */
/* ------------------------------------------------------------------ */

const REPO_ROOT = path.resolve(__dirname, '..');
const GENERATED_DIR = path.join(REPO_ROOT, 'packages/@yuletech/core/src/schema/generated');
const VERIFY_DIR = path.join(REPO_ROOT, 'verification/extracted-cfgh');

const LAYER_DIRS: Array<[string, string]> = [
  ['bsw/mcal', 'MCAL'],
  ['bsw/ecual', 'ECUAL'],
  ['bsw/services', 'Service'],
  ['bsw/os', 'Service'],
  ['rte', 'RTE'],
  ['bsw/cdd', 'ECUAL'],
  ['bsw/boot', 'Service'],
  ['platform', 'MCAL'],
];

/** 布尔字面量集合 */
const BOOL_LITERALS: Record<string, boolean> = {
  STD_ON: true,
  STD_OFF: false,
  TRUE: true,
  FALSE: false,
  STD_HIGH: true,
  STD_LOW: false,
};

/** 类型 cast 名 → 数值范围（无 cast 时按数值量级推断） */
const CAST_RANGES: Record<string, { min: number; max: number }> = {
  uint8: { min: 0, max: 255 },
  uint8_t: { min: 0, max: 255 },
  uint16: { min: 0, max: 65535 },
  uint16_t: { min: 0, max: 65535 },
  uint32: { min: 0, max: 4294967295 },
  uint32_t: { min: 0, max: 4294967295 },
  uint64: { min: 0, max: 18446744073709551615 },
  uint64_t: { min: 0, max: 18446744073709551615 },
  sint8: { min: -128, max: 127 },
  sint8_t: { min: -128, max: 127 },
  sint16: { min: -32768, max: 32767 },
  sint16_t: { min: -32768, max: 32767 },
  sint32: { min: -2147483648, max: 2147483647 },
  sint32_t: { min: -2147483648, max: 2147483647 },
  int8: { min: -128, max: 127 },
  int16: { min: -32768, max: 32767 },
  int32: { min: -2147483648, max: 2147483647 },
  int8_t: { min: -128, max: 127 },
  int16_t: { min: -32768, max: 32767 },
  int32_t: { min: -2147483648, max: 2147483647 },
};

const MAX_SAFE = Number.MAX_SAFE_INTEGER;
const MAX_U32 = 4294967295;

/* ------------------------------------------------------------------ */
/* 类型                                                                */
/* ------------------------------------------------------------------ */

interface RawParam {
  name: string;
  /** 归一化后的值（已去外层括号/cast/行尾注释） */
  value: string;
  /** 原始值串（去行尾注释前），用于表达式/枚举描述 */
  raw: string;
  /** 行尾 /* ... *​/ 注释（description 素材） */
  comment?: string;
  /** 分节标题 */
  section: string;
  /** 原始类型 cast（如 uint16） */
  cast?: string;
  /** 是否为多行初始化宏 */
  multilineObject?: boolean;
  line: number;
}

interface TypedParam {
  name: string;
  type: string; // boolean | integer | number | string | enum | reference | object
  default?: unknown;
  min?: number;
  max?: number;
  description?: string;
  options?: string[];
  referenceTarget?: string;
  section: string;
}

interface ModuleResult {
  /** 显示名（如 Wdg、CanNm、Cdd_Fvm） */
  displayName: string;
  fileName: string; // 小写文件名（不含 .json）
  layer: string;
  sourceFile: string; // yuleASR 相对路径
  version: string;
  description: string;
  params: TypedParam[];
  sections: string[];
}

/* ------------------------------------------------------------------ */
/* 工具函数                                                            */
/* ------------------------------------------------------------------ */

/** 匹配括号并返回 [外层括号内容, 剩余]；不匹配返回 null */
function matchParenGroup(s: string): { inner: string; rest: string } | null {
  if (!s.startsWith('(')) return null;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') {
      depth--;
      if (depth === 0) {
        return { inner: s.slice(1, i), rest: s.slice(i + 1).trim() };
      }
    }
  }
  return null;
}

/** 判断 token 是否为 C 类型名（内置类型或 AUTOSAR `XxxType` typedef） */
function isTypeToken(tok: string): boolean {
  const t = tok.trim();
  if (!t) return false;
  if (/^(u?int(8|16|32|64)?|int(8|16|32|64)?|s?int(8|16|32|64)?|uint(8|16|32|64)?|sint(8|16|32|64)?|float(32|64)?|double|boolean|bool|char|byte|void)(_t)?$/i.test(t))
    return true;
  if (/^[A-Z][A-Za-z0-9_]*Type$/.test(t)) return true; // Wdg_TimeoutType 等
  if (/^(Std_|Can_|Lin_|Eth_)[A-Za-z0-9_]*Type$/.test(t)) return true;
  return false;
}

/** 判断是否为函数式宏（参数列表） */
function isFunctionLike(rest: string): boolean {
  const g = matchParenGroup(rest);
  if (!g) return false;
  const inner = g.inner.trim();
  if (inner === '') return true; // `()` 空参
  if (inner.includes(',')) return true; // 多参 (a, b)
  // 单参: 全小写参数名 → 函数式；类型名 → cast
  if (/^[a-z][a-z0-9_]*$/.test(inner)) return !isTypeToken(inner);
  if (isTypeToken(inner)) return false;
  // 其它（含大写/嵌套）→ 视作值
  return false;
}

/** 去除行尾块注释，返回 [值, 注释] */
function stripTrailingComment(rest: string): { value: string; comment?: string } {
  const m = rest.match(/^(.*?)(?:\/\*\*?<?\s*([\s\S]*?)\s*\*+\/)?$/);
  if (!m) return { value: rest.trim() };
  const value = (m[1] || '').trim();
  const comment = m[2] ? m[2].trim().replace(/\s+/g, ' ') : undefined;
  return { value, comment };
}

/** 归一化宏值: 去外层括号 / cast */
function normalizeValue(rest: string): { value: string; cast?: string; raw: string } {
  const raw = rest;
  let s = rest;
  // 剥掉最外层整包括号: ((Type)100U) → (Type)100U ; (100U) → 100U
  for (;;) {
    const g = matchParenGroup(s);
    if (g && g.rest === '') {
      s = g.inner.trim();
      continue;
    }
    break;
  }
  // cast: (uint16)0x0001U 或 (Wdg_TimeoutType)100U
  const g = matchParenGroup(s);
  if (g && g.rest !== '' && isTypeToken(g.inner.trim())) {
    return { value: g.rest.trim(), cast: g.inner.trim(), raw };
  }
  return { value: s, raw };
}

/** 解析整数（支持 U/UL/LL/Ull/hex/0b/负号） */
function parseIntegerLiteral(s: string): number | null {
  const t = s.replace(/[uUlL]+$/g, '');
  if (/^0[xX][0-9a-fA-F]+$/.test(t)) {
    const n = parseInt(t, 16);
    return Number.isNaN(n) ? null : n;
  }
  if (/^0[bB][01]+$/.test(t)) {
    const n = parseInt(t.slice(2), 2);
    return Number.isNaN(n) ? null : n;
  }
  if (/^-?\d+$/.test(t)) {
    const n = Number(t);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function isFloatLiteral(s: string): boolean {
  return /^-?\d*\.\d+[fF]?$/.test(s) || /^-?\d+[eE][+-]?\d+[fF]?$/.test(s);
}

/** 按数值量级推断无符号范围；未知 typedef cast 按 32 位无符号 */
function rangeForValue(v: number, cast?: string): { min: number; max: number } {
  if (cast) {
    const known = CAST_RANGES[cast];
    if (known) return known;
    return { min: 0, max: MAX_U32 };
  }
  const av = Math.abs(v);
  if (v >= 0) {
    if (av <= 255) return { min: 0, max: 255 };
    if (av <= 65535) return { min: 0, max: 65535 };
    if (av <= MAX_U32) return { min: 0, max: MAX_U32 };
    return { min: 0, max: MAX_SAFE };
  }
  if (av <= 128) return { min: -128, max: 127 };
  if (av <= 32768) return { min: -32768, max: 32767 };
  if (av <= 2147483648) return { min: -2147483648, max: 2147483647 };
  return { min: -MAX_SAFE, max: MAX_SAFE };
}

/* ------------------------------------------------------------------ */
/* 单文件解析                                                          */
/* ------------------------------------------------------------------ */

const DEFINE_RE = /^[ \t]*#[ \t]*define[ \t]+([A-Za-z_][A-Za-z0-9_]*)[ \t]*(.*)$/;
const GUARD_RE = /_CFG_H$/;

interface ParsedFile {
  params: RawParam[];
  guards: number;
  empty: number;
  functionLike: string[];
  multilineObjects: number;
  skippedOther: number;
}

function parseCfgHeader(content: string): ParsedFile {
  const lines = content.split('\n');
  const params: RawParam[] = [];
  const result: ParsedFile = {
    params,
    guards: 0,
    empty: 0,
    functionLike: [],
    multilineObjects: 0,
    skippedOther: 0,
  };

  let currentSection = 'General';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // --- 分节横幅识别 ---
    // 形态: `/*=====...` + `* TITLE` + `====...*/`（开+闭都要成立，避免误判版权头）
    {
      const banner = line.match(/^[ \t]*\*+[ \t]*([A-Z][A-Z0-9 _&/()-]{2,})[ \t]*\*?[ \t]*$/);
      if (banner) {
        const next = (lines[i + 1] || '').trim();
        const prev = (lines[i - 1] || '').trim();
        const nextIsBannerChars = /^[*\s=_-]+\*?\/?$/.test(next) && next.length > 0;
        const prevIsBannerOpen = /^\/\*[=*]+/.test(prev);
        if (prevIsBannerOpen && nextIsBannerChars) {
          currentSection = banner[1].trim().replace(/\s+/g, ' ');
        }
      }
    }

    const m = line.match(DEFINE_RE);
    if (!m) continue;
    const name = m[1];
    let rest = m[2].trim();

    // guard
    if (GUARD_RE.test(name)) {
      result.guards++;
      continue;
    }

    // 函数式宏（含多行续行，如 LINNM_CALL_*）
    if (isFunctionLike(rest)) {
      result.functionLike.push(name);
      while (i + 1 < lines.length && lines[i + 1].trimEnd().endsWith('\\')) i++;
      continue;
    }

    // 空宏
    if (rest === '') {
      result.empty++;
      continue;
    }

    // 多行宏（初始值列表等）
    if (rest.endsWith('\\')) {
      // 判断是否为初始化器 `{`
      const body = lines
        .slice(i, i + 30)
        .join('\n')
        .slice(0, 2000);
      const isObject = body.includes('{');
      result.multilineObjects++;
      params.push({
        name,
        value: '',
        raw: rest,
        section: currentSection,
        multilineObject: true,
        line: i + 1,
        comment: isObject ? '多行初始化宏（对象/数组字面量，提取器不展开）' : undefined,
      });
      while (i + 1 < lines.length && lines[i + 1].trimEnd().endsWith('\\')) i++;
      continue;
    }

    const { value: v, comment } = stripTrailingComment(rest);
    const { value, cast, raw } = normalizeValue(v);
    if (value === '') {
      result.skippedOther++;
      continue;
    }
    params.push({
      name,
      value,
      raw,
      comment,
      cast,
      section: currentSection,
      line: i + 1,
    });
  }

  return result;
}

/* ------------------------------------------------------------------ */
/* 类型推断                                                            */
/* ------------------------------------------------------------------ */

/** 在指定目录全部头文件里收集匹配前缀的标识符（枚举成员候选）
 * dirTextCache: 目录→拼接文本缓存，避免重复读盘 */
function collectPrefixIdentifiers(
  moduleDir: string,
  prefix: string,
  dirTextCache: Map<string, string>
): string[] {
  const out = new Set<string>();
  const re = new RegExp(`\\b${prefix}[A-Z0-9_]*\\b`, 'g');
  let text = dirTextCache.get(moduleDir);
  if (text === undefined) {
    let files: string[] = [];
    try {
      files = fs.readdirSync(moduleDir).filter(f => f.endsWith('.h'));
    } catch {
      /* 目录不存在则跳过 */
    }
    text = '';
    for (const f of files) {
      try {
        text += '\n' + fs.readFileSync(path.join(moduleDir, f), 'utf8');
      } catch {
        /* 忽略单个文件读取失败 */
      }
    }
    dirTextCache.set(moduleDir, text);
  }
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(text)) !== null) out.add(mm[0]);
  return [...out];
}

/** 枚举块成员提取: 在模块目录头文件里找包含 value 的 enum 块，返回该块全部成员 */
function enumBlockMembers(
  moduleDir: string,
  value: string,
  dirTextCache: Map<string, string>
): string[] {
  let text = dirTextCache.get(moduleDir);
  if (text === undefined) {
    let files: string[] = [];
    try {
      files = fs.readdirSync(moduleDir).filter(f => f.endsWith('.h'));
    } catch {
      /* 目录不存在则跳过 */
    }
    text = '';
    for (const f of files) {
      try {
        text += '\n' + fs.readFileSync(path.join(moduleDir, f), 'utf8');
      } catch {
        /* 忽略 */
      }
    }
    dirTextCache.set(moduleDir, text);
  }

  const blockRe = /(?:typedef\s+)?enum\s*\{([^}]*)\}\s*\w*\s*;/g;
  let bm: RegExpExecArray | null;
  while ((bm = blockRe.exec(text)) !== null) {
    // 先剥掉块内注释，避免注释词被当成成员
    const cleaned = bm[1].replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
    const members: string[] = [];
    const memberRe = /([A-Z][A-Z0-9_]*)\s*(?:=\s*[^,]+)?,?/g;
    let mm: RegExpExecArray | null;
    while ((mm = memberRe.exec(cleaned)) !== null) members.push(mm[1]);
    if (members.includes(value)) return members;
  }
  return [];
}

/** 推断参数类型（需要文件级/全局标识符池） */
function inferParamType(
  p: RawParam,
  fileDefines: Map<string, TypedParam>,
  fileIdentifiers: Set<string>,
  globalIdentifiers: Set<string>,
  moduleDir: string,
  dirTextCache: Map<string, string>
): TypedParam {
  const base: TypedParam = {
    name: p.name,
    type: 'string',
    section: p.section,
    description: p.comment || `${p.name} 参数`,
  };

  if (p.multilineObject) {
    base.type = 'object';
    return base;
  }

  const v = p.value;

  // boolean 字面量
  if (BOOL_LITERALS[v] !== undefined) {
    base.type = 'boolean';
    base.default = BOOL_LITERALS[v];
    return base;
  }

  // NULL_PTR → reference
  if (v === 'NULL_PTR') {
    base.type = 'reference';
    base.referenceTarget = 'callback';
    base.default = null;
    base.description = `${p.comment || p.name}（NULL_PTR 回调指针）`;
    return base;
  }

  // 字符串
  if (v.startsWith('"') && v.endsWith('"')) {
    base.type = 'string';
    base.default = v.slice(1, -1);
    return base;
  }

  // 浮点
  if (isFloatLiteral(v)) {
    base.type = 'number';
    base.default = Number(v.replace(/[fF]$/, ''));
    return base;
  }

  // 整数
  const intVal = parseIntegerLiteral(v);
  if (intVal !== null) {
    base.type = 'integer';
    base.default = intVal;
    const r = rangeForValue(intVal, p.cast);
    base.min = r.min;
    base.max = r.max;
    if (p.cast) base.description = `${p.comment || p.name}（cast: ${p.cast}）`;
    return base;
  }

  // 纯标识符 → 枚举 或 别名
  if (/^[A-Z][A-Z0-9_]*$/.test(v)) {
    const lastUnderscore = v.lastIndexOf('_');
    const prefix = lastUnderscore > 0 ? v.slice(0, lastUnderscore + 1) : v + '_';
    const siblings = new Set<string>();

    // (a) 本文件标识符（define 名 + 值）
    for (const id of fileIdentifiers) {
      if (id.startsWith(prefix) && id !== p.name) siblings.add(id);
    }
    // (b) 模块目录兄弟头文件（枚举成员）
    for (const id of collectPrefixIdentifiers(moduleDir, prefix, dirTextCache)) {
      if (id !== p.name) siblings.add(id);
    }
    // (c) 全局 Cfg.h 标识符池
    for (const id of globalIdentifiers) {
      if (id.startsWith(prefix) && id !== p.name) siblings.add(id);
    }

    // 枚举判定（优先级从高到低）:
    // 1) 引用的标识符是本文件内已解析的字面量 define（OS_CFG_NUM_TASKS → 别名 8U）
    //    → 别名，避免把兄弟参数误当枚举选项（OS_TASK_COUNT 案例）
    if (fileDefines.has(v)) {
      const target = fileDefines.get(v)!;
      if (target.type === 'integer' || target.type === 'boolean' || target.type === 'number' || target.type === 'string') {
        base.type = target.type;
        base.default = target.default;
        if (target.min !== undefined) base.min = target.min;
        if (target.max !== undefined) base.max = target.max;
        const familyNote =
          siblings.size >= 1 ? `；同族可选: ${[...siblings].sort().join(' / ')}` : '';
        base.description = `${p.comment || p.name}（别名: ${v} = ${target.default}${familyNote}）`;
        return base;
      }
    }

    // 2) 值所在 enum 块的成员（WDGIF_FAST_MODE → WdgIf_ModeType 全部成员）
    const blockMembers = enumBlockMembers(moduleDir, v, dirTextCache);
    if (blockMembers.length >= 2) {
      base.type = 'enum';
      base.default = v;
      base.options = blockMembers;
      return base;
    }

    // 3) 同前缀族 ≥ 2 个标识符（文件 + 兄弟头文件 + 全局值池）
    //    （WDG_WINDOW_ERROR_ACTION → {RESET, IGNORE}）
    if (siblings.size >= 2) {
      base.type = 'enum';
      base.default = v;
      base.options = [v, ...[...siblings].sort()].filter((x, idx, arr) => arr.indexOf(x) === idx);
      return base;
    }

    // 别名解析: 引用同文件其它 define 的字面量（兜底，一般已被上面规则覆盖）
    const target = fileDefines.get(v);
    if (target && (target.type === 'integer' || target.type === 'boolean' || target.type === 'number' || target.type === 'string')) {
      base.type = target.type;
      base.default = target.default;
      if (target.min !== undefined) base.min = target.min;
      if (target.max !== undefined) base.max = target.max;
      base.description = `${p.comment || p.name}（别名: ${v} = ${target.default}）`;
      return base;
    }

    // 单值枚举
    base.type = 'enum';
    base.default = v;
    base.options = [v];
    return base;
  }

  // 表达式（位或/算术/宏派生）→ integer（描述记录原式）
  if (/^[0-9A-Za-z_().*&|+\-<>\s]+$/.test(v)) {
    base.type = 'integer';
    base.min = 0;
    base.max = MAX_U32;
    base.description = `${p.comment || p.name}（派生表达式: ${v}）`;
    return base;
  }

  // 兜底
  base.type = 'string';
  base.description = `${p.comment || `${p.name} 参数`}（原始值: ${p.raw}）`;
  return base;
}

/* ------------------------------------------------------------------ */
/* 模块组装                                                            */
/* ------------------------------------------------------------------ */

function layerForFile(relPath: string): string {
  const norm = relPath.replace(/\\/g, '/');
  for (const [dir, layer] of LAYER_DIRS) {
    if (norm.includes(`/${dir}/`) || norm.startsWith(`${dir}/`)) return layer;
  }
  return 'Service';
}

function displayNameForFile(fileName: string): string {
  return fileName.replace(/_Cfg\.h$/, '');
}

function extractBrief(content: string): string | undefined {
  const m = content.match(/@brief\s+([^\n]+)/);
  return m ? m[1].trim() : undefined;
}

/* ------------------------------------------------------------------ */
/* CPI 容器                                                            */
/* ------------------------------------------------------------------ */

function cpiContainer(): Record<string, unknown> {
  const cpiFields = [
    'ArReleaseMajorVersion',
    'ArReleaseMinorVersion',
    'ArReleaseRevisionVersion',
    'ModuleId',
    'SwMajorVersion',
    'SwMinorVersion',
    'SwPatchVersion',
    'VendorId',
  ];
  const props: Record<string, unknown> = {};
  for (const f of cfiFieldsSafe(cpiFields)) {
    props[f] = {
      type: 'integer',
      minimum: 0,
      maximum: 65535,
      description: `${f} 参数`,
    };
  }
  return {
    description: 'CommonPublishedInformation 配置容器',
    type: 'object',
    properties: props,
    additionalProperties: true,
  };
}

function cfiFieldsSafe(fields: string[]): string[] {
  return fields;
}

/* ------------------------------------------------------------------ */
/* 输出 JSON 组装                                                      */
/* ------------------------------------------------------------------ */

function toGeneratedJson(mod: ModuleResult, sourceRel: string): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  properties.CommonPublishedInformation = cpiContainer();
  for (const p of mod.params) {
    const prop: Record<string, unknown> = { type: p.type, description: p.description || `${p.name} 参数` };
    if (p.default !== undefined) prop.default = p.default;
    if (p.min !== undefined) prop.minimum = p.min;
    if (p.max !== undefined) prop.maximum = p.max;
    if (p.options && p.options.length > 0) prop.enum = p.options;
    if (p.referenceTarget) prop['x-reference-target'] = p.referenceTarget;
    if (p.section && p.section !== 'General') prop['x-section'] = p.section;
    properties[p.name] = prop;
  }

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://yuletech.io/schemas/modules/${mod.fileName}.json`,
    title: `${mod.displayName} Configuration`,
    description: mod.description,
    type: 'object',
    properties,
    additionalProperties: true,
    'x-layer': mod.layer,
    'x-version': mod.version,
    'x-source': 'CfgH-Extracted',
    'x-source-file': sourceRel,
    'x-display-name': mod.displayName,
    ...(mod.sections.length > 1 ? { 'x-sections': mod.sections } : {}),
  };
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */

function main(): void {
  const args = process.argv.slice(2);
  const yuleasrArg = args.indexOf('--yuleasr');
  const yuleasrRoot =
    (yuleasrArg >= 0 ? args[yuleasrArg + 1] : undefined) ||
    process.env.YULEASR_ROOT ||
    path.resolve(REPO_ROOT, '../yuleASR');
  const srcDir = path.join(yuleasrRoot, 'src');
  if (!fs.existsSync(srcDir)) {
    console.error(`[F1] yuleASR src 目录不存在: ${srcDir}`);
    console.error('      用法: npx tsx scripts/extract-schemas-from-cfgh.ts --yuleasr <yuleASR-root>');
    process.exit(1);
  }

  fs.mkdirSync(VERIFY_DIR, { recursive: true });
  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  // 收集全部 Cfg.h
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('_Cfg.h')) files.push(full);
    }
  };
  walk(srcDir);
  files.sort();
  console.log(`[F1] 发现 yuleASR *_Cfg.h: ${files.length}`);

  // 全局标识符池（全部 Cfg.h 的标识符值）
  const globalIdentifiers = new Set<string>();
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const parsed = parseCfgHeader(content);
    for (const p of parsed.params) {
      if (!p.multilineObject && /^[A-Z][A-Z0-9_]*$/.test(p.value)) globalIdentifiers.add(p.value);
    }
  }

  const dirTextCache = new Map<string, string>();
  const results: ModuleResult[] = [];

  for (const f of files) {
    const rel = path.relative(yuleasrRoot, f).replace(/\\/g, '/');
    const baseName = path.basename(f);
    const displayName = displayNameForFile(baseName);
    const content = fs.readFileSync(f, 'utf8');

    const parsed = parseCfgHeader(content);

    // 文件级 define 表（供别名解析: 仅字面量）
    const fileDefines = new Map<string, TypedParam>();
    const fileIdentifiers = new Set<string>();
    for (const p of parsed.params) {
      if (p.multilineObject) continue;
      fileIdentifiers.add(p.name); // define 名也参与前缀族收集
      if (/^[A-Z][A-Z0-9_]*$/.test(p.value)) fileIdentifiers.add(p.value);
      const t = inferParamType(p, new Map(), new Set(), globalIdentifiers, path.dirname(f), dirTextCache);
      if (t.type !== 'enum' && t.default !== undefined && (t.type === 'integer' || t.type === 'boolean' || t.type === 'number' || t.type === 'string')) {
        fileDefines.set(p.name, t);
      }
    }

    // 正式推断
    const typed: TypedParam[] = [];
    for (const p of parsed.params) {
      typed.push(inferParamType(p, fileDefines, fileIdentifiers, globalIdentifiers, path.dirname(f), dirTextCache));
    }

    // 分节列表（按出现顺序）
    const sections: string[] = [];
    for (const p of parsed.params) {
      if (p.section !== 'General' && !sections.includes(p.section)) sections.push(p.section);
    }

    const brief = extractBrief(content);
    const mod: ModuleResult = {
      displayName,
      fileName: displayName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      layer: layerForFile(rel),
      sourceFile: rel,
      version: '4.4.0',
      description: brief || `${displayName} configuration (extracted from yuleASR Cfg.h)`,
      params: typed,
      sections,
    };
    results.push(mod);
  }

  // 统计 + 重名分组
  const byName = new Map<string, ModuleResult[]>();
  for (const r of results) {
    const arr = byName.get(r.displayName) || [];
    arr.push(r);
    byName.set(r.displayName, arr);
  }

  // 重名优先级: services > mcal > ecual（Fee/RamTst 以 AUTOSAR 规范层 MCAL 为准；
  // Dem 存在 legacy 副本 → 作为 Dem_Legacy 副版保留，保证 110 全覆盖）
  const IS_LEGACY = (r: ModuleResult): boolean => r.sourceFile.includes('/legacy/');
  const PREFER_MCAL = new Set(['Fee', 'RamTst']);
  const layerRank = (layer: string): number =>
    layer === 'Service' ? 0 : layer === 'MCAL' ? 1 : layer === 'RTE' ? 2 : layer === 'ECUAL' ? 3 : 4;

  const canonical = new Map<string, ModuleResult>();
  const dupSecondary: ModuleResult[] = [];
  for (const [name, arr] of byName) {
    if (arr.length === 1) {
      canonical.set(name, arr[0]);
      continue;
    }
    const usable = arr.filter(r => !IS_LEGACY(r));
    if (usable.length === 0) usable.push(arr[0]);
    const sorted = [...usable].sort((a, b) => {
      const aMcal = PREFER_MCAL.has(a.displayName) && a.layer === 'MCAL' ? -1 : 0;
      const bMcal = PREFER_MCAL.has(b.displayName) && b.layer === 'MCAL' ? -1 : 0;
      if (aMcal !== bMcal) return aMcal - bMcal;
      return layerRank(a.layer) - layerRank(b.layer);
    });
    canonical.set(name, sorted[0]);
    for (const other of sorted.slice(1)) {
      const dup: ModuleResult = {
        ...other,
        displayName: `${other.displayName}_${other.layer === 'MCAL' ? 'Mcal' : other.layer === 'ECUAL' ? 'Ecual' : 'Service'}`,
        fileName: `${other.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${(other.layer === 'MCAL' ? 'mcal' : other.layer === 'ECUAL' ? 'ecual' : 'service')}`,
      };
      dupSecondary.push(dup);
    }
    // legacy 副本 → 副版 Dem_Legacy
    for (const r of arr.filter(IS_LEGACY)) {
      dupSecondary.push({
        ...r,
        displayName: `${r.displayName}_Legacy`,
        fileName: `${r.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}_legacy`,
      });
      console.log(`[F1] Dem legacy 副本 → ${r.displayName}_Legacy (${r.sourceFile})`);
    }
  }

  const all = [...canonical.values(), ...dupSecondary];
  console.log(`[F1] 提取模块 schema 总数: ${all.length}（canonical ${canonical.size} + 重名副版 ${dupSecondary.length}）`);
  console.log(`[F1] 重名模块: ${[...byName.entries()].filter(([, v]) => v.length > 1).map(([n]) => n).join(', ')}`);

  // ---- 提取版全量写入 verification/（110 个，供审计 + F1 抽查）----
  fs.rmSync(VERIFY_DIR, { recursive: true, force: true });
  fs.mkdirSync(VERIFY_DIR, { recursive: true });
  for (const mod of all) {
    fs.writeFileSync(
      path.join(VERIFY_DIR, `${mod.fileName}.json`),
      JSON.stringify(toGeneratedJson(mod, mod.sourceFile), null, 2) + '\n',
      'utf8'
    );
  }
  const verifyCount = fs.readdirSync(VERIFY_DIR).filter(f => f.endsWith('.json')).length;
  console.log(`[F1] verification/extracted-cfgh: ${verifyCount} 个提取版 schema`);

  // ---- 合并到 generated/ ----
  // 现有文件若带 x-source=CfgH-Extracted（本脚本之前生成的）→ 重新生成覆盖；
  // 无标记的（手写/ARXML 提取的原始 54 个）→ 重名时保留现有更完整者。
  const existingFiles = fs.existsSync(GENERATED_DIR)
    ? fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.json')).sort()
    : [];
  const priorExtracted = new Set<string>();
  for (const f of existingFiles) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, f), 'utf8'));
      if (j['x-source'] === 'CfgH-Extracted') priorExtracted.add(f.replace(/\.json$/, ''));
    } catch {
      /* 忽略解析失败 */
    }
  }

  let written = 0;
  let keptExisting = 0;
  const keptList: string[] = [];
  for (const mod of all) {
    const target = path.join(GENERATED_DIR, `${mod.fileName}.json`);
    const isOriginal = !priorExtracted.has(mod.fileName) && existingFiles.includes(`${mod.fileName}.json`);
    if (isOriginal) {
      // 现有更完整者保留（现有带手写容器/crossReferences，validator 测试消费）
      keptExisting++;
      keptList.push(mod.displayName);
      continue;
    }
    fs.writeFileSync(target, JSON.stringify(toGeneratedJson(mod, mod.sourceFile), null, 2) + '\n', 'utf8');
    written++;
  }
  console.log(`[F1] 合并结果: 新增写入 generated/ ${written} 个; 与现有重名保留现有 ${keptExisting} 个 → ${keptList.join(', ')}`);

  // ---- 重写 index.ts ----
  const oldIndex = path.join(GENERATED_DIR, 'index.ts');
  const oldMap = new Map<string, string>();
  if (fs.existsSync(oldIndex)) {
    const text = fs.readFileSync(oldIndex, 'utf8');
    for (const m of text.matchAll(/export\s*\{\s*default\s+as\s+([A-Za-z0-9_]+)\s*\}\s*from\s*'\.\/([a-z0-9_]+)\.json'/g)) {
      oldMap.set(m[2], m[1]);
    }
  }

  const finalJson = fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.json')).sort();
  const lines: string[] = [];
  for (const f of finalJson) {
    const key = f.replace(/\.json$/, '');
    let exportName = oldMap.get(key);
    if (!exportName) {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, f), 'utf8'));
        exportName = (j['x-display-name'] as string) || key;
      } catch {
        exportName = key;
      }
    }
    lines.push(`export { default as ${exportName} } from './${f}';`);
  }
  lines.sort();
  fs.writeFileSync(oldIndex, `// Auto-generated by scripts/extract-schemas-from-cfgh.ts — DO NOT EDIT\n${lines.join('\n')}\n`, 'utf8');

  console.log(`[F1] generated/ 最终 JSON 数量: ${finalJson.length}; index.ts 导出 ${lines.length} 个`);
  console.log(`[F1] 层分布: ${stats(all)}`);

  // 层统计
  function stats(mods: ModuleResult[]): string {
    const c = new Map<string, number>();
    for (const m of mods) c.set(m.layer, (c.get(m.layer) || 0) + 1);
    return [...c.entries()].map(([k, v]) => `${k}=${v}`).join(' ');
  }
}

main();

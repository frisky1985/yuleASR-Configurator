#!/usr/bin/env npx tsx
/**
 * generate-ecuc-defs-from-schema.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * 方案④：从修复后的 schema/generated/*.json（117 模块）反向生成标准
 * ECUC-MODULE-DEF 定义层 ARXML（AUTOSAR R4.0 形态），补上"标准模板"缺口。
 *
 * 结构映射（schema → ECUC 定义层）：
 *   模块（schema 文件）        → <ECUC-MODULE-DEF><SHORT-NAME>模块名</SHORT-NAME>
 *   顶层非 object 属性（模块级参数）→ <PARAMETER-DEFS>（模块级参数定义）
 *   顶层 object 属性（容器）    → <CONTAINER-DEFS><ECUC-CONTAINER-DEF>（含 PARAMETER-DEFS）
 *
 * 类型映射（JSON Schema type → ECUC-PARAM-DEF 族）：
 *   boolean            → ECUC-BOOLEAN-PARAM-DEF
 *   integer（含 integer+enum）→ ECUC-INTEGER-PARAM-DEF（可带 MIN/MAX）
 *   number             → ECUC-FLOAT-PARAM-DEF
 *   string（无 enum）   → ECUC-STRING-PARAM-DEF
 *   string+enum / enum → ECUC-ENUMERATION-PARAM-DEF + LITERALS
 *   reference          → ECUC-REFERENCE-DEF
 *   array / 其他       → 跳过（ECUC-PARAM-DEF 族不可表达，见 SKIPPED 统计）
 *
 * Multiplicity（schema 无信息时显式补默认）：
 *   参数：   0..1（LOWER-MULTIPLICITY=0, UPPER-MULTIPLICITY=1）
 *   容器：   0..*（LOWER-MULTIPLICITY=0, UPPER-MULTIPLICITY=-1，-1 为 AUTOSAR 不限约定）
 *
 * 输出：/tmp/ecuc-defs-generated/<模块名>.arxml（每模块一个文件，便于对比）
 *
 * 用法：
 *   npx tsx scripts/generate-ecuc-defs-from-schema.ts [--out <dir>] [--no-min-max]
 *
 * 纪律：只读 schema/generated/，不修改任何现有源码；本脚本仅新增。
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** schema/generated 目录（唯一事实来源，只读） */
export const SCHEMA_DIR = join(__dirname, '../packages/@yuletech/core/src/schema/generated');

/** 默认输出目录（每模块一个 ARXML 文件） */
export const DEFAULT_OUTPUT_DIR = '/tmp/ecuc-defs-generated';

/** 生成 ARXML 时是否输出 MIN/MAX（integer 参数；reader R8 边界未建模 → 会产生 Unprocessed 告警，不影响结构闭环） */
export const DEFAULT_EMIT_MIN_MAX = true;

// ── 类型定义 ────────────────────────────────────────────────────────────────

/** 参数分类结果（schema 属性 → ECUC 定义层可表达性） */
export type ParamClass =
  | { kind: 'boolean' }
  | { kind: 'integer' }
  | { kind: 'float' }
  | { kind: 'string' }
  | { kind: 'enum'; literals: string[] }
  | { kind: 'reference' }
  | { kind: 'skip'; reason: string };

/** 生成的模块定义（供 round-trip 验证脚本复用的中间视图） */
export interface GeneratedModule {
  /** 模块名（schema title 去 " Configuration" 后缀） */
  moduleName: string;
  /** schema 源文件名 */
  sourceFile: string;
  /** 模块级参数（按 schema 属性顺序） */
  moduleParams: Array<{ name: string; schema: Record<string, unknown>; cls: ParamClass }>;
  /** 容器 → 参数（按 schema 属性顺序） */
  containers: Array<{
    name: string;
    params: Array<{ name: string; schema: Record<string, unknown>; cls: ParamClass }>;
  }>;
  /** 被跳过的参数（不可表达） */
  skipped: Array<{ container: string | null; name: string; reason: string }>;
}

export interface SchemaDoc {
  title?: string;
  properties?: Record<string, Record<string, unknown>>;
  [k: string]: unknown;
}

// ── 核心映射 ────────────────────────────────────────────────────────────────

/** 模块名：title "Xxx Configuration" → "Xxx"；无 title 时退回文件名（首字母大写） */
export function moduleNameFromSchema(schema: SchemaDoc, fileName: string): string {
  if (schema.title) {
    const t = schema.title.trim();
    if (t.endsWith(' Configuration')) return t.slice(0, -' Configuration'.length).trim();
    return t;
  }
  const base = fileName.replace(/\.json$/, '');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** 分类单个 schema 属性 → ECUC 参数定义类别（type 优先；enum 仅在 string/enum 上表达） */
export function classifyParam(pval: Record<string, unknown> | undefined): ParamClass {
  if (!pval || typeof pval !== 'object') return { kind: 'skip', reason: '属性无 schema 对象' };
  const t = pval.type;
  switch (t) {
    case 'boolean':
      return { kind: 'boolean' };
    case 'integer':
      // integer+enum（如 McuResetReason/OsIsrCategory/SpiDataWidth）：主类型 integer，
      // enum 为符号常量语义，定义层按 ECUC-INTEGER-PARAM-DEF 表达（LITERALS 不适用）
      return { kind: 'integer' };
    case 'number':
      return { kind: 'float' };
    case 'string':
      if (Array.isArray(pval.enum) && pval.enum.length > 0) {
        return { kind: 'enum', literals: pval.enum.map(String) };
      }
      return { kind: 'string' };
    case 'enum':
      if (Array.isArray(pval.enum) && pval.enum.length > 0) {
        return { kind: 'enum', literals: pval.enum.map(String) };
      }
      return { kind: 'skip', reason: 'enum 类型但无 LITERALS' };
    case 'reference':
      return { kind: 'reference' };
    case 'array':
      return { kind: 'skip', reason: 'array 类型（ECUC-PARAM-DEF 族不可表达）' };
    default:
      return { kind: 'skip', reason: `未分类类型 ${JSON.stringify(t)}` };
  }
}

/** 构建单个模块的定义视图（schema → 中间模型，生成与验证共用） */
export function buildGeneratedModule(schema: SchemaDoc, sourceFile: string): GeneratedModule {
  const moduleName = moduleNameFromSchema(schema, sourceFile);
  const props = schema.properties ?? {};
  const module: GeneratedModule = {
    moduleName,
    sourceFile,
    moduleParams: [],
    containers: [],
    skipped: [],
  };

  for (const [pname, pval] of Object.entries(props)) {
    const cls = classifyParam(pval);
    if (pval && pval.type === 'object') {
      const params: GeneratedModule['containers'][number]['params'] = [];
      for (const [pname2, pval2] of Object.entries(
        (pval.properties ?? {}) as Record<string, Record<string, unknown>>
      )) {
        const cls2 = classifyParam(pval2);
        if (cls2.kind === 'skip') {
          module.skipped.push({ container: pname, name: pname2, reason: cls2.reason });
          continue;
        }
        params.push({ name: pname2, schema: pval2, cls: cls2 });
      }
      module.containers.push({ name: pname, params });
    } else if (cls.kind === 'skip') {
      module.skipped.push({ container: null, name: pname, reason: cls.reason });
    } else {
      module.moduleParams.push({ name: pname, schema: pval, cls });
    }
  }
  return module;
}

// ── XML 生成 ────────────────────────────────────────────────────────────────

export function xmlEncode(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 参数默认值（schema default 非空时输出；reference 的 default:null 不输出） */
function defaultValueOf(schema: Record<string, unknown>): string | undefined {
  const d = schema.default;
  if (d === undefined || d === null) return undefined;
  if (typeof d === 'boolean') return d ? 'true' : 'false';
  return String(d);
}

function emitParamDef(
  name: string,
  schema: Record<string, unknown>,
  cls: ParamClass,
  indent: string,
  emitMinMax: boolean
): string[] {
  const tagByKind: Record<string, string> = {
    boolean: 'ECUC-BOOLEAN-PARAM-DEF',
    integer: 'ECUC-INTEGER-PARAM-DEF',
    float: 'ECUC-FLOAT-PARAM-DEF',
    string: 'ECUC-STRING-PARAM-DEF',
    enum: 'ECUC-ENUMERATION-PARAM-DEF',
    reference: 'ECUC-REFERENCE-DEF',
  };
  const lines = [`${indent}<${tagByKind[cls.kind]}>`];
  lines.push(`${indent}  <SHORT-NAME>${xmlEncode(name)}</SHORT-NAME>`);
  lines.push(`${indent}  <LOWER-MULTIPLICITY>0</LOWER-MULTIPLICITY>`);
  lines.push(`${indent}  <UPPER-MULTIPLICITY>1</UPPER-MULTIPLICITY>`);
  if (cls.kind === 'integer' && emitMinMax) {
    if (typeof schema.minimum === 'number') lines.push(`${indent}  <MIN>${schema.minimum}</MIN>`);
    if (typeof schema.maximum === 'number') lines.push(`${indent}  <MAX>${schema.maximum}</MAX>`);
  }
  const dflt = defaultValueOf(schema);
  if (dflt !== undefined)
    lines.push(`${indent}  <DEFAULT-VALUE>${xmlEncode(dflt)}</DEFAULT-VALUE>`);
  if (cls.kind === 'enum') {
    const literals = (cls as { literals: string[] }).literals;
    lines.push(`${indent}  <LITERALS>`);
    for (const lit of literals) {
      lines.push(
        `${indent}    <ECUC-ENUMERATION-LITERAL-DEF><SHORT-NAME>${xmlEncode(lit)}</SHORT-NAME></ECUC-ENUMERATION-LITERAL-DEF>`
      );
    }
    lines.push(`${indent}  </LITERALS>`);
  }
  lines.push(`${indent}</${tagByKind[cls.kind]}>`);
  return lines;
}

/** 单个模块 → ECUC-MODULE-DEF ARXML 文档（AUTOSAR R4.0） */
export function moduleToEcucDefArxml(module: GeneratedModule, emitMinMax: boolean): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<AUTOSAR xmlns="http://autosar.org/schema/r4.0">');
  lines.push('  <AR-PACKAGES>');
  lines.push('    <AR-PACKAGE>');
  lines.push('      <SHORT-NAME>EcucDefs</SHORT-NAME>');
  lines.push('      <ELEMENTS>');
  lines.push('        <ECUC-MODULE-DEF>');
  lines.push(`          <SHORT-NAME>${xmlEncode(module.moduleName)}</SHORT-NAME>`);

  if (module.moduleParams.length > 0) {
    lines.push('          <PARAMETER-DEFS>');
    for (const p of module.moduleParams) {
      lines.push(...emitParamDef(p.name, p.schema, p.cls, '            ', emitMinMax));
    }
    lines.push('          </PARAMETER-DEFS>');
  }

  if (module.containers.length > 0) {
    lines.push('          <CONTAINER-DEFS>');
    for (const c of module.containers) {
      lines.push('            <ECUC-CONTAINER-DEF>');
      lines.push(`              <SHORT-NAME>${xmlEncode(c.name)}</SHORT-NAME>`);
      lines.push('              <LOWER-MULTIPLICITY>0</LOWER-MULTIPLICITY>');
      lines.push('              <UPPER-MULTIPLICITY>-1</UPPER-MULTIPLICITY>');
      if (c.params.length > 0) {
        lines.push('              <PARAMETER-DEFS>');
        for (const p of c.params) {
          lines.push(...emitParamDef(p.name, p.schema, p.cls, '                ', emitMinMax));
        }
        lines.push('              </PARAMETER-DEFS>');
      }
      lines.push('            </ECUC-CONTAINER-DEF>');
    }
    lines.push('          </CONTAINER-DEFS>');
  }

  lines.push('        </ECUC-MODULE-DEF>');
  lines.push('      </ELEMENTS>');
  lines.push('    </AR-PACKAGE>');
  lines.push('  </AR-PACKAGES>');
  lines.push('</AUTOSAR>');
  lines.push('');
  return lines.join('\n');
}

// ── 加载与生成 ──────────────────────────────────────────────────────────────

export function loadSchemas(
  schemaDir: string = SCHEMA_DIR
): Array<{ file: string; schema: SchemaDoc }> {
  return readdirSync(schemaDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => ({
      file: f,
      schema: JSON.parse(readFileSync(join(schemaDir, f), 'utf8')) as SchemaDoc,
    }));
}

export function generateAllModules(
  schemas: Array<{ file: string; schema: SchemaDoc }>
): GeneratedModule[] {
  return schemas.map(({ file, schema }) => buildGeneratedModule(schema, file));
}

// ── CLI 入口 ────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): { outDir: string; emitMinMax: boolean } {
  let outDir = DEFAULT_OUTPUT_DIR;
  let emitMinMax = DEFAULT_EMIT_MIN_MAX;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out' && argv[i + 1]) {
      outDir = argv[i + 1];
      i++;
    } else if (argv[i] === '--no-min-max') {
      emitMinMax = false;
    }
  }
  return { outDir, emitMinMax };
}

function main(): void {
  const { outDir, emitMinMax } = parseArgs(process.argv.slice(2));
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const schemas = loadSchemas();
  const modules = generateAllModules(schemas);

  let containers = 0;
  let params = 0;
  let skipped = 0;
  for (const m of modules) {
    const arxml = moduleToEcucDefArxml(m, emitMinMax);
    writeFileSync(join(outDir, `${m.moduleName}.arxml`), arxml, 'utf8');
    containers += m.containers.length;
    params += m.moduleParams.length + m.containers.reduce((n, c) => n + c.params.length, 0);
    skipped += m.skipped.length;
  }

  console.log(`✅ 生成完成: ${modules.length} 个模块定义 ARXML → ${outDir}`);
  console.log(`   容器定义: ${containers}，参数定义: ${params}，跳过（不可表达）: ${skipped}`);
  console.log(`   MIN/MAX 输出: ${emitMinMax ? '是' : '否（--no-min-max）'}`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-ecuc-defs-from-schema.ts')) {
  main();
}

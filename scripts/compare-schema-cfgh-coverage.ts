#!/usr/bin/env tsx
/**
 * YAC-VER-001 — schema 参数全集 ↔ yuleASR *_Cfg.h 宏全集 双向机器对比
 *
 * 与 scripts/verify-extracted-schemas.ts（F1 验证，单向：yuleASR 宏 → schema 覆盖）互补，
 * 本脚本补三个方向：
 *   1) 缺失配置项：yuleASR 手写头有宏、schema properties 无（合理缺省需在报告中解释；
 *      函数式宏/别名宏经 x-verbatim-defines 原样透传视为已覆盖）
 *   2) 多余配置项：schema properties 有、yuleASR 手写头无对应宏（config container 等
 *      需解释；容器叶参数才是真实宏）
 *   3) 默认值不一致：schema defaultValue（归一化）vs 手写头宏值（C 表达式归一化）
 *      —— STD_ON/TRUE→true、STD_OFF/FALSE→false、去括号/后缀、hex/dec 数值比较
 *
 * 用法: npx tsx scripts/compare-schema-cfgh-coverage.ts [--yuleasr <root>] [--json <out>]
 * 退出码: 0 = 无"未解释缺口"（本脚本只做机器对比，缺口的解释/修复在报告文档）；
 *         1 = 解析/IO 错误
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CFGH_DIR = path.join(REPO_ROOT, 'verification/extracted-cfgh');

const args = process.argv.slice(2);
const yuleasrArg = args.indexOf('--yuleasr');
const jsonArg = args.indexOf('--json');
const yuleasrRoot =
  (yuleasrArg >= 0 ? args[yuleasrArg + 1] : undefined) ||
  process.env.YULEASR_ROOT ||
  path.resolve(REPO_ROOT, '../yuleASR');

const DEFINE_RE = /^[ \t]*#[ \t]*define[ \t]+([A-Za-z_][A-Za-z0-9_]*)[ \t]*(.*)$/;
const GUARD_RE = /_CFG_H$/;

interface Row {
  module: string;
  sourceFile: string | undefined;
  nMacros: number;
  nProps: number;
  missing: string[]; // yuleASR 有宏、schema 无（且非 verbatim 透传）
  missingVerbatim: string[]; // 同上但经 x-verbatim-defines 透传覆盖
  extra: string[]; // schema 有、yuleASR 无宏
  mismatches: { name: string; schemaDefault: unknown; handwritten: string }[];
}

function macrosOf(file: string): Map<string, string> {
  const out = new Map<string, string>();
  if (!fs.existsSync(file)) return out;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(DEFINE_RE);
    if (!m) continue;
    const name = m[1];
    if (GUARD_RE.test(name)) continue;
    out.set(name, m[2].trim());
  }
  return out;
}

/** C 宏值归一化 → [kind, value] */
function normValue(s: string): [string, unknown] | null {
  let t = s.replace(/\/\*.*?\*\//g, ' ').trim().replace(/\s*\/\/.*$/, '').trim();
  if (!t) return null;
  const up = t.toUpperCase();
  if (['STD_ON', 'TRUE', 'STD_HIGH'].includes(up)) return ['bool', true];
  if (['STD_OFF', 'FALSE', 'STD_LOW'].includes(up)) return ['bool', false];
  if (t.startsWith('"')) return ['str', t];
  // 外层括号整体展开（仅当左右括号完全包裹整个表达式）
  while (t.startsWith('(') && t.endsWith(')')) {
    let depth = 0;
    let wraps = true;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === '(') depth++;
      else if (t[i] === ')') {
        depth--;
        if (depth === 0 && i !== t.length - 1) {
          wraps = false;
          break;
        }
      }
    }
    if (!wraps) break;
    t = t.slice(1, -1).trim();
  }
  let m = t.match(/^(-?0[xX][0-9a-fA-F]+|-?\d+)[uUlL]*$/);
  if (m) {
    const v = m[1];
    return ['int', v.toLowerCase().startsWith('0x') ? parseInt(v, 16) : parseInt(v, 10)];
  }
  m = t.match(/^(-?\d+\.\d+)[fF]?$/);
  if (m) return ['float', parseFloat(m[1])];
  return ['expr', t];
}

/** schema defaultValue 归一化 → [kind, value] */
function normSchemaVal(v: unknown): [string, unknown] | null {
  if (typeof v === 'boolean') return ['bool', v];
  if (typeof v === 'number') return ['num', v];
  if (typeof v === 'string') {
    if (v.startsWith('"')) return ['str', v];
    const m = v.match(/^(-?0[xX][0-9a-fA-F]+|-?\d+)[uUlL]*$/);
    if (m) {
      const x = m[1];
      return ['int', x.toLowerCase().startsWith('0x') ? parseInt(x, 16) : parseInt(x, 10)];
    }
    const f = v.match(/^(-?\d+\.\d+)[fF]?$/);
    if (f) return ['float', parseFloat(f[1])];
    return ['sym', v];
  }
  return ['sym', String(v)];
}

function verbatimNames(schema: any): Set<string> {
  const out = new Set<string>();
  const defs = schema['x-verbatim-defines'];
  if (!Array.isArray(defs)) return out;
  for (const block of defs) {
    if (typeof block !== 'string') continue;
    for (const m of block.matchAll(/^[ \t]*#[ \t]*define[ \t]+([A-Za-z_][A-Za-z0-9_]*)/gm)) out.add(m[1]);
  }
  return out;
}

function compare(): Row[] {
  const rows: Row[] = [];
  for (const f of fs.readdirSync(CFGH_DIR).filter(x => x.endsWith('.json')).sort()) {
    const stem = f.replace(/\.json$/, '');
    const schema = JSON.parse(fs.readFileSync(path.join(CFGH_DIR, f), 'utf8'));
    const src = schema['x-source-file'] as string | undefined;
    const props: Record<string, any> = schema.properties || {};
    const macros = macrosOf(src ? path.join(yuleasrRoot, src) : '');
    const macroNames = new Set(macros.keys());
    const propNames = new Set(Object.keys(props));
    const verbatim = verbatimNames(schema);

    const missing: string[] = [];
    const missingVerbatim: string[] = [];
    for (const n of macroNames) {
      if (propNames.has(n)) continue;
      if (verbatim.has(n)) missingVerbatim.push(n);
      else missing.push(n);
    }
    const extra = [...propNames].filter(n => !macroNames.has(n)).sort();

    const mismatches: Row['mismatches'] = [];
    for (const name of [...macroNames].filter(n => propNames.has(n)).sort()) {
      const prop = props[name];
      const dv = 'defaultValue' in prop ? prop.defaultValue : 'default' in prop ? prop.default : undefined;
      if (dv === undefined) continue;
      const nv = normValue(macros.get(name)!);
      const sv = normSchemaVal(dv);
      if (!nv || !sv) continue;
      if (nv[0] === 'bool' && sv[0] === 'bool') {
        if (nv[1] !== sv[1]) mismatches.push({ name, schemaDefault: dv, handwritten: macros.get(name)! });
      } else if ((nv[0] === 'int' || nv[0] === 'num' || nv[0] === 'float') && (sv[0] === 'int' || sv[0] === 'num' || sv[0] === 'float')) {
        if (Number(nv[1]) !== Number(sv[1])) mismatches.push({ name, schemaDefault: dv, handwritten: macros.get(name)! });
      } else if (nv[0] === 'str' && sv[0] === 'str') {
        if (nv[1] !== sv[1]) mismatches.push({ name, schemaDefault: dv, handwritten: macros.get(name)! });
      }
    }

    rows.push({
      module: stem,
      sourceFile: src,
      nMacros: macroNames.size,
      nProps: propNames.size,
      missing: missing.sort(),
      missingVerbatim: missingVerbatim.sort(),
      extra,
      mismatches,
    });
  }
  return rows;
}

function main(): number {
  if (!fs.existsSync(path.join(yuleasrRoot, 'src'))) {
    console.error(`[VER-001] yuleASR src 不存在: ${yuleasrRoot}`);
    return 1;
  }
  const rows = compare();
  const nMissing = rows.reduce((a, r) => a + r.missing.length, 0);
  const nVerbatim = rows.reduce((a, r) => a + r.missingVerbatim.length, 0);
  const nExtra = rows.reduce((a, r) => a + r.extra.length, 0);
  const nMm = rows.reduce((a, r) => a + r.mismatches.length, 0);

  const out = { generatedAt: new Date().toISOString(), yuleasrRoot, totalModules: rows.length, summary: { missing: nMissing, verbatimCovered: nVerbatim, extra: nExtra, defaultMismatch: nMm }, rows };
  const jsonPath = jsonArg >= 0 ? args[jsonArg + 1] : undefined;
  if (jsonPath) fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2));

  console.log(`[VER-001] 模块数: ${rows.length}; 缺失配置项: ${nMissing}; verbatim 透传覆盖: ${nVerbatim}; 多余配置项: ${nExtra}; 默认值不一致: ${nMm}`);
  for (const r of rows) {
    if (r.missing.length) console.log(`  [missing] ${r.module}: ${r.missing.join(', ')}`);
    if (r.missingVerbatim.length) console.log(`  [verbatim] ${r.module}: ${r.missingVerbatim.join(', ')}`);
    if (r.extra.length) console.log(`  [extra] ${r.module}: ${r.extra.join(', ')}`);
    for (const m of r.mismatches) console.log(`  [mismatch] ${r.module}.${m.name}: schema=${JSON.stringify(m.schemaDefault)} vs 手写=${m.handwritten}`);
  }
  return 0;
}

process.exit(main());

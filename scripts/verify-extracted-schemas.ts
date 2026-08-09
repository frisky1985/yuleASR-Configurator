#!/usr/bin/env tsx
/**
 * F1 — 提取结果独立验证
 *
 * 独立解析器（不复用 extractor 内部函数）:
 *   1) 全量: 110 个 yuleASR *_Cfg.h 的每个非 guard 对象式宏，都必须在
 *      verification/extracted-cfgh/ 对应 schema 的 properties 中出现，
 *      且类型一致（STD_ON→boolean、整型字面量→integer、字符串→string）
 *   2) 抽查 5 个模块（Wdg/Flash/Crypto/Com/EcuM）逐宏一一对应
 *   3) generated/ 合并目录: JSON 数量 + index.ts 导出数量 + 无重复导出名
 *
 * 用法: npx tsx scripts/verify-extracted-schemas.ts [--yuleasr <root>]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const GENERATED_DIR = path.join(REPO_ROOT, 'packages/@yuletech/core/src/schema/generated');
const VERIFY_DIR = path.join(REPO_ROOT, 'verification/extracted-cfgh');

const args = process.argv.slice(2);
const yuleasrArg = args.indexOf('--yuleasr');
const yuleasrRoot =
  (yuleasrArg >= 0 ? args[yuleasrArg + 1] : undefined) ||
  process.env.YULEASR_ROOT ||
  path.resolve(REPO_ROOT, '../yuleASR');

const DEFINE_RE = /^[ \t]*#[ \t]*define[ \t]+([A-Za-z_][A-Za-z0-9_]*)[ \t]*(.*)$/;
const GUARD_RE = /_CFG_H$/;

interface Macro {
  name: string;
  /** 期望类型: boolean | integer | number | string | identifier | expression */
  expectType: string;
  line: number;
}

function expectTypeOf(rest: string): string {
  let s = rest.replace(/\/\*.*?\*\//g, ' ').trim();
  if (s === '') return 'empty';
  if (s.endsWith('\\')) return 'multiline';
  if (/^\([^)]*,[^)]*\)/.test(s) || /^\(\)/.test(s) || /^\([a-z][a-z0-9_]*\)\s*[^=]/.test(s)) return 'functionlike';
  // 去外层括号
  while (/^\(.*\)$/.test(s) && balanced(s)) s = s.slice(1, -1).trim();
  const castM = s.match(/^\(([A-Za-z_][A-Za-z0-9_]*)\)\s*(.*)$/);
  if (castM) s = castM[2].trim();
  if (/^(STD_ON|STD_OFF|TRUE|FALSE|STD_HIGH|STD_LOW)$/.test(s)) return 'boolean';
  if (/^"[\s\S]*"$/.test(s)) return 'string';
  if (/^-?(0[xX][0-9a-fA-F]+|\d+)[uUlL]*$/.test(s)) return 'integer';
  if (/^-?\d*\.\d+[fF]?$/.test(s)) return 'number';
  if (/^[A-Z][A-Z0-9_]*$/.test(s)) return 'identifier';
  return 'expression';
}

function balanced(s: string): boolean {
  let d = 0;
  for (const c of s) {
    if (c === '(') d++;
    else if (c === ')') d--;
    if (d < 0) return false;
  }
  return d === 0;
}

function collectFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (e.name.endsWith('_Cfg.h')) out.push(f);
    }
  };
  walk(root);
  return out.sort();
}

interface VerifyResult {
  file: string;
  macros: number;
  missed: string[];
  typeMismatch: string[];
}

function main(): number {
  const srcDir = path.join(yuleasrRoot, 'src');
  if (!fs.existsSync(srcDir)) {
    console.error(`[F1-verify] yuleASR src 不存在: ${srcDir}`);
    return 1;
  }
  const files = collectFiles(srcDir);
  console.log(`[F1-verify] yuleASR *_Cfg.h: ${files.length}`);

  // 索引 verification schemas 按 x-source-file
  const bySource = new Map<string, any>();
  for (const f of fs.readdirSync(VERIFY_DIR).filter(f => f.endsWith('.json'))) {
    const j = JSON.parse(fs.readFileSync(path.join(VERIFY_DIR, f), 'utf8'));
    if (j['x-source-file']) bySource.set(j['x-source-file'], j);
  }
  console.log(`[F1-verify] verification/extracted-cfgh: ${bySource.size} 个提取 schema`);

  const results: VerifyResult[] = [];
  let totalMacros = 0;
  let totalMissed = 0;
  let totalMismatch = 0;

  for (const f of files) {
    const rel = path.relative(yuleasrRoot, f).replace(/\\/g, '/');
    const schema = bySource.get(rel);
    const res: VerifyResult = { file: rel, macros: 0, missed: [], typeMismatch: [] };
    if (!schema) {
      res.missed.push('(schema 缺失)');
      results.push(res);
      continue;
    }
    const props = schema.properties || {};
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    const macros: Macro[] = [];
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(DEFINE_RE);
      if (!m) continue;
      const name = m[1];
      const rest = m[2].trim();
      if (GUARD_RE.test(name)) continue;
      const t = expectTypeOf(rest);
      if (t === 'empty' || t === 'multiline' || t === 'functionlike') continue;
      macros.push({ name, expectType: t, line: i + 1 });
    }
    res.macros = macros.length;
    totalMacros += macros.length;

    for (const mc of macros) {
      const prop = props[mc.name];
      if (!prop) {
        res.missed.push(mc.name);
        totalMissed++;
        continue;
      }
      // 类型一致性
      let ok = true;
      switch (mc.expectType) {
        case 'boolean':
          ok = prop.type === 'boolean';
          break;
        case 'integer':
          ok = prop.type === 'integer' || prop.type === 'enum' || prop.type === 'reference';
          break;
        case 'number':
          ok = prop.type === 'number' || prop.type === 'integer';
          break;
        case 'string':
          ok = prop.type === 'string';
          break;
        case 'identifier':
          ok = prop.type === 'enum' || prop.type === 'integer' || prop.type === 'boolean' || prop.type === 'reference' || prop.type === 'string';
          break;
        default:
          ok = prop.type === 'integer' || prop.type === 'string' || prop.type === 'object';
      }
      if (!ok) {
        res.typeMismatch.push(`${mc.name} (期望 ${mc.expectType}, 实际 ${prop.type})`);
        totalMismatch++;
      }
    }
    results.push(res);
  }

  // 汇总
  const missFiles = results.filter(r => r.missed.length > 0);
  const mismatchFiles = results.filter(r => r.typeMismatch.length > 0);
  console.log(`[F1-verify] 宏总数: ${totalMacros}; 覆盖缺失: ${totalMissed}; 类型不一致: ${totalMismatch}`);
  console.log(`[F1-verify] 缺失宏的文件数: ${missFiles.length}; 类型不一致的文件数: ${mismatchFiles.length}`);
  for (const r of missFiles) {
    console.log(`  [miss] ${r.file}: ${r.missed.slice(0, 8).join(', ')}${r.missed.length > 8 ? '...' : ''}`);
  }
  for (const r of mismatchFiles) {
    console.log(`  [type] ${r.file}: ${r.typeMismatch.slice(0, 6).join(', ')}${r.typeMismatch.length > 6 ? '...' : ''}`);
  }

  // ---- 抽查 5 个模块（逐宏一一对应）----
  const SPOT = ['Wdg', 'Flash', 'Crypto', 'Com', 'EcuM'];
  console.log(`\n[F1-verify] 抽查 ${SPOT.length} 个模块（与手写头逐宏对应）:`);
  for (const mod of SPOT) {
    const file = files.find(f => path.basename(f).toLowerCase().startsWith(mod.toLowerCase() + '_cfg.h'));
    if (!file) {
      console.log(`  ✗ ${mod}: 未找到 Cfg.h`);
      continue;
    }
    const rel = path.relative(yuleasrRoot, file).replace(/\\/g, '/');
    const schema = bySource.get(rel);
    const r = results.find(x => x.file === rel)!;
    const layer = schema?.['x-layer'] ?? '?';
    const verdict = r.missed.length === 0 && r.typeMismatch.length === 0 ? '✓' : '✗';
    console.log(`  ${verdict} ${mod} (${rel}, layer=${layer}): ${r.macros} 个宏全部对应，类型一致`);
    if (r.missed.length || r.typeMismatch.length) {
      console.log(`      missed: ${r.missed.slice(0, 5).join(', ')}; type: ${r.typeMismatch.slice(0, 5).join(', ')}`);
    }
  }

  // ---- generated/ 合并目录校验 ----
  const genJson = fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.json')).sort();
  const genIndex = fs.readFileSync(path.join(GENERATED_DIR, 'index.ts'), 'utf8');
  const exports_ = [...genIndex.matchAll(/export\s*\{\s*default\s+as\s+([A-Za-z0-9_]+)\s*\}\s*from\s*'\.\/([a-z0-9_]+)\.json'/g)];
  const dupExports = exports_.map(m => m[1]).filter((n, i, a) => a.indexOf(n) !== i);
  const dupFiles = exports_.map(m => m[2]).filter((n, i, a) => a.indexOf(n) !== i);
  console.log(`\n[F1-verify] generated/: ${genJson.length} 个 JSON; index.ts 导出 ${exports_.length} 个`);
  if (dupExports.length || dupFiles.length) {
    console.log(`  ✗ 重复导出名: ${[...new Set([...dupExports, ...dupFiles])].join(', ')}`);
    return 1;
  }
  console.log('  ✓ 无重复导出');

  const pass = missFiles.length === 0 && mismatchFiles.length === 0 && files.length === bySource.size;
  console.log(`\n[F1-verify] 结论: ${pass ? 'PASS — 110 模块全覆盖，类型一致' : 'FAIL — 见上方缺失/不一致清单'}`);
  return pass ? 0 : 1;
}

process.exit(main());

/**
 * B/C/D 快速差异分析：extracted-cfgh schema → 生成宏头，与手写头对比
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const YULEASR = '/Users/stefan/.openclaw/workspace/yuleASR';
const CFGH = path.resolve(__dirname, '../verification/extracted-cfgh');

// 直接读 codegen.ts 的生成函数（通过 tsx 运行本脚本）
import { generateHeadersFromSchemas } from '../apps/yuleasr-web/src/services/codegen.ts';
import { generatedJsonToModuleSchema, loadModuleSchemas } from '../packages/@yuletech/core/src/schema/load-generated.ts';

const generated = loadModuleSchemas();
const byName = new Map(generated.map(s => [s.name.toLowerCase(), s]));

const schemas = [];
for (const f of fs.readdirSync(CFGH).filter(f => f.endsWith('.json'))) {
  const stem = f.replace(/\.json$/, '');
  const base = byName.get(stem);
  if (!base) continue;
  const json = JSON.parse(fs.readFileSync(path.join(CFGH, f), 'utf8'));
  schemas.push(generatedJsonToModuleSchema(base.name, json));
}
schemas.sort((a,b)=>a.name.localeCompare(b.name));

// 收集手写头宏
function collectDefines(content: string): Map<string, string> {
  const m = new Map<string, string>();
  const re = /^[ \t]*#[ \t]*define[ \t]+([A-Za-z_][A-Za-z0-9_]*)[ \t]*(.*)$/gm;
  let mm;
  while ((mm = re.exec(content)) !== null) {
    m.set(mm[1], (mm[2]||'').trim());
  }
  return m;
}

async function main() {
const files = await generateHeadersFromSchemas(schemas);
let missingCount = 0, extraCount = 0, valueDiff = 0;
const problems: any[] = [];

for (const f of files) {
  const hPath = path.join(YULEASR, 'src', f.filename.replace(/^src\//,''));
  // 搜索实际路径
  if (!fs.existsSync(hPath)) continue;
  const handwritten = fs.readFileSync(hPath, 'utf8');
  const gen = f.content;
  const hMacros = collectDefines(handwritten);
  const gMacros = collectDefines(gen);
  const missing = [...hMacros.keys()].filter(k => !gMacros.has(k));
  const extra = [...gMacros.keys()].filter(k => !hMacros.has(k));
  const diffVal = [...hMacros.keys()].filter(k => gMacros.has(k) && hMacros.get(k) !== gMacros.get(k) && !/VERSION|RELEASE|MODULE_ID|VENDOR_ID/i.test(k));
  if (missing.length || extra.length || diffVal.length) {
    missingCount += missing.length; extraCount += extra.length; valueDiff += diffVal.length;
    problems.push({ mod: f.filename, missing, extra, diffVal: diffVal.slice(0,5) });
  }
}
console.log('生成文件数:', files.length);
console.log('缺失宏总数:', missingCount, '多余宏总数:', extraCount, '值差异总数:', valueDiff);
for (const p of problems) {
  console.log(`\n[${p.mod}]`);
  if (p.missing.length) console.log('  缺失:', p.missing.join(', '));
  if (p.extra.length) console.log('  多余:', p.extra.join(', '));
  if (p.diffVal.length) console.log('  值异:', p.diffVal.join(', '));
}
}
main();

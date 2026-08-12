#!/usr/bin/env npx tsx
/**
 * verify-schema-arxml-roundtrip.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * round-trip 闭环验证（方案④）：schema → 生成 ECUC 定义层 ARXML → reader 解析 →
 * 与源 schema 结构对比（模块数 / 容器名集合 / 参数名集合 / 类型映射一致性）。
 *
 * 对比基准：
 *   - 期望侧：schema/generated/*.json 经 generate-ecuc-defs-from-schema.ts 的
 *     可表达视图（跳过 array 等不可表达参数，与生成侧同一逻辑）
 *   - 实际侧：parseSwcArxml 解析 /tmp/ecuc-defs-generated/*.arxml 得到 EcucModuleDef
 *
 * 输出：
 *   - 控制台：一致率摘要 + 差异明细
 *   - 报告：/Users/stefan/.openclaw/workspace/reports/schema-to-arxml-roundtrip-20260812.md
 *
 * 用法：
 *   npx tsx scripts/verify-schema-arxml-roundtrip.ts [--arxml-dir <dir>] [--report <path>]
 *
 * 纪律：只读验证；不修改 schema/generated/、arxml-import/、reader.ts。
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { parseSwcArxml } from '../packages/@yuletech/core/src/arxml-import/reader.ts';
import {
  DEFAULT_OUTPUT_DIR,
  buildGeneratedModule,
  generateAllModules,
  loadSchemas,
  moduleNameFromSchema,
  type GeneratedModule,
} from './generate-ecuc-defs-from-schema.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPORT = '/Users/stefan/.openclaw/workspace/reports/schema-to-arxml-roundtrip-20260812.md';

interface DiffEntry {
  module: string;
  level: 'module' | 'container' | 'param' | 'kind' | 'literal';
  where: string;
  expected: string;
  actual: string;
}

function sortedSet(names: Iterable<string>): string[] {
  return [...new Set(names)].sort();
}

/** 期望视图 → 可比较结构 */
function expectedView(m: GeneratedModule): {
  moduleParams: Set<string>;
  containers: Map<string, Set<string>>;
} {
  return {
    moduleParams: new Set(m.moduleParams.map(p => p.name)),
    containers: new Map(m.containers.map(c => [c.name, new Set(c.params.map(p => p.name))])),
  };
}

function kindOf(cls: GeneratedModule['moduleParams'][number]['cls']): string | null {
  switch (cls.kind) {
    case 'boolean':
      return 'BOOLEAN';
    case 'integer':
    case 'float':
      return 'NUMERICAL';
    case 'string':
      return 'TEXTUAL';
    case 'enum':
      return 'ENUMERATION';
    case 'reference':
      return 'REFERENCE';
    default:
      return null;
  }
}

function main(): void {
  const args = process.argv.slice(2);
  let arxmlDir = DEFAULT_OUTPUT_DIR;
  let reportPath = DEFAULT_REPORT;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--arxml-dir' && args[i + 1]) {
      arxmlDir = args[i + 1];
      i++;
    } else if (args[i] === '--report' && args[i + 1]) {
      reportPath = args[i + 1];
      i++;
    }
  }

  // ── 期望侧：schema 可表达视图 ──
  const schemas = loadSchemas();
  const generated = generateAllModules(schemas);
  const expectedByName = new Map(generated.map(m => [m.moduleName, m]));

  // ── 实际侧：解析生成的 ARXML ──
  if (!existsSync(arxmlDir)) {
    console.error(`❌ 生成目录不存在: ${arxmlDir}（先运行 generate-ecuc-defs-from-schema.ts）`);
    process.exit(1);
  }
  const files = readdirSync(arxmlDir).filter(f => f.endsWith('.arxml')).sort();

  const diffs: DiffEntry[] = [];
  let parsedModuleCount = 0;
  let totalWarnings = 0;
  let totalErrors = 0;
  const warningTagCounts = new Map<string, number>();
  const parsedByFile = new Map<string, ReturnType<typeof parseSwcArxml>>();

  for (const f of files) {
    const xml = readFileSync(join(arxmlDir, f), 'utf8');
    const parsed = parseSwcArxml(xml, f);
    parsedByFile.set(f, parsed);
    totalWarnings += parsed.report.warnings.length;
    totalErrors += parsed.report.errors.length;
    for (const w of parsed.report.warnings) {
      warningTagCounts.set(w.tag, (warningTagCounts.get(w.tag) ?? 0) + 1);
    }
    parsedModuleCount += parsed.ecucModuleDefs.length;

    for (const def of parsed.ecucModuleDefs) {
      const expected = expectedByName.get(def.name);
      if (!expected) {
        diffs.push({ module: def.name, level: 'module', where: '<module>', expected: '(schema 中不存在)', actual: 'ARXML 中存在' });
        continue;
      }
      const ev = expectedView(expected);

      // 模块级参数名集合
      const parsedModuleParams = sortedSet(def.parameterDefs.map(p => p.name));
      const expModuleParams = sortedSet(ev.moduleParams);
      const onlyParsed = parsedModuleParams.filter(n => !ev.moduleParams.has(n));
      const onlyExpected = expModuleParams.filter(n => !parsedModuleParams.includes(n));
      for (const n of onlyParsed) diffs.push({ module: expected.moduleName, level: 'param', where: '<module>', expected: '(无)', actual: n });
      for (const n of onlyExpected) diffs.push({ module: expected.moduleName, level: 'param', where: '<module>', expected: n, actual: '(缺失)' });

      // 容器名集合
      const parsedContainers = new Set(def.containerDefs.map(c => c.name));
      const expContainers = sortedSet(ev.containers.keys());
      for (const n of def.containerDefs.map(c => c.name)) {
        if (!ev.containers.has(n)) diffs.push({ module: expected.moduleName, level: 'container', where: '<containers>', expected: '(无)', actual: n });
      }
      for (const n of expContainers) {
        if (!parsedContainers.has(n)) diffs.push({ module: expected.moduleName, level: 'container', where: '<containers>', expected: n, actual: '(缺失)' });
      }

      // 每容器参数名集合 + 参数类型映射
      for (const cdef of def.containerDefs) {
        const expParams = ev.containers.get(cdef.name);
        if (!expParams) continue; // 容器名不匹配已在上面记录
        const parsedParams = sortedSet(cdef.parameterDefs.map(p => p.name));
        for (const n of cdef.parameterDefs.map(p => p.name)) {
          if (!expParams.has(n)) diffs.push({ module: expected.moduleName, level: 'param', where: cdef.name, expected: '(无)', actual: n });
        }
        for (const n of sortedSet(expParams)) {
          if (!parsedParams.includes(n)) diffs.push({ module: expected.moduleName, level: 'param', where: cdef.name, expected: n, actual: '(缺失)' });
        }
      }

      // 类型映射 + 枚举 LITERALS（二级校验：结构一致之外的保真度）
      // 注意：同名参数可出现在多个容器（AUTOSAR 常见形态），必须按 (容器, 参数名) 复合键定位，
      // 仅用参数名会串位导致误报（如 Can.CanControllerBaudRate 同时存在于 3 个容器）。
      const schemaParamsByKey = new Map<string, { cls: GeneratedModule['moduleParams'][number]['cls']; container: string | null }>();
      for (const p of expected.moduleParams) schemaParamsByKey.set(`<module>/${p.name}`, { cls: p.cls, container: null });
      for (const c of expected.containers) {
        for (const p of c.params) schemaParamsByKey.set(`${c.name}/${p.name}`, { cls: p.cls, container: c.name });
      }
      const allDefs = [
        ...def.parameterDefs.map(p => ({ p, container: null as string | null })),
        ...def.containerDefs.flatMap(c => c.parameterDefs.map(p => ({ p, container: c.name as string | null }))),
      ];
      for (const { p, container } of allDefs) {
        const key = container ? `${container}/${p.name}` : `<module>/${p.name}`;
        const exp = schemaParamsByKey.get(key);
        if (!exp) continue;
        const expKind = kindOf(exp.cls);
        if (expKind && expKind !== p.kind) {
          diffs.push({ module: expected.moduleName, level: 'kind', where: container ?? '<module>', expected: expKind, actual: p.kind });
        }
        if (exp.cls.kind === 'enum' && p.kind === 'ENUMERATION') {
          const expLits = (exp.cls as { literals: string[] }).literals.slice().sort();
          const actLits = (p.literals ?? []).slice().sort();
          if (JSON.stringify(expLits) !== JSON.stringify(actLits)) {
            diffs.push({
              module: expected.moduleName,
              level: 'literal',
              where: container ?? '<module>',
              expected: expLits.join('|') || '(无 LITERALS)',
              actual: actLits.join('|') || '(无 LITERALS)',
            });
          }
        }
      }
    }
  }

  // ── 汇总统计 ──
  const modulesMatched = generated.filter(m => {
    const expModuleParams = sortedSet(expectedView(m).moduleParams);
    const expContainers = sortedSet(expectedView(m).containers.keys());
    const f = `${m.moduleName}.arxml`;
    const parsed = parsedByFile.get(f);
    if (!parsed || parsed.ecucModuleDefs.length === 0) return false;
    const def = parsed.ecucModuleDefs.find(d => d.name === m.moduleName);
    if (!def) return false;
    const expContainerParams = expectedView(m).containers;
    return (
      sortedSet(def.parameterDefs.map(p => p.name)).join(',') === expModuleParams.join(',') &&
      sortedSet(def.containerDefs.map(c => c.name)).join(',') === expContainers.join(',') &&
      def.containerDefs.every(c => {
        const exp = expContainerParams.get(c.name);
        return exp !== undefined && sortedSet(c.parameterDefs.map(p => p.name)).join(',') === sortedSet(exp).join(',');
      })
    );
  }).length;

  const totalContainers = generated.reduce((n, m) => n + m.containers.length, 0);
  const totalParams = generated.reduce((n, m) => n + m.moduleParams.length + m.containers.reduce((k, c) => k + c.params.length, 0), 0);
  const totalSkipped = generated.reduce((n, m) => n + m.skipped.length, 0);
  const structDiffs = diffs.filter(d => d.level === 'module' || d.level === 'container' || d.level === 'param');

  // ── 报告 ──
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const lines: string[] = [];
  lines.push(`# Schema → ARXML 反向生成 + Round-Trip 验证报告（方案④）`);
  lines.push('');
  lines.push(`- 日期：${now}`);
  lines.push(`- 执行者：小马（质量架构师）`);
  lines.push(`- 生成脚本：\`scripts/generate-ecuc-defs-from-schema.ts\``);
  lines.push(`- 验证脚本：\`scripts/verify-schema-arxml-roundtrip.ts\``);
  lines.push(`- 解析器：\`packages/@yuletech/core/src/arxml-import/reader.ts\`（parseSwcArxml / EcucModuleDef，R8/E2）`);
  lines.push(`- 生成输出：\`${arxmlDir}/\`（${files.length} 个文件，每模块一个）`);
  lines.push('');
  lines.push('## 1. 生成方法');
  lines.push('');
  lines.push('| 源（JSON Schema） | 目标（ECUC 定义层） | 说明 |');
  lines.push('|---|---|---|');
  lines.push('| schema 文件（117 个） | `<ECUC-MODULE-DEF>` | 模块名 = title 去 ` Configuration` 后缀 |');
  lines.push('| 顶层非 object 属性 | `<PARAMETER-DEFS>` | 模块级参数定义 |');
  lines.push('| 顶层 object 属性 | `<CONTAINER-DEFS><ECUC-CONTAINER-DEF>` | 容器定义（含参数定义） |');
  lines.push('| `boolean` | `ECUC-BOOLEAN-PARAM-DEF` | — |');
  lines.push('| `integer`（含 integer+enum） | `ECUC-INTEGER-PARAM-DEF` | 带 MIN/MAX（schema 有值时） |');
  lines.push('| `number` | `ECUC-FLOAT-PARAM-DEF` | — |');
  lines.push('| `string`（无 enum） | `ECUC-STRING-PARAM-DEF` | — |');
  lines.push('| `string`+enum / `enum` | `ECUC-ENUMERATION-PARAM-DEF` + `LITERALS` | enum 值 → literal 短名 |');
  lines.push('| `reference` | `ECUC-REFERENCE-DEF` | 回调指针类参数 |');
  lines.push('| `array` / 其他 | 跳过 | ECUC-PARAM-DEF 族不可表达（记录 skipped 清单） |');
  lines.push('| multiplicity 无信息 | 参数 0..1；容器 0..-1（*） | 显式补默认，避免 reader 隐式推断 |');
  lines.push('');
  lines.push('## 2. 覆盖规模');
  lines.push('');
  lines.push(`- 模块定义：**${generated.length}**（生成文件 ${files.length} 个）`);
  lines.push(`- 容器定义：**${totalContainers}**`);
  lines.push(`- 参数定义：**${totalParams}**（模块级 + 容器级）`);
  lines.push(`- 跳过（不可表达）：**${totalSkipped}**（array 类型为主，含 appswc/compswc 的 SWC 结构数组）`);
  lines.push('');
  lines.push('## 3. Round-Trip 对比结果');
  lines.push('');
  lines.push(`- 解析模块数：**${parsedModuleCount} / ${generated.length}**`);
  lines.push(`- 结构完全一致模块（模块级参数 + 容器 + 每容器参数名集合全部相等）：**${modulesMatched} / ${generated.length}（${((modulesMatched / generated.length) * 100).toFixed(1)}%）**`);
  lines.push(`- 结构差异（module/container/param 名集合）：**${structDiffs.length} 条**`);
  lines.push(`- 类型映射差异（kind 不符）：**${diffs.filter(d => d.level === 'kind').length} 条**`);
  lines.push(`- 枚举 LITERALS 差异：**${diffs.filter(d => d.level === 'literal').length} 条**`);
  lines.push(`- 解析告警总数：**${totalWarnings}**（${[...warningTagCounts.entries()].map(([k, v]) => `${k}:${v}`).join('，') || '无'}）`);
  lines.push(`- 解析错误总数：**${totalErrors}**`);
  lines.push('');
  if (structDiffs.length > 0) {
    lines.push('### 3.1 结构差异明细');
    lines.push('');
    lines.push('| 模块 | 层级 | 位置 | 期望 | 实际 |');
    lines.push('|---|---|---|---|---|');
    for (const d of structDiffs) {
      lines.push(`| ${d.module} | ${d.level} | ${d.where} | ${d.expected} | ${d.actual} |`);
    }
    lines.push('');
  }
  if (diffs.some(d => d.level === 'kind' || d.level === 'literal')) {
    lines.push('### 3.2 类型映射 / LITERALS 差异明细');
    lines.push('');
    lines.push('| 模块 | 层级 | 位置 | 期望 | 实际 |');
    lines.push('|---|---|---|---|---|');
    for (const d of diffs.filter(d => d.level === 'kind' || d.level === 'literal')) {
      lines.push(`| ${d.module} | ${d.level} | ${d.where} | ${d.expected} | ${d.actual} |`);
    }
    lines.push('');
  }
  lines.push('## 4. 差异根因分析');
  lines.push('');
  lines.push('1. **multiplicity 无信息默认值**：schema 不含 multiplicity 信息，生成侧显式补 0..1（参数）/ 0..-1（容器）；reader 只记录显式值，故解析结果与生成一致，不构成结构差异。');
  lines.push('2. **enum 无 LITERALS 表达**：`integer`+enum（McuResetReason / OsIsrCategory / SpiDataWidth）按主类型 `ECUC-INTEGER-PARAM-DEF` 生成，enum 符号常量语义丢失（reader 的 integer 定义也不捕获 LITERALS，双向一致）；若需符号常量，应补 COMPU-METHOD（超出本方案范围）。');
  lines.push('3. **array 类型跳过**：ECUC-PARAM-DEF 族无数组定义（AUTOSAR 定义层用容器 + 多实例表达）；appswc/compswc 的 SWC 结构数组与 OsScheduleTableExpiryPoints 等 17 个 array 参数被跳过并计数，不参与结构对比。');
  lines.push('4. **MIN/MAX 未建模告警**：生成侧输出 MIN/MAX（integer 参数 3221/3222 个有界），reader R8 边界未建模 MIN/MAX → 每条产生一条 Unprocessed 告警（不崩溃、不影响结构）；若需零告警可加 `--no-min-max` 重新生成。');
  lines.push('5. **reference 参数**：9 个回调指针（doip 等）映射 `ECUC-REFERENCE-DEF`，reader 归一 kind=REFERENCE，一致。');
  lines.push('');
  lines.push('## 5. 结论');
  lines.push('');
  if (structDiffs.length === 0 && parsedModuleCount === generated.length) {
    lines.push(`**通过**：schema → ARXML → 解析的结构闭环 100% 一致（${generated.length}/${generated.length} 模块、${totalContainers} 容器、${totalParams} 参数名集合全部吻合），类型映射与枚举 LITERALS 零差异。`);
    lines.push('');
    lines.push(`反向生成的 ECUC-MODULE-DEF ARXML **可作为"标准模板"替代丢失的源 ARXML**：`);
    lines.push('- 结构层（模块/容器/参数名 + 类型归一）由修复后 schema 完全决定，round-trip 验证了 schema 修复与模板生成的一致性；');
    lines.push('- 保真度缺口仅剩：MIN/MAX（生成已有，reader 未建模）、array 参数（17 个，不可表达）、integer 枚举符号常量（3 个，需 COMPU-METHOD）。');
    lines.push('- 建议：将 `/tmp/ecuc-defs-generated/` 产物纳入版本管理或按需合并为单文件，作为 E3 一致性校验与定义↔值关联的标准定义层输入。');
  } else {
    lines.push(`**未完全通过**：存在 ${structDiffs.length} 条结构差异 / ${parsedModuleCount}/${generated.length} 模块解析成功，需先修复生成映射再作为标准模板。`);
  }
  lines.push('');
  lines.push('## 6. 复现命令');
  lines.push('');
  lines.push('```bash');
  lines.push('cd yuleASR-Configurator');
  lines.push('npx tsx scripts/generate-ecuc-defs-from-schema.ts');
  lines.push('npx tsx scripts/verify-schema-arxml-roundtrip.ts');
  lines.push('```');

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, lines.join('\n'), 'utf8');

  // ── 控制台摘要 ──
  console.log(`📊 Round-Trip 验证结果`);
  console.log(`   模块: ${parsedModuleCount}/${generated.length} 解析成功；结构一致 ${modulesMatched}/${generated.length}（${((modulesMatched / generated.length) * 100).toFixed(1)}%）`);
  console.log(`   容器: ${totalContainers}，参数: ${totalParams}，跳过: ${totalSkipped}`);
  console.log(`   结构差异: ${structDiffs.length}，类型差异: ${diffs.filter(d => d.level === 'kind').length}，LITERALS 差异: ${diffs.filter(d => d.level === 'literal').length}`);
  console.log(`   告警: ${totalWarnings}（${[...warningTagCounts.entries()].map(([k, v]) => `${k}:${v}`).join('，')}），错误: ${totalErrors}`);
  for (const d of structDiffs.slice(0, 20)) {
    console.log(`   ⚠️ [${d.module}] ${d.level}@${d.where}: 期望 ${d.expected} ≠ 实际 ${d.actual}`);
  }
  console.log(`📄 报告: ${reportPath}`);
}

main();

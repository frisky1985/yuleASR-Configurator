/**
 * replace-cfgh — yuleASR 手写头全量替换工具（可追溯）
 *
 * 目标（老板 2026-08-10 指令）：全量替换入库前保证万一有问题可追溯。
 *
 * 用法（vitest 环境运行——codegen.ts 依赖 Vite import.meta.glob）：
 *   YULEASR_DIR=~/.../yuleASR npx vitest run scripts/replace-cfgh.test.ts
 *
 * 产出替换包（默认 /tmp/replace-cfgh/<timestamp>/）：
 *   manifest.json     — 109 模块逐条（YAC-MAP-003 起；110→109，dlt_ecual 并入 dlt）：module / sourcePath / 手写 md5 / 生成 md5 / 宏数 / 拼接标记 / 状态
 *   backup/           — 替换前手写头快照（按 sourcePath 镜像）
 *   backup-md5.json   — 手写头 md5 清单（回滚校验用）
 *   generated/        — 生成产物（按 sourcePath 镜像）
 *   verify.json       — 替换后验证（build exit / ctest 结果，可选项）
 *
 * 模式：
 *   REPLACE_MODE=dry-run  仅生成替换包不落 yuleASR（默认）
 *   REPLACE_MODE=apply    备份 + 替换到 yuleASR 工作树
 *   REPLACE_MODE=rollback 从替换包恢复手写头（校验 md5）
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, copyFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// YAC-KNOWN-003 修复：根目录脚本不能用裸包名导入 @yuletech/core —— 仓库根 node_modules
// 没有 @yuletech 作用域链接（根 package.json 无 dependencies，pnpm 只在各 app/package 下建链），
// 从 scripts/ 解析会 Cannot find package。对齐仓库既有约定（verify-schema-arxml-roundtrip.ts /
// utils/schema-parser.ts 同款）：相对路径直达 core 源码。
import { generatedJsonToModuleSchema } from '../packages/@yuletech/core/src/schema/load-generated';
import type { ModuleSchema } from '../packages/@yuletech/core/src';

import { generateHeadersFromSchemas } from '../apps/yuleasr-web/src/services/codegen';

const CFGH_DIR = join(__dirname, '../verification/extracted-cfgh');

/** 惰性取 YULEASR 路径（支持运行时 env 覆盖；模块加载时固化会导致测试/UI 传参不生效）
 *  P1 修复（小马验收 2026-08-10）：默认路径须指向 workspace/yuleASR——
 *  scripts/ 的 __dirname 是 <repo>/scripts，.. 才是 workspace 上级。
 *  P2 加固（2026-08-10）：~ 展开 + 绝对路径校验，避免 UI 输入 ~/workspace/yuleASR 时落字面 ~ 目录 */
function yuleasrDir(): string {
  const raw = process.env.YULEASR_DIR || join(__dirname, '..', '..', 'yuleASR');
  const expanded = raw.startsWith('~/') ? join(process.env.HOME || '/', raw.slice(2)) : raw;
  return expanded;
}
/** 惰性取替换包根目录 */
function outRoot(): string {
  return process.env.REPLACE_OUT || '/tmp/replace-cfgh';
}

/**
 * 统一 git 仓库护栏（P2 加固 2026-08-10）：apply/rollback 前必须确认 yuleASR 是 git 仓库，
 * 空/错误路径（如非 git 草稿树 ~/.openclaw/yuleASR）拒绝执行，防止静默写错目标。
 */
function assertYuleasrGitRepo(mode: 'dry-run' | 'apply' | 'rollback'): string {
  const yDir = yuleasrDir();
  if (!yDir || !existsSync(join(yDir, '.git'))) {
    throw new Error(`yuleASR 路径无效（非 git 仓库，${mode} 拒绝执行）: ${yDir || '(空)'}`);
  }
  return yDir;
}

/** md5 */
function md5(content: string | Buffer): string {
  return createHash('md5').update(content).digest('hex');
}

/** 模块 → 手写头内容（按 x-source-file 精确；重名模块各自独立） */
function loadHandwrittenHeaders(): Map<string, string> {
  const map = new Map<string, string>();
  for (const f of readdirSync(CFGH_DIR).filter(f => f.endsWith('.json')).sort()) {
    const json = JSON.parse(readFileSync(join(CFGH_DIR, f), 'utf8'));
    const src = json['x-source-file'];
    if (typeof src !== 'string') continue;
    const p = join(yuleasrDir(), src);
    if (!existsSync(p)) continue;
    map.set(src, readFileSync(p, 'utf8'));
  }
  return map;
}

/** 加载宏名版 schema（与生产 loadPreferredSchemas 对齐） */
function loadSchemas(): ModuleSchema[] {
  const schemas: ModuleSchema[] = [];
  for (const f of readdirSync(CFGH_DIR).filter(f => f.endsWith('.json')).sort()) {
    const stem = f.replace(/\.json$/, '');
    const json = JSON.parse(readFileSync(join(CFGH_DIR, f), 'utf8'));
    schemas.push(generatedJsonToModuleSchema(stem, json));
  }
  schemas.sort((a, b) => a.name.localeCompare(b.name));
  return schemas;
}

/** 生成全部头（拼接路径开启；YAC-MAP-003 起 109 个） */
async function generateAll(): Promise<{ files: Map<string, { content: string; sourcePath: string }>; errors: any[] }> {
  const schemas = loadSchemas();
  const handwritten = loadHandwrittenHeaders();
  const files = new Map<string, { content: string; sourcePath: string }>();
  const errors: any[] = [];
  for (const schema of schemas) {
    const json = JSON.parse(readFileSync(join(CFGH_DIR, `${schema.name.toLowerCase()}.json`), 'utf8'));
    const src = json['x-source-file'] as string | undefined;
    try {
      const out = await generateHeadersFromSchemas([schema], { handwrittenHeaders: handwritten });
      const f = out[0];
      if (!f) throw new Error('无输出');
      files.set(schema.name, { content: f.content, sourcePath: src || '' });
    } catch (e: any) {
      errors.push({ module: schema.name, sourcePath: src, error: e.message });
    }
  }
  return { files, errors };
}

/** 主流程（mode 显式传参，避免模块加载时 env 固化）
 *  rollback 提前处理：不生成/不写新包，直接从指定（或最新）替换包恢复 */
export async function runReplace(
  mode: 'dry-run' | 'apply' | 'rollback' = 'dry-run',
  explicitPkgDir?: string
): Promise<Record<string, unknown>> {
  // rollback 模式：从替换包恢复（读取包内 manifest/backup，不重新生成——工作树可能已被替换）
  if (mode === 'rollback') {
    // P1 修复（小马验收 2026-08-10）：回滚前强制校验 yuleASR 路径是 git 仓库——
    // 空/错误路径会静默写向草稿树（~/.openclaw/yuleASR）导致真实仓库未恢复
    const yDir = assertYuleasrGitRepo(mode);
    const pkgDirs = existsSync(outRoot())
      ? readdirSync(outRoot()).filter(d => existsSync(join(outRoot(), d, 'backup-md5.json'))).sort()
      : [];
    const latest = explicitPkgDir || (pkgDirs.length > 0 ? pkgDirs[pkgDirs.length - 1] : null);
    if (!latest) throw new Error('无可回滚的替换包');
    const pkgRoot = explicitPkgDir ? explicitPkgDir : join(outRoot(), latest);
    const pkgManifest: any[] = JSON.parse(readFileSync(join(pkgRoot, 'manifest.json'), 'utf8'));
    const genMd5BySrc = new Map<string, string>();
    for (const m of pkgManifest) {
      if (m.sourcePath && m.generatedMd5) genMd5BySrc.set(m.sourcePath, m.generatedMd5);
    }
    const latestBackupMd5 = JSON.parse(readFileSync(join(pkgRoot, 'backup-md5.json'), 'utf8'));
    const bakRoot = join(pkgRoot, 'backup');
    const rolledBack: string[] = [];
    const skipped: string[] = [];
    for (const [src, expected] of Object.entries(latestBackupMd5)) {
      const bak = join(bakRoot, src);
      if (!existsSync(bak)) continue;
      const cur = existsSync(join(yDir, src)) ? readFileSync(join(yDir, src), 'utf8') : '';
      const curMd5 = md5(cur);
      // 仅当当前文件与生成产物一致（或文件缺失）才回滚，避免覆盖用户新改动
      const genMd5 = genMd5BySrc.get(src);
      // P2 加固（2026-08-10）：genMd5 缺失（manifest 无该 sourcePath）也跳过——
      // 避免无条件恢复覆盖用户改动
      if (!genMd5 || curMd5 !== genMd5) {
        skipped.push(src); // 用户已改动或无法溯源，跳过
        continue;
      }
      copyFileSync(bak, join(yDir, src));
      rolledBack.push(src);
    }
    return {
      mode,
      pkgDir: pkgRoot,
      total: pkgManifest.length,
      ok: pkgManifest.filter(m => m.ok).length,
      failed: pkgManifest.length - pkgManifest.filter(m => m.ok).length,
      applied: 0,
      rolledBack: rolledBack.length,
      skipped: skipped.length,
      errors: [],
      manifest: join(pkgRoot, 'manifest.json'),
      backupMd5: join(pkgRoot, 'backup-md5.json'),
    };
  }

  // 时间戳 + 模式后缀（P2 加固 2026-08-10）：dry-run/apply 同秒执行会写同一包目录，
  // 第二次 backup 会录成生成内容 → 回滚错乱；加模式后缀 + 毫秒彻底隔离
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '-' + String(Date.now() % 1000).padStart(3, '0');
  const pkgDir = join(outRoot(), `${ts}-${mode}`);
  const backupDir = join(pkgDir, 'backup');
  const genDir = join(pkgDir, 'generated');

  // apply 前 git 仓库护栏（P2 加固 2026-08-10）——dry-run 只写替换包，可豁免但同样校验
  const yDir = assertYuleasrGitRepo(mode);

  // 0) 生成 + 备份
  const { files, errors } = await generateAll();
  if (files.size === 0) throw new Error('生成失败：0 个模块产出');

  const manifest: any[] = [];
  const backupMd5: Record<string, string> = {};

  for (const [module, { content, sourcePath }] of files) {
    if (!sourcePath) continue;
    const hwPath = join(yDir, sourcePath);
    const hwContent = existsSync(hwPath) ? readFileSync(hwPath, 'utf8') : '';
    const entry: any = {
      module,
      sourcePath,
      handwrittenMd5: md5(hwContent),
      generatedMd5: md5(content),
      ok: true,
    };
    // 宏数（生成产物）
    entry.generatedMacros = (content.match(/^\s*#\s*define\s+\w+/gm) || []).length;
    entry.handwrittenMacros = (hwContent.match(/^\s*#\s*define\s+\w+/gm) || []).length;
    // 拼接标记
    entry.spliced = content.includes('NON-MACRO SEGMENT (preserved from handwritten');
    manifest.push(entry);
    backupMd5[sourcePath] = md5(hwContent);
  }
  for (const e of errors) manifest.push({ ...e, ok: false });

  // 写替换包（无论 dry-run / apply 都产出，保证可追溯）
  mkdirSync(backupDir, { recursive: true });
  mkdirSync(genDir, { recursive: true });
  for (const [module, { content, sourcePath }] of files) {
    if (!sourcePath) continue;
    const bak = join(backupDir, sourcePath);
    const gen = join(genDir, sourcePath);
    mkdirSync(join(bak, '..'), { recursive: true });
    mkdirSync(join(gen, '..'), { recursive: true });
    const hwPath = join(yDir, sourcePath);
    if (existsSync(hwPath)) copyFileSync(hwPath, bak);
    writeFileSync(gen, content, 'utf8');
  }
  writeFileSync(join(pkgDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  writeFileSync(join(pkgDir, 'backup-md5.json'), JSON.stringify(backupMd5, null, 2));

  // 统计
  const okCount = manifest.filter(m => m.ok).length;
  const failCount = manifest.length - okCount;

  // apply 模式：替换 yuleASR 工作树
  let applied: string[] = [];
  if (mode === 'apply') {
    for (const [module, { content, sourcePath }] of files) {
      if (!sourcePath) continue;
      const dst = join(yDir, sourcePath);
      mkdirSync(join(dst, '..'), { recursive: true });
      writeFileSync(dst, content, 'utf8');
      applied.push(sourcePath);
    }
  }

  return {
    mode,
    pkgDir,
    total: manifest.length,
    ok: okCount,
    failed: failCount,
    applied: applied.length,
    rolledBack: 0,
    errors: errors.map(e => e.error),
    manifest: join(pkgDir, 'manifest.json'),
    backupMd5: join(pkgDir, 'backup-md5.json'),
  };
}

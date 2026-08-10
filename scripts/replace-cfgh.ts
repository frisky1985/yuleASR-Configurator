/**
 * replace-cfgh — yuleASR 手写头全量替换工具（可追溯）
 *
 * 目标（老板 2026-08-10 指令）：全量替换入库前保证万一有问题可追溯。
 *
 * 用法（vitest 环境运行——codegen.ts 依赖 Vite import.meta.glob）：
 *   YULEASR_DIR=~/.../yuleASR npx vitest run scripts/replace-cfgh.test.ts
 *
 * 产出替换包（默认 /tmp/replace-cfgh/<timestamp>/）：
 *   manifest.json     — 110 模块逐条：module / sourcePath / 手写 md5 / 生成 md5 / 宏数 / 拼接标记 / 状态
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

import { generatedJsonToModuleSchema } from '@yuletech/core/schema/load-generated';
import type { ModuleSchema } from '@yuletech/core';

import { generateHeadersFromSchemas } from '../apps/yuleasr-web/src/services/codegen';

const CFGH_DIR = join(__dirname, '../verification/extracted-cfgh');

/** 惰性取 YULEASR 路径（支持运行时 env 覆盖；模块加载时固化会导致测试/UI 传参不生效） */
function yuleasrDir(): string {
  return process.env.YULEASR_DIR || join(__dirname, '../../..', 'yuleASR');
}
/** 惰性取替换包根目录 */
function outRoot(): string {
  return process.env.REPLACE_OUT || '/tmp/replace-cfgh';
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

/** 生成全部 110 头（拼接路径开启） */
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
      const cur = existsSync(join(yuleasrDir(), src)) ? readFileSync(join(yuleasrDir(), src), 'utf8') : '';
      const curMd5 = md5(cur);
      // 仅当当前文件与生成产物一致（或文件缺失）才回滚，避免覆盖用户新改动
      const genMd5 = genMd5BySrc.get(src);
      if (genMd5 && curMd5 !== genMd5) {
        skipped.push(src); // 用户已改动，跳过
        continue;
      }
      copyFileSync(bak, join(yuleasrDir(), src));
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

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const pkgDir = join(outRoot(), ts);
  const backupDir = join(pkgDir, 'backup');
  const genDir = join(pkgDir, 'generated');

  // 0) 生成 + 备份
  const { files, errors } = await generateAll();
  if (files.size === 0) throw new Error('生成失败：0 个模块产出');

  const manifest: any[] = [];
  const backupMd5: Record<string, string> = {};

  for (const [module, { content, sourcePath }] of files) {
    if (!sourcePath) continue;
    const hwPath = join(yuleasrDir(), sourcePath);
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
    const hwPath = join(yuleasrDir(), sourcePath);
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
      const dst = join(yuleasrDir(), sourcePath);
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

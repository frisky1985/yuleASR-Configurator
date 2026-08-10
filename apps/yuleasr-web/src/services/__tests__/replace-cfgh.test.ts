import { describe, expect, it, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { runReplace } from '../../../../../scripts/replace-cfgh';

// 路径可被 env 覆盖（P2 加固：CI 可移植，不硬编码本机路径）
const Y = process.env.YULEASR_AUDIT_DIR || '/Users/stefan/.openclaw/workspace/yuleASR';
const OUT = process.env.REPLACE_AUDIT_OUT || '/tmp/replace-cfgh-test';

/** 恢复 yuleASR 工作树（无论断言成败，防止遗留脏工作树） */
afterEach(() => {
  try {
    execSync(`git -C ${Y} checkout -- src/`, { stdio: 'pipe' });
  } catch { /* 已干净 */ }
});

/**
 * replace-cfgh 可追溯替换工具闭环（单文件串行，避免并行共享 yuleASR 工作树冲突）：
 * dry-run（生成替换包）→ apply（替换工作树）→ rollback（恢复，md5 校验）。
 */
describe('replace-cfgh（可追溯替换工具）', () => {
  it('dry-run → apply → rollback 全闭环，工作树归零 + 替换包证据齐全', async () => {
    process.env.YULEASR_DIR = Y;
    process.env.REPLACE_OUT = OUT;

    // 0) 前置：yuleASR 工作树干净
    const before = execSync(`git -C ${Y} status --porcelain | wc -l`, { encoding: 'utf8' }).trim();
    expect(before).toBe('0');

    // 1) dry-run：生成替换包，不落 yuleASR
    const dry = await runReplace('dry-run');
    console.log(`[dry-run] total=${dry.total} ok=${dry.ok} failed=${dry.failed} pkg=${dry.pkgDir}`);
    expect(dry.total).toBeGreaterThanOrEqual(106);
    expect(dry.ok).toBe(dry.total);
    expect(dry.failed).toBe(0);
    expect(dry.applied).toBe(0);
    const dryDirty = execSync(`git -C ${Y} status --porcelain | wc -l`, { encoding: 'utf8' }).trim();
    expect(dryDirty).toBe('0');

    // 2) apply：备份 + 替换
    const r = await runReplace('apply');
    console.log(`[apply] total=${r.total} ok=${r.ok} applied=${r.applied} pkg=${r.pkgDir}`);
    expect(r.ok).toBe(r.total);
    expect(r.applied).toBeGreaterThan(100);
    const dirty = execSync(`git -C ${Y} status --porcelain | wc -l`, { encoding: 'utf8' }).trim();
    console.log(`[apply] yuleASR 改动文件数: ${dirty}`);
    expect(Number(dirty)).toBeGreaterThan(100);

    // 3) rollback：恢复手写头
    const rb = await runReplace('rollback');
    console.log(`[rollback] rolledBack=${rb.rolledBack} skipped=${rb.skipped ?? 0} pkg=${rb.pkgDir}`);
    const clean = execSync(`git -C ${Y} status --porcelain | wc -l`, { encoding: 'utf8' }).trim();
    console.log(`[rollback] yuleASR 剩余改动: ${clean}`);
    expect(clean).toBe('0');

    // 4) 替换包产物完整（可追溯证据）
    const pkgDir = dry.pkgDir as string;
    expect(existsSync(`${pkgDir}/manifest.json`)).toBe(true);
    expect(existsSync(`${pkgDir}/backup-md5.json`)).toBe(true);
    expect(existsSync(`${pkgDir}/backup`)).toBe(true);
    expect(existsSync(`${pkgDir}/generated`)).toBe(true);
  });

  it('rollback 跳过用户改动（md5 校验保护）——P2 加固回归', async () => {
    process.env.YULEASR_DIR = Y;
    process.env.REPLACE_OUT = OUT;

    // apply 替换
    const r = await runReplace('apply');
    expect(r.applied).toBeGreaterThan(100);

    // 手工改一个生成产物（模拟用户改动）
    const victim = 'src/bsw/services/det/include/Det_Cfg.h';
    const victimPath = join(Y, victim);
    const orig = readFileSync(victimPath, 'utf8');
    writeFileSync(victimPath, orig + '\n// USER-EDIT-MARKER\n', 'utf8');

    // rollback：该文件应被跳过，其余恢复
    const rb = await runReplace('rollback');
    console.log(`[rollback-user-edit] rolledBack=${rb.rolledBack} skipped=${rb.skipped ?? 0}`);
    expect(rb.skipped).toBeGreaterThanOrEqual(1);
    const afterRollback = readFileSync(victimPath, 'utf8');
    expect(afterRollback).toContain('USER-EDIT-MARKER'); // 用户改动保留
  });
});

import { describe, expect, it, beforeAll, afterAll, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runReplace } from '../../../../../scripts/replace-cfgh';

// 真实 yuleASR 仓库 = 只读基准（YAC-KNOWN-006 纪律：测试绝不写入真实工作树）。
// 全闭环（dry-run → apply → rollback）在 /tmp 下的 scratch 副本上执行——副本保留 .git
// 才能验证"工作树归零"，且真实仓库全程保持干净。
// 注：yuleASR 是 partial clone（promisor remote，blob:limit=204800），离线环境下 git clone
// 会因惰性拉取缺失对象失败 → 用"已跟踪文件 tar 复制 + 全新 git init"建副本（等价 rsync 副本）。
// 路径可被 env 覆盖（CI 可移植，不硬编码本机路径）。
// YAC-CI-004：CI test job 不 checkout yuleASR → env 未设且默认路径不存在时整体跳过
// （真实 yuleASR 闭环验证由 configurator-linkage job 的 replace-cfgh-run 负责）。
const REAL = process.env.YULEASR_AUDIT_DIR || '/Users/stefan/.openclaw/workspace/yuleASR';
const HAS_REAL_REPO = (() => {
  if (!existsSync(REAL)) return false;
  try {
    execSync(`git -C ${REAL} rev-parse --is-inside-work-tree`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
})();
const SCRATCH = join(tmpdir(), `yuleasr-cfgh-scratch-${process.pid}`);
const OUT = process.env.REPLACE_AUDIT_OUT || join(tmpdir(), `replace-cfgh-test-${process.pid}`);

/** 真实仓库起始工作树脏数（afterAll 差值校验：测试不得制造增量污染） */
let realDirtyBefore = '0';

/**
 * 注（YAC-MAP-003，2026-08-21）：rte.json 的 x-source-file 已随 yuleASR 目录重构同步为
 * src/middleware/rte/include/Rte_Cfg.h（e81eceb7 后 F1 重跑自动对齐）；dlt_ecual.json 已删除
 * （ecual/dlt 并入 services/dlt）。全部 109 个 schema 的 x-source-file 均指向 yuleASR 当前
 * 存在的头，scratch 副本直接可闭环，无需再 seed 旧路径。
 */

beforeAll(() => {
  // hook 默认超时 10s 不够：基线 tar 拷贝 + git init + commit 实测 ~11s（机器负载敏感），
  // 显式放宽至 120s，避免 CI 并行下 flaky 超时（YAC-CI-002）
  // 0) 真实仓库必须是 git 仓库（只读基准；路径错误/非 git 立即失败），记录起始脏数
  execSync(`git -C ${REAL} rev-parse --is-inside-work-tree`, { stdio: 'pipe' });
  realDirtyBefore = execSync(`git -C ${REAL} status --porcelain | wc -l`, {
    encoding: 'utf8',
  }).trim();

  // 1) 建 scratch 副本：只复制真实仓库已跟踪文件（工作树干净 = 基线），全新 git init
  //    （保留 .git 供"工作树归零"校验；partial clone 无法离线 git clone）
  rmSync(SCRATCH, { recursive: true, force: true });
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(SCRATCH, { recursive: true });
  mkdirSync(OUT, { recursive: true });
  execSync(`git -C ${REAL} ls-files | tar -T - -C ${REAL} -cf - | tar -C ${SCRATCH} -xf -`, {
    stdio: 'pipe',
  });
  execSync(`git init -q ${SCRATCH}`, { stdio: 'pipe' });
  execSync(`git -C ${SCRATCH} add -A`, { stdio: 'pipe' });
  // 仓库级 user.name/email 不随副本继承（本机 yuleASR 为 repo-local 配置），显式注入
  const gitName = execSync(`git -C ${REAL} config user.name`, { encoding: 'utf8' }).trim();
  const gitEmail = execSync(`git -C ${REAL} config user.email`, { encoding: 'utf8' }).trim();
  execSync(
    `git -C ${SCRATCH} -c user.name='${gitName}' -c user.email='${gitEmail}' commit --quiet ` +
      `-m "scratch baseline (YAC-KNOWN-006)"`,
    { stdio: 'pipe' }
  );
}, 120_000); // hook 超时显式放宽至 120s（YAC-CI-002：并行下基线 tar+git init 实测 ~11s）

/** 恢复 scratch 工作树（无论断言成败；只操作 scratch，绝不触碰真实仓库） */
afterEach(() => {
  try {
    execSync(`git -C ${SCRATCH} checkout -- src/`, { stdio: 'pipe' });
  } catch {
    /* 已干净 */
  }
  try {
    execSync(`git -C ${SCRATCH} clean -fd src/rte src/bsw/ecual/dlt`, { stdio: 'pipe' });
  } catch {
    /* 已干净 */
  }
}, 120_000);

afterAll(() => {
  try {
    // 纪律校验：真实 yuleASR 仓库工作树脏数与测试前一致（测试全程只读，不得制造增量污染）
    const realDirty = execSync(`git -C ${REAL} status --porcelain | wc -l`, {
      encoding: 'utf8',
    }).trim();
    expect(realDirty, '真实 yuleASR 仓库工作树被测试污染（应与测试前一致）').toBe(realDirtyBefore);
  } finally {
    rmSync(SCRATCH, { recursive: true, force: true });
    rmSync(OUT, { recursive: true, force: true });
  }
});

/**
 * replace-cfgh 可追溯替换工具闭环（单文件串行；scratch 副本隔离，YAC-KNOWN-006）：
 * dry-run（生成替换包）→ apply（替换 scratch 工作树）→ rollback（恢复，md5 校验）。
 */
describe.skipIf(!HAS_REAL_REPO)('replace-cfgh（可追溯替换工具）', () => {
  it('dry-run → apply → rollback 全闭环，工作树归零 + 替换包证据齐全（scratch 副本）', async () => {
    process.env.YULEASR_DIR = SCRATCH;
    process.env.REPLACE_OUT = OUT;

    // 0) 前置：scratch 工作树干净（clone + seed 后基线）
    const before = execSync(`git -C ${SCRATCH} status --porcelain | wc -l`, {
      encoding: 'utf8',
    }).trim();
    expect(before).toBe('0');

    // 1) dry-run：生成替换包，不落工作树
    const dry = await runReplace('dry-run');
    console.log(`[dry-run] total=${dry.total} ok=${dry.ok} failed=${dry.failed} pkg=${dry.pkgDir}`);
    expect(dry.total).toBeGreaterThanOrEqual(106);
    expect(dry.ok).toBe(dry.total);
    expect(dry.failed).toBe(0);
    expect(dry.applied).toBe(0);
    const dryDirty = execSync(`git -C ${SCRATCH} status --porcelain | wc -l`, {
      encoding: 'utf8',
    }).trim();
    expect(dryDirty).toBe('0');

    // 2) apply：备份 + 替换
    const r = await runReplace('apply');
    console.log(`[apply] total=${r.total} ok=${r.ok} applied=${r.applied} pkg=${r.pkgDir}`);
    expect(r.ok).toBe(r.total);
    expect(r.applied).toBeGreaterThan(100);
    const dirty = execSync(`git -C ${SCRATCH} status --porcelain | wc -l`, {
      encoding: 'utf8',
    }).trim();
    console.log(`[apply] scratch 改动文件数: ${dirty}`);
    // 2026-08-10：yuleASR 已入库生成头（3902399e）后，再 apply 是增量差异（仅内容变化文件），
    // 不再要求 >100；核心断言是 applied>100（工具替换数）+ rollback 后工作树归零。
    expect(Number(dirty)).toBeGreaterThan(0);

    // 3) rollback：恢复手写头
    const rb = await runReplace('rollback');
    console.log(
      `[rollback] rolledBack=${rb.rolledBack} skipped=${rb.skipped ?? 0} pkg=${rb.pkgDir}`
    );
    const clean = execSync(`git -C ${SCRATCH} status --porcelain | wc -l`, {
      encoding: 'utf8',
    }).trim();
    console.log(`[rollback] scratch 剩余改动: ${clean}`);
    expect(clean).toBe('0');

    // 4) 替换包产物完整（可追溯证据）
    const pkgDir = dry.pkgDir as string;
    expect(existsSync(`${pkgDir}/manifest.json`)).toBe(true);
    expect(existsSync(`${pkgDir}/backup-md5.json`)).toBe(true);
    expect(existsSync(`${pkgDir}/backup`)).toBe(true);
    expect(existsSync(`${pkgDir}/generated`)).toBe(true);
  });

  it('rollback 跳过用户改动（md5 校验保护）——P2 加固回归（scratch 副本）', async () => {
    process.env.YULEASR_DIR = SCRATCH;
    process.env.REPLACE_OUT = OUT;

    // apply 替换
    const r = await runReplace('apply');
    expect(r.applied).toBeGreaterThan(100);

    // 手工改一个生成产物（模拟用户改动）
    const victim = 'src/bsw/services/det/include/Det_Cfg.h';
    const victimPath = join(SCRATCH, victim);
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

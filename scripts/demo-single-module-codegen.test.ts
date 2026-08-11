/**
 * P0-3 单模块 codegen→编译 全流程演示（Demo）
 *
 * 流程：加载单个模块 schema（verification/extracted-cfgh/Can.json）
 *       → generateHeadersFromSchemas 生成头
 *       → gcc -fsyntax-only 编译验证（含 yuleASR include 路径）
 *       → 输出计时 + 宏数 + 产物大小
 *
 * 运行：cd yuleASR-Configurator && npx vitest run scripts/demo-single-module-codegen.test.ts
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';

import { generateHeadersFromSchemas } from '../apps/yuleasr-web/src/services/codegen';

const CFGH_DIR = join(__dirname, '../verification/extracted-cfgh');
const OUT_DIR = '/tmp/p0-3-single-module-demo';
const YULEASR_INCLUDE = join(__dirname, '../../yuleASR/include');

describe('P0-3 单模块 codegen→编译全流程演示', () => {
  it('Can 模块：schema → codegen → 编译验证', async () => {
    const t0 = Date.now();

    // 1. 加载单个模块 schema
    const schemaPath = join(CFGH_DIR, 'Can.json');
    expect(existsSync(schemaPath), `schema 缺失: ${schemaPath}`).toBe(true);
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const t1 = Date.now();

    // 2. codegen 生成头
    const out = await generateHeadersFromSchemas([schema]);
    expect(out.length).toBeGreaterThan(0);
    const gen = out[0];
    expect(gen.content.length).toBeGreaterThan(0);
    const t2 = Date.now();

    // 3. 落盘 + gcc 编译验证
    mkdirSync(OUT_DIR, { recursive: true });
    const headerPath = join(OUT_DIR, 'Can_Cfg.h');
    writeFileSync(headerPath, gen.content);

    const macroCount = (gen.content.match(/^#define\s+/gm) || []).length;
    const gccCmd = `gcc -fsyntax-only -std=c11 -I${OUT_DIR} -I${YULEASR_INCLUDE} -x c - <<'EOF'
#include "Can_Cfg.h"
int main(void) { return 0; }
EOF`;
    const t3 = Date.now();
    execSync(gccCmd, { shell: '/bin/sh', stdio: 'pipe' });
    const t4 = Date.now();

    // 4. 输出演示证据
    // eslint-disable-next-line no-console
    console.log(`
════════════════════════════════════════════════
  P0-3 单模块 codegen→编译 全流程演示（Can）
────────────────────────────────────────────────
  schema 加载    : ${t1 - t0}ms  (${schemaPath})
  codegen 生成   : ${t2 - t1}ms  (${gen.content.length}B, ${macroCount} 宏)
  gcc 编译验证   : ${t4 - t3}ms  (0 error)
  全流程总时长   : ${t4 - t0}ms
  产物           : ${headerPath}
════════════════════════════════════════════════
`);
    expect(macroCount).toBeGreaterThan(0);
  }, 60000);
});

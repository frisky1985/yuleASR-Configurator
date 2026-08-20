/**
 * Fix 5 单测：desktop-utils 的文件载荷校验（防命令注入 + 路径遍历）
 * 运行: node --test apps/yuleasr-desktop/electron/desktop-utils.test.mjs
 */
import { mkdtempSync, existsSync, rmSync } from 'fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tmpdir } from 'os';
import { join } from 'path';

import { sanitizeFiles, saveFilesToDir, verifyFiles } from './desktop-utils.mjs';

const VALID_FILES = [{ filename: 'Can_Cfg.h', content: 'typedef int uint32;', language: 'h' }];

test('sanitizeFiles: 合法文件通过', () => {
  const out = sanitizeFiles(VALID_FILES);
  assert.ok(out);
  assert.equal(out[0].filename, 'Can_Cfg.h');
});

test('sanitizeFiles: 命令注入载荷拒绝（分号 + touch）', () => {
  const out = sanitizeFiles([{ filename: 'x.h; touch /tmp/pwned', content: 'int x;', language: 'h' }]);
  assert.equal(out, null);
});

test('sanitizeFiles: 路径遍历拒绝（../evil.c）', () => {
  const out = sanitizeFiles([{ filename: '../evil.c', content: 'int x;', language: 'c' }]);
  assert.equal(out, null);
});

test('sanitizeFiles: 绝对路径拒绝（/etc/passwd）', () => {
  const out = sanitizeFiles([{ filename: '/etc/passwd', content: 'root:x', language: 'c' }]);
  assert.equal(out, null);
});

test('sanitizeFiles: 非 .c/.h 扩展名拒绝', () => {
  const out = sanitizeFiles([{ filename: 'payload.sh', content: 'rm -rf /', language: 'c' }]);
  assert.equal(out, null);
});

test('sanitizeFiles: 超大 content 拒绝', () => {
  const big = 'x'.repeat(5 * 1024 * 1024 + 1);
  const out = sanitizeFiles([{ filename: 'Big_Cfg.c', content: big, language: 'c' }]);
  assert.equal(out, null);
});

test('sanitizeFiles: 空数组/非数组拒绝', () => {
  assert.equal(sanitizeFiles([]), null);
  assert.equal(sanitizeFiles('nope'), null);
  assert.equal(sanitizeFiles(null), null);
});

test('saveFilesToDir: 合法文件写入成功', () => {
  const dir = mkdtempSync(join(tmpdir(), 'yuleasr-save-test-'));
  try {
    const res = saveFilesToDir(dir, VALID_FILES);
    assert.equal(res.success, true);
    assert.equal(res.count, 1);
    assert.ok(existsSync(join(dir, 'Can_Cfg.h')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('saveFilesToDir: 恶意载荷整体拒绝，不产生目录外文件', () => {
  const dir = mkdtempSync(join(tmpdir(), 'yuleasr-save-evil-'));
  const outside = join(dir, '..', 'pwned-by-path-traversal.txt');
  try {
    const res = saveFilesToDir(dir, [{ filename: '../pwned-by-path-traversal.txt', content: 'owned', language: 'c' }]);
    assert.equal(res.success, false);
    assert.equal(existsSync(outside), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
    try { rmSync(outside, { force: true }); } catch { /* 不存在则忽略 */ }
  }
});

test('verifyFiles: 恶意文件名在写入/编译阶段被跳过', () => {
  const res = verifyFiles([
    { filename: 'x.h; touch /tmp/pwned', content: 'int x;', language: 'h' },
    { filename: 'Valid_Cfg.h', content: 'typedef int uint32;', language: 'h' },
  ]);
  const evil = res.find(r => r.filename === 'x.h; touch /tmp/pwned');
  assert.ok(evil, '恶意文件应有结果条目');
  assert.equal(evil.status, 'skipped');
  assert.equal(existsSync('/tmp/pwned'), false);
  const valid = res.find(r => r.filename === 'Valid_Cfg.h');
  assert.ok(valid);
  assert.equal(valid.status, 'pass');
});

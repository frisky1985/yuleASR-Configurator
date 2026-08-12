/**
 * Fix 32 (对应 Fix 30): api-server 安全/性能修复单测。
 *
 * 覆盖：
 * - bswTemplates 列表 status 解析：未认证/非 admin 请求 ?status=draft 强制 'published'
 * - templateIsPublic / canViewTemplate：私有模板仅作者/admin 可读（IDOR 404 语义）
 * - sharedConfigs like toggle：连续 like 同一配置 +1 再 -1（唯一约束 + toggle 决策）
 * - branding cssEscape：`");background:red` 注入载荷被剔除（CSS 注入防护）
 */
import { describe, expect, it } from 'vitest';

import {
  canViewTemplate,
  resolveListStatus,
  templateIsPublic,
} from '../bswTemplates.js';
import { cssEscape } from '../branding.js';
import { likeToggleDecision } from '../sharedConfigs.js';

// ── bswTemplates：未认证 ?status=draft 只返回 published ─────────────────────

describe('resolveListStatus（Fix 30 列表 draft 泄露防护）', () => {
  it('非 admin（含匿名）请求 ?status=draft 被强制为 published', () => {
    expect(resolveListStatus(false, 'draft')).toBe('published');
    expect(resolveListStatus(false, 'archived')).toBe('published');
  });

  it('非 admin 未传 status 时保持 published', () => {
    expect(resolveListStatus(false, undefined)).toBe('published');
  });

  it('admin 请求 ?status=draft 可正常查看 draft', () => {
    expect(resolveListStatus(true, 'draft')).toBe('draft');
  });

  it('admin 未传 status 时保持 published', () => {
    expect(resolveListStatus(true, undefined)).toBe('published');
  });
});

describe('templateIsPublic（Fix 30 公开可见性判定）', () => {
  const base = { status: 'published', isPublic: true, visibility: 'public' };

  it('published + isPublic + visibility=public 才公开', () => {
    expect(templateIsPublic(base)).toBe(true);
    expect(templateIsPublic({ ...base, status: 'draft' })).toBe(false);
    expect(templateIsPublic({ ...base, isPublic: false })).toBe(false);
    expect(templateIsPublic({ ...base, visibility: 'private' })).toBe(false);
  });
});

describe('canViewTemplate（Fix 30 IDOR 404 语义）', () => {
  const privateTemplate = {
    authorId: 42,
    status: 'draft',
    isPublic: false,
    visibility: 'private',
  };
  const publicTemplate = {
    authorId: 42,
    status: 'published',
    isPublic: true,
    visibility: 'public',
  };

  it('公开模板任何人可读（含匿名）', () => {
    expect(canViewTemplate(publicTemplate, undefined)).toBe(true);
    expect(canViewTemplate(publicTemplate, { id: 1, role: 'user' })).toBe(true);
  });

  it('私有模板匿名用户不可读（404）', () => {
    expect(canViewTemplate(privateTemplate, undefined)).toBe(false);
  });

  it('私有模板非作者普通用户不可读（404）', () => {
    expect(canViewTemplate(privateTemplate, { id: 1, role: 'user' })).toBe(false);
  });

  it('私有模板作者本人可读', () => {
    expect(canViewTemplate(privateTemplate, { id: 42, role: 'user' })).toBe(true);
  });

  it('私有模板 admin/super_admin 可读', () => {
    expect(canViewTemplate(privateTemplate, { id: 1, role: 'admin' })).toBe(true);
    expect(canViewTemplate(privateTemplate, { id: 1, role: 'super_admin' })).toBe(true);
  });
});

// ── sharedConfigs like toggle ────────────────────────────────────────────────

describe('likeToggleDecision（Fix 30 like 幂等 toggle）', () => {
  it('第一次点赞（插入命中）→ liked=true / delta=+1', () => {
    expect(likeToggleDecision(1)).toEqual({ liked: true, delta: 1 });
  });

  it('重复点赞（唯一约束冲突，插入 0 行）→ liked=false / delta=-1（取消赞）', () => {
    expect(likeToggleDecision(0)).toEqual({ liked: false, delta: -1 });
  });

  it('连续 like 同一配置：+1 再 -1（toggle 对称性）', () => {
    const first = likeToggleDecision(1);
    const second = likeToggleDecision(0);
    expect(first.delta + second.delta).toBe(0);
    expect(first.liked).not.toBe(second.liked);
  });
});

// ── branding CSS 注入转义 ────────────────────────────────────────────────────

describe('cssEscape（Fix 30 CSS 注入防护）', () => {
  it('经典注入载荷 ");background:red 被剔除（无 CSS 语法字符可闭合规则）', () => {
    const escaped = cssEscape('");background:red');
    // 所有 CSS 语法字符（" ) ; 等）必须被剔除 —— 无法闭合 url() 注入新规则
    expect(escaped).not.toMatch(/[\\()"';]/);
    expect(escaped).toBe('background:red');
  });

  it('单引号/反斜杠/换行/圆括号等 CSS 语法字符全部剔除', () => {
    const payload = "abc'\\\n();\"";
    const escaped = cssEscape(payload);
    expect(escaped).not.toMatch(/[\\()"';]/);
    expect(escaped).toBe('abc');
  });

  it('正常 URL / 名称保持不变', () => {
    expect(cssEscape('https://example.com/logo.png')).toBe('https://example.com/logo.png');
    expect(cssEscape('yuleASR 科技')).toBe('yuleASR 科技');
  });

  it('null/undefined 转空字符串', () => {
    expect(cssEscape(null)).toBe('');
    expect(cssEscape(undefined)).toBe('');
  });
});

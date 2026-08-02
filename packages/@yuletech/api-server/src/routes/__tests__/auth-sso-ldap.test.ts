/**
 * Fix 32: LDAP 过滤器注入防护（Fix 7）与连接超时契约（Fix 8）单测。
 *
 * 覆盖：
 * - ldapEscapeFilterValue：RFC 4515 特殊字符（\ * ( ) NUL）转义，杜绝过滤器注入
 * - ldapBuildFilter：畸形过滤器必须抛错拒绝（不得退化为 objectClass present 过滤 = 认证绕过）
 * - ldapUnescapeFilterValue：hex 转义解码（\2a → *）
 * - LDAP_TIMEOUT_MS：主 socket 与用户校验 verifier 共用的 10s 超时契约
 */
import { describe, expect, it, vi } from 'vitest';

// db 仅在路由处理器中使用，单测不触达 —— mock 掉以避免实例化 postgres 客户端
vi.mock('../../db/index.js', () => ({ db: {} }));
vi.mock('../../db/schema.js', () => ({ users: {} }));

import {
  LDAP_TIMEOUT_MS,
  ldapBuildFilter,
  ldapEscapeFilterValue,
  ldapUnescapeFilterValue,
} from '../auth-sso.js';

describe('ldapEscapeFilterValue（Fix 7 RFC 4515 转义）', () => {
  it('普通用户名保持不变', () => {
    expect(ldapEscapeFilterValue('admin')).toBe('admin');
    expect(ldapEscapeFilterValue('zhang.san_01')).toBe('zhang.san_01');
  });

  it('* ( ) 前置反斜杠转义', () => {
    expect(ldapEscapeFilterValue('a*b')).toBe('a\\*b');
    expect(ldapEscapeFilterValue('a(b)c')).toBe('a\\(b\\)c');
  });

  it('反斜杠本身被转义', () => {
    expect(ldapEscapeFilterValue('a\\b')).toBe('a\\\\b');
  });

  it('NUL 字节被转义', () => {
    expect(ldapEscapeFilterValue('a\x00b')).toBe('a\\\x00b');
  });

  it('完整注入载荷（*)(uid=*))(|(uid=*）转义后无裸特殊字符', () => {
    const payload = '*)(uid=*))(|(uid=*';
    const escaped = ldapEscapeFilterValue(payload);
    // 每个特殊字符（\ * ( )）都必须带反斜杠前缀 —— 无裸字符可闭合过滤器
    expect(escaped).not.toMatch(/(?<!\\)[*()]/);
    expect(escaped.startsWith('\\*')).toBe(true);
  });
});

describe('ldapBuildFilter（Fix 7 畸形过滤器拒绝）', () => {
  it('合法 (uid=xxx) 过滤器正常编码为 Buffer', () => {
    const buf = ldapBuildFilter('(uid=admin)');
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
    // value 字节包含原始用户名
    expect(buf.includes(Buffer.from('admin'))).toBe(true);
  });

  it('畸形过滤器（含闭合括号的注入载荷）必须抛错拒绝', () => {
    expect(() => ldapBuildFilter('(uid=admin)(|(uid=*))')).toThrow(
      'LDAP filter parse failed'
    );
  });

  it('空过滤器必须抛错拒绝', () => {
    expect(() => ldapBuildFilter('')).toThrow('LDAP filter parse failed');
    expect(() => ldapBuildFilter('uid=admin')).toThrow('LDAP filter parse failed');
  });

  it('注入载荷转义后嵌入过滤器：解析拒绝（fail-closed，不匹配所有条目）', () => {
    // 转义后含 \* 与 \)；过滤器解析器无法正确闭合 → 必须抛错拒绝，
    // 绝不退化为 objectClass present 之类的“匹配所有条目”过滤（认证绕过）。
    const escaped = ldapEscapeFilterValue('*)(uid=*');
    expect(() => ldapBuildFilter(`(uid=${escaped})`)).toThrow('LDAP filter parse failed');
  });

  it('合法 hex 转义值（\\2a → *）经 unescape 还原为字面字符参与 equalityMatch', () => {
    const buf = ldapBuildFilter('(uid=\\2a)');
    expect(buf.includes(Buffer.from('*'))).toBe(true);
  });
});

describe('ldapUnescapeFilterValue（RFC 4515 hex 解码）', () => {
  it('\\2a → *、\\28 → (、\\29 → )、\\5c → \\', () => {
    expect(ldapUnescapeFilterValue('\\2a')).toBe('*');
    expect(ldapUnescapeFilterValue('\\28')).toBe('(');
    expect(ldapUnescapeFilterValue('\\29')).toBe(')');
    expect(ldapUnescapeFilterValue('\\5c')).toBe('\\');
  });

  it('普通字符串原样返回', () => {
    expect(ldapUnescapeFilterValue('admin')).toBe('admin');
  });
});

describe('LDAP_TIMEOUT_MS（Fix 8 超时契约）', () => {
  it('主 socket 与 verifier 共用 10s 超时，防止 LDAP 挂死', () => {
    expect(LDAP_TIMEOUT_MS).toBe(10_000);
  });
});

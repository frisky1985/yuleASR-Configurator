import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import * as jose from 'jose';
import { z } from 'zod';

import { eq, and, or } from 'drizzle-orm';

import { db } from '../db/index.js';
import { users } from '../db/schema.js';

// ── Environment helpers ─────────────────────────────────────────────────

function envStr(key: string, fallback = ''): string {
  return process.env[key] || fallback;
}

// ── Fix 7: LDAP 过滤器注入防护 ─────────────────────────────────────────

/** Fix 8: LDAP 连接/用户校验超时（毫秒）。主 socket 与 verifier 共用，防止挂死。 */
export const LDAP_TIMEOUT_MS = 10_000;

/** RFC 4515 过滤器值转义：\ * ( ) NUL 前置反斜杠（Fix 7，导出以便单测） */
export function ldapEscapeFilterValue(input: string): string {
  return input.replace(/([\\*\\(\\)\x00])/g, '\\$1');
}

// ── OIDC Routes ─────────────────────────────────────────────────────────

export async function ssoRoutes(app: FastifyInstance) {
  // ────────── OIDC Login (redirect) ──────────

  // Fix 30: 敏感端点单独配额（10 次/分钟）
  app.get(
    '/oidc/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (_request, reply) => {
      const issuer = envStr('OIDC_ISSUER');
      const clientId = envStr('OIDC_CLIENT_ID');
      const redirectUri = envStr('OIDC_REDIRECT_URI');

      if (!issuer || !clientId || !redirectUri) {
        return reply.status(500).send({ message: 'OIDC not configured' });
      }

      // Discover OIDC configuration from the issuer
      const oidcConfigUrl = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;
      let oidcConfig: any;
      try {
        const res = await fetch(oidcConfigUrl);
        oidcConfig = await res.json();
      } catch {
        return reply.status(500).send({ message: 'Failed to fetch OIDC configuration' });
      }

      const authorizationUrl = oidcConfig.authorization_endpoint;
      const state = crypto.randomUUID();
      const nonce = crypto.randomUUID();

      // Store state/nonce in a simple in-memory map (for production, use session/cache)
      oidcStateStore.set(state, { nonce, createdAt: Date.now() });

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        state,
        nonce,
      });

      return reply.redirect(`${authorizationUrl}?${params.toString()}`);
    }
  );

  // ────────── OIDC Callback ──────────

  app.get(
    '/oidc/callback',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { code, state } = request.query as { code?: string; state?: string };
      const issuer = envStr('OIDC_ISSUER');
      const clientId = envStr('OIDC_CLIENT_ID');
      const clientSecret = envStr('OIDC_CLIENT_SECRET');
      const redirectUri = envStr('OIDC_REDIRECT_URI');

      if (!code || !state) {
        return reply.status(400).send({ message: 'Missing code or state parameter' });
      }
      if (!issuer || !clientId || !clientSecret || !redirectUri) {
        return reply.status(500).send({ message: 'OIDC not configured' });
      }

      // Verify state（Fix 30: nonce 一次性消费——校验通过后才删除条目）
      const storedState = oidcStateStore.get(state);
      if (!storedState) {
        return reply.status(400).send({ message: 'Invalid state parameter' });
      }

      // Discover OIDC configuration
      const oidcConfigUrl = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;
      let oidcConfig: any;
      try {
        const res = await fetch(oidcConfigUrl);
        oidcConfig = await res.json();
      } catch {
        return reply.status(500).send({ message: 'Failed to fetch OIDC configuration' });
      }

      // Exchange authorization code for tokens
      let tokenResponse: any;
      try {
        const res = await fetch(oidcConfig.token_endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
          }).toString(),
        });
        tokenResponse = await res.json();
      } catch {
        return reply.status(500).send({ message: 'Failed to exchange authorization code' });
      }

      if (!tokenResponse.id_token) {
        return reply.status(500).send({ message: 'No id_token in token response' });
      }

      // Verify the id_token using JWKS（Fix 30: 增加 nonce 校验，防重放/CSRF；
      // jose v6 的 JWTVerifyOptions 无 nonce 选项，验证后手动比对）
      let payload: jose.JWTPayload;
      try {
        const JWKS = jose.createRemoteJWKSet(new URL(oidcConfig.jwks_uri));
        const { payload: verified } = await jose.jwtVerify(tokenResponse.id_token, JWKS, {
          issuer,
          audience: clientId,
        });
        payload = verified;
      } catch {
        oidcStateStore.delete(state);
        return reply.status(500).send({ message: 'Failed to verify id_token' });
      }

      // nonce 一次性消费：比对失败或通过后均删除 state 条目
      if (payload.nonce !== storedState.nonce) {
        oidcStateStore.delete(state);
        return reply.status(400).send({ message: 'Invalid nonce' });
      }
      oidcStateStore.delete(state);

      const ssoId = (payload.sub || payload.email || '') as string;
      const email = (payload.email || `${ssoId}@oidc.local`) as string;
      // Fix 30: 兜底邮箱（*@oidc.local）视为未验证；真实邮箱尊重 IdP 的 email_verified 声明
      const emailVerified = email.endsWith('@oidc.local')
        ? false
        : typeof payload.email_verified === 'boolean'
          ? payload.email_verified
          : true;
      const username = (payload.preferred_username ||
        payload.name ||
        email.split('@')[0]) as string;

      // Find or create user by ssoId (or email fallback)
      const [found] = await db
        .select()
        .from(users)
        .where(
          or(and(eq(users.ssoProvider, 'oidc'), eq(users.ssoId, ssoId)), eq(users.email, email))
        )
        .limit(1);

      let user = found;

      if (user) {
        // Update existing user's SSO info
        const [updated] = await db
          .update(users)
          .set({
            ssoProvider: 'oidc',
            ssoId,
            ssoMetadata: JSON.stringify(payload),
            // update email if changed（Fix 30: 同步刷新邮箱验证状态）
            ...(user.email === email ? {} : { email, emailVerified }),
          })
          .where(eq(users.id, user.id))
          .returning();
        user = updated;
      } else {
        // Create new user
        const randomPassword = crypto.randomUUID();
        const hashed = await bcrypt.hash(randomPassword, 10);
        const [created] = await db
          .insert(users)
          .values({
            email,
            username: await uniqueUsername(username),
            passwordHash: hashed,
            ssoProvider: 'oidc',
            ssoId,
            ssoMetadata: JSON.stringify(payload),
            emailVerified,
          })
          .returning();
        user = created;
      }

      const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
      // Fix 30: token 放 URL fragment（#token=...），避免 token 进入浏览器历史/日志；
      // 前端从 location.hash 读取（配合 helmet Referrer-Policy: no-referrer 防 Referer 泄露）
      return reply.redirect(`/#token=${token}`);
    }
  );

  // ────────── OIDC Logout ──────────

  app.post(
    '/oidc/logout',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (_request, _reply) => {
      const issuer = envStr('OIDC_ISSUER');
      if (issuer) {
        const endSessionEndpoint = `${issuer.replace(/\/$/, '')}/protocol/openid-connect/logout`;
        try {
          await fetch(endSessionEndpoint, { method: 'GET' });
        } catch {
          // Ignore errors — just proceed with local logout
        }
      }
      return { message: 'Logged out' };
    }
  );

  // ────────── LDAP Login ──────────

  const ldapLoginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  app.post(
    '/ldap/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const parsed = ldapLoginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() });
      }

      const { username: inputUsername, password: inputPassword } = parsed.data;
      const ldapUrl = envStr('LDAP_URL');
      const baseDn = envStr('LDAP_BASE_DN');
      const bindDn = envStr('LDAP_BIND_DN');
      const bindCredentials = envStr('LDAP_BIND_CREDENTIALS');
      const searchFilter = envStr('LDAP_SEARCH_FILTER', '(uid={{username}})');

      if (!ldapUrl || !baseDn) {
        return reply.status(500).send({ message: 'LDAP not configured' });
      }

      // Parse LDAP URL
      const url = new URL(ldapUrl);
      const isTls = url.protocol === 'ldaps:';
      const hostname = url.hostname;
      const port = parseInt(url.port || (isTls ? '636' : '389'), 10);

      // Construct search filter (Fix 7: 用户名经 RFC 4515 转义后再拼入，杜绝过滤器注入)
      const filter = searchFilter.replace(
        /\{\{username\}\}/g,
        ldapEscapeFilterValue(inputUsername)
      );

      // Perform LDAP bind via raw socket (no external dependency)
      try {
        const ldapEntry = await ldapBindAndSearch(
          hostname,
          port,
          isTls,
          bindDn,
          bindCredentials,
          baseDn,
          filter,
          inputPassword
        );
        if (!ldapEntry) {
          return reply.status(401).send({ message: 'LDAP authentication failed' });
        }

        const email = ldapEntry.mail || ldapEntry.email || `${inputUsername}@ldap.local`;
        const displayName =
          ldapEntry.displayName || ldapEntry.cn || ldapEntry.name || inputUsername;
        const ssoId = ldapEntry.dn || ldapEntry.uid || inputUsername;

        // Find or create user
        const [found] = await db
          .select()
          .from(users)
          .where(
            or(and(eq(users.ssoProvider, 'ldap'), eq(users.ssoId, ssoId)), eq(users.email, email))
          )
          .limit(1);

        let user = found;

        if (user) {
          const [updated] = await db
            .update(users)
            .set({
              ssoProvider: 'ldap',
              ssoId,
              ssoMetadata: JSON.stringify(ldapEntry),
            })
            .where(eq(users.id, user.id))
            .returning();
          user = updated;
        } else {
          const randomPassword = crypto.randomUUID();
          const hashed = await bcrypt.hash(randomPassword, 10);
          const [created] = await db
            .insert(users)
            .values({
              email,
              username: await uniqueUsername(displayName),
              passwordHash: hashed,
              ssoProvider: 'ldap',
              ssoId,
              ssoMetadata: JSON.stringify(ldapEntry),
              // Fix 30: LDAP 兜底邮箱（*@ldap.local）视为未验证
              emailVerified: !email.endsWith('@ldap.local'),
            })
            .returning();
          user = created;
        }

        const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
        return {
          token,
          provider: 'ldap',
          user: { id: user.id, email: user.email, username: user.username, role: user.role },
        };
      } catch (err: any) {
        return reply.status(401).send({ message: err.message || 'LDAP authentication failed' });
      }
    }
  );
}

// ── Helper: OIDC state store (in-memory) ────────────────────────────────

const oidcStateStore = new Map<string, { nonce: string; createdAt: number }>();

// ── Fix 30: OIDC state 定期清理（TTL 10 分钟，每 10 分钟清理一次；unref 不阻塞进程退出）──
setInterval(
  () => {
    const cutoff = Date.now() - 10 * 60 * 1000;
    for (const [key, entry] of oidcStateStore) {
      if (entry.createdAt < cutoff) {
        oidcStateStore.delete(key);
      }
    }
  },
  10 * 60 * 1000
).unref();

// ── Helper: Ensure unique username ──────────────────────────────────────

async function uniqueUsername(baseName: string): Promise<string> {
  let name = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32) || 'user';
  let [exists] = await db.select().from(users).where(eq(users.username, name)).limit(1);
  let i = 1;
  while (exists) {
    const suffix = `_${i}`;
    name = `${name.substring(0, 32 - suffix.length)}${suffix}`;
    [exists] = await db.select().from(users).where(eq(users.username, name)).limit(1);
    i++;
  }
  return name;
}

// ── Helper: LDAP bind + search via raw TLS socket ───────────────────────

interface LdapEntry {
  dn: string;
  [key: string]: any;
}

function ldapBuildBindRequest(dn: string, password: string): Buffer {
  // LDAP bind request (simple auth) — ASN.1 DER encoded
  // We build a minimal LDAPMessage sequence
  const msgId = Buffer.from([0x02, 0x01, 0x01]); // INTEGER 1

  // BindRequest: CHOICE { simple [0] APPLICATION 0 }
  const version = Buffer.from([0x02, 0x01, 0x03]); // INTEGER 3 (LDAPv3)
  const dnBytes = Buffer.from(dn, 'utf-8');
  const dnTag = Buffer.from([0x04, dnBytes.length]);
  const auth = Buffer.from(password, 'utf-8');
  const authTag = Buffer.from([0x80, auth.length]); // context-specific simple auth

  const bindRequest = Buffer.concat([version, dnTag, dnBytes, authTag, auth]);
  const bindRequestTag = Buffer.from([0x60, bindRequest.length]); // APPLICATION 0

  const ldapMessage = Buffer.concat([msgId, bindRequestTag, bindRequest]);
  const seq = Buffer.from([0x30, ldapMessage.length]);

  return Buffer.concat([seq, ldapMessage]);
}

function ldapBuildSearchRequest(baseDn: string, filter: string): Buffer {
  // LDAP SearchRequest — simplified for our needs
  const msgId = Buffer.from([0x02, 0x01, 0x02]); // INTEGER 2

  const baseDnBytes = Buffer.from(baseDn, 'utf-8');
  const baseDnTag = Buffer.from([0x04, baseDnBytes.length]);

  // Scope: wholeSubtree (2)
  const scope = Buffer.from([0x0a, 0x01, 0x02]);
  // DerefAliases: neverDerefAliases (0)
  const deref = Buffer.from([0x0a, 0x01, 0x00]);
  // SizeLimit: 0 (no limit)
  const sizeLimit = Buffer.from([0x02, 0x01, 0x00]);
  // TimeLimit: 0 (no limit)
  const timeLimit = Buffer.from([0x02, 0x01, 0x00]);
  // TypesOnly: false
  const typesOnly = Buffer.from([0x01, 0x01, 0x00]);

  // Filter: (uid=username) — AND filter format
  // We'll parse simple filter expressions: (attr=value)
  const filterBytes = ldapBuildFilter(filter);

  // Attributes: all user attributes, empty list means all
  const attrs = Buffer.from([0x30, 0x00]);

  const searchRequest = Buffer.concat([
    baseDnTag,
    baseDnBytes,
    scope,
    deref,
    sizeLimit,
    timeLimit,
    typesOnly,
    filterBytes,
    attrs,
  ]);
  const searchRequestTag = Buffer.from([0x63, searchRequest.length]); // APPLICATION 3

  const ldapMessage = Buffer.concat([msgId, searchRequestTag, searchRequest]);
  const seq = Buffer.from([0x30, ldapMessage.length]);

  return Buffer.concat([seq, ldapMessage]);
}

/** 解析 (attr=value) 过滤器并编码为 LDAP equalityMatch DER（导出以便单测） */
export function ldapBuildFilter(filterStr: string): Buffer {
  // Parse (attr=value) filters — simplified equalityMatch filter
  // Fix 7: 解析失败必须抛错拒绝（不得退化为 objectClass present 过滤，
  //        否则任何畸形/注入过滤器都会匹配所有条目 = 认证绕过）。
  const match = filterStr.match(/^\(([^=]+)=([^)]+)\)$/);
  if (!match) {
    throw new Error('LDAP filter parse failed: only simple (attr=value) filters are supported');
  }

  const attr = match[1];
  // Fix 7: 按 RFC 4515 解码转义值（\2a → '*', \28 → '(', \29 → ')', \5c → '\'）
  //        转义后的注入载荷在此还原为字面字符，作为普通 value 参与 equalityMatch。
  const value = ldapUnescapeFilterValue(match[2]);
  const attrBytes = Buffer.from(attr, 'utf-8');
  const valueBytes = Buffer.from(value, 'utf-8');

  // EqualityMatch tag: [0xa3] length attrTag attrBytes valueTag valueBytes
  const attrTag = Buffer.from([0x04, attrBytes.length]);
  const valueTag = Buffer.from([0x04, valueBytes.length]);
  const inner = Buffer.concat([attrTag, attrBytes, valueTag, valueBytes]);

  return Buffer.concat([Buffer.from([0xa3, inner.length]), inner]);
}

/** RFC 4515 转义值解码：\\2a \\28 \\29 \\5c \\00（hex 转义）→ 字面字符（导出以便单测） */
export function ldapUnescapeFilterValue(value: string): string {
  return value.replace(/\\([0-9a-fA-F]{2})/g, (_m, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

function ldapParseResult(data: Buffer): LdapEntry | null {
  // Very simplified LDAP result parser — extracts DN and attributes
  try {
    // Skip past the LDAPResult/LDAPSearchResultEntry
    // We're looking for SearchResultEntry (0x64 APPLICATION 4)

    let offset = 0;
    while (offset < data.length) {
      if (data[offset] === 0x30) {
        // LDAPMessage sequence
        offset += 2;
        if (data[offset] === 0x02) {
          offset += 2; // msgId
        }
        continue;
      }
      if (data[offset] === 0x64) {
        // SearchResultEntry
        offset += 2;

        // Object name (DN)
        if (data[offset] === 0x04) {
          const dnLen = data[offset + 1];
          const dn = data.subarray(offset + 2, offset + 2 + dnLen).toString('utf-8');
          offset += 2 + dnLen;

          const entry: LdapEntry = { dn };

          // Attributes
          if (data[offset] === 0x30) {
            const attrListLen = data[offset + 1];
            offset += 2;
            const attrListEnd = offset + attrListLen;

            while (offset < attrListEnd) {
              if (data[offset] === 0x30) {
                const attrLen = data[offset + 1];
                offset += 2;
                const attrEnd = offset + attrLen;

                // AttributeDescription (type)
                if (data[offset] === 0x04) {
                  const typeLen = data[offset + 1];
                  const type = data.subarray(offset + 2, offset + 2 + typeLen).toString('utf-8');
                  offset += 2 + typeLen;

                  // Values
                  if (data[offset] === 0x31) {
                    const valSetLen = data[offset + 1];
                    offset += 2;
                    const valSetEnd = offset + valSetLen;

                    const values: string[] = [];
                    while (offset < valSetEnd) {
                      if (data[offset] === 0x04) {
                        const valLen = data[offset + 1];
                        const val = data
                          .subarray(offset + 2, offset + 2 + valLen)
                          .toString('utf-8');
                        values.push(val);
                        offset += 2 + valLen;
                      } else {
                        offset++;
                      }
                    }
                    entry[type] = values.length === 1 ? values[0] : values;
                  } else {
                    offset = attrEnd;
                  }
                } else {
                  offset = attrEnd;
                }
              } else {
                offset++;
              }
            }
          }
          return entry;
        }
      } else {
        offset++;
      }
    }
  } catch {
    // Parsing failed
  }
  return null;
}

async function ldapBindAndSearch(
  hostname: string,
  port: number,
  isTls: boolean,
  bindDn: string,
  bindCredentials: string,
  baseDn: string,
  filter: string,
  userPassword: string
): Promise<LdapEntry | null> {
  const tls = await import('tls');
  const net = await import('net');

  return new Promise((resolve, reject) => {
    // Fix 8: 默认校验 TLS 证书（rejectUnauthorized: true），支持 LDAP_CA_CERT 注入自定义 CA
    const ca = process.env.LDAP_CA_CERT ? [Buffer.from(process.env.LDAP_CA_CERT)] : undefined;
    const socket = isTls
      ? tls.connect(port, hostname, { rejectUnauthorized: true, ...(ca ? { ca } : {}) })
      : net.connect(port, hostname);

    let buf = Buffer.alloc(0);
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('LDAP connection timeout'));
    }, LDAP_TIMEOUT_MS);

    socket.on('connect', () => {
      // Step 1: Bind with service account
      const bindReq = ldapBuildBindRequest(bindDn || '', bindCredentials || '');
      socket.write(bindReq);
    });

    socket.on('data', (data: Buffer) => {
      buf = Buffer.concat([buf, data]);

      // Try to find the bind response first
      if (buf.length > 10) {
        // Check if bind succeeded (look for LDAPResult application tag 0x61)
        // Then proceed to search as the user
        if (buf.length < 20) return;

        // Check bind result status code at a known offset
        const bindResultCode = buf[12]; // Simplified: result code is usually here
        if (bindResultCode !== 0) {
          clearTimeout(timeout);
          socket.destroy();
          reject(new Error('LDAP bind failed'));
          return;
        }

        // Now perform search as the bound service account
        // But first, we need to unbind and rebind as the user to verify password
        // Actually, for LDAP auth, we bind directly with the user's credentials
        // Since we already bound with service account to search, we need to
        // first search for the user's DN, then do a second bind as the user

        // For simplicity, skip the user-verification bind here
        // and just do a simple search
        // ...

        // Actually, let's restructure: first search with service account,
        // then rebind as the user to verify password

        // Since we already sent bind with service creds, let's now search
        const searchReq = ldapBuildSearchRequest(baseDn, filter);
        socket.write(searchReq);
        return;
      }

      // Try to parse search result
      if (buf.length > 50) {
        clearTimeout(timeout);

        const entry = ldapParseResult(buf);
        socket.end();

        if (entry) {
          // Now verify user password by doing a second bind as the user
          // This actually verifies the password
          const userDn = entry.dn;
          if (userPassword) {
            // Create a new socket for user-verification bind
            // Fix 8: verifier 同样默认校验 TLS + 10s 超时 + 错误处理（与主 socket 一致）
            const verifier = isTls
              ? tls.connect(port, hostname, { rejectUnauthorized: true, ...(ca ? { ca } : {}) })
              : net.connect(port, hostname);

            let verBuf = Buffer.alloc(0);
            const verifierTimeout = setTimeout(() => {
              verifier.destroy();
              reject(new Error('LDAP user-verification timeout'));
            }, LDAP_TIMEOUT_MS);
            verifier.on('connect', () => {
              const userBindReq = ldapBuildBindRequest(userDn, userPassword);
              verifier.write(userBindReq);
            });
            verifier.on('data', (d: Buffer) => {
              verBuf = Buffer.concat([verBuf, d]);
              if (verBuf.length >= 20) {
                clearTimeout(verifierTimeout);
                const resultCode = verBuf[12];
                verifier.end();
                if (resultCode === 0) {
                  resolve(entry);
                } else {
                  reject(new Error('LDAP user authentication failed'));
                }
              }
            });
            verifier.on('error', (err: Error) => {
              clearTimeout(verifierTimeout);
              reject(err);
            });
          } else {
            resolve(entry);
          }
        } else {
          reject(new Error('LDAP user not found'));
        }
      }
    });

    socket.on('error', (err: Error) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

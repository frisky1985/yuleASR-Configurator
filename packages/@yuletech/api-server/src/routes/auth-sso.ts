import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'

// ── Environment helpers ─────────────────────────────────────────────────

function envStr(key: string, fallback = ''): string {
  return process.env[key] || fallback
}

// ── OIDC Routes ─────────────────────────────────────────────────────────

export async function ssoRoutes(app: FastifyInstance) {
  // ────────── OIDC Login (redirect) ──────────

  app.get('/oidc/login', async (_request, reply) => {
    const issuer = envStr('OIDC_ISSUER')
    const clientId = envStr('OIDC_CLIENT_ID')
    const redirectUri = envStr('OIDC_REDIRECT_URI')

    if (!issuer || !clientId || !redirectUri) {
      return reply.status(500).send({ message: 'OIDC not configured' })
    }

    // Discover OIDC configuration from the issuer
    const oidcConfigUrl = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`
    let oidcConfig: any
    try {
      const res = await fetch(oidcConfigUrl)
      oidcConfig = await res.json()
    } catch {
      return reply.status(500).send({ message: 'Failed to fetch OIDC configuration' })
    }

    const authorizationUrl = oidcConfig.authorization_endpoint
    const state = crypto.randomUUID()
    const nonce = crypto.randomUUID()

    // Store state/nonce in a simple in-memory map (for production, use session/cache)
    oidcStateStore.set(state, { nonce, createdAt: Date.now() })

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      state,
      nonce,
    })

    return reply.redirect(`${authorizationUrl}?${params.toString()}`)
  })

  // ────────── OIDC Callback ──────────

  app.get('/oidc/callback', async (request, reply) => {
    const { code, state } = request.query as { code?: string; state?: string }
    const issuer = envStr('OIDC_ISSUER')
    const clientId = envStr('OIDC_CLIENT_ID')
    const clientSecret = envStr('OIDC_CLIENT_SECRET')
    const redirectUri = envStr('OIDC_REDIRECT_URI')

    if (!code || !state) {
      return reply.status(400).send({ message: 'Missing code or state parameter' })
    }
    if (!issuer || !clientId || !clientSecret || !redirectUri) {
      return reply.status(500).send({ message: 'OIDC not configured' })
    }

    // Verify state
    const storedState = oidcStateStore.get(state)
    if (!storedState) {
      return reply.status(400).send({ message: 'Invalid state parameter' })
    }
    oidcStateStore.delete(state)

    // Discover OIDC configuration
    const oidcConfigUrl = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`
    let oidcConfig: any
    try {
      const res = await fetch(oidcConfigUrl)
      oidcConfig = await res.json()
    } catch {
      return reply.status(500).send({ message: 'Failed to fetch OIDC configuration' })
    }

    // Exchange authorization code for tokens
    let tokenResponse: any
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
      })
      tokenResponse = await res.json()
    } catch {
      return reply.status(500).send({ message: 'Failed to exchange authorization code' })
    }

    if (!tokenResponse.id_token) {
      return reply.status(500).send({ message: 'No id_token in token response' })
    }

    // Verify the id_token using JWKS
    let payload: jose.JWTPayload
    try {
      const JWKS = jose.createRemoteJWKSet(new URL(oidcConfig.jwks_uri))
      const { payload: verified } = await jose.jwtVerify(tokenResponse.id_token, JWKS, {
        issuer,
        audience: clientId,
      })
      payload = verified
    } catch {
      return reply.status(500).send({ message: 'Failed to verify id_token' })
    }

    const ssoId = (payload.sub || payload.email || '') as string
    const email = (payload.email || `${ssoId}@oidc.local`) as string
    const username = (payload.preferred_username || payload.name || email.split('@')[0]) as string

    const { prisma } = await import('../lib/prisma.js')

    // Find or create user by ssoId (or email fallback)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { ssoProvider: 'oidc', ssoId },
          { email },
        ],
      },
    })

    if (user) {
      // Update existing user's SSO info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ssoProvider: 'oidc',
          ssoId,
          ssoMetadata: JSON.stringify(payload),
          ...(user.email === email ? {} : { email }), // update email if changed
        },
      })
    } else {
      // Create new user
      const randomPassword = crypto.randomUUID()
      const hashed = await bcrypt.hash(randomPassword, 10)
      user = await prisma.user.create({
        data: {
          email,
          username: await uniqueUsername(prisma, username),
          password: hashed,
          ssoProvider: 'oidc',
          ssoId,
          ssoMetadata: JSON.stringify(payload),
        },
      })
    }

    const token = (app as any).jwt.sign({ id: user.id, email: user.email, role: user.role })
    // Redirect with token in URL fragment (frontend picks it up)
    return reply.redirect(`/?token=${token}`)
  })

  // ────────── OIDC Logout ──────────

  app.post('/oidc/logout', async (_request, reply) => {
    const issuer = envStr('OIDC_ISSUER')
    if (issuer) {
      const endSessionEndpoint = `${issuer.replace(/\/$/, '')}/protocol/openid-connect/logout`
      try {
        await fetch(endSessionEndpoint, { method: 'GET' })
      } catch {
        // Ignore errors — just proceed with local logout
      }
    }
    return { message: 'Logged out' }
  })

  // ────────── LDAP Login ──────────

  const ldapLoginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  })

  app.post('/ldap/login', async (request, reply) => {
    const parsed = ldapLoginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid input', errors: parsed.error.flatten() })
    }

    const { username: inputUsername, password: inputPassword } = parsed.data
    const ldapUrl = envStr('LDAP_URL')
    const baseDn = envStr('LDAP_BASE_DN')
    const bindDn = envStr('LDAP_BIND_DN')
    const bindCredentials = envStr('LDAP_BIND_CREDENTIALS')
    const searchFilter = envStr('LDAP_SEARCH_FILTER', '(uid={{username}})')

    if (!ldapUrl || !baseDn) {
      return reply.status(500).send({ message: 'LDAP not configured' })
    }

    // Parse LDAP URL
    const url = new URL(ldapUrl)
    const isTls = url.protocol === 'ldaps:'
    const hostname = url.hostname
    const port = parseInt(url.port || (isTls ? '636' : '389'), 10)

    // Construct search filter
    const filter = searchFilter.replace(/\{\{username\}\}/g, inputUsername)

    // Perform LDAP bind via raw socket (no external dependency)
    try {
      const ldapEntry = await ldapBindAndSearch(hostname, port, isTls, bindDn, bindCredentials, baseDn, filter, inputPassword)
      if (!ldapEntry) {
        return reply.status(401).send({ message: 'LDAP authentication failed' })
      }

      const email = ldapEntry.mail || ldapEntry.email || `${inputUsername}@ldap.local`
      const displayName = ldapEntry.displayName || ldapEntry.cn || ldapEntry.name || inputUsername
      const ssoId = ldapEntry.dn || ldapEntry.uid || inputUsername

      const { prisma } = await import('../lib/prisma.js')

      // Find or create user
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { ssoProvider: 'ldap', ssoId },
            { email },
          ],
        },
      })

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            ssoProvider: 'ldap',
            ssoId,
            ssoMetadata: JSON.stringify(ldapEntry),
          },
        })
      } else {
        const randomPassword = crypto.randomUUID()
        const hashed = await bcrypt.hash(randomPassword, 10)
        user = await prisma.user.create({
          data: {
            email,
            username: await uniqueUsername(prisma, displayName),
            password: hashed,
            ssoProvider: 'ldap',
            ssoId,
            ssoMetadata: JSON.stringify(ldapEntry),
          },
        })
      }

      const token = (app as any).jwt.sign({ id: user.id, email: user.email, role: user.role })
      return {
        token,
        provider: 'ldap',
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
      }
    } catch (err: any) {
      return reply.status(401).send({ message: err.message || 'LDAP authentication failed' })
    }
  })
}

// ── Helper: OIDC state store (in-memory) ────────────────────────────────

const oidcStateStore = new Map<string, { nonce: string; createdAt: number }>()

// ── Helper: Ensure unique username ──────────────────────────────────────

async function uniqueUsername(prisma: any, baseName: string): Promise<string> {
  let name = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32) || 'user'
  let exists = await prisma.user.findUnique({ where: { username: name } })
  let i = 1
  while (exists) {
    const suffix = `_${i}`
    name = `${name.substring(0, 32 - suffix.length)}${suffix}`
    exists = await prisma.user.findUnique({ where: { username: name } })
    i++
  }
  return name
}

// ── Helper: LDAP bind + search via raw TLS socket ───────────────────────

interface LdapEntry {
  dn: string
  [key: string]: any
}

function ldapBuildBindRequest(dn: string, password: string): Buffer {
  // LDAP bind request (simple auth) — ASN.1 DER encoded
  // We build a minimal LDAPMessage sequence
  const msgId = Buffer.from([0x02, 0x01, 0x01]) // INTEGER 1

  // BindRequest: CHOICE { simple [0] APPLICATION 0 }
  const version = Buffer.from([0x02, 0x01, 0x03]) // INTEGER 3 (LDAPv3)
  const dnBytes = Buffer.from(dn, 'utf-8')
  const dnTag = Buffer.from([0x04, dnBytes.length])
  const auth = Buffer.from(password, 'utf-8')
  const authTag = Buffer.from([0x80, auth.length]) // context-specific simple auth

  const bindRequest = Buffer.concat([version, dnTag, dnBytes, authTag, auth])
  const bindRequestTag = Buffer.from([0x60, bindRequest.length]) // APPLICATION 0

  const ldapMessage = Buffer.concat([msgId, bindRequestTag, bindRequest])
  const seq = Buffer.from([0x30, ldapMessage.length])

  return Buffer.concat([seq, ldapMessage])
}

function ldapBuildSearchRequest(baseDn: string, filter: string): Buffer {
  // LDAP SearchRequest — simplified for our needs
  const msgId = Buffer.from([0x02, 0x01, 0x02]) // INTEGER 2

  const baseDnBytes = Buffer.from(baseDn, 'utf-8')
  const baseDnTag = Buffer.from([0x04, baseDnBytes.length])

  // Scope: wholeSubtree (2)
  const scope = Buffer.from([0x0a, 0x01, 0x02])
  // DerefAliases: neverDerefAliases (0)
  const deref = Buffer.from([0x0a, 0x01, 0x00])
  // SizeLimit: 0 (no limit)
  const sizeLimit = Buffer.from([0x02, 0x01, 0x00])
  // TimeLimit: 0 (no limit)
  const timeLimit = Buffer.from([0x02, 0x01, 0x00])
  // TypesOnly: false
  const typesOnly = Buffer.from([0x01, 0x01, 0x00])

  // Filter: (uid=username) — AND filter format
  // We'll parse simple filter expressions: (attr=value)
  const filterBytes = ldapBuildFilter(filter)

  // Attributes: all user attributes, empty list means all
  const attrs = Buffer.from([0x30, 0x00])

  const searchRequest = Buffer.concat([
    baseDnTag, baseDnBytes,
    scope, deref, sizeLimit, timeLimit, typesOnly,
    filterBytes,
    attrs,
  ])
  const searchRequestTag = Buffer.from([0x63, searchRequest.length]) // APPLICATION 3

  const ldapMessage = Buffer.concat([msgId, searchRequestTag, searchRequest])
  const seq = Buffer.from([0x30, ldapMessage.length])

  return Buffer.concat([seq, ldapMessage])
}

function ldapBuildFilter(filterStr: string): Buffer {
  // Parse (attr=value) filters — simplified equalityMatch filter
  const match = filterStr.match(/^\(([^=]+)=([^)]+)\)$/)
  if (!match) {
    // Fallback: return a present filter for objectClass
    const attrBytes = Buffer.from('objectClass', 'utf-8')
    const attrTag = Buffer.from([0x04, attrBytes.length])
    return Buffer.concat([Buffer.from([0x87, attrBytes.length + 2]), attrTag, attrBytes])
  }

  const attr = match[1]
  const value = match[2]
  const attrBytes = Buffer.from(attr, 'utf-8')
  const valueBytes = Buffer.from(value, 'utf-8')

  // EqualityMatch tag: [0xa3] length attrTag attrBytes valueTag valueBytes
  const attrTag = Buffer.from([0x04, attrBytes.length])
  const valueTag = Buffer.from([0x04, valueBytes.length])
  const inner = Buffer.concat([attrTag, attrBytes, valueTag, valueBytes])

  return Buffer.concat([Buffer.from([0xa3, inner.length]), inner])
}

function ldapParseResult(data: Buffer): LdapEntry | null {
  // Very simplified LDAP result parser — extracts DN and attributes
  try {
    // Skip past the LDAPResult/LDAPSearchResultEntry
    // We're looking for SearchResultEntry (0x64 APPLICATION 4)

    let offset = 0
    while (offset < data.length) {
      if (data[offset] === 0x30) {
        // LDAPMessage sequence
        offset += 2
        if (data[offset] === 0x02) {
          offset += 2 // msgId
        }
        continue
      }
      if (data[offset] === 0x64) {
        // SearchResultEntry
        const len = data[offset + 1]
        offset += 2

        // Object name (DN)
        if (data[offset] === 0x04) {
          const dnLen = data[offset + 1]
          const dn = data.subarray(offset + 2, offset + 2 + dnLen).toString('utf-8')
          offset += 2 + dnLen

          const entry: LdapEntry = { dn }

          // Attributes
          if (data[offset] === 0x30) {
            const attrListLen = data[offset + 1]
            offset += 2
            const attrListEnd = offset + attrListLen

            while (offset < attrListEnd) {
              if (data[offset] === 0x30) {
                const attrLen = data[offset + 1]
                offset += 2
                const attrEnd = offset + attrLen

                // AttributeDescription (type)
                if (data[offset] === 0x04) {
                  const typeLen = data[offset + 1]
                  const type = data.subarray(offset + 2, offset + 2 + typeLen).toString('utf-8')
                  offset += 2 + typeLen

                  // Values
                  if (data[offset] === 0x31) {
                    const valSetLen = data[offset + 1]
                    offset += 2
                    const valSetEnd = offset + valSetLen

                    const values: string[] = []
                    while (offset < valSetEnd) {
                      if (data[offset] === 0x04) {
                        const valLen = data[offset + 1]
                        const val = data.subarray(offset + 2, offset + 2 + valLen).toString('utf-8')
                        values.push(val)
                        offset += 2 + valLen
                      } else {
                        offset++
                      }
                    }
                    entry[type] = values.length === 1 ? values[0] : values
                  } else {
                    offset = attrEnd
                  }
                } else {
                  offset = attrEnd
                }
              } else {
                offset++
              }
            }
          }
          return entry
        }
      } else {
        offset++
      }
    }
  } catch {
    // Parsing failed
  }
  return null
}

async function ldapBindAndSearch(
  hostname: string,
  port: number,
  isTls: boolean,
  bindDn: string,
  bindCredentials: string,
  baseDn: string,
  filter: string,
  userPassword: string,
): Promise<LdapEntry | null> {
  const tls = await import('tls')
  const net = await import('net')

  return new Promise((resolve, reject) => {
    const socket = isTls
      ? tls.connect(port, hostname, { rejectUnauthorized: false })
      : net.connect(port, hostname)

    let buf = Buffer.alloc(0)
    const timeout = setTimeout(() => {
      socket.destroy()
      reject(new Error('LDAP connection timeout'))
    }, 10000)

    socket.on('connect', () => {
      // Step 1: Bind with service account
      const bindReq = ldapBuildBindRequest(bindDn || '', bindCredentials || '')
      socket.write(bindReq)
    })

    socket.on('data', (data: Buffer) => {
      buf = Buffer.concat([buf, data])

      // Try to find the bind response first
      if (buf.length > 10) {
        // Check if bind succeeded (look for LDAPResult application tag 0x61)
        // Then proceed to search as the user
        if (buf.length < 20) return

        // Check bind result status code at a known offset
        const bindResultCode = buf[12] // Simplified: result code is usually here
        if (bindResultCode !== 0) {
          clearTimeout(timeout)
          socket.destroy()
          reject(new Error('LDAP bind failed'))
          return
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
        const searchReq = ldapBuildSearchRequest(baseDn, filter)
        socket.write(searchReq)
        return
      }

      // Try to parse search result
      if (buf.length > 50) {
        clearTimeout(timeout)

        const entry = ldapParseResult(buf)
        socket.end()

        if (entry) {
          // Now verify user password by doing a second bind as the user
          // This actually verifies the password
          const userDn = entry.dn
          if (userPassword) {
            // Create a new socket for user-verification bind
            const verifier = isTls
              ? tls.connect(port, hostname, { rejectUnauthorized: false })
              : net.connect(port, hostname)

            let verBuf = Buffer.alloc(0)
            verifier.on('connect', () => {
              const userBindReq = ldapBuildBindRequest(userDn, userPassword)
              verifier.write(userBindReq)
            })
            verifier.on('data', (d: Buffer) => {
              verBuf = Buffer.concat([verBuf, d])
              if (verBuf.length >= 20) {
                const resultCode = verBuf[12]
                verifier.end()
                if (resultCode === 0) {
                  resolve(entry)
                } else {
                  reject(new Error('LDAP user authentication failed'))
                }
              }
            })
            verifier.on('error', (err: Error) => reject(err))
          } else {
            resolve(entry)
          }
        } else {
          reject(new Error('LDAP user not found'))
        }
      }
    })

    socket.on('error', (err: Error) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

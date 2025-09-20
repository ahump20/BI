import type { Context, MiddlewareHandler } from 'hono';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { AuthenticationError, ConfigurationError } from '../errors';
import type { Bindings } from '../types';

export interface AuthenticatedUser {
  sub: string;
  scope?: string;
  permissions: string[];
  email?: string;
  expiresAt: number;
  token: string;
  claims: JWTPayload;
}

interface Auth0Config {
  issuer: string;
  audience: string;
}

const verifierCache = new Map<string, Auth0Verifier>();

export type BlazeVariables = {
  auth?: AuthenticatedUser;
};

class Auth0Verifier {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly config: Auth0Config) {
    const jwksUrl = new URL('.well-known/jwks.json', this.config.issuer);
    this.jwks = createRemoteJWKSet(jwksUrl);
  }

  async verify(token: string): Promise<AuthenticatedUser> {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.config.issuer,
      audience: this.config.audience,
    });

    if (!payload.sub) {
      throw new AuthenticationError('Token missing subject claim');
    }

    const permissions: string[] = Array.isArray(payload.permissions)
      ? payload.permissions.filter((value): value is string => typeof value === 'string')
      : typeof payload.scope === 'string'
        ? payload.scope.split(' ').filter((value) => value.length > 0)
        : [];

    const expiresAt = typeof payload.exp === 'number' ? payload.exp * 1000 : Date.now() + 300_000;

    return {
      sub: payload.sub,
      scope: typeof payload.scope === 'string' ? payload.scope : undefined,
      permissions,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      expiresAt,
      token,
      claims: payload,
    };
  }
}

function resolveAuth0Config(env: Bindings): Auth0Config {
  const domain = env.AUTH0_DOMAIN?.trim();
  const audience = env.AUTH0_AUDIENCE?.trim();
  const issuerRaw = env.AUTH0_ISSUER?.trim() ?? (domain ? `https://${domain}/` : undefined);

  if (!audience || !issuerRaw) {
    throw new ConfigurationError('Auth0 environment variables are not fully configured');
  }

  const issuer = normalizeIssuer(issuerRaw);
  const cacheKey = `${issuer}|${audience}`;

  let verifier = verifierCache.get(cacheKey);
  if (!verifier) {
    verifier = new Auth0Verifier({ issuer, audience });
    verifierCache.set(cacheKey, verifier);
  }

  return { issuer, audience };
}

function getVerifier(env: Bindings): Auth0Verifier {
  const { issuer, audience } = resolveAuth0Config(env);
  const cacheKey = `${issuer}|${audience}`;
  const verifier = verifierCache.get(cacheKey);
  if (!verifier) {
    throw new ConfigurationError('Auth0 verifier not initialized');
  }
  return verifier;
}

function normalizeIssuer(value: string): string {
  const prefixed = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return prefixed.endsWith('/') ? prefixed : `${prefixed}/`;
}

export function requireAuth(): MiddlewareHandler<{ Bindings: Bindings; Variables: BlazeVariables }> {
  return async (c, next) => {
    let verifier: Auth0Verifier;
    try {
      verifier = getVerifier(c.env);
    } catch (error) {
      if (error instanceof ConfigurationError) {
        return c.json({ error: error.message, code: error.code }, error.status);
      }
      throw error;
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return c.json({ error: 'Missing bearer token' }, 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return c.json({ error: 'Invalid bearer token' }, 401);
    }

    try {
      const user = await verifier.verify(token);
      c.set('auth', user);
    } catch (error) {
      console.warn('Auth0 verification failed', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await next();
  };
}

export function getAuthenticatedUser(
  c: Context<{ Bindings: Bindings; Variables: BlazeVariables }>
): AuthenticatedUser | undefined {
  return c.get('auth');
}

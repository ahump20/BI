import type { Bindings } from '../types';

export interface SentryContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id?: string; email?: string };
  request?: { method: string; url: string };
  level?: 'error' | 'warning' | 'info';
}

interface SentryParts {
  dsn: string;
  endpoint: string;
  publicKey: string;
}

const clientCache = new Map<string, SentryClient>();

export class SentryClient {
  constructor(private readonly parts: SentryParts) {}

  async captureException(error: unknown, context: SentryContext = {}): Promise<void> {
    try {
      const eventId = crypto.randomUUID().replace(/-/g, '');
      const timestamp = Date.now() / 1000;
      const normalized = normalizeError(error);
      const headers = {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_key=${this.parts.publicKey}, sentry_version=7`,
      };

      const envelopeHeader = JSON.stringify({
        event_id: eventId,
        sent_at: new Date().toISOString(),
        sdk: { name: 'blaze-intelligence.worker', version: '1.0.0' },
        dsn: this.parts.dsn,
      });

      const eventPayload = JSON.stringify({
        event_id: eventId,
        level: context.level ?? 'error',
        timestamp,
        message: normalized.message,
        exception: {
          values: [
            {
              type: normalized.name,
              value: normalized.message,
              stacktrace: normalized.stack ? { frames: normalized.stack } : undefined,
            },
          ],
        },
        tags: context.tags,
        extra: context.extra,
        user: context.user,
        request: context.request,
      });

      const itemHeader = JSON.stringify({ type: 'event' });
      const envelope = `${envelopeHeader}\n${itemHeader}\n${eventPayload}`;

      await fetch(this.parts.endpoint, {
        method: 'POST',
        headers,
        body: envelope,
      });
    } catch (captureError) {
      console.warn('Sentry capture failed', captureError);
    }
  }
}

export function getSentryClient(env: Bindings): SentryClient | null {
  const dsn = env.SENTRY_DSN?.trim();
  if (!dsn) {
    return null;
  }

  const parts = parseSentryDsn(dsn);
  if (!parts) {
    console.warn('Invalid Sentry DSN provided');
    return null;
  }

  let client = clientCache.get(parts.endpoint);
  if (!client) {
    client = new SentryClient(parts);
    clientCache.set(parts.endpoint, client);
  }

  return client;
}

function parseSentryDsn(dsn: string): SentryParts | null {
  try {
    const url = new URL(dsn);
    if (!url.username) {
      return null;
    }

    const project = url.pathname.replace(/^\/+/, '');
    if (!project) {
      return null;
    }

    const endpoint = `${url.protocol}//${url.host}/api/${project}/envelope/`;
    return {
      dsn,
      endpoint,
      publicKey: url.username,
    };
  } catch {
    return null;
  }
}

function normalizeError(error: unknown): { name: string; message: string; stack?: { filename: string; function?: string; lineno?: number; colno?: number }[] } {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: parseStack(error.stack),
    };
  }
  return {
    name: typeof error,
    message: typeof error === 'string' ? error : JSON.stringify(error),
  };
}

function parseStack(stack?: string) {
  if (!stack) {
    return undefined;
  }

  return stack
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .map((line) => {
      const match = /at (?:(?<fn>[^\s]+) )?\(?([^:]+):(\d+):(\d+)\)?/.exec(line);
      if (!match) {
        return { filename: line };
      }
      const [, , file, lineNumber, column] = match;
      return {
        filename: file,
        function: match.groups?.fn,
        lineno: Number.parseInt(lineNumber, 10),
        colno: Number.parseInt(column, 10),
      };
    });
}

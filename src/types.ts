export type Bindings = {
  CACHE?: KVNamespace;
  ANALYTICS_CACHE?: KVNamespace;
  SPORTS_DATA?: KVNamespace;
  USER_SESSIONS?: KVNamespace;
  DB?: D1Database;
  BLAZE_DB?: D1Database;
  MEDIA?: R2Bucket;
  MEDIA_STORAGE?: R2Bucket;
  DATA_STORAGE?: R2Bucket;
  ScoreHub: DurableObjectNamespace;
  INGEST?: Queue;
  CFB_API_KEY?: string;
  ODDS_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  SPORTSDATAIO_API_KEY?: string;
  AUTH0_DOMAIN?: string;
  AUTH0_AUDIENCE?: string;
  AUTH0_ISSUER?: string;
  SENTRY_DSN?: string;
};

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

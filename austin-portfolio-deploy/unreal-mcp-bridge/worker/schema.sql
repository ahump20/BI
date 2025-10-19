-- D1 schema for job queue
DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL, -- queued | processing | done | failed
  spec TEXT NOT NULL,
  r2_key TEXT,
  error TEXT,
  duration_s INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
import { neon } from '@neondatabase/serverless';

declare const process: { env: Record<string, string | undefined> };

let _sql: ReturnType<typeof neon> | null = null;
let _schemaReady = false;

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

/**
 * Lazy-initialized Neon Serverless HTTP SQL client (build-safe).
 */
export function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }
  if (!_sql) {
    _sql = neon(url);
  }
  return _sql;
}

/**
 * Ensures the PostgreSQL tables exist (idempotent & fast after first warm invocation).
 */
export async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS colorio_state (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS colorio_orders (
      id TEXT PRIMARY KEY,
      folio TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendiente',
      design_status TEXT NOT NULL DEFAULT 'aprobado',
      payment_status TEXT NOT NULL DEFAULT 'pendiente',
      total_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_units INT NOT NULL DEFAULT 0,
      seller_code TEXT,
      referral_code TEXT,
      customer_name TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_colorio_orders_created_at
    ON colorio_orders (created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS colorio_tracked_links (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      label TEXT NOT NULL,
      product_name TEXT NOT NULL,
      seller_code TEXT,
      referral_code TEXT,
      channel TEXT NOT NULL DEFAULT 'direct',
      shares INT NOT NULL DEFAULT 1,
      opens INT NOT NULL DEFAULT 0,
      conversions INT NOT NULL DEFAULT 0,
      last_device TEXT,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_opened_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_colorio_links_created_at
    ON colorio_tracked_links (created_at DESC)
  `;

  _schemaReady = true;
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

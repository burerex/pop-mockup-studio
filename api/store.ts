import { ensureSchema, getSql, hasDatabaseUrl, jsonResponse } from './_db.js';

const ALLOWED_KEYS = new Set([
  'products',
  'coupons',
  'sellers',
  'referrals',
  'promo',
  'settings',
]);

export async function GET(): Promise<Response> {
  if (!hasDatabaseUrl()) {
    return jsonResponse({ connected: false, provider: 'local' }, 200);
  }

  try {
    await ensureSchema();
    const sql = getSql();

    const [stateRows, orderRows, linkRows] = await Promise.all([
      sql`SELECT key, value FROM colorio_state`,
      sql`SELECT payload FROM colorio_orders ORDER BY created_at DESC LIMIT 300`,
      sql`SELECT payload, shares, opens, conversions, last_device, last_opened_at FROM colorio_tracked_links ORDER BY created_at DESC LIMIT 300`,
    ]);

    const stateMap: Record<string, unknown> = {};
    for (const row of stateRows as { key: string; value: unknown }[]) {
      stateMap[row.key] = row.value;
    }

    const orders = (orderRows as { payload: Record<string, unknown> }[]).map((r) => r.payload);

    const trackedLinks = (
      linkRows as {
        payload: Record<string, unknown>;
        shares: number;
        opens: number;
        conversions: number;
        last_device: string | null;
        last_opened_at: string | null;
      }[]
    ).map((r) => ({
      ...r.payload,
      shares: r.shares,
      opens: r.opens,
      conversions: r.conversions,
      ...(r.last_device ? { lastDevice: r.last_device } : {}),
      ...(r.last_opened_at ? { lastOpenedAt: new Date(r.last_opened_at).getTime() } : {}),
    }));

    return jsonResponse({
      connected: true,
      provider: 'neon-postgres',
      state: stateMap,
      orders,
      trackedLinks,
    });
  } catch (error) {
    console.error('[api/store GET] Neon error:', error);
    return jsonResponse(
      { connected: false, error: 'Database read failed' },
      500
    );
  }
}

export async function PUT(request: Request): Promise<Response> {
  if (!hasDatabaseUrl()) {
    return jsonResponse({ connected: false, saved: false }, 200);
  }

  try {
    const body = (await request.json()) as {
      key?: string;
      value?: unknown;
      seed?: Record<string, unknown>;
      seedOrders?: Record<string, unknown>[];
      seedLinks?: Record<string, unknown>[];
    };

    await ensureSchema();
    const sql = getSql();

    // Optional one-time initial seed when DB is freshly provisioned
    if (body.seed && typeof body.seed === 'object') {
      for (const [k, v] of Object.entries(body.seed)) {
        if (!ALLOWED_KEYS.has(k)) continue;
        await sql`
          INSERT INTO colorio_state (key, value, updated_at)
          VALUES (${k}, ${JSON.stringify(v)}::jsonb, NOW())
          ON CONFLICT (key) DO NOTHING
        `;
      }

      if (Array.isArray(body.seedOrders)) {
        const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM colorio_orders`) as {
          count: number;
        }[];
        if (count === 0) {
          for (const ord of body.seedOrders) {
            await sql`
              INSERT INTO colorio_orders (
                id, folio, status, design_status, payment_status,
                total_usd, total_units, seller_code, referral_code,
                customer_name, payload, created_at
              )
              VALUES (
                ${String(ord.id)},
                ${String(ord.folio)},
                ${String(ord.status || 'pendiente')},
                ${String(ord.designStatus || 'aprobado')},
                ${String(ord.paymentStatus || 'pendiente')},
                ${Number(ord.totalUsd || 0)},
                ${Number(ord.totalUnits || 0)},
                ${ord.sellerCode ? String(ord.sellerCode) : null},
                ${ord.referralCode ? String(ord.referralCode) : null},
                ${String(ord.customerName || 'Cliente')},
                ${JSON.stringify(ord)}::jsonb,
                to_timestamp(${Number(ord.createdAt || Date.now()) / 1000})
              )
              ON CONFLICT (id) DO NOTHING
            `;
          }
        }
      }

      if (Array.isArray(body.seedLinks)) {
        const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM colorio_tracked_links`) as {
          count: number;
        }[];
        if (count === 0) {
          for (const lnk of body.seedLinks) {
            await sql`
              INSERT INTO colorio_tracked_links (
                id, url, label, product_name, seller_code, referral_code,
                channel, shares, opens, conversions, last_device, payload, created_at
              )
              VALUES (
                ${String(lnk.id)},
                ${String(lnk.url || '')},
                ${String(lnk.label || '')},
                ${String(lnk.productName || '')},
                ${lnk.sellerCode ? String(lnk.sellerCode) : null},
                ${lnk.referralCode ? String(lnk.referralCode) : null},
                ${String(lnk.channel || 'direct')},
                ${Number(lnk.shares || 1)},
                ${Number(lnk.opens || 0)},
                ${Number(lnk.conversions || 0)},
                ${lnk.lastDevice ? String(lnk.lastDevice) : null},
                ${JSON.stringify(lnk)}::jsonb,
                to_timestamp(${Number(lnk.createdAt || Date.now()) / 1000})
              )
              ON CONFLICT (id) DO NOTHING
            `;
          }
        }
      }

      return jsonResponse({ connected: true, seeded: true });
    }

    if (!body.key || !ALLOWED_KEYS.has(body.key)) {
      return jsonResponse({ error: 'Invalid state key' }, 400);
    }

    await sql`
      INSERT INTO colorio_state (key, value, updated_at)
      VALUES (${body.key}, ${JSON.stringify(body.value)}::jsonb, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;

    return jsonResponse({ connected: true, saved: true, key: body.key });
  } catch (error) {
    console.error('[api/store PUT] Neon error:', error);
    return jsonResponse({ error: 'Database write failed' }, 500);
  }
}

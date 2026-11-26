import { ensureSchema, getSql, hasDatabaseUrl, jsonResponse } from './_db.js';

export async function POST(request: Request): Promise<Response> {
  if (!hasDatabaseUrl()) {
    return jsonResponse({ connected: false, saved: false }, 200);
  }

  try {
    const body = (await request.json()) as {
      order?: Record<string, unknown>;
    };
    const ord = body.order;
    if (!ord || !ord.id || !ord.folio) {
      return jsonResponse({ error: 'Missing order payload' }, 400);
    }

    await ensureSchema();
    const sql = getSql();

    await sql`
      INSERT INTO colorio_orders (
        id, folio, status, design_status, payment_status,
        total_usd, total_units, seller_code, referral_code,
        customer_name, payload, created_at, updated_at
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
        to_timestamp(${Number(ord.createdAt || Date.now()) / 1000}),
        NOW()
      )
      ON CONFLICT (id)
      DO UPDATE SET
        status = EXCLUDED.status,
        design_status = EXCLUDED.design_status,
        payment_status = EXCLUDED.payment_status,
        total_usd = EXCLUDED.total_usd,
        payload = EXCLUDED.payload,
        updated_at = NOW()
    `;

    return jsonResponse({ connected: true, saved: true, id: ord.id, folio: ord.folio }, 201);
  } catch (error) {
    console.error('[api/orders POST] Neon error:', error);
    return jsonResponse({ error: 'Failed to save order' }, 500);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  if (!hasDatabaseUrl()) {
    return jsonResponse({ connected: false, saved: false }, 200);
  }

  try {
    const body = (await request.json()) as {
      orders?: Record<string, unknown>[];
      order?: Record<string, unknown>;
    };

    const list = body.order ? [body.order] : Array.isArray(body.orders) ? body.orders : [];
    if (!list.length) {
      return jsonResponse({ error: 'No orders provided' }, 400);
    }

    await ensureSchema();
    const sql = getSql();

    for (const ord of list) {
      if (!ord.id || !ord.folio) continue;
      await sql`
        INSERT INTO colorio_orders (
          id, folio, status, design_status, payment_status,
          total_usd, total_units, seller_code, referral_code,
          customer_name, payload, created_at, updated_at
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
          to_timestamp(${Number(ord.createdAt || Date.now()) / 1000}),
          NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET
          status = EXCLUDED.status,
          design_status = EXCLUDED.design_status,
          payment_status = EXCLUDED.payment_status,
          total_usd = EXCLUDED.total_usd,
          payload = EXCLUDED.payload,
          updated_at = NOW()
      `;
    }

    return jsonResponse({ connected: true, updated: list.length });
  } catch (error) {
    console.error('[api/orders PATCH] Neon error:', error);
    return jsonResponse({ error: 'Failed to update orders' }, 500);
  }
}

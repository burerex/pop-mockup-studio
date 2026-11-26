import { ensureSchema, getSql, hasDatabaseUrl, jsonResponse } from './_db.js';

export async function POST(request: Request): Promise<Response> {
  if (!hasDatabaseUrl()) {
    return jsonResponse({ connected: false, tracked: false }, 200);
  }

  try {
    const body = (await request.json()) as {
      action?: 'share' | 'open' | 'convert';
      link?: Record<string, unknown>;
    };

    const lnk = body.link;
    const action = body.action || 'share';
    if (!lnk || !lnk.id) {
      return jsonResponse({ error: 'Missing tracked link id' }, 400);
    }

    await ensureSchema();
    const sql = getSql();

    const id = String(lnk.id);
    const url = String(lnk.url || '');
    const label = String(lnk.label || id);
    const productName = String(lnk.productName || 'Producto POP');
    const sellerCode = lnk.sellerCode ? String(lnk.sellerCode) : null;
    const referralCode = lnk.referralCode ? String(lnk.referralCode) : null;
    const channel = String(lnk.channel || 'direct');
    const device = lnk.lastDevice ? String(lnk.lastDevice) : null;

    const initShares = action === 'share' ? 1 : 0;
    const initOpens = action === 'open' ? 1 : 0;
    const initConv = action === 'convert' ? 1 : 0;

    await sql`
      INSERT INTO colorio_tracked_links (
        id, url, label, product_name, seller_code, referral_code,
        channel, shares, opens, conversions, last_device, payload,
        created_at, last_opened_at
      )
      VALUES (
        ${id},
        ${url},
        ${label},
        ${productName},
        ${sellerCode},
        ${referralCode},
        ${channel},
        ${Math.max(1, initShares)},
        ${initOpens},
        ${initConv},
        ${device},
        ${JSON.stringify(lnk)}::jsonb,
        NOW(),
        ${action === 'open' ? new Date().toISOString() : null}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        shares = colorio_tracked_links.shares + ${initShares},
        opens = colorio_tracked_links.opens + ${initOpens},
        conversions = colorio_tracked_links.conversions + ${initConv},
        last_device = COALESCE(${device}, colorio_tracked_links.last_device),
        last_opened_at = CASE WHEN ${action === 'open'} THEN NOW() ELSE colorio_tracked_links.last_opened_at END,
        url = CASE WHEN ${url} <> '' THEN ${url} ELSE colorio_tracked_links.url END
    `;

    return jsonResponse({ connected: true, tracked: true, id, action });
  } catch (error) {
    console.error('[api/track POST] Neon error:', error);
    return jsonResponse({ error: 'Failed to track link event' }, 500);
  }
}

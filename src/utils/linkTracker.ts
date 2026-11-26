import { OrderRecord, Seller, SystemSettings, TrackedLink } from '../types';
import { formatCurrency } from '../data/products';

export function generateTrackId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `LNK-${suffix}`;
}

export function detectDeviceType(): 'Móvil' | 'Escritorio' {
  if (typeof navigator === 'undefined') return 'Escritorio';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    ? 'Móvil'
    : 'Escritorio';
}

export function formatWhatsappDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function formatMinutesLabel(minutes?: number): string {
  if (minutes === undefined || minutes === null || Number.isNaN(minutes)) return 'Sin responder';
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const rem = Math.round(minutes % 60);
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

/**
 * Exports a comprehensive Excel-ready CSV report (UTF-8 BOM) with all orders,
 * response times, seller commissions, referral commissions, and 1% system commission.
 */
export function exportOrdersCsvReport(orders: OrderRecord[], settings: SystemSettings): void {
  const headers = [
    'Folio',
    'Fecha',
    'Estado Pedido',
    'Estado Diseno',
    'Cliente',
    'Empresa',
    'Telefono',
    'Ciudad',
    'Unidades',
    'Subtotal USD',
    'Cupon',
    'Descuento USD',
    `IVA (${settings.ivaPct}%) USD`,
    'Envio',
    'Costo Envio USD',
    'Comision Procesamiento (%)',
    'Comision Procesamiento USD',
    'Total Venta USD',
    'Estado Pago Master',
    'Link Pago Master',
    'Codigo Vendedor',
    'Vendedor',
    'Comision Vendedor (%)',
    'Comision Vendedor (USD)',
    'Codigo Referido',
    'Referido',
    'Comision Referido (%)',
    'Comision Referido (USD)',
    `Comision Sistema (${settings.systemCommissionPct}%) USD`,
    'Tiempo Respuesta (min)',
    'ID Link Rastreado',
  ];

  const escapeCsv = (val: string | number | undefined) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = orders.map((o) => [
    o.folio,
    new Date(o.createdAt).toLocaleString('es-ES'),
    o.status.toUpperCase(),
    o.designStatus === 'aprobado' ? 'APROBADO' : 'EN REVISION',
    o.customerName,
    o.company,
    o.phone,
    o.city,
    o.totalUnits,
    o.subtotalBeforeDiscount.toFixed(2),
    o.couponCode || '',
    o.discountAmount.toFixed(2),
    o.ivaAmount.toFixed(2),
    o.shippingLabel,
    o.shippingCost.toFixed(2),
    o.processingFeePct,
    o.processingFeeAmount.toFixed(2),
    o.totalUsd.toFixed(2),
    o.paymentStatus.toUpperCase(),
    o.pagoMasterLink || '',
    o.sellerCode || '',
    o.sellerName || '',
    o.sellerCommissionPct,
    o.sellerCommissionUsd.toFixed(2),
    o.referralCode || '',
    o.referralOwner || '',
    o.referralCommissionPct,
    o.referralCommissionUsd.toFixed(2),
    o.systemCommissionUsd.toFixed(2),
    o.responseMinutes !== undefined ? o.responseMinutes : '',
    o.trackedLinkId || '',
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-ventas-colorio-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Opens a clean 2026 executive summary print/PDF report for Superadmin.
 */
export function openPrintableExecutiveReport(params: {
  orders: OrderRecord[];
  sellers: Seller[];
  links: TrackedLink[];
  settings: SystemSettings;
}): void {
  const activeOrders = params.orders.filter((o) => o.status !== 'cancelado');
  const totalRevenue = activeOrders.reduce((s, o) => s + o.totalUsd, 0);
  const totalUnits = activeOrders.reduce((s, o) => s + o.totalUnits, 0);
  const totalSellerComm = activeOrders.reduce((s, o) => s + o.sellerCommissionUsd, 0);
  const totalRefComm = activeOrders.reduce((s, o) => s + o.referralCommissionUsd, 0);
  const totalSystemComm = activeOrders.reduce((s, o) => s + o.systemCommissionUsd, 0);

  const responded = activeOrders.filter((o) => o.responseMinutes !== undefined);
  const avgResp = responded.length
    ? responded.reduce((s, o) => s + (o.responseMinutes || 0), 0) / responded.length
    : undefined;

  const totalOpens = params.links.reduce((s, l) => s + l.opens, 0);
  const totalShares = params.links.reduce((s, l) => s + l.shares, 0);

  const html = `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>Reporte Ejecutivo .colorío — People Creativa, C.A.</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; color: #0f172a; margin: 32px; background: #fff; }
        .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
        .brand { font-size: 26px; font-weight: 800; letter-spacing: -1px; }
        .dot { color: #4C1EDB; }
        .meta { text-align: right; font-size: 12px; color: #64748b; }
        .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .kpi { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; }
        .kpi-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
        .kpi-val { font-size: 22px; font-weight: 800; margin-top: 4px; }
        .accent { color: #4C1EDB; }
        h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #475569; margin: 22px 0 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; }
        th { background: #f8fafc; font-weight: 700; font-size: 11px; color: #475569; }
        .foot { margin-top: 32px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="head">
        <div>
          <div class="brand"><span class="dot">.</span>colorío <span style="font-size:13px;font-weight:600;color:#64748b;">· Reporte Ejecutivo Superadmin</span></div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">WhatsApp Principal: ${params.settings.mainWhatsappDisplay} · Superadmin: ${params.settings.superAdminEmail}</div>
        </div>
        <div class="meta">
          <div>Emitido: ${new Date().toLocaleString('es-ES')}</div>
          <div>Comisión Sistema: ${params.settings.systemCommissionPct}%</div>
        </div>
      </div>

      <div class="kpis">
        <div class="kpi"><div class="kpi-label">Ventas Totales</div><div class="kpi-val">${formatCurrency(totalRevenue)}</div><div style="font-size:11px;color:#64748b;">${activeOrders.length} pedidos · ${totalUnits.toLocaleString('es-ES')} uds</div></div>
        <div class="kpi"><div class="kpi-label">Comisión Sistema (${params.settings.systemCommissionPct}%)</div><div class="kpi-val accent">${formatCurrency(totalSystemComm)}</div><div style="font-size:11px;color:#64748b;">People Creativa, C.A.</div></div>
        <div class="kpi"><div class="kpi-label">Comisiones Vendedores + Referidos</div><div class="kpi-val">${formatCurrency(totalSellerComm + totalRefComm)}</div><div style="font-size:11px;color:#64748b;">Vend: ${formatCurrency(totalSellerComm)} · Ref: ${formatCurrency(totalRefComm)}</div></div>
        <div class="kpi"><div class="kpi-label">Tiempo Prom. Respuesta</div><div class="kpi-val">${formatMinutesLabel(avgResp)}</div><div style="font-size:11px;color:#64748b;">${responded.length} de ${activeOrders.length} atendidos</div></div>
        <div class="kpi"><div class="kpi-label">Links Compartidos</div><div class="kpi-val">${totalShares}</div><div style="font-size:11px;color:#64748b;">${params.links.length} enlaces activos</div></div>
        <div class="kpi"><div class="kpi-label">Aperturas de Links</div><div class="kpi-val">${totalOpens}</div><div style="font-size:11px;color:#64748b;">Rastreo en vivo</div></div>
      </div>

      <h2>Detalle de Pedidos y Comisiones</h2>
      <table>
        <thead>
          <tr><th>Folio</th><th>Cliente</th><th>Vendedor / Ref.</th><th>Total</th><th>Com. Vend.</th><th>Com. Ref.</th><th>Com. Sist. (${params.settings.systemCommissionPct}%)</th><th>SLA Resp.</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${params.orders
            .map(
              (o) => `<tr>
                <td><strong>#${o.folio}</strong></td>
                <td>${o.customerName}${o.company ? ` (${o.company})` : ''}</td>
                <td>${o.sellerCode || '—'}${o.referralCode ? ` / ${o.referralCode}` : ''}</td>
                <td><strong>${formatCurrency(o.totalUsd)}</strong></td>
                <td>${formatCurrency(o.sellerCommissionUsd)}</td>
                <td>${formatCurrency(o.referralCommissionUsd)}</td>
                <td><strong>${formatCurrency(o.systemCommissionUsd)}</strong></td>
                <td>${formatMinutesLabel(o.responseMinutes)}</td>
                <td style="text-transform:uppercase;font-weight:700;">${o.status}</td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <div class="foot">
        <span>Por People Creativa, C.A. para Colorio Merchandising</span>
        <span>Generado automáticamente · 2026</span>
      </div>
      <script>window.onload = () => window.print();</script>
    </body>
  </html>`;

  const w = window.open('', '_blank', 'width=980,height=740');
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
}

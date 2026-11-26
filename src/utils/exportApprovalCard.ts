import {
  ColorVariant,
  DesignApprovalStatus,
  InkMode,
  LogoTransform,
  PrintCoverage,
  PrintTechniqueId,
  Product,
  SecondaryOption,
} from '../types';
import {
  DEFAULT_IVA_PCT,
  formatCurrency,
  getInkLabel,
  getTechniqueById,
  getUnitPrice,
} from '../data/products';

export const COLORIO_WHATSAPP_NUMBER = '584245252121';
export const COLORIO_WHATSAPP_DISPLAY = '+58 0424-5252121';

/**
 * Serializes an SVG DOM element into a PNG data URL with extra bleed padding
 * so drop-shadows and edges are NEVER clipped.
 */
export async function renderSvgElementToPng(
  svgEl: SVGSVGElement,
  maxDim = 1080
): Promise<string> {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const origX = svgEl.viewBox?.baseVal?.x || 0;
  const origY = svgEl.viewBox?.baseVal?.y || 0;
  const origW = svgEl.viewBox?.baseVal?.width || 540;
  const origH = svgEl.viewBox?.baseVal?.height || 540;

  // Add subtle safety bleed around viewBox so outer shadows never slice
  const bleed = Math.round(Math.max(origW, origH) * 0.045);
  const vbW = origW + bleed * 2;
  const vbH = origH + bleed * 2;
  clone.setAttribute('viewBox', `${origX - bleed} ${origY - bleed} ${vbW} ${vbH}`);

  const scale = maxDim / Math.max(vbW, vbH);
  const outW = Math.round(vbW * scale);
  const outH = Math.round(vbH * scale);

  clone.setAttribute('width', String(outW));
  clone.setAttribute('height', String(outH));
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.clearRect(0, 0, outW, outH);
    ctx.drawImage(img, 0, 0, outW, outH);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

interface ApprovalCardOptions {
  svgEl: SVGSVGElement;
  product: Product;
  color: ColorVariant;
  secondaryOption?: SecondaryOption;
  techniqueId: PrintTechniqueId;
  inkMode: InkMode;
  customInkHex: string;
  printCoverage?: PrintCoverage;
  pouchPrint?: boolean;
  logoName: string;
  logoIsVector: boolean;
  quantity: number;
  modelUrl: string;
  ivaPct?: number;
  whatsappDisplay?: string;
  designStatus?: DesignApprovalStatus;
  brandLogoUrl?: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws the bold, exaggerated .colorío logo onto the canvas */
function drawColorioBrandMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  darkText = true
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Leading oversized dot
  ctx.beginPath();
  ctx.arc(8, 30, 6.2, 0, Math.PI * 2);
  ctx.fillStyle = darkText ? '#4C1EDB' : '#C0EE00';
  ctx.fill();

  // Wordmark colorıo
  ctx.fillStyle = darkText ? '#0D0E12' : '#FFFFFF';
  ctx.font = '800 38px "Plus Jakarta Sans", Inter, -apple-system, sans-serif';
  ctx.fillText('colorıo', 20, 36);

  // Measure exact width of "color" + half of "ı" so the magenta accent ALWAYS sits squarely over the 'ı'
  const prefixW = ctx.measureText('color').width;
  const iW = ctx.measureText('ı').width;
  const iCenterX = 20 + prefixW + iW * 0.5;

  // Slanted magenta acute accent directly over the dotless ı
  ctx.strokeStyle = '#F72585';
  ctx.lineWidth = 4.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(iCenterX - 3.2, 11.5);
  ctx.lineTo(iCenterX + 4.8, 3.2);
  ctx.stroke();

  ctx.restore();
}

export async function generateApprovalCardPng(opts: ApprovalCardOptions): Promise<string> {
  const mockupPng = await renderSvgElementToPng(opts.svgEl, 1140);
  const mockupImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = mockupPng;
  });

  const W = 1600;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F4F5F8';
  ctx.fillRect(0, 0, W, H);

  // Main white presentation card
  drawRoundedRect(ctx, 36, 36, W - 72, H - 72, 32);
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Left Mockup Stage Panel
  const stageX = 64;
  const stageY = 64;
  const stageW = 868;
  const stageH = H - 128;
  drawRoundedRect(ctx, stageX, stageY, stageW, stageH, 24);
  ctx.fillStyle = '#F6F7FA';
  ctx.fill();

  // Subtle dot grid inside stage
  ctx.fillStyle = 'rgba(15, 23, 42, 0.068)';
  for (let gx = stageX + 24; gx < stageX + stageW - 18; gx += 22) {
    for (let gy = stageY + 24; gy < stageY + stageH - 18; gy += 22) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fit mockup proportionally inside stage with generous safe padding (ZERO clipping!)
  const padX = 52;
  const padTop = 108;
  const padBottom = 94;
  const availW = stageW - padX * 2;
  const availH = stageH - padTop - padBottom;
  const imgRatio = mockupImg.width / mockupImg.height;
  let drawW = availW;
  let drawH = drawW / imgRatio;
  if (drawH > availH) {
    drawH = availH;
    drawW = drawH * imgRatio;
  }
  const drawX = stageX + (stageW - drawW) / 2;
  const drawY = stageY + padTop + (availH - drawH) / 2;
  ctx.drawImage(mockupImg, drawX, drawY, drawW, drawH);

  // Load optional custom uploaded original brand logo if provided
  let customBrandImg: HTMLImageElement | null = null;
  if (opts.brandLogoUrl) {
    try {
      customBrandImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = opts.brandLogoUrl!;
      });
    } catch {
      customBrandImg = null;
    }
  }

  // BIG prominent .colorío brand mark top-left of stage
  drawRoundedRect(ctx, 90, 88, 224, 62, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(15,23,42,0.08)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (customBrandImg) {
    const ratio = customBrandImg.width / Math.max(1, customBrandImg.height);
    const bh = 40;
    const bw = Math.min(184, bh * ratio);
    ctx.drawImage(customBrandImg, 108, 99, bw, bh);
  } else {
    drawColorioBrandMark(ctx, 114, 98, 1.05, true);
  }

  // Top-right stage status badge (Aprobado / En revisión)
  const isApproved = opts.designStatus !== 'en_revision';
  drawRoundedRect(ctx, stageX + stageW - 260, 96, 234, 44, 22);
  ctx.fillStyle = isApproved ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.14)';
  ctx.fill();
  ctx.fillStyle = isApproved ? '#047857' : '#B45309';
  ctx.font = '800 13px Inter, -apple-system, sans-serif';
  ctx.fillText(
    isApproved ? '✓ DISEÑO APROBADO' : '⏳ DISEÑO EN REVISIÓN',
    stageX + stageW - 226,
    123
  );

  // Visible Model Link bar at bottom of stage
  const cleanLink = opts.modelUrl.replace(/^https?:\/\//, '');
  const displayLink = cleanLink.length > 74 ? `${cleanLink.slice(0, 74)}…` : cleanLink;
  drawRoundedRect(ctx, 90, H - 134, stageW - 52, 46, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(76, 30, 219, 0.18)';
  ctx.stroke();
  ctx.fillStyle = '#4C1EDB';
  ctx.font = '700 13px Inter, -apple-system, sans-serif';
  ctx.fillText('LINK AL MODELO:', 110, H - 106);
  ctx.fillStyle = '#0F172A';
  ctx.font = '600 13px Inter, -apple-system, sans-serif';
  ctx.fillText(displayLink, 240, H - 106);

  // Right Specification Column
  const rx = 972;
  let ry = 92;

  // Big brand header on right column too
  if (customBrandImg) {
    const ratio = customBrandImg.width / Math.max(1, customBrandImg.height);
    const bh = 36;
    const bw = Math.min(156, bh * ratio);
    ctx.drawImage(customBrandImg, rx, ry - 10, bw, bh);
  } else {
    drawColorioBrandMark(ctx, rx, ry - 12, 0.92, true);
  }
  ctx.fillStyle = '#64748B';
  ctx.font = '700 12px Inter, -apple-system, sans-serif';
  ctx.fillText('FICHA TÉCNICA & PRESUPUESTO POP', rx + 168, ry + 18);

  ry += 70;
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 31px "Plus Jakarta Sans", Inter, sans-serif';
  ctx.fillText(opts.product.name, rx, ry);

  ry += 28;
  ctx.fillStyle = '#64748B';
  ctx.font = '500 15px Inter, -apple-system, sans-serif';
  const today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  ctx.fillText(`SKU: ${opts.product.sku}  ·  ${opts.product.dimensions}  ·  ${today}`, rx, ry);

  ry += 24;
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(W - 80, ry);
  ctx.stroke();

  const technique = getTechniqueById(opts.techniqueId);
  const unitPrice = getUnitPrice(
    opts.product,
    opts.quantity,
    opts.inkMode,
    opts.pouchPrint,
    opts.printCoverage,
    opts.techniqueId,
    opts.secondaryOption
  );
  const ivaPct = opts.ivaPct ?? DEFAULT_IVA_PCT;
  const subtotal = Number((opts.quantity * unitPrice).toFixed(2));
  const ivaAmount = Number(((subtotal * ivaPct) / 100).toFixed(2));
  const total = Number((subtotal + ivaAmount).toFixed(2));

  const rows: { label: string; value: string; swatchHex?: string }[] = [
    {
      label: 'Color de Base',
      value: `${opts.color.name} (${opts.color.hex.toUpperCase()})`,
      swatchHex: opts.color.hex,
    },
    ...(opts.product.hasPouch
      ? [
          {
            label: 'Funda Individual',
            value: opts.pouchPrint
              ? 'Incluida · Con logotipo estampado'
              : 'Incluida al tono (sin logo)',
            swatchHex: opts.color.hex,
          },
        ]
      : opts.secondaryOption
        ? [
            {
              label: opts.product.secondaryLabel || 'Acabado',
              value: opts.secondaryOption.name,
              swatchHex:
                opts.secondaryOption.hex === 'MATCH'
                  ? opts.color.hex
                  : opts.secondaryOption.hex,
            },
          ]
        : []),
    {
      label: 'Opción de Impresión',
      value:
        opts.printCoverage === 'full-bleed' && opts.product.supportsFullBleed
          ? `${technique.name} · Full Bleed`
          : technique.name,
    },
    {
      label: 'Color de Tinta / Arte',
      value: `${getInkLabel(opts.inkMode, opts.customInkHex)}  ·  ${opts.logoName}`,
      swatchHex:
        opts.inkMode === 'white'
          ? '#FFFFFF'
          : opts.inkMode === 'black'
            ? '#111827'
            : opts.inkMode === 'custom'
              ? opts.customInkHex
              : undefined,
    },
    {
      label: 'Material & Entrega',
      value: `${opts.product.material}  ·  ${opts.product.leadTimeDays}`,
    },
  ];

  ry += 40;
  for (const row of rows) {
    ctx.fillStyle = '#64748B';
    ctx.font = '700 12.5px Inter, -apple-system, sans-serif';
    ctx.fillText(row.label.toUpperCase(), rx, ry);

    ry += 24;
    let textX = rx;
    if (row.swatchHex) {
      ctx.beginPath();
      ctx.arc(rx + 9, ry - 6, 9, 0, Math.PI * 2);
      ctx.fillStyle = row.swatchHex;
      ctx.fill();
      ctx.strokeStyle = 'rgba(15,23,42,0.22)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      textX = rx + 26;
    }

    ctx.fillStyle = '#0F172A';
    ctx.font = '600 16.5px Inter, -apple-system, sans-serif';
    const clippedVal = row.value.length > 52 ? `${row.value.slice(0, 52)}…` : row.value;
    ctx.fillText(clippedVal, textX, ry);
    ry += 40;
  }

  // Budget Summary Box
  ry += 16;
  drawRoundedRect(ctx, rx, ry, W - rx - 80, 154, 22);
  ctx.fillStyle = '#0D0E12';
  ctx.fill();

  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 13px Inter, -apple-system, sans-serif';
  ctx.fillText('RESUMEN DE PRESUPUESTO ESTIMADO', rx + 26, ry + 38);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 23px Inter, -apple-system, sans-serif';
  ctx.fillText(`${opts.quantity.toLocaleString('es-ES')} unidades`, rx + 26, ry + 78);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '500 15px Inter, -apple-system, sans-serif';
  ctx.fillText(
    `${formatCurrency(unitPrice)} / ud  ·  Subtotal: ${formatCurrency(subtotal)}  +  IVA (${ivaPct}%): ${formatCurrency(ivaAmount)}`,
    rx + 26,
    ry + 110
  );

  ctx.fillStyle = '#C0EE00';
  ctx.font = '800 34px "Plus Jakarta Sans", Inter, sans-serif';
  const totalTxt = formatCurrency(total);
  const metrics = ctx.measureText(totalTxt);
  ctx.fillText(totalTxt, W - 80 - 26 - metrics.width, ry + 86);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 11.5px Inter, -apple-system, sans-serif';
  const pmLabel = 'Envío opcional · Pago directo vía Pago Master';
  const pmW = ctx.measureText(pmLabel).width;
  ctx.fillText(pmLabel, W - 80 - 26 - pmW, ry + 134);

  // Corporate contact footer
  const fy = H - 102;
  ctx.fillStyle = '#4C1EDB';
  ctx.font = '700 14px Inter, -apple-system, sans-serif';
  ctx.fillText(
    `WhatsApp Pedidos: ${opts.whatsappDisplay || COLORIO_WHATSAPP_DISPLAY}  ·  @holacolorio  ·  Por People Creativa, C.A.`,
    rx,
    fy
  );

  return canvas.toDataURL('image/png');
}

export function buildShareableUrl(params: {
  productId: string;
  colorId: string;
  secondaryId?: string;
  techniqueId: PrintTechniqueId;
  inkMode: InkMode;
  customInkHex: string;
  printCoverage?: PrintCoverage;
  pouchPrint?: boolean;
  quantity: number;
  sellerCode?: string;
  referralCode?: string;
  trackId?: string;
  transform: LogoTransform;
}): string {
  const url = new URL(`${window.location.origin}/catalogo`);
  url.searchParams.set('p', params.productId);
  url.searchParams.set('c', params.colorId);
  if (params.secondaryId) url.searchParams.set('s', params.secondaryId);
  url.searchParams.set('t', params.techniqueId);
  url.searchParams.set('i', params.inkMode);
  if (params.inkMode === 'custom') url.searchParams.set('ci', params.customInkHex);
  if (params.printCoverage) url.searchParams.set('cov', params.printCoverage);
  if (params.pouchPrint !== undefined) url.searchParams.set('fp', params.pouchPrint ? '1' : '0');
  url.searchParams.set('q', String(params.quantity));
  if (params.sellerCode) url.searchParams.set('ref', params.sellerCode);
  if (params.referralCode) url.searchParams.set('rc', params.referralCode);
  if (params.trackId) url.searchParams.set('trk', params.trackId);
  url.searchParams.set('x', String(Math.round(params.transform.x)));
  url.searchParams.set('y', String(Math.round(params.transform.y)));
  url.searchParams.set('sc', params.transform.scale.toFixed(2));
  url.searchParams.set('r', String(Math.round(params.transform.rotation)));
  return url.toString();
}

export function buildWhatsAppSummary(params: {
  product: Product;
  color: ColorVariant;
  secondaryOption?: SecondaryOption;
  techniqueId: PrintTechniqueId;
  inkMode: InkMode;
  customInkHex: string;
  printCoverage?: PrintCoverage;
  pouchPrint?: boolean;
  logoName: string;
  quantity: number;
  ivaPct?: number;
  sellerCode?: string;
  shareUrl: string;
}): string {
  const technique = getTechniqueById(params.techniqueId);
  const unitPrice = getUnitPrice(
    params.product,
    params.quantity,
    params.inkMode,
    params.pouchPrint,
    params.printCoverage,
    params.techniqueId,
    params.secondaryOption
  );
  const ivaPct = params.ivaPct ?? DEFAULT_IVA_PCT;
  const subtotal = Number((params.quantity * unitPrice).toFixed(2));
  const ivaAmount = Number(((subtotal * ivaPct) / 100).toFixed(2));
  const total = Number((subtotal + ivaAmount).toFixed(2));

  const lines = [
    `¡Hola equipo *.colorío*! Quiero aprobar este diseño y recibir mi link de *Pago Master*:`,
    ``,
    `• *Producto:* ${params.product.name} (${params.product.sku})`,
    `• *Color base:* ${params.color.name}`,
    ...(params.product.hasPouch
      ? [`• *Funda:* ${params.pouchPrint ? 'Con logo estampado' : 'Al tono (sin logo)'}`]
      : params.secondaryOption
        ? [`• *${params.product.secondaryLabel || 'Acabado'}:* ${params.secondaryOption.name}`]
        : []),
    `• *Opción de impresión:* ${technique.name}${
      params.printCoverage === 'full-bleed' && params.product.supportsFullBleed
        ? ' (Full Bleed)'
        : ''
    }`,
    `• *Color de tinta:* ${getInkLabel(params.inkMode, params.customInkHex)}`,
    `• *Archivo / Logo:* ${params.logoName}`,
    `• *Cantidad:* ${params.quantity.toLocaleString('es-ES')} uds (${formatCurrency(unitPrice)}/ud)`,
    `• *Subtotal:* ${formatCurrency(subtotal)}`,
    `• *IVA (${ivaPct}%):* ${formatCurrency(ivaAmount)}`,
    `• *Total estimado (sin envío):* *${formatCurrency(total)}*`,
    ...(params.sellerCode ? [`• *Código de Asesor:* ${params.sellerCode}`] : []),
    ``,
    `🔗 *Link directo al modelo:* ${params.shareUrl}`,
  ];
  return lines.join('\n');
}

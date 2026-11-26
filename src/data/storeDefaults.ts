import {
  Coupon,
  OrderRecord,
  Product,
  PromoBannerConfig,
  ReferralCode,
  Seller,
  SystemSettings,
  TrackedLink,
} from '../types';
import { INITIAL_PRODUCTS } from './products';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  superAdminEmail: 'peoplecreativaca@gmail.com',
  superAdminPassword: '1234',
  isDefaultPassword: true,
  mainWhatsapp: '584245252121',
  mainWhatsappDisplay: '+58 0424-5252121',
  routeToSellerWhatsapp: false,
  ivaPct: 16,
  shippingLocalCost: 5,
  shippingNationalCost: 10,
  systemCommissionPct: 1,
  processingFeeEnabled: false,
  processingFeePct: 1,
  pagoMasterEnabled: true,
  pagoMasterBaseUrl: '',
  pagoMasterMerchantId: 'COLORIO-POP',
  paymentDisplayMode: 'both',
  paymentBankName: 'Banco Mercantil / Banesco (Referencia BCV)',
  paymentPagoMovilPhone: '0424-5252121',
  paymentPagoMovilId: 'J-00000000-0',
  paymentZelleEmail: 'holacolorio@gmail.com',
  paymentZelleHolder: 'Colorio Merchandising',
  paymentBinanceId: '',
  paymentNotes: 'Referencia BCV del día · Envía tu comprobante por WhatsApp para iniciar producción.',
  brandLogoLightUrl: '',
  brandLogoDarkUrl: '',
  landingEnabled: true,
  hideOutOfStock: false,
};

export const DEFAULT_PROMO_IMAGE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 220">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4C1EDB"/>
      <stop offset="60%" stop-color="#6D28D9"/>
      <stop offset="100%" stop-color="#F72585"/>
    </linearGradient>
  </defs>
  <rect width="420" height="220" rx="22" fill="url(#bg)"/>
  <circle cx="350" cy="48" r="68" fill="#C0EE00" opacity="0.22"/>
  <circle cx="310" cy="140" r="56" fill="#1CA8E8" stroke="#18181B" stroke-width="5"/>
  <circle cx="348" cy="116" r="52" fill="#F2DC1D" stroke="#18181B" stroke-width="5"/>
  <circle cx="268" cy="128" r="48" fill="#DC2127" stroke="#18181B" stroke-width="5"/>
  <text x="26" y="64" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="24" fill="#FFFFFF">.colorío POP</text>
  <text x="26" y="96" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="13" fill="#E9D5FF">Merchandising diseñado para</text>
  <text x="26" y="114" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="13" fill="#C0EE00">dejar huella y vender.</text>
  <rect x="26" y="146" width="138" height="32" rx="16" fill="#FFFFFF" fill-opacity="0.16"/>
  <text x="95" y="166" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">DESDE 50 UNIDADES</text>
</svg>
`.trim())}`;

export const DEFAULT_PROMO_BANNER: PromoBannerConfig = {
  enabled: true,
  eyebrow: 'MERCHANDISING CORPORATIVO DE ALTO IMPACTO',
  headline: 'Haz que tu marca se sienta en cada evento.',
  body: 'Acabados premium en vinil planchado, impresión plana y full color HD con entrega rápida garantizada. Aprueba tu diseño en línea y paga directo con link de Pago Master.',
  ctaHint: 'Envíos a toda Venezuela · Pago seguro vía Pago Master',
  imageUrl: DEFAULT_PROMO_IMAGE_SVG,
};

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-colorio10',
    code: 'COLORIO10',
    description: '10% de descuento corporativo en cualquier pedido POP',
    type: 'percent',
    value: 10,
    minSubtotal: 80,
    active: true,
    uses: 4,
    createdAt: Date.now() - 86400000 * 12,
  },
  {
    id: 'cpn-evento25',
    code: 'EVENTO25',
    description: '$25 OFF en pedidos corporativos mayores a $250',
    type: 'fixed',
    value: 25,
    minSubtotal: 250,
    active: true,
    uses: 2,
    createdAt: Date.now() - 86400000 * 5,
  },
];

export const INITIAL_SELLERS: Seller[] = [
  {
    id: 'sel-maria',
    name: 'María Alejandra',
    code: 'MARIA01',
    pin: '1111',
    whatsapp: '584245252121',
    commissionPct: 8,
    monthlyGoalUsd: 2500,
    active: true,
  },
  {
    id: 'sel-carlos',
    name: 'Carlos Mendoza',
    code: 'CARLOS02',
    pin: '2222',
    whatsapp: '584140001122',
    commissionPct: 7,
    monthlyGoalUsd: 2000,
    active: true,
  },
  {
    id: 'sel-directo',
    name: 'Gustavo · Dirección',
    code: 'COLORIO',
    pin: '1234',
    whatsapp: '584245252121',
    commissionPct: 10,
    monthlyGoalUsd: 4000,
    active: true,
  },
];

export const INITIAL_REFERRALS: ReferralCode[] = [
  {
    id: 'ref-agencia1',
    code: 'ALIADO10',
    ownerName: 'Agencia Eventos CCS',
    ownerPhone: '0412-9001122',
    commissionPct: 3,
    linkedSellerCode: 'MARIA01',
    active: true,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'ref-people',
    code: 'PEOPLEVIP',
    ownerName: 'People Creativa Partner',
    ownerPhone: '0424-5252121',
    commissionPct: 4,
    linkedSellerCode: 'COLORIO',
    active: true,
    createdAt: Date.now() - 86400000 * 6,
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ord-seed-1',
    folio: 'COL-2026-4812',
    createdAt: Date.now() - 86400000 * 3,
    firstResponseAt: Date.now() - 86400000 * 3 + 11 * 60000,
    responseMinutes: 11,
    status: 'entregado',
    designStatus: 'aprobado',
    paymentStatus: 'pagado',
    pagoMasterLink: 'https://pagomaster.app/pay/COL-2026-4812',
    customerName: 'Andrea Salazar',
    company: 'Sambil Eventos',
    phone: '+58 412 555 8810',
    city: 'Barquisimeto',
    sellerCode: 'MARIA01',
    sellerName: 'María Alejandra',
    referralCode: 'ALIADO10',
    referralOwner: 'Agencia Eventos CCS',
    trackedLinkId: 'LNK-8421',
    couponCode: 'COLORIO10',
    discountAmount: 48.5,
    subtotalBeforeDiscount: 485,
    ivaPct: 16,
    ivaAmount: 69.84,
    shippingOption: 'national',
    shippingLabel: 'Envío Nacional (MRW / Zoom)',
    shippingCost: 10,
    processingFeePct: 0,
    processingFeeAmount: 0,
    totalUsd: 516.34,
    sellerCommissionPct: 8,
    sellerCommissionUsd: 41.31,
    referralCommissionPct: 3,
    referralCommissionUsd: 15.49,
    systemCommissionPct: 1,
    systemCommissionUsd: 5.16,
    totalUnits: 500,
    itemsSummary: [
      {
        productId: 'abanico-circular-ribete-negro',
        productName: 'Abanico Circular Flexible (Ribete Negro)',
        sku: 'POP-FLEX-BLK25',
        colorId: 'azul-rey',
        colorName: 'Azul Rey',
        techniqueId: 'vinil-plano',
        inkLabel: 'Blanco (1 tinta)',
        pouchPrint: true,
        quantity: 500,
        unitPrice: 0.97,
        subtotal: 485,
        modelUrl: 'https://pop-mockup-studio.vercel.app/?p=abanico-circular-ribete-negro&c=azul-rey&trk=LNK-8421',
      },
    ],
  },
  {
    id: 'ord-seed-2',
    folio: 'COL-2026-4905',
    createdAt: Date.now() - 86400000 * 1,
    firstResponseAt: Date.now() - 86400000 * 1 + 18 * 60000,
    responseMinutes: 18,
    status: 'produccion',
    designStatus: 'aprobado',
    paymentStatus: 'link_enviado',
    pagoMasterLink: 'https://pagomaster.app/pay/COL-2026-4905',
    customerName: 'Luis Romero',
    company: 'Óptica Argenis',
    phone: '+58 414 625 6675',
    city: 'Caracas',
    sellerCode: 'CARLOS02',
    sellerName: 'Carlos Mendoza',
    trackedLinkId: 'LNK-9104',
    discountAmount: 0,
    subtotalBeforeDiscount: 285,
    ivaPct: 16,
    ivaAmount: 45.6,
    shippingOption: 'local',
    shippingLabel: 'Delivery Local (Caracas)',
    shippingCost: 5,
    processingFeePct: 0,
    processingFeeAmount: 0,
    totalUsd: 335.6,
    sellerCommissionPct: 7,
    sellerCommissionUsd: 23.49,
    referralCommissionPct: 0,
    referralCommissionUsd: 0,
    systemCommissionPct: 1,
    systemCommissionUsd: 3.36,
    totalUnits: 250,
    itemsSummary: [
      {
        productId: 'abanico-circular-blanco-sublimable',
        productName: 'Abanico Circular Blanco Total (Sublimable)',
        sku: 'POP-FLEX-WHT25',
        colorId: 'blanco-total',
        colorName: 'Blanco Total',
        techniqueId: 'full-color',
        inkLabel: 'Full Color',
        pouchPrint: false,
        quantity: 250,
        unitPrice: 1.14,
        subtotal: 285,
        modelUrl: 'https://pop-mockup-studio.vercel.app/?p=abanico-circular-blanco-sublimable&c=blanco-total&trk=LNK-9104',
      },
    ],
  },
];

export const INITIAL_TRACKED_LINKS: TrackedLink[] = [
  {
    id: 'LNK-8421',
    url: 'https://pop-mockup-studio.vercel.app/?p=abanico-circular-ribete-negro&c=azul-rey&ref=MARIA01&rc=ALIADO10&trk=LNK-8421',
    label: 'Abanico Circular · Azul Rey (Sambil)',
    productName: 'Abanico Circular Flexible (Ribete Negro)',
    colorName: 'Azul Rey',
    sellerCode: 'MARIA01',
    referralCode: 'ALIADO10',
    channel: 'whatsapp',
    createdAt: Date.now() - 86400000 * 3,
    shares: 3,
    opens: 14,
    conversions: 1,
    lastOpenedAt: Date.now() - 3600000 * 4,
    lastDevice: 'Móvil',
  },
  {
    id: 'LNK-9104',
    url: 'https://pop-mockup-studio.vercel.app/?p=abanico-circular-blanco-sublimable&c=blanco-total&ref=CARLOS02&trk=LNK-9104',
    label: 'Blanco Sublimable · Óptica Argenis',
    productName: 'Abanico Circular Blanco Total (Sublimable)',
    colorName: 'Blanco Total',
    sellerCode: 'CARLOS02',
    channel: 'seller-link',
    createdAt: Date.now() - 86400000 * 1,
    shares: 2,
    opens: 8,
    conversions: 1,
    lastOpenedAt: Date.now() - 3600000 * 2,
    lastDevice: 'Escritorio',
  },
];

const KEYS = {
  products: 'colorio_store_products_v6',
  coupons: 'colorio_store_coupons_v6',
  sellers: 'colorio_store_sellers_v6',
  referrals: 'colorio_store_referrals_v6',
  orders: 'colorio_store_orders_v6',
  promo: 'colorio_store_promo_v6',
  settings: 'colorio_store_settings_v6',
  links: 'colorio_store_links_v6',
};

export function loadStored<T>(key: keyof typeof KEYS, fallback: T): T {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveStored<T>(key: keyof typeof KEYS, value: T): void {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function loadInitialProducts(): Product[] {
  const stored = loadStored<Product[]>('products', INITIAL_PRODUCTS);
  if (!Array.isArray(stored) || stored.length === 0) return INITIAL_PRODUCTS;

  // Merge initial catalog data so new catalog fields are present while preserving user edits
  return stored.map((p) => {
    const orig = INITIAL_PRODUCTS.find((init) => init.id === p.id);
    if (!orig) return p;
    return {
      ...orig,
      ...p,
      realImageUrl: p.realImageUrl || orig.realImageUrl,
      cleanMockupUrl: p.cleanMockupUrl || orig.cleanMockupUrl,
      dimensions: p.dimensions || orig.dimensions,
      capacity: p.capacity || orig.capacity,
      priceTiers: p.priceTiers?.length ? p.priceTiers : orig.priceTiers,
      colors: p.colors?.length ? p.colors : orig.colors,
      secondaryOptions: p.secondaryOptions?.length ? p.secondaryOptions : orig.secondaryOptions,
    };
  });
}

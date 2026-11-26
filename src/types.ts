export type ProductShape = 'circular-flex' | 'conventional-fan' | 'paddle-rigid' | 'photo-product';

export type PaymentDisplayMode = 'both' | 'data_only' | 'link_only' | 'whatsapp_only';

export type InkMode = 'full' | 'white' | 'black' | 'custom';

export type PrintTechniqueId =
  | 'vinil-plano'
  | 'impreso-plano'
  | 'material-premium'
  | 'full-color';

export interface PrintTechnique {
  id: PrintTechniqueId;
  name: string;
  shortName: string;
  description: string;
  surchargePerUnit: number;
  supportsFullColor: boolean;
  badge?: string;
}

export type PrintCoverage = 'centered' | 'full-bleed';

export type StudioViewMode = '2d' | 'presentation' | 'assortment' | '3d';

export type ShippingOptionId = 'pickup' | 'local' | 'national';

export type PaymentStatus = 'pendiente' | 'link_enviado' | 'pagado';

export type DesignApprovalStatus = 'aprobado' | 'en_revision';

export interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  trimHex?: string;
  stock: number;
  available: boolean;
  badge?: string;
}

export interface SecondaryOption {
  id: string;
  name: string;
  hex: string;
  stock: number;
  available: boolean;
  /** Optional unit price override (used for size variants like Bolsas Ecológicas) */
  unitPriceOverride?: number;
}

export interface PriceTier {
  minQty: number;
  unitPrice: number;
  promoLabel?: string;
}

export interface PrintAreaConfig {
  cx: number;
  cy: number;
  width: number;
  height: number;
  physicalLabel: string;
  guideShape: 'circle' | 'arc' | 'rounded-rect';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  shortName: string;
  category: string;
  tagline: string;
  description: string;
  dimensions: string;
  material: string;
  leadTimeDays: string;
  shape: ProductShape;
  minOrderQty: number;
  fullColorSurcharge: number;
  hasPouch?: boolean;
  pouchPrintSurcharge?: number;
  supportsFullBleed?: boolean;
  defaultRimHex?: string;
  printArea: PrintAreaConfig;
  colors: ColorVariant[];
  secondaryLabel?: string;
  secondaryOptions?: SecondaryOption[];
  priceTiers: PriceTier[];
  highlights: string[];
  /** Official real product studio photography URL (e.g., /catalog/tulas.jpg) */
  realImageUrl?: string;
  /** Clean blank mockup template image (without logo) where the customer's design is placed when customized */
  cleanMockupUrl?: string;
  /** Product capacity (e.g., "520 ml", "500 ml", "750 ml", "12 oz") */
  capacity?: string;
  /** Total available stock override */
  stock?: number;
  /** Optional pricing reference note (e.g. "Referencia BCV · Sin estampado") */
  priceNote?: string;
  promoImageUrl?: string;
}

export interface LogoAsset {
  id: string;
  name: string;
  originalUrl: string;
  isVector: boolean;
  aspectRatio: number;
  removeWhiteBg: boolean;
}

export interface LogoTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  color: ColorVariant;
  secondaryOption?: SecondaryOption;
  techniqueId: PrintTechniqueId;
  inkMode: InkMode;
  customInkHex: string;
  printCoverage: PrintCoverage;
  pouchPrint: boolean;
  logoName: string;
  logoIsVector: boolean;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  previewDataUrl: string;
  modelUrl: string;
  createdAt: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal: number;
  active: boolean;
  uses: number;
  createdAt: number;
}

export interface Seller {
  id: string;
  name: string;
  code: string;
  pin: string;
  whatsapp: string;
  commissionPct: number;
  monthlyGoalUsd: number;
  active: boolean;
}

export interface ReferralCode {
  id: string;
  code: string;
  ownerName: string;
  ownerPhone: string;
  commissionPct: number;
  linkedSellerCode?: string;
  active: boolean;
  createdAt: number;
}

export type OrderStatus = 'pendiente' | 'produccion' | 'entregado' | 'cancelado';

export interface OrderRecord {
  id: string;
  folio: string;
  createdAt: number;
  firstResponseAt?: number;
  responseMinutes?: number;
  status: OrderStatus;
  designStatus: DesignApprovalStatus;
  paymentStatus: PaymentStatus;
  pagoMasterLink?: string;
  customerName: string;
  company: string;
  phone: string;
  city: string;
  eventDate?: string;
  notes?: string;
  sellerCode?: string;
  sellerName?: string;
  referralCode?: string;
  referralOwner?: string;
  trackedLinkId?: string;
  couponCode?: string;
  discountAmount: number;
  subtotalBeforeDiscount: number;
  ivaPct: number;
  ivaAmount: number;
  shippingOption: ShippingOptionId;
  shippingLabel: string;
  shippingCost: number;
  processingFeePct: number;
  processingFeeAmount: number;
  totalUsd: number;
  sellerCommissionPct: number;
  sellerCommissionUsd: number;
  referralCommissionPct: number;
  referralCommissionUsd: number;
  systemCommissionPct: number;
  systemCommissionUsd: number;
  totalUnits: number;
  itemsSummary: {
    productId: string;
    productName: string;
    sku: string;
    colorId: string;
    colorName: string;
    techniqueId: PrintTechniqueId;
    inkLabel: string;
    pouchPrint: boolean;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    modelUrl: string;
  }[];
}

export interface PromoBannerConfig {
  enabled: boolean;
  eyebrow: string;
  headline: string;
  body: string;
  ctaHint: string;
  imageUrl: string;
}

export interface SystemSettings {
  superAdminEmail: string;
  superAdminPassword: string;
  isDefaultPassword: boolean;
  mainWhatsapp: string;
  mainWhatsappDisplay: string;
  routeToSellerWhatsapp: boolean;
  /** Default 16% VAT / IVA */
  ivaPct: number;
  /** Optional shipping costs */
  shippingLocalCost: number;
  shippingNationalCost: number;
  /** System platform commission (1% per sale) */
  systemCommissionPct: number;
  /** Optional internal 1% processing fee */
  processingFeeEnabled: boolean;
  processingFeePct: number;
  /** Pago Master direct payment link integration settings */
  pagoMasterEnabled: boolean;
  pagoMasterBaseUrl: string;
  pagoMasterMerchantId: string;
  /** Independent Payment Options Module (Bank/Pago Móvil/Zelle data vs Payment Link) */
  paymentDisplayMode: PaymentDisplayMode;
  paymentBankName: string;
  paymentPagoMovilPhone: string;
  paymentPagoMovilId: string;
  paymentZelleEmail: string;
  paymentZelleHolder: string;
  paymentBinanceId: string;
  paymentNotes: string;
  /** Optional custom uploaded original brand logo (PNG/SVG) */
  brandLogoLightUrl?: string;
  brandLogoDarkUrl?: string;
  /** Optional Figma-style Landing Page enabled by default on root URL */
  landingEnabled: boolean;
  /** Hide out of stock color variants and size options instead of showing them struck-through / disabled */
  hideOutOfStock: boolean;
}

export type TrackChannel = 'whatsapp' | 'copy' | 'seller-link' | 'referral-link' | 'direct';

export interface TrackedLink {
  id: string;
  url: string;
  label: string;
  productName: string;
  colorName?: string;
  sellerCode?: string;
  referralCode?: string;
  channel: TrackChannel;
  createdAt: number;
  shares: number;
  opens: number;
  conversions: number;
  lastOpenedAt?: number;
  lastDevice?: 'Móvil' | 'Escritorio';
}

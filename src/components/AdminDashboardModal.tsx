import React, { useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Boxes,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  CreditCard,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Gift,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Link2,
  Lock,
  LogOut,
  Megaphone,
  MessageCircle,
  Package,
  Palette,
  Phone,
  Plus,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  ColorVariant,
  Coupon,
  DesignApprovalStatus,
  OrderRecord,
  OrderStatus,
  PaymentDisplayMode,
  PaymentStatus,
  PriceTier,
  Product,
  ProductShape,
  PromoBannerConfig,
  ReferralCode,
  SecondaryOption,
  Seller,
  SystemSettings,
  TrackChannel,
  TrackedLink,
} from '../types';
import { formatCurrency } from '../data/products';
import {
  exportOrdersCsvReport,
  formatMinutesLabel,
  formatWhatsappDigits,
  generateTrackId,
  openPrintableExecutiveReport,
} from '../utils/linkTracker';
import { ColorioLogo } from './ColorioLogo';

type SuperTab =
  | 'stats'
  | 'links'
  | 'orders'
  | 'inventory'
  | 'products'
  | 'coupons'
  | 'sellers'
  | 'settings';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbConnected?: boolean;
  products: Product[];
  onUpdateProducts: (next: Product[]) => void;
  coupons: Coupon[];
  onUpdateCoupons: (next: Coupon[]) => void;
  sellers: Seller[];
  onUpdateSellers: (next: Seller[]) => void;
  referrals: ReferralCode[];
  onUpdateReferrals: (next: ReferralCode[]) => void;
  orders: OrderRecord[];
  onUpdateOrders: (next: OrderRecord[]) => void;
  promoBanner: PromoBannerConfig;
  onUpdatePromoBanner: (next: PromoBannerConfig) => void;
  settings: SystemSettings;
  onUpdateSettings: (next: SystemSettings) => void;
  trackedLinks: TrackedLink[];
  onRegisterTrackedLink: (params: {
    trackId: string;
    url: string;
    label: string;
    productName: string;
    colorName?: string;
    sellerCode?: string;
    referralCode?: string;
    channel: TrackChannel;
  }) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  dbConnected = false,
  products,
  onUpdateProducts,
  coupons,
  onUpdateCoupons,
  sellers,
  onUpdateSellers,
  referrals,
  onUpdateReferrals,
  orders,
  onUpdateOrders,
  promoBanner,
  onUpdatePromoBanner,
  settings,
  onUpdateSettings,
  trackedLinks,
  onRegisterTrackedLink,
}) => {
  const [authRole, setAuthRole] = useState<'none' | 'superadmin' | 'seller'>('none');
  const [loginMode, setLoginMode] = useState<'superadmin' | 'seller'>('superadmin');
  const [loginEmail, setLoginEmail] = useState(settings.superAdminEmail);
  const [loginPassword, setLoginPassword] = useState('');
  const [sellerLoginCode, setSellerLoginCode] = useState('');
  const [sellerLoginPin, setSellerLoginPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeSeller, setActiveSeller] = useState<Seller | null>(null);

  const [tab, setTab] = useState<SuperTab>('stats');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent' | 'fixed'>('percent');
  const [newCouponVal, setNewCouponVal] = useState('10');
  const [newCouponMin, setNewCouponMin] = useState('100');

  // Seller form
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerCode, setNewSellerCode] = useState('');
  const [newSellerPin, setNewSellerPin] = useState('1111');
  const [newSellerWhatsapp, setNewSellerWhatsapp] = useState('584245252121');
  const [newSellerComm, setNewSellerComm] = useState('8');
  const [newSellerGoal, setNewSellerGoal] = useState('2000');

  // Referral form
  const [newRefCode, setNewRefCode] = useState('');
  const [newRefOwner, setNewRefOwner] = useState('');
  const [newRefPhone, setNewRefPhone] = useState('');
  const [newRefComm, setNewRefComm] = useState('3');
  const [newRefSeller, setNewRefSeller] = useState('');

  // Settings password change form
  const [currentPw, setCurrentPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwFeedback, setPwFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Quick product form & JSON
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('POP-NEW-01');
  const [prodShape, setProdShape] = useState<ProductShape>('circular-flex');
  const [prodBasePrice, setProdBasePrice] = useState('1.35');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonDraft, setJsonDraft] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Comprehensive Product Studio State & Refs
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('Todos');
  const [productSaveFeedback, setProductSaveFeedback] = useState<string | null>(null);

  const promoImgInputRef = useRef<HTMLInputElement>(null);
  const brandLogoLightInputRef = useRef<HTMLInputElement>(null);
  const brandLogoDarkInputRef = useRef<HTMLInputElement>(null);
  const realImgInputRef = useRef<HTMLInputElement>(null);
  const cleanMockupInputRef = useRef<HTMLInputElement>(null);

  const buildPagoMasterUrlForOrder = (ord: OrderRecord) => {
    const base = (settings.pagoMasterBaseUrl || 'https://pagomaster.app/pay').replace(/\/+$/, '');
    return `${base}/${ord.folio}?amount=${ord.totalUsd.toFixed(2)}&merchant=${encodeURIComponent(
      settings.pagoMasterMerchantId || 'COLORIO'
    )}`;
  };

  const handleSetOrderDesignStatus = (orderId: string, nextStatus: DesignApprovalStatus) => {
    onUpdateOrders(
      orders.map((o) => {
        if (o.id !== orderId) return o;
        const autoLink =
          nextStatus === 'aprobado' && !o.pagoMasterLink
            ? buildPagoMasterUrlForOrder(o)
            : o.pagoMasterLink;
        return {
          ...o,
          designStatus: nextStatus,
          pagoMasterLink: autoLink,
        };
      })
    );
  };

  const handleUploadBrandLogo = (file: File, variant: 'light' | 'dark') => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateSettings({
          ...settings,
          ...(variant === 'light'
            ? { brandLogoLightUrl: reader.result }
            : { brandLogoDarkUrl: reader.result }),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelado');
    const revenue = activeOrders.reduce((s, o) => s + o.totalUsd, 0);
    const totalUnits = activeOrders.reduce((s, o) => s + o.totalUnits, 0);
    const sellerCommTotal = activeOrders.reduce((s, o) => s + o.sellerCommissionUsd, 0);
    const refCommTotal = activeOrders.reduce((s, o) => s + o.referralCommissionUsd, 0);
    const systemCommTotal = activeOrders.reduce((s, o) => s + o.systemCommissionUsd, 0);

    const responded = activeOrders.filter((o) => o.responseMinutes !== undefined);
    const avgResponseMin = responded.length
      ? responded.reduce((s, o) => s + (o.responseMinutes || 0), 0) / responded.length
      : undefined;

    const totalOpens = trackedLinks.reduce((s, l) => s + l.opens, 0);
    const totalShares = trackedLinks.reduce((s, l) => s + l.shares, 0);
    const totalConversions = trackedLinks.reduce((s, l) => s + l.conversions, 0);

    const byProduct = new Map<string, { name: string; revenue: number; units: number }>();
    for (const o of activeOrders) {
      for (const it of o.itemsSummary) {
        const cur = byProduct.get(it.productId) || {
          name: it.productName,
          revenue: 0,
          units: 0,
        };
        cur.revenue += it.subtotal;
        cur.units += it.quantity;
        byProduct.set(it.productId, cur);
      }
    }

    const bySeller = sellers.map((sel) => {
      const sOrders = activeOrders.filter(
        (o) => o.sellerCode?.toUpperCase() === sel.code.toUpperCase()
      );
      const sRev = sOrders.reduce((s, o) => s + o.totalUsd, 0);
      const sUnits = sOrders.reduce((s, o) => s + o.totalUnits, 0);
      const commission = sOrders.reduce((s, o) => s + o.sellerCommissionUsd, 0);
      const sResp = sOrders.filter((o) => o.responseMinutes !== undefined);
      const avgResp = sResp.length
        ? sResp.reduce((s, o) => s + (o.responseMinutes || 0), 0) / sResp.length
        : undefined;
      return {
        seller: sel,
        ordersCount: sOrders.length,
        revenue: sRev,
        units: sUnits,
        commission,
        avgResp,
      };
    });

    const byReferral = referrals.map((ref) => {
      const rOrders = activeOrders.filter(
        (o) => o.referralCode?.toUpperCase() === ref.code.toUpperCase()
      );
      const rRev = rOrders.reduce((s, o) => s + o.totalUsd, 0);
      const rComm = rOrders.reduce((s, o) => s + o.referralCommissionUsd, 0);
      return { referral: ref, ordersCount: rOrders.length, revenue: rRev, commission: rComm };
    });

    return {
      revenue,
      ordersCount: activeOrders.length,
      totalUnits,
      sellerCommTotal,
      refCommTotal,
      systemCommTotal,
      avgResponseMin,
      respondedCount: responded.length,
      totalOpens,
      totalShares,
      totalConversions,
      byProduct: Array.from(byProduct.values()).sort((a, b) => b.revenue - a.revenue),
      bySeller: bySeller.sort((a, b) => b.revenue - a.revenue),
      byReferral: byReferral.sort((a, b) => b.revenue - a.revenue),
    };
  }, [orders, sellers, referrals, trackedLinks]);

  if (!isOpen) return null;

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
    } catch {
      // ignore
    }
  };

  const createAndCopyTrackedPartnerLink = (opts: {
    idKey: string;
    sellerCode?: string;
    referralCode?: string;
    label: string;
    channel: TrackChannel;
  }) => {
    const trk = generateTrackId();
    const url = new URL(window.location.origin + window.location.pathname);
    if (opts.sellerCode) url.searchParams.set('ref', opts.sellerCode.toUpperCase());
    if (opts.referralCode) url.searchParams.set('rc', opts.referralCode.toUpperCase());
    url.searchParams.set('trk', trk);
    const fullUrl = url.toString();

    onRegisterTrackedLink({
      trackId: trk,
      url: fullUrl,
      label: opts.label,
      productName: 'Catálogo General .colorío',
      sellerCode: opts.sellerCode,
      referralCode: opts.referralCode,
      channel: opts.channel,
    });
    copyText(opts.idKey, fullUrl);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (loginMode === 'superadmin') {
      if (
        loginEmail.trim().toLowerCase() === settings.superAdminEmail.toLowerCase() &&
        loginPassword.trim() === settings.superAdminPassword
      ) {
        setAuthRole('superadmin');
        setActiveSeller(null);
        setLoginPassword('');
      } else {
        setLoginError('Correo o clave de Superadministrador incorrectos.');
      }
    } else {
      const found = sellers.find(
        (s) =>
          s.active &&
          s.code.toUpperCase() === sellerLoginCode.trim().toUpperCase() &&
          s.pin === sellerLoginPin.trim()
      );
      if (found) {
        setAuthRole('seller');
        setActiveSeller(found);
        setSellerLoginPin('');
      } else {
        setLoginError('Código de vendedor o PIN inválido. (Demo: MARIA01 / 1111)');
      }
    }
  };

  const handleMarkOrderResponded = (orderId: string) => {
    const now = Date.now();
    onUpdateOrders(
      orders.map((o) => {
        if (o.id !== orderId || o.firstResponseAt) return o;
        const mins = Math.max(1, Math.round((now - o.createdAt) / 60000));
        return { ...o, firstResponseAt: now, responseMinutes: mins };
      })
    );
  };

  const handleChangeSuperPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPw.trim() !== settings.superAdminPassword) {
      setPwFeedback({ ok: false, msg: 'La clave actual no coincide.' });
      return;
    }
    if (nextPw.trim().length < 4) {
      setPwFeedback({ ok: false, msg: 'La nueva clave debe tener al menos 4 caracteres.' });
      return;
    }
    if (nextPw.trim() !== confirmPw.trim()) {
      setPwFeedback({ ok: false, msg: 'La confirmación no coincide con la nueva clave.' });
      return;
    }
    onUpdateSettings({
      ...settings,
      superAdminPassword: nextPw.trim(),
      isDefaultPassword: false,
    });
    setCurrentPw('');
    setNextPw('');
    setConfirmPw('');
    setPwFeedback({ ok: true, msg: '¡Clave de Superadministrador actualizada!' });
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = (newCouponCode.trim() || `COL${Math.floor(10 + Math.random() * 89)}`).toUpperCase();
    const coupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code,
      description:
        newCouponDesc.trim() ||
        (newCouponType === 'percent' ? `${newCouponVal}% de descuento` : `$${newCouponVal} de descuento`),
      type: newCouponType,
      value: Math.max(1, parseFloat(newCouponVal) || 10),
      minSubtotal: Math.max(0, parseFloat(newCouponMin) || 0),
      active: true,
      uses: 0,
      createdAt: Date.now(),
    };
    onUpdateCoupons([coupon, ...coupons]);
    setNewCouponCode('');
    setNewCouponDesc('');
  };

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerName.trim() || !newSellerCode.trim()) return;
    const seller: Seller = {
      id: `sel-${Date.now()}`,
      name: newSellerName.trim(),
      code: newSellerCode.trim().toUpperCase().replace(/\s+/g, ''),
      pin: newSellerPin.trim() || '1111',
      whatsapp: formatWhatsappDigits(newSellerWhatsapp) || settings.mainWhatsapp,
      commissionPct: Math.max(1, parseFloat(newSellerComm) || 8),
      monthlyGoalUsd: Math.max(100, parseFloat(newSellerGoal) || 2000),
      active: true,
    };
    onUpdateSellers([seller, ...sellers]);
    setNewSellerName('');
    setNewSellerCode('');
  };

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefCode.trim() || !newRefOwner.trim()) return;
    const ref: ReferralCode = {
      id: `ref-${Date.now()}`,
      code: newRefCode.trim().toUpperCase().replace(/\s+/g, ''),
      ownerName: newRefOwner.trim(),
      ownerPhone: newRefPhone.trim() || '—',
      commissionPct: Math.max(0.5, parseFloat(newRefComm) || 3),
      linkedSellerCode: newRefSeller || undefined,
      active: true,
      createdAt: Date.now(),
    };
    onUpdateReferrals([ref, ...referrals]);
    setNewRefCode('');
    setNewRefOwner('');
    setNewRefPhone('');
  };

  const handleQuickAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;
    const template = products.find((p) => p.shape === prodShape) || products[0];
    const base = Math.max(0.2, parseFloat(prodBasePrice) || 1.35);
    const created: Product = {
      ...template,
      id: `prod-${Date.now()}`,
      sku: prodSku.trim() || `POP-${Date.now().toString().slice(-4)}`,
      name: prodName.trim(),
      shortName: prodName.trim().slice(0, 20),
      priceTiers: [
        { minQty: 50, unitPrice: Number(base.toFixed(2)) },
        { minQty: 100, unitPrice: Number((base * 0.85).toFixed(2)), promoLabel: '-15% Promo' },
        { minQty: 250, unitPrice: Number((base * 0.72).toFixed(2)), promoLabel: '-28% Evento' },
        { minQty: 500, unitPrice: Number((base * 0.62).toFixed(2)), promoLabel: '-38% Corporativo' },
      ],
    };
    onUpdateProducts([created, ...products]);
    setProdName('');
  };

  const handleUpdateTierPrice = (
    productId: string,
    tierIdx: number,
    field: 'minQty' | 'unitPrice' | 'promoLabel',
    value: string
  ) => {
    onUpdateProducts(
      products.map((p) => {
        if (p.id !== productId) return p;
        const nextTiers = p.priceTiers.map((t, i) => {
          if (i !== tierIdx) return t;
          if (field === 'promoLabel') return { ...t, promoLabel: value };
          const num = parseFloat(value);
          return { ...t, [field]: Number.isNaN(num) ? t[field] : num };
        });
        return { ...p, priceTiers: nextTiers };
      })
    );
  };

  const handleUpdateStock = (
    productId: string,
    colorId: string,
    nextStock: number,
    nextAvail?: boolean
  ) => {
    onUpdateProducts(
      products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          colors: p.colors.map((c) => {
            if (c.id !== colorId) return c;
            const safeStock = Math.max(0, nextStock);
            return {
              ...c,
              stock: safeStock,
              available: nextAvail !== undefined ? nextAvail : safeStock > 0,
            };
          }),
        };
      })
    );
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    onUpdateProducts(
      products.map((p) => {
        if (p.id !== id) return p;
        return { ...p, ...updates };
      })
    );
    setProductSaveFeedback('¡Cambios guardados con éxito!');
    setTimeout(() => setProductSaveFeedback(null), 2500);
  };

  const handleUploadProductImage = (
    id: string,
    field: 'realImageUrl' | 'cleanMockupUrl',
    file: File
  ) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUpdateProduct(id, { [field]: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProductColor = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const newColor: ColorVariant = {
      id: `c-${Date.now().toString(36)}`,
      name: 'Nuevo Color',
      hex: '#4C1EDB',
      stock: 100,
      available: true,
    };
    handleUpdateProduct(id, { colors: [...prod.colors, newColor] });
  };

  const handleUpdateProductColor = (
    id: string,
    colorId: string,
    updates: Partial<ColorVariant>
  ) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    handleUpdateProduct(id, {
      colors: prod.colors.map((c) => (c.id === colorId ? { ...c, ...updates } : c)),
    });
  };

  const handleRemoveProductColor = (id: string, colorId: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod || prod.colors.length <= 1) return;
    handleUpdateProduct(id, {
      colors: prod.colors.filter((c) => c.id !== colorId),
    });
  };

  const handleAddProductSecondary = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const newSec: SecondaryOption = {
      id: `sec-${Date.now().toString(36)}`,
      name: 'Nueva Medida / Opción',
      hex: 'MATCH',
      stock: 100,
      available: true,
      unitPriceOverride: prod.priceTiers[0]?.unitPrice ?? 1.5,
    };
    handleUpdateProduct(id, {
      secondaryOptions: [...(prod.secondaryOptions || []), newSec],
    });
  };

  const handleUpdateProductSecondary = (
    id: string,
    secId: string,
    updates: Partial<SecondaryOption>
  ) => {
    const prod = products.find((p) => p.id === id);
    if (!prod || !prod.secondaryOptions) return;
    handleUpdateProduct(id, {
      secondaryOptions: prod.secondaryOptions.map((s) =>
        s.id === secId ? { ...s, ...updates } : s
      ),
    });
  };

  const handleRemoveProductSecondary = (id: string, secId: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod || !prod.secondaryOptions) return;
    handleUpdateProduct(id, {
      secondaryOptions: prod.secondaryOptions.filter((s) => s.id !== secId),
    });
  };

  const handleAddProductTier = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const lastTier = prod.priceTiers[prod.priceTiers.length - 1];
    const newMin = lastTier ? lastTier.minQty * 2 : 100;
    const newPrice = lastTier
      ? Math.max(0.2, Number((lastTier.unitPrice * 0.9).toFixed(2)))
      : 1.0;
    handleUpdateProduct(id, {
      priceTiers: [...prod.priceTiers, { minQty: newMin, unitPrice: newPrice }],
    });
  };

  const handleRemoveProductTier = (id: string, idx: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod || prod.priceTiers.length <= 1) return;
    handleUpdateProduct(id, {
      priceTiers: prod.priceTiers.filter((_, i) => i !== idx),
    });
  };

  const handleDeleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    if (window.confirm(`¿Seguro que deseas eliminar "${prod.name}" del catálogo?`)) {
      onUpdateProducts(products.filter((p) => p.id !== id));
      if (editingProductId === id) setEditingProductId(null);
    }
  };

  const handleUploadPromoImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdatePromoBanner({ ...promoBanner, imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const statusColors: Record<OrderStatus, string> = {
    pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
    produccion: 'bg-violet-50 text-[#4C1EDB] border-violet-200',
    entregado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelado: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />

      {/* AUTH LOGIN SCREEN */}
      {authRole === 'none' ? (
        <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ColorioLogo theme="light" className="h-7 w-auto" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-50 text-[#4C1EDB]">
                Control & Ventas
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('superadmin');
                  setLoginError(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  loginMode === 'superadmin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Superadministrador
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('seller');
                  setLoginError(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  loginMode === 'seller'
                    ? 'bg-white text-[#4C1EDB] shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Vendedor / Asesor
              </button>
            </div>

            {loginMode === 'superadmin' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Superadministrador
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="peoplecreativaca@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#4C1EDB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clave de acceso
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Ingresa tu clave"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tracking-widest focus:border-[#4C1EDB] outline-none"
                  />
                </div>
                {settings.isDefaultPassword && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                    Acceso inicial: <strong>{settings.superAdminEmail}</strong> · Clave temporal:{' '}
                    <strong>1234</strong> (cámbiala dentro de Configuración).
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código de Vendedor
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerLoginCode}
                    onChange={(e) => setSellerLoginCode(e.target.value.toUpperCase())}
                    placeholder="Ej. MARIA01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm uppercase font-bold tracking-wider focus:border-[#4C1EDB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN de Vendedor
                  </label>
                  <input
                    type="password"
                    required
                    value={sellerLoginPin}
                    onChange={(e) => setSellerLoginPin(e.target.value)}
                    placeholder="Ej. 1111"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tracking-widest focus:border-[#4C1EDB] outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Demo vendedores: <strong>MARIA01 / 1111</strong> o <strong>CARLOS02 / 2222</strong>
                </p>
              </div>
            )}

            {loginError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#0D0E12] hover:bg-[#4C1EDB] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Ingresar al Panel</span>
            </button>
          </form>
        </div>
      ) : authRole === 'seller' && activeSeller ? (
        /* SELLER PORTAL */
        <div className="relative w-full max-w-[820px] max-h-[94vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <ColorioLogo
                theme="light"
                customLogoUrl={settings.brandLogoLightUrl || undefined}
                className="h-7 w-auto shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-slate-900 truncate">
                  Portal Vendedor · {activeSeller.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Código: <strong className="text-[#4C1EDB]">{activeSeller.code}</strong> · Comisión:{' '}
                  <strong>{activeSeller.commissionPct}%</strong> · WA: +{activeSeller.whatsapp}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAuthRole('none');
                  setActiveSeller(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4C1EDB] to-[#6D28D9] text-white space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-200">
                Genera tu enlace rastreable de ventas (mide aperturas y pedidos)
              </p>
              <button
                type="button"
                onClick={() =>
                  createAndCopyTrackedPartnerLink({
                    idKey: 'seller-portal-link',
                    sellerCode: activeSeller.code,
                    label: `Link de Ventas · ${activeSeller.name}`,
                    channel: 'seller-link',
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-[#C0EE00] text-[#0D0E12] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'seller-portal-link' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                <span>
                  {copiedId === 'seller-portal-link'
                    ? '¡Link Rastreable Copiado!'
                    : 'Generar y Copiar Mi Link Rastreable'}
                </span>
              </button>
            </div>

            {(() => {
              const myOrders = orders.filter(
                (o) =>
                  o.status !== 'cancelado' &&
                  o.sellerCode?.toUpperCase() === activeSeller.code.toUpperCase()
              );
              const myLinks = trackedLinks.filter(
                (l) => l.sellerCode?.toUpperCase() === activeSeller.code.toUpperCase()
              );
              const myRev = myOrders.reduce((s, o) => s + o.totalUsd, 0);
              const myComm = myOrders.reduce((s, o) => s + o.sellerCommissionUsd, 0);
              const myOpens = myLinks.reduce((s, l) => s + l.opens, 0);
              const myResp = myOrders.filter((o) => o.responseMinutes !== undefined);
              const myAvgResp = myResp.length
                ? myResp.reduce((s, o) => s + (o.responseMinutes || 0), 0) / myResp.length
                : undefined;

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[11px] font-semibold text-slate-500">Ventas</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                        {formatCurrency(myRev)}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70">
                      <p className="text-[11px] font-semibold text-emerald-700">Tu Comisión</p>
                      <p className="text-xl font-extrabold text-emerald-800 mt-0.5">
                        {formatCurrency(myComm)}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[11px] font-semibold text-slate-500">Links Abiertos</p>
                      <p className="text-xl font-extrabold text-[#4C1EDB] mt-0.5">{myOpens}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[11px] font-semibold text-slate-500">SLA Respuesta</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                        {formatMinutesLabel(myAvgResp)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Tus Pedidos ({myOrders.length})
                    </h3>
                    {myOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              #{o.folio} · {o.customerName} {o.company ? `(${o.company})` : ''}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {o.totalUnits} uds · SLA: {formatMinutesLabel(o.responseMinutes)} · Comisión:{' '}
                              <strong className="text-emerald-700">
                                {formatCurrency(o.sellerCommissionUsd)}
                              </strong>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!o.firstResponseAt && (
                              <button
                                type="button"
                                onClick={() => handleMarkOrderResponded(o.id)}
                                className="px-2.5 py-1 rounded-lg bg-violet-50 text-[#4C1EDB] text-[11px] font-bold cursor-pointer"
                              >
                                Marcar Respondido
                              </button>
                            )}
                            <span className="text-sm font-extrabold text-slate-900">
                              {formatCurrency(o.totalUsd)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 border border-slate-200/80">
                            <button
                              type="button"
                              onClick={() => handleSetOrderDesignStatus(o.id, 'aprobado')}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                                o.designStatus === 'aprobado'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:bg-white'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Aprobado
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetOrderDesignStatus(o.id, 'en_revision')}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                                o.designStatus === 'en_revision'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'text-slate-600 hover:bg-white'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              En revisión
                            </button>
                          </div>

                          <a
                            href={`https://wa.me/${formatWhatsappDigits(o.phone)}?text=${encodeURIComponent(
                              o.designStatus === 'aprobado'
                                ? `¡Hola ${o.customerName}! Tu diseño del pedido *#${o.folio}* en *.colorío* fue *APROBADO*.\n\nTotal a pagar (IVA ${o.ivaPct}% incluido): *${formatCurrency(o.totalUsd)}*\n\n💳 Link directo *Pago Master*:\n${o.pagoMasterLink || buildPagoMasterUrlForOrder(o)}`
                                : `¡Hola ${o.customerName}! Tu diseño del pedido *#${o.folio}* en *.colorío* está *EN REVISIÓN*. Te confirmamos los ajustes para enviarte tu link de Pago Master por *${formatCurrency(o.totalUsd)}*.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => {
                              handleMarkOrderResponded(o.id);
                              if (o.designStatus === 'aprobado' && o.paymentStatus === 'pendiente') {
                                onUpdateOrders(
                                  orders.map((item) =>
                                    item.id === o.id
                                      ? {
                                          ...item,
                                          paymentStatus: 'link_enviado',
                                          pagoMasterLink:
                                            item.pagoMasterLink || buildPagoMasterUrlForOrder(item),
                                        }
                                      : item
                                  )
                                );
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold text-white flex items-center gap-1 ${
                              o.designStatus === 'aprobado'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>
                              {o.designStatus === 'aprobado'
                                ? `Enviar Pedido + Pago (${formatCurrency(o.totalUsd)})`
                                : 'Notificar En Revisión'}
                            </span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : (
        /* SUPERADMIN COMPLETE CONTROL PANEL */
        <div className="relative w-full max-w-[1140px] h-[95vh] sm:h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <ColorioLogo
                theme="light"
                customLogoUrl={settings.brandLogoLightUrl || undefined}
                className="h-7 w-auto shrink-0"
              />
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#4C1EDB] text-white shrink-0">
                Superadmin
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  dbConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {dbConnected ? '● BD Neon En Vivo' : '○ Almacenamiento Local'}
              </span>
              <span className="hidden md:inline text-xs text-slate-500 truncate">
                {settings.superAdminEmail}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthRole('none')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Temporary Password Reminder Banner */}
          {settings.isDefaultPassword && (
            <div className="px-5 py-2 bg-amber-50 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
              <span className="font-semibold">
                Estás usando la clave temporal (1234). Te recomendamos actualizarla ahora.
              </span>
              <button
                type="button"
                onClick={() => setTab('settings')}
                className="font-extrabold text-[#4C1EDB] underline cursor-pointer"
              >
                Cambiar clave →
              </button>
            </div>
          )}

          {/* Responsive Tabs */}
          <div className="px-3 sm:px-4 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
            {(
              [
                { id: 'stats', label: 'Estadísticas y Reportes', icon: BarChart3 },
                { id: 'links', label: `Links (${trackedLinks.length})`, icon: Activity },
                { id: 'orders', label: `Pedidos (${orders.length})`, icon: ShoppingBag },
                { id: 'sellers', label: 'Vendedores y Referidos', icon: Users },
                { id: 'inventory', label: 'Inventario', icon: Boxes },
                { id: 'products', label: 'Catálogo y Promos', icon: Package },
                { id: 'coupons', label: `Cupones (${coupons.length})`, icon: Tag },
                { id: 'settings', label: 'Configuración', icon: Settings },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#0D0E12] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#FAFBFD]">
            {/* TAB 1: ESTADÍSTICAS, COMISIONES, SLA Y REPORTES */}
            {tab === 'stats' && (
              <div className="space-y-5">
                {/* Report Export Action Bar */}
                <div className="p-4 rounded-2xl bg-[#0D0E12] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#C0EE00]">
                      People Creativa, C.A. · Panel Ejecutivo
                    </p>
                    <h3 className="text-sm sm:text-base font-extrabold">
                      Generación de Reportes y Control Financiero
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => exportOrdersCsvReport(orders, settings)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[#C0EE00]" />
                      <span>Exportar Excel (CSV)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openPrintableExecutiveReport({
                          orders,
                          sellers,
                          links: trackedLinks,
                          settings,
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#4C1EDB] hover:bg-[#5E30EB] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Reporte PDF / Imprimir</span>
                    </button>
                  </div>
                </div>

                {/* Primary KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
                    <p className="text-[10.5px] font-bold uppercase text-slate-400">Ventas Totales</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 font-display">
                      {formatCurrency(stats.revenue)}
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      {stats.ordersCount} pedidos · {stats.totalUnits.toLocaleString('es-ES')} uds
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-violet-50/70 border border-violet-200/80">
                    <p className="text-[10.5px] font-bold uppercase text-[#4C1EDB]">
                      Comisión Sistema ({settings.systemCommissionPct}%)
                    </p>
                    <p className="text-xl font-extrabold text-[#4C1EDB] mt-1 font-display">
                      {formatCurrency(stats.systemCommTotal)}
                    </p>
                    <p className="text-[10.5px] text-violet-700/80 mt-0.5">People Creativa, C.A.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
                    <p className="text-[10.5px] font-bold uppercase text-slate-400">
                      Com. Vendedores
                    </p>
                    <p className="text-xl font-extrabold text-emerald-700 mt-1 font-display">
                      {formatCurrency(stats.sellerCommTotal)}
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      {sellers.length} asesores activos
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
                    <p className="text-[10.5px] font-bold uppercase text-slate-400">
                      Com. Referidos
                    </p>
                    <p className="text-xl font-extrabold text-[#F72585] mt-1 font-display">
                      {formatCurrency(stats.refCommTotal)}
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      {referrals.length} códigos activos
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
                    <p className="text-[10.5px] font-bold uppercase text-slate-400">
                      Tiempo Respuesta
                    </p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 font-display">
                      {formatMinutesLabel(stats.avgResponseMin)}
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      {stats.respondedCount}/{stats.ordersCount} atendidos
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
                    <p className="text-[10.5px] font-bold uppercase text-slate-400">
                      Links Rastrados
                    </p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 font-display">
                      {stats.totalOpens} <span className="text-xs font-semibold text-slate-400">abr.</span>
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      {stats.totalShares} comp. · {stats.totalConversions} ped.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Seller Leaderboard with Commissions & Response SLA */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
                      Vendedores · Ventas, Comisiones y Tiempo de Respuesta
                    </h3>
                    <div className="space-y-2.5">
                      {stats.bySeller.map((row) => (
                        <div
                          key={row.seller.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {row.seller.name}{' '}
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-100 text-[#4C1EDB]">
                                {row.seller.code}
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {row.ordersCount} pedidos · SLA: {formatMinutesLabel(row.avgResp)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-extrabold text-slate-900">
                              {formatCurrency(row.revenue)}
                            </p>
                            <p className="text-[10.5px] font-semibold text-emerald-600">
                              Com ({row.seller.commissionPct}%): {formatCurrency(row.commission)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Referrals + Product Breakdown */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
                        Comisiones por Referidos
                      </h3>
                      <div className="space-y-2">
                        {stats.byReferral.map((r) => (
                          <div
                            key={r.referral.id}
                            className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{r.referral.ownerName}</span>{' '}
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-[#F72585]">
                                {r.referral.code}
                              </span>
                              <p className="text-[10.5px] text-slate-500">
                                {r.ordersCount} pedidos · {formatCurrency(r.revenue)} en ventas
                              </p>
                            </div>
                            <span className="font-extrabold text-[#F72585]">
                              {formatCurrency(r.commission)} ({r.referral.commissionPct}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
                        Ventas por Producto
                      </h3>
                      <div className="space-y-2.5">
                        {stats.byProduct.map((bp, i) => {
                          const pct = stats.revenue ? Math.round((bp.revenue / stats.revenue) * 100) : 0;
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-slate-800 truncate pr-2">
                                  {bp.name}
                                </span>
                                <span className="font-bold text-slate-900 shrink-0">
                                  {formatCurrency(bp.revenue)} ({bp.units} uds)
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#4C1EDB] to-[#F72585]"
                                  style={{ width: `${Math.max(6, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RASTREO DE LINKS (APERTURAS, COMPARTIDOS, CONVERSIONES) */}
            {tab === 'links' && (
              <div className="space-y-4">
                {/* Separate Shareable Links: Landing Corporativo vs Catálogo Interactivo POP */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0D0E12] to-[#1E1442] text-white space-y-3">
                  <div>
                    <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#C0EE00]">
                      Envía cada experiencia por separado
                    </p>
                    <h3 className="text-sm font-extrabold">
                      Landing Corporativo vs Catálogo Interactivo POP
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase text-violet-200">
                          1. Landing Corporativo
                        </p>
                        <p className="text-xs font-mono truncate text-white">
                          {window.location.origin}/landing
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText('direct-landing', `${window.location.origin}/landing`)}
                        className="px-3 py-1.5 rounded-lg bg-white text-[#0D0E12] text-[11px] font-extrabold shrink-0 cursor-pointer"
                      >
                        {copiedId === 'direct-landing' ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white/10 border border-[#C0EE00]/40 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase text-[#C0EE00]">
                          2. Catálogo Interactivo (Rastreable)
                        </p>
                        <p className="text-xs font-mono truncate text-white">
                          {window.location.origin}/catalogo
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const tid = generateTrackId();
                          const url = `${window.location.origin}/catalogo?trk=${tid}`;
                          onRegisterTrackedLink({
                            trackId: tid,
                            url,
                            label: 'Catálogo Interactivo POP (Directo)',
                            productName: 'Catálogo Completo POP',
                            channel: 'copy',
                          });
                          copyText('direct-catalog', url);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#C0EE00] text-[#0D0E12] text-[11px] font-extrabold shrink-0 cursor-pointer"
                      >
                        {copiedId === 'direct-catalog' ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
                    <p className="text-[10.5px] font-bold uppercase text-slate-400">Veces Compartido</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalShares}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
                    <p className="text-[10.5px] font-bold uppercase text-[#4C1EDB]">Aperturas (Clics)</p>
                    <p className="text-2xl font-extrabold text-[#4C1EDB] mt-1">{stats.totalOpens}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
                    <p className="text-[10.5px] font-bold uppercase text-emerald-600">Pedidos Generados</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                      {stats.totalConversions}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {trackedLinks.map((lnk) => (
                    <div
                      key={lnk.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-extrabold font-mono text-[#4C1EDB]">
                            {lnk.id}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{lnk.label}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {lnk.channel}
                          </span>
                          {lnk.sellerCode && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-[#4C1EDB]">
                              Vend: {lnk.sellerCode}
                            </span>
                          )}
                          {lnk.referralCode && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-[#F72585]">
                              Ref: {lnk.referralCode}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-1 font-mono">
                          {lnk.url}
                        </p>
                        <p className="text-[10.5px] text-slate-500 mt-1">
                          Última apertura:{' '}
                          {lnk.lastOpenedAt
                            ? `${new Date(lnk.lastOpenedAt).toLocaleString('es-ES')} (${lnk.lastDevice || 'Web'})`
                            : 'Aún sin abrir'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 text-center">
                          <div className="px-2.5 py-1.5 rounded-xl bg-slate-50">
                            <p className="text-xs font-extrabold text-slate-900">{lnk.shares}</p>
                            <p className="text-[9.5px] text-slate-400">Comp.</p>
                          </div>
                          <div className="px-2.5 py-1.5 rounded-xl bg-violet-50">
                            <p className="text-xs font-extrabold text-[#4C1EDB]">{lnk.opens}</p>
                            <p className="text-[9.5px] text-violet-500">Abiertos</p>
                          </div>
                          <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50">
                            <p className="text-xs font-extrabold text-emerald-700">
                              {lnk.conversions}
                            </p>
                            <p className="text-[9.5px] text-emerald-600">Pedidos</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(lnk.id, lnk.url)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-600 hover:text-[#4C1EDB] cursor-pointer"
                          title="Copiar link rastreable"
                        >
                          {copiedId === lnk.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CONTROL DE PEDIDOS & TIEMPOS DE RESPUESTA */}
            {tab === 'orders' && (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-[#4C1EDB] font-mono">
                          #{ord.folio}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {ord.customerName}
                          {ord.company ? ` · ${ord.company}` : ''}
                        </span>
                        {ord.sellerCode && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-[#4C1EDB]">
                            Vend: {ord.sellerCode} ({formatCurrency(ord.sellerCommissionUsd)})
                          </span>
                        )}
                        {ord.referralCode && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-[#F72585]">
                            Ref: {ord.referralCode} ({formatCurrency(ord.referralCommissionUsd)})
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Sistema {ord.systemCommissionPct}%: {formatCurrency(ord.systemCommissionUsd)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.firstResponseAt ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                            <Clock className="w-3 h-3" />
                            SLA: {formatMinutesLabel(ord.responseMinutes)}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkOrderResponded(ord.id)}
                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl cursor-pointer"
                          >
                            <Clock className="w-3 h-3" />
                            Marcar Respondido
                          </button>
                        )}

                        <select
                          value={ord.status}
                          onChange={(e) =>
                            onUpdateOrders(
                              orders.map((o) =>
                                o.id === ord.id
                                  ? { ...o, status: e.target.value as OrderStatus }
                                  : o
                              )
                            )
                          }
                          className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-xl border outline-none cursor-pointer ${statusColors[ord.status]}`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="produccion">En Producción</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>

                        <a
                          href={`https://wa.me/${formatWhatsappDigits(ord.phone)}?text=${encodeURIComponent(
                            `Hola ${ord.customerName}, te escribimos de .colorío sobre tu pedido #${ord.folio}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleMarkOrderResponded(ord.id)}
                          className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          title="Responder por WhatsApp (registra tiempo de respuesta)"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Tel: {ord.phone}</span>
                      <span>Ciudad: {ord.city}</span>
                      <span>IVA ({ord.ivaPct}%): {formatCurrency(ord.ivaAmount)}</span>
                      <span>Envío: {ord.shippingLabel} ({formatCurrency(ord.shippingCost)})</span>
                      {ord.processingFeeAmount > 0 && (
                        <span>Proc. ({ord.processingFeePct}%): {formatCurrency(ord.processingFeeAmount)}</span>
                      )}
                      <span className="font-bold text-slate-900">
                        Total: {formatCurrency(ord.totalUsd)} ({ord.totalUnits} uds)
                      </span>
                    </div>

                    {/* Design Approval Toggle (Aprobado / En revisión) + Pago Master Direct Link Bar */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                            Diseño:
                          </span>
                          <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 border border-slate-200/80">
                            <button
                              type="button"
                              onClick={() => handleSetOrderDesignStatus(ord.id, 'aprobado')}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                                ord.designStatus === 'aprobado'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:bg-white'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Aprobado
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetOrderDesignStatus(ord.id, 'en_revision')}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                                ord.designStatus === 'en_revision'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'text-slate-600 hover:bg-white'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              En revisión
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <CreditCard className="w-3.5 h-3.5 text-[#4C1EDB]" />
                          <select
                            value={ord.paymentStatus}
                            onChange={(e) =>
                              onUpdateOrders(
                                orders.map((o) =>
                                  o.id === ord.id
                                    ? { ...o, paymentStatus: e.target.value as PaymentStatus }
                                    : o
                                )
                              )
                            }
                            className={`text-[10.5px] font-bold uppercase px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                              ord.paymentStatus === 'pagado'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ord.paymentStatus === 'link_enviado'
                                  ? 'bg-violet-50 text-[#4C1EDB] border-violet-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            <option value="pendiente">Pago Pendiente</option>
                            <option value="link_enviado">Link Pago Master Enviado</option>
                            <option value="pagado">Pagado</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <input
                          type="url"
                          value={ord.pagoMasterLink || ''}
                          onChange={(e) =>
                            onUpdateOrders(
                              orders.map((o) =>
                                o.id === ord.id ? { ...o, pagoMasterLink: e.target.value } : o
                              )
                            )
                          }
                          placeholder={`Link Pago Master para ${formatCurrency(ord.totalUsd)}...`}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 text-[11px] font-mono outline-none focus:border-[#4C1EDB] focus:bg-white"
                        />

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!ord.pagoMasterLink && (
                            <button
                              type="button"
                              onClick={() => {
                                const generated = buildPagoMasterUrlForOrder(ord);
                                onUpdateOrders(
                                  orders.map((o) =>
                                    o.id === ord.id ? { ...o, pagoMasterLink: generated } : o
                                  )
                                );
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-[#4C1EDB] text-[11px] font-bold cursor-pointer"
                            >
                              Generar Link ({formatCurrency(ord.totalUsd)})
                            </button>
                          )}

                          <a
                            href={`https://wa.me/${formatWhatsappDigits(ord.phone)}?text=${encodeURIComponent(
                              ord.designStatus === 'aprobado'
                                ? `¡Hola ${ord.customerName}! Tu diseño del pedido *#${ord.folio}* en *.colorío* fue *APROBADO*.\n\nTotal a pagar (incluye IVA ${ord.ivaPct}%): *${formatCurrency(ord.totalUsd)}*\n\n💳 Paga directo aquí vía *Pago Master*:\n${ord.pagoMasterLink || buildPagoMasterUrlForOrder(ord)}`
                                : `¡Hola ${ord.customerName}! Tu diseño del pedido *#${ord.folio}* en *.colorío* se encuentra *EN REVISIÓN*. Apenas confirmemos los detalles del arte te enviamos el link de *Pago Master* por *${formatCurrency(ord.totalUsd)}*.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => {
                              handleMarkOrderResponded(ord.id);
                              if (ord.designStatus === 'aprobado') {
                                onUpdateOrders(
                                  orders.map((o) =>
                                    o.id === ord.id
                                      ? {
                                          ...o,
                                          pagoMasterLink:
                                            o.pagoMasterLink || buildPagoMasterUrlForOrder(o),
                                          paymentStatus:
                                            o.paymentStatus === 'pendiente'
                                              ? 'link_enviado'
                                              : o.paymentStatus,
                                        }
                                      : o
                                  )
                                );
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-white text-[11px] font-bold flex items-center gap-1 ${
                              ord.designStatus === 'aprobado'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>
                              {ord.designStatus === 'aprobado'
                                ? `Enviar Pedido + Pago (${formatCurrency(ord.totalUsd)})`
                                : 'Enviar Estado En Revisión'}
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: VENDEDORES (CON WHATSAPP INDIVIDUAL) & CÓDIGOS DE REFERENCIA */}
            {tab === 'sellers' && (
              <div className="space-y-6">
                {/* Vendedores */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Vendedores · Teléfono WhatsApp, Código y Comisión
                  </h3>
                  <form
                    onSubmit={handleCreateSeller}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end"
                  >
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        Nombre *
                      </label>
                      <input
                        required
                        value={newSellerName}
                        onChange={(e) => setNewSellerName(e.target.value)}
                        placeholder="Sofía Pérez"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        Código *
                      </label>
                      <input
                        required
                        value={newSellerCode}
                        onChange={(e) => setNewSellerCode(e.target.value.toUpperCase())}
                        placeholder="SOFIA03"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        WhatsApp (58...)
                      </label>
                      <input
                        value={newSellerWhatsapp}
                        onChange={(e) => setNewSellerWhatsapp(e.target.value)}
                        placeholder="584245252121"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        PIN
                      </label>
                      <input
                        value={newSellerPin}
                        onChange={(e) => setNewSellerPin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        Comisión %
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={newSellerComm}
                        onChange={(e) => setNewSellerComm(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2 px-3 rounded-xl bg-[#0D0E12] hover:bg-[#4C1EDB] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Registrar
                    </button>
                  </form>

                  <div className="space-y-2.5">
                    {stats.bySeller.map(({ seller, ordersCount, revenue, commission, avgResp }) => (
                      <div
                        key={seller.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900">
                              {seller.name}
                            </span>
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-violet-50 text-[#4C1EDB]">
                              {seller.code}
                            </span>
                            <span className="text-[10.5px] text-slate-400">PIN: {seller.pin}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span>Ventas: <strong>{formatCurrency(revenue)}</strong> ({ordersCount})</span>
                            <span>·</span>
                            <span>Comisión ({seller.commissionPct}%): <strong className="text-emerald-700">{formatCurrency(commission)}</strong></span>
                            <span>·</span>
                            <span>SLA: <strong>{formatMinutesLabel(avgResp)}</strong></span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <input
                              type="text"
                              value={seller.whatsapp}
                              onChange={(e) =>
                                onUpdateSellers(
                                  sellers.map((s) =>
                                    s.id === seller.id
                                      ? { ...s, whatsapp: formatWhatsappDigits(e.target.value) }
                                      : s
                                  )
                                )
                              }
                              className="w-28 bg-transparent text-[11px] font-mono font-semibold outline-none"
                              title="WhatsApp asignado a este vendedor"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              createAndCopyTrackedPartnerLink({
                                idKey: `sel-${seller.id}`,
                                sellerCode: seller.code,
                                label: `Link Vendedor · ${seller.name}`,
                                channel: 'seller-link',
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#4C1EDB] text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === `sel-${seller.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Link2 className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {copiedId === `sel-${seller.id}` ? 'Copiado' : 'Link Rastreable'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSellers(sellers.filter((s) => s.id !== seller.id))
                            }
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Códigos de Referencia / Referidos */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#F72585] flex items-center gap-1.5">
                    <Gift className="w-4 h-4" />
                    Códigos de Referencia / Programa de Referidos
                  </h3>

                  <form
                    onSubmit={handleCreateReferral}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end"
                  >
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        Código Ref *
                      </label>
                      <input
                        required
                        value={newRefCode}
                        onChange={(e) => setNewRefCode(e.target.value.toUpperCase())}
                        placeholder="ALIADO20"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        Nombre / Aliado *
                      </label>
                      <input
                        required
                        value={newRefOwner}
                        onChange={(e) => setNewRefOwner(e.target.value)}
                        placeholder="Agencia BTL"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        Teléfono
                      </label>
                      <input
                        value={newRefPhone}
                        onChange={(e) => setNewRefPhone(e.target.value)}
                        placeholder="0414-0000000"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        Comisión %
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={newRefComm}
                        onChange={(e) => setNewRefComm(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        Vendedor Asoc.
                      </label>
                      <select
                        value={newRefSeller}
                        onChange={(e) => setNewRefSeller(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      >
                        <option value="">Ninguno</option>
                        {sellers.map((s) => (
                          <option key={s.id} value={s.code}>
                            {s.code} ({s.name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="py-2 px-3 rounded-xl bg-[#F72585] hover:bg-pink-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Crear Ref
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stats.byReferral.map(({ referral, ordersCount, revenue, commission }) => (
                      <div
                        key={referral.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold font-mono text-[#F72585]">
                              {referral.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {referral.ownerName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {ordersCount} pedidos · Ventas: {formatCurrency(revenue)} · Comisión ({referral.commissionPct}%):{' '}
                            <strong className="text-[#F72585]">{formatCurrency(commission)}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              createAndCopyTrackedPartnerLink({
                                idKey: `ref-${referral.id}`,
                                sellerCode: referral.linkedSellerCode,
                                referralCode: referral.code,
                                label: `Referido · ${referral.ownerName}`,
                                channel: 'referral-link',
                              })
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-pink-50 text-[#F72585] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === `ref-${referral.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Link2 className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === `ref-${referral.id}` ? 'Copiado' : 'Link'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateReferrals(referrals.filter((r) => r.id !== referral.id))
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: INVENTARIO */}
            {tab === 'inventory' && (
              <div className="space-y-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{prod.name}</h3>
                        <p className="text-[11px] text-slate-500">SKU: {prod.sku}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Stock:{' '}
                        {prod.colors
                          .reduce((s, c) => s + (c.available ? c.stock : 0), 0)
                          .toLocaleString('es-ES')}{' '}
                        uds
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {prod.colors.map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-6 h-6 rounded-full border border-slate-900/20 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateStock(prod.id, c.id, c.stock || 200, !c.available)
                                }
                                className={`text-[10px] font-bold cursor-pointer ${
                                  c.available && c.stock > 0 ? 'text-emerald-600' : 'text-rose-500'
                                }`}
                              >
                                {c.available && c.stock > 0 ? '● Disponible' : '○ Agotado'}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateStock(prod.id, c.id, c.stock - 100)}
                              className="px-1.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                            >
                              -100
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={c.stock}
                              onChange={(e) =>
                                handleUpdateStock(prod.id, c.id, parseInt(e.target.value, 10) || 0)
                              }
                              className="w-16 px-1.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center tabular-nums"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateStock(prod.id, c.id, c.stock + 250, true)}
                              className="px-1.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                            >
                              +250
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 6: CATÁLOGO, PRECIOS, PROMOS & BANNER CORPORATIVO */}
            {tab === 'products' && (
              <div className="space-y-5">
                {/* Hidden File Inputs for Product Images */}
                <input
                  ref={realImgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && editingProductId) handleUploadProductImage(editingProductId, 'realImageUrl', f);
                  }}
                />
                <input
                  ref={cleanMockupInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && editingProductId) handleUploadProductImage(editingProductId, 'cleanMockupUrl', f);
                  }}
                />

                {/* ================= IF EDITING A SPECIFIC PRODUCT ================= */}
                {editingProductId ? (() => {
                  const prod = products.find((p) => p.id === editingProductId);
                  if (!prod) return <p className="text-xs text-rose-600">Producto no encontrado.</p>;

                  return (
                    <div className="space-y-4">
                      {/* Top Header Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setEditingProductId(null)}
                            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver a la lista</span>
                          </button>
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                              Editando: {prod.name}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              SKU: <strong className="text-slate-800">{prod.sku}</strong> · Categoría:{' '}
                              <span className="font-semibold text-[#4C1EDB]">{prod.category}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {productSaveFeedback && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 animate-in fade-in">
                              ✓ {productSaveFeedback}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingProductId(null)}
                            className="px-4 py-2 rounded-xl bg-[#0D0E12] hover:bg-[#4C1EDB] text-white text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Listo / Cerrar Ficha
                          </button>
                        </div>
                      </div>

                      {/* SECTION 1: FOTOS DEL PRODUCTO (VITRINA VS LIMPIO) */}
                      <div className="p-4 rounded-2xl bg-white border border-violet-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#4C1EDB] flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4" />
                            Fotografías y Mockup (Vitrina vs Base Limpia)
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Sube aquí la imagen para la vitrina del catálogo (con logo .colorío) y la imagen base limpia (sin logo) para que el cliente vea su propio logotipo al personalizar.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {/* Foto Vitrina / Catálogo (Con logo Colorío) */}
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                <span>📷 Foto Vitrina / Catálogo</span>
                              </span>
                              <span className="text-[10px] font-bold text-[#4C1EDB] bg-violet-50 px-2 py-0.5 rounded-full">
                                Con logo .colorío
                              </span>
                            </div>

                            <div className="h-36 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300/60">
                              {prod.realImageUrl ? (
                                <img
                                  src={prod.realImageUrl}
                                  alt="Vitrina"
                                  className="w-full h-full object-contain bg-white"
                                />
                              ) : (
                                <span className="text-xs text-slate-400">Sin foto de vitrina</span>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={prod.realImageUrl || ''}
                                onChange={(e) =>
                                  handleUpdateProduct(prod.id, { realImageUrl: e.target.value })
                                }
                                placeholder="URL de la imagen vitrina (ej. /catalog/tulas.jpg o https://...)"
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => realImgInputRef.current?.click()}
                                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-[#4C1EDB]" />
                                <span>Subir Foto Vitrina desde tu equipo</span>
                              </button>
                            </div>
                          </div>

                          {/* Base Limpia para Personalizar (Sin logo) */}
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                <span>🧼 Base Limpia para Personalizar</span>
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Sin logo
                              </span>
                            </div>

                            <div className="h-36 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300/60">
                              {prod.cleanMockupUrl ? (
                                <img
                                  src={prod.cleanMockupUrl}
                                  alt="Base Limpia"
                                  className="w-full h-full object-contain bg-white"
                                />
                              ) : (
                                <span className="text-xs text-slate-400 text-center px-4">
                                  Sin base limpia cargada (usará la foto de vitrina)
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={prod.cleanMockupUrl || ''}
                                onChange={(e) =>
                                  handleUpdateProduct(prod.id, { cleanMockupUrl: e.target.value })
                                }
                                placeholder="URL base limpia sin logo (ej. https://...)"
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => cleanMockupInputRef.current?.click()}
                                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Subir Foto Limpia (Sin logo)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: DATOS COMERCIALES Y TÉCNICOS */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                          Información General y Especificaciones
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              Nombre Completo *
                            </label>
                            <input
                              type="text"
                              value={prod.name}
                              onChange={(e) => handleUpdateProduct(prod.id, { name: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              Nombre Corto
                            </label>
                            <input
                              type="text"
                              value={prod.shortName}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, { shortName: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              SKU
                            </label>
                            <input
                              type="text"
                              value={prod.sku}
                              onChange={(e) => handleUpdateProduct(prod.id, { sku: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#4C1EDB]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              Categoría
                            </label>
                            <input
                              type="text"
                              value={prod.category}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, { category: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              Medidas / Dimensiones (Tamaño)
                            </label>
                            <input
                              type="text"
                              value={prod.dimensions}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, { dimensions: e.target.value })
                              }
                              placeholder="Ej. 17 × 20 cm / 42 × 23 cm"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              Capacidad (si aplica)
                            </label>
                            <input
                              type="text"
                              value={prod.capacity || ''}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, { capacity: e.target.value })
                              }
                              placeholder="Ej. 520 ml / 750 ml / 12 oz"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              Material
                            </label>
                            <input
                              type="text"
                              value={prod.material}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, { material: e.target.value })
                              }
                              placeholder="Ej. Poliéster 210D / Aluminio"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              Pedido Mínimo (uds)
                            </label>
                            <input
                              type="number"
                              value={prod.minOrderQty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!Number.isNaN(val)) {
                                  handleUpdateProduct(prod.id, { minOrderQty: Math.max(1, val) });
                                }
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              Tagline / Frase Corta
                            </label>
                            <input
                              type="text"
                              value={prod.tagline}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, { tagline: e.target.value })
                              }
                              placeholder="Ej. Colores neón vibrantes · Incluye DTF UV"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                              Nota de Precio / Referencia
                            </label>
                            <input
                              type="text"
                              value={prod.priceNote || ''}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, { priceNote: e.target.value })
                              }
                              placeholder="Ej. Referencia BCV · Sin estampado"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                            Descripción Detallada
                          </label>
                          <textarea
                            rows={3}
                            value={prod.description}
                            onChange={(e) =>
                              handleUpdateProduct(prod.id, { description: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs resize-none"
                          />
                        </div>
                      </div>

                      {/* SECTION 3: ESCALA DE PRECIOS POR CANTIDAD */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                              Precios por Escala / Cantidad
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Define los precios unitarios en USD según el volumen solicitado.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddProductTier(prod.id)}
                            className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#4C1EDB] text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir Escala</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                          {prod.priceTiers.map((tier, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5 relative group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400">
                                  Escala #{idx + 1}
                                </span>
                                {prod.priceTiers.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProductTier(prod.id, idx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <label className="block text-[10px] font-bold text-slate-500">
                                Desde (uds)
                              </label>
                              <input
                                type="number"
                                value={tier.minQty}
                                onChange={(e) =>
                                  handleUpdateTierPrice(prod.id, idx, 'minQty', e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                              />

                              <label className="block text-[10px] font-bold text-slate-500">
                                Precio Unitario ($ USD)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={tier.unitPrice}
                                onChange={(e) =>
                                  handleUpdateTierPrice(prod.id, idx, 'unitPrice', e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-extrabold text-[#4C1EDB]"
                              />

                              <input
                                type="text"
                                value={tier.promoLabel || ''}
                                onChange={(e) =>
                                  handleUpdateTierPrice(prod.id, idx, 'promoLabel', e.target.value)
                                }
                                placeholder="Etiqueta promo (opcional)"
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10.5px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 4: COLORES Y STOCK DISPONIBLE */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                              Colores y Stock Disponible
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Añade colores, edita su tono, asigna stock y marca si están disponibles o agotados.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddProductColor(prod.id)}
                            className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#4C1EDB] text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir Color</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {prod.colors.map((c) => (
                            <div
                              key={c.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 relative"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={c.hex}
                                  onChange={(e) =>
                                    handleUpdateProductColor(prod.id, c.id, { hex: e.target.value })
                                  }
                                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white shrink-0"
                                />
                                <input
                                  type="text"
                                  value={c.name}
                                  onChange={(e) =>
                                    handleUpdateProductColor(prod.id, c.id, { name: e.target.value })
                                  }
                                  placeholder="Nombre del color"
                                  className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                                />
                                {prod.colors.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProductColor(prod.id, c.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400">Stock:</span>
                                  <input
                                    type="number"
                                    value={c.stock}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      if (!Number.isNaN(val)) {
                                        handleUpdateProductColor(prod.id, c.id, {
                                          stock: Math.max(0, val),
                                          available: val > 0 ? c.available : false,
                                        });
                                      }
                                    }}
                                    className="w-16 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-xs font-bold text-center"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateProductColor(prod.id, c.id, { available: !c.available })
                                  }
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold cursor-pointer transition-colors ${
                                    c.available && c.stock > 0
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {c.available && c.stock > 0 ? '✓ Disponible' : '✕ Agotado'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 5: MEDIDAS / VARIANTES SECUNDARIAS (SI TIENE O SE DESEA AGREGAR) */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                              Variantes Secundarias / Medidas / Tamaños
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Ideal para diferentes tamaños de bolsas ecológicas, capacidades o tipos de asa.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddProductSecondary(prod.id)}
                            className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#4C1EDB] text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir Medida / Variante</span>
                          </button>
                        </div>

                        {prod.secondaryOptions && prod.secondaryOptions.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {prod.secondaryOptions.map((opt) => (
                              <div
                                key={opt.id}
                                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <input
                                    type="text"
                                    value={opt.name}
                                    onChange={(e) =>
                                      handleUpdateProductSecondary(prod.id, opt.id, {
                                        name: e.target.value,
                                      })
                                    }
                                    className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProductSecondary(prod.id, opt.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400">Precio $:</span>
                                    <input
                                      type="number"
                                      step="0.05"
                                      value={opt.unitPriceOverride || ''}
                                      onChange={(e) => {
                                        const num = parseFloat(e.target.value);
                                        handleUpdateProductSecondary(prod.id, opt.id, {
                                          unitPriceOverride: Number.isNaN(num) ? undefined : num,
                                        });
                                      }}
                                      className="w-16 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-xs font-bold text-[#4C1EDB]"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateProductSecondary(prod.id, opt.id, {
                                        available: !opt.available,
                                      })
                                    }
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold cursor-pointer transition-colors ${
                                      opt.available
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}
                                  >
                                    {opt.available ? '✓ Disponible' : '✕ Agotado'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Este producto no tiene medidas secundarias asignadas.
                          </p>
                        )}
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar Producto del Catálogo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingProductId(null)}
                          className="px-5 py-2.5 rounded-xl bg-[#4C1EDB] hover:bg-[#3B15B5] text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Guardar y Volver a la Lista</span>
                        </button>
                      </div>
                    </div>
                  );
                })() : (
                  /* ================= IF BROWSING PRODUCTS LIST ================= */
                  <div className="space-y-4">
                    {/* GLOBAL INVENTORY SETTING: HIDE / SHOW OUT OF STOCK OPTIONS */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          {settings.hideOutOfStock ? (
                            <EyeOff className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-emerald-600" />
                          )}
                          <span>Visibilidad de Colores y Opciones Agotadas</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {settings.hideOutOfStock
                            ? 'Actualmente: Las opciones con stock 0 o no disponibles se OCULTAN totalmente al cliente.'
                            : 'Actualmente: Las opciones agotadas se MUESTRAN al cliente con aviso "Agotado" deshabilitadas.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSettings({ ...settings, hideOutOfStock: !settings.hideOutOfStock })
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          settings.hideOutOfStock
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        }`}
                      >
                        {settings.hideOutOfStock ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar Agotados (Activo)</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mostrar con Badge Agotado</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Persuasive Corporate Banner Settings */}
                    <div className="p-4 rounded-2xl bg-white border border-violet-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#4C1EDB] flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4" />
                          Mensaje Persuasivo Corporativo & Imagen Alusiva
                        </h3>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={promoBanner.enabled}
                            onChange={(e) =>
                              onUpdatePromoBanner({ ...promoBanner, enabled: e.target.checked })
                            }
                          />
                          Visible en tienda
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2 space-y-2.5">
                          <input
                            type="text"
                            value={promoBanner.headline}
                            onChange={(e) =>
                              onUpdatePromoBanner({ ...promoBanner, headline: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            value={promoBanner.body}
                            onChange={(e) =>
                              onUpdatePromoBanner({ ...promoBanner, body: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs resize-none"
                          />
                          <input
                            type="text"
                            value={promoBanner.ctaHint}
                            onChange={(e) =>
                              onUpdatePromoBanner({ ...promoBanner, ctaHint: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                            <img
                              src={promoBanner.imageUrl}
                              alt="Imagen alusiva"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => promoImgInputRef.current?.click()}
                            className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-violet-50 hover:text-[#4C1EDB] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Subir Imagen Alusiva</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product Search & Filter Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-white border border-slate-200">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Buscar por nombre o SKU..."
                          className="w-full text-xs outline-none bg-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-1 overflow-x-auto text-xs">
                        {['Todos', ...Array.from(new Set(products.map((p) => p.category)))].map(
                          (cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setProductCategoryFilter(cat)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                productCategoryFilter === cat
                                  ? 'bg-[#4C1EDB] text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {cat}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {products
                        .filter((p) => {
                          const matchesCat =
                            productCategoryFilter === 'Todos' || p.category === productCategoryFilter;
                          const matchesSearch =
                            !productSearch ||
                            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.sku.toLowerCase().includes(productSearch.toLowerCase());
                          return matchesCat && matchesSearch;
                        })
                        .map((prod) => {
                          const lowest = Math.min(...prod.priceTiers.map((t) => t.unitPrice));
                          const totalStock = prod.colors.reduce((sum, c) => sum + c.stock, 0);

                          return (
                            <div
                              key={prod.id}
                              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  {prod.cleanMockupUrl || prod.realImageUrl ? (
                                    <img
                                      src={prod.realImageUrl || prod.cleanMockupUrl}
                                      alt={prod.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 text-slate-400" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-bold text-[#4C1EDB] tracking-wider uppercase">
                                      {prod.sku}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                                      {prod.category}
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-extrabold text-slate-900 leading-snug mt-0.5 truncate">
                                    {prod.name}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 line-clamp-1">
                                    {prod.capacity ? `${prod.capacity} · ` : ''}
                                    {prod.dimensions}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                                    <span className="font-extrabold text-slate-900">
                                      Desde ${lowest.toFixed(2)}
                                    </span>
                                    <span className="text-slate-300">·</span>
                                    <span className="text-emerald-600 font-bold">
                                      {totalStock} disp.
                                    </span>
                                    <span className="text-slate-300">·</span>
                                    <span className="text-slate-500">
                                      {prod.colors.length} col.
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Badges for Photos */}
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold ${
                                    prod.realImageUrl
                                      ? 'bg-violet-50 text-[#4C1EDB]'
                                      : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  📷 Foto Vitrina {prod.realImageUrl ? '✓' : '✕'}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold ${
                                    prod.cleanMockupUrl
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  🧼 Base Limpia {prod.cleanMockupUrl ? '✓' : '✕'}
                                </span>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Eliminar producto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingProductId(prod.id)}
                                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-[#4C1EDB] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Editar Ficha Completa</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* QUICK ADD NEW PRODUCT & JSON SECTION */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          Crear Nuevo Producto Rápido / Importar JSON
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setJsonDraft(JSON.stringify(products, null, 2));
                            setShowJsonImport((v) => !v);
                          }}
                          className="text-xs font-bold text-[#4C1EDB] flex items-center gap-1 cursor-pointer"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>{showJsonImport ? 'Ocultar JSON' : 'Importar / Exportar JSON'}</span>
                        </button>
                      </div>

                      {!showJsonImport ? (
                        <form
                          onSubmit={handleQuickAddProduct}
                          className="grid grid-cols-1 sm:grid-cols-4 gap-2.5"
                        >
                          <input
                            required
                            value={prodName}
                            onChange={(e) => setProdName(e.target.value)}
                            placeholder="Nombre del producto"
                            className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <input
                            value={prodSku}
                            onChange={(e) => setProdSku(e.target.value)}
                            placeholder="SKU"
                            className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <select
                            value={prodShape}
                            onChange={(e) => setProdShape(e.target.value as ProductShape)}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                          >
                            <option value="photo-product">Foto Producto General (Tulas, Llaveros, etc.)</option>
                            <option value="circular-flex">Abanico Circular Flexible</option>
                            <option value="conventional-fan">Abanico Convencional</option>
                          </select>
                          <div className="flex gap-1.5">
                            <input
                              type="number"
                              step="0.05"
                              value={prodBasePrice}
                              onChange={(e) => setProdBasePrice(e.target.value)}
                              placeholder="$ Base"
                              className="w-20 px-2.5 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                            <button
                              type="submit"
                              className="flex-1 py-2 px-3 rounded-xl bg-[#0D0E12] hover:bg-[#4C1EDB] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Crear
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-2.5">
                          <textarea
                            rows={8}
                            value={jsonDraft}
                            onChange={(e) => setJsonDraft(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px]"
                          />
                          {jsonError && <p className="text-xs text-rose-600">{jsonError}</p>}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  const parsed = JSON.parse(jsonDraft);
                                  if (!Array.isArray(parsed) || !parsed.length) {
                                    setJsonError('Debe ser un arreglo JSON con al menos 1 producto.');
                                    return;
                                  }
                                  setJsonError(null);
                                  onUpdateProducts(parsed as Product[]);
                                  setShowJsonImport(false);
                                } catch {
                                  setJsonError('JSON inválido.');
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-[#4C1EDB] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" /> Aplicar Catálogo JSON
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const blob = new Blob([JSON.stringify(products, null, 2)], {
                                  type: 'application/json',
                                });
                                const u = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = u;
                                a.download = 'catalogo-colorio.json';
                                a.click();
                                URL.revokeObjectURL(u);
                              }}
                              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Descargar Plantilla
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: CUPONES */}
            {tab === 'coupons' && (
              <div className="space-y-4">
                <form
                  onSubmit={handleCreateCoupon}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end"
                >
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                      Código
                    </label>
                    <input
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      placeholder="COLORIO15"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                      Descripción
                    </label>
                    <input
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      placeholder="Promo corporativa"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                      Tipo & Valor
                    </label>
                    <div className="flex gap-1">
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as 'percent' | 'fixed')}
                        className="px-2 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold"
                      >
                        <option value="percent">%</option>
                        <option value="fixed">$</option>
                      </select>
                      <input
                        type="number"
                        value={newCouponVal}
                        onChange={(e) => setNewCouponVal(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                      Mínimo ($)
                    </label>
                    <input
                      type="number"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-2 px-3 rounded-xl bg-[#4C1EDB] hover:bg-[#3B15B5] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generar
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {coupons.map((cpn) => (
                    <div
                      key={cpn.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold font-mono text-[#4C1EDB]">
                            {cpn.code}
                          </span>
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            {cpn.type === 'percent' ? `-${cpn.value}%` : `-${formatCurrency(cpn.value)}`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{cpn.description}</p>
                        <p className="text-[10.5px] text-slate-400 mt-1">
                          Mínimo: {formatCurrency(cpn.minSubtotal)} · Usos: {cpn.uses}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateCoupons(
                              coupons.map((c) => (c.id === cpn.id ? { ...c, active: !c.active } : c))
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer ${
                            cpn.active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {cpn.active ? 'Activo' : 'Pausado'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateCoupons(coupons.filter((c) => c.id !== cpn.id))}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: CONFIGURACIÓN SUPERADMIN (WHATSAPP PRINCIPAL, 1% COMISIÓN SISTEMA, CAMBIO CLAVE) */}
            {tab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* WhatsApp Principal & System Commission */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#4C1EDB] flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    WhatsApp Principal y Comisión del Sistema
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono WhatsApp Principal (solo dígitos, ej. 584245252121)
                    </label>
                    <input
                      type="text"
                      value={settings.mainWhatsapp}
                      onChange={(e) => {
                        const digits = formatWhatsappDigits(e.target.value);
                        onUpdateSettings({
                          ...settings,
                          mainWhatsapp: digits,
                          mainWhatsappDisplay: digits.startsWith('58') && digits.length >= 12
                            ? `+58 0${digits.slice(2, 5)}-${digits.slice(5)}`
                            : `+${digits}`,
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:border-[#4C1EDB] outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Formato visible en tienda y ficha PNG: <strong>{settings.mainWhatsappDisplay}</strong>
                    </p>
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-50/70 border border-violet-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.landingEnabled !== false}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          landingEnabled: e.target.checked,
                        })
                      }
                      className="mt-0.5"
                    />
                    <span className="text-xs text-slate-800">
                      <strong>Activar Landing inicial `.colorío` por defecto (Opcional)</strong>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        Muestra el landing dinámico al entrar al dominio principal con CTA directo al
                        Catálogo POP. Los links rastreables de modelos y vendedores siempre entran
                        directo al catálogo sin pasos extra.
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.routeToSellerWhatsapp}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          routeToSellerWhatsapp: e.target.checked,
                        })
                      }
                      className="mt-0.5"
                    />
                    <span className="text-xs text-slate-700">
                      <strong>Enrutar al WhatsApp del vendedor asignado</strong>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        Si el cliente ingresa desde el link o código de un vendedor, enviar el pedido
                        al WhatsApp de ese vendedor en lugar del número principal.
                      </span>
                    </span>
                  </label>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        IVA (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={30}
                        value={settings.ivaPct}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            ivaPct: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Delivery Local ($)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min={0}
                        value={settings.shippingLocalCost}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            shippingLocalCost: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Envío Nacional ($)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min={0}
                        value={settings.shippingNationalCost}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            shippingNationalCost: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Internal Optional 1% Processing Fee */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.processingFeeEnabled}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            processingFeeEnabled: e.target.checked,
                          })
                        }
                        className="mt-0.5"
                      />
                      <span className="text-xs text-amber-950">
                        <strong>Comisión por procesamiento ({settings.processingFeePct}%) — Uso interno opcional</strong>
                        <span className="block text-[11px] text-amber-800/80 mt-0.5">
                          Actívalo si deseas sumar automáticamente {settings.processingFeePct}% de procesamiento al total del pedido.
                        </span>
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Comisión por venta para el sistema (% — People Creativa, C.A.)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        max={20}
                        value={settings.systemCommissionPct}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            systemCommissionPct: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-28 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-extrabold text-[#4C1EDB]"
                      />
                      <span className="text-xs font-semibold text-slate-500">
                        % interno sobre cada venta (por defecto: 1%)
                      </span>
                    </div>
                  </div>

                  {/* MÓDULO INDEPENDIENTE DE OPCIONES DE PAGO (Datos Bancarios / Link de Pago) */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#4C1EDB] flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        Opciones de Pago (Módulo Independiente)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Elige si al confirmar un pedido se muestran tus datos bancarios, un link de
                        pago directo (Pago Master), ambos o solo coordinación por WhatsApp.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                        Modo de pago visible al cliente
                      </label>
                      <select
                        value={settings.paymentDisplayMode || 'both'}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            paymentDisplayMode: e.target.value as PaymentDisplayMode,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-[#4C1EDB]"
                      >
                        <option value="both">Mostrar Datos de Pago + Link de Pago Directo</option>
                        <option value="data_only">Mostrar solo Datos de Pago (Pago Móvil / Zelle / Banco)</option>
                        <option value="link_only">Mostrar solo Link de Pago Directo (Pago Master)</option>
                        <option value="whatsapp_only">Solo coordinar pago por WhatsApp</option>
                      </select>
                    </div>

                    {/* Datos bancarios / Pago Móvil / Zelle / Binance */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <p className="text-[10.5px] font-extrabold uppercase text-slate-500">
                        Datos de Pago Directo (opcional)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={settings.paymentBankName || ''}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, paymentBankName: e.target.value })
                          }
                          placeholder="Banco (ej. Banesco / Mercantil)"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={settings.paymentPagoMovilPhone || ''}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, paymentPagoMovilPhone: e.target.value })
                          }
                          placeholder="Teléfono Pago Móvil"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={settings.paymentPagoMovilId || ''}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, paymentPagoMovilId: e.target.value })
                          }
                          placeholder="RIF / Cédula"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={settings.paymentZelleEmail || ''}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, paymentZelleEmail: e.target.value })
                          }
                          placeholder="Correo Zelle"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={settings.paymentZelleHolder || ''}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, paymentZelleHolder: e.target.value })
                          }
                          placeholder="Titular Zelle"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={settings.paymentBinanceId || ''}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, paymentBinanceId: e.target.value })
                          }
                          placeholder="Binance Pay ID (opcional)"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <input
                        type="text"
                        value={settings.paymentNotes || ''}
                        onChange={(e) =>
                          onUpdateSettings({ ...settings, paymentNotes: e.target.value })
                        }
                        placeholder="Nota visible (ej. Tasa BCV del día · Enviar comprobante)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>

                    {/* Link de Pago / Pasarela Pago Master */}
                    <div className="p-3 rounded-xl bg-violet-50/55 border border-violet-200/75 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-extrabold uppercase text-[#4C1EDB]">
                          Link de Pago Directo (Pago Master / Pasarela)
                        </span>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.pagoMasterEnabled}
                            onChange={(e) =>
                              onUpdateSettings({
                                ...settings,
                                pagoMasterEnabled: e.target.checked,
                              })
                            }
                          />
                          Activo
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="url"
                          value={settings.pagoMasterBaseUrl}
                          onChange={(e) =>
                            onUpdateSettings({
                              ...settings,
                              pagoMasterBaseUrl: e.target.value,
                            })
                          }
                          placeholder="URL Base / API Link de Pago"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                        />
                        <input
                          type="text"
                          value={settings.pagoMasterMerchantId}
                          onChange={(e) =>
                            onUpdateSettings({
                              ...settings,
                              pagoMasterMerchantId: e.target.value,
                            })
                          }
                          placeholder="Merchant ID / Comercio"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Superadmin Password */}
                <form
                  onSubmit={handleChangeSuperPassword}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4"
                >
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#4C1EDB]" />
                    Seguridad de Superadministrador
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cuenta Superadministrador
                    </label>
                    <input
                      type="email"
                      value={settings.superAdminEmail}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, superAdminEmail: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Clave actual
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder={settings.isDefaultPassword ? 'Clave temporal: 1234' : 'Clave actual'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nueva clave
                      </label>
                      <input
                        type="password"
                        required
                        value={nextPw}
                        onChange={(e) => setNextPw(e.target.value)}
                        placeholder="Mín. 4 caracteres"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirmar nueva clave
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        placeholder="Repite la clave"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  {pwFeedback && (
                    <p
                      className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 ${
                        pwFeedback.ok
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {pwFeedback.msg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#0D0E12] hover:bg-[#4C1EDB] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Guardar Nueva Clave de Superadministrador
                  </button>
                </form>

                {/* Espacio para Cargar el Logo Original de la Marca (.colorío) */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#4C1EDB]" />
                        Logo Original de la Marca (.colorío)
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sube tu logotipo oficial en PNG transparente o SVG cuando lo tengas listo.
                        Se actualizará automáticamente en el encabezado, lienzo y ficha de
                        aprobación PNG.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Logo para fondo claro */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Logo Fondo Claro (Principal)
                        </span>
                        {settings.brandLogoLightUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSettings({ ...settings, brandLogoLightUrl: '' })
                            }
                            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            Restaurar vector
                          </button>
                        )}
                      </div>
                      <div className="h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center px-4">
                        <ColorioLogo
                          theme="light"
                          customLogoUrl={settings.brandLogoLightUrl || undefined}
                          className="h-9 w-auto max-w-full"
                        />
                      </div>
                      <input
                        ref={brandLogoLightInputRef}
                        type="file"
                        accept=".svg,.png,.webp,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadBrandLogo(f, 'light');
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => brandLogoLightInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#0D0E12] hover:bg-[#4C1EDB] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {settings.brandLogoLightUrl
                            ? 'Cambiar Logo Fondo Claro'
                            : 'Cargar Logo Original (PNG / SVG)'}
                        </span>
                      </button>
                    </div>

                    {/* Logo para fondo oscuro */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          Logo Fondo Oscuro (Opcional)
                        </span>
                        {settings.brandLogoDarkUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSettings({ ...settings, brandLogoDarkUrl: '' })
                            }
                            className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
                          >
                            Restaurar vector
                          </button>
                        )}
                      </div>
                      <div className="h-16 rounded-xl bg-[#111318] border border-white/10 flex items-center justify-center px-4">
                        <ColorioLogo
                          theme="dark"
                          customLogoUrl={
                            settings.brandLogoDarkUrl || settings.brandLogoLightUrl || undefined
                          }
                          className="h-9 w-auto max-w-full"
                        />
                      </div>
                      <input
                        ref={brandLogoDarkInputRef}
                        type="file"
                        accept=".svg,.png,.webp,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadBrandLogo(f, 'dark');
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => brandLogoDarkInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {settings.brandLogoDarkUrl
                            ? 'Cambiar Logo Fondo Oscuro'
                            : 'Cargar Versión Blanca / Oscuro'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

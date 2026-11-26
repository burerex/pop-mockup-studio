import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Package,
  Palette,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react';
import {
  CartItem,
  Coupon,
  DesignApprovalStatus,
  InkMode,
  LogoAsset,
  LogoTransform,
  OrderRecord,
  PrintCoverage,
  PrintTechniqueId,
  Product,
  PromoBannerConfig,
  ReferralCode,
  Seller,
  ShippingOptionId,
  StudioViewMode,
  SystemSettings,
  TrackChannel,
  TrackedLink,
} from './types';
import {
  DEMO_LOGOS,
  INITIAL_PRODUCTS,
  formatCurrency,
  getInkLabel,
  getLuminance,
  getUnitPrice,
} from './data/products';
import {
  DEFAULT_PROMO_BANNER,
  DEFAULT_SYSTEM_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_REFERRALS,
  INITIAL_SELLERS,
  INITIAL_TRACKED_LINKS,
  loadInitialProducts,
  loadStored,
  saveStored,
} from './data/storeDefaults';
import { processLogoForInk, readFileAsLogoAsset } from './utils/logoProcessor';
import {
  buildShareableUrl,
  buildWhatsAppSummary,
  generateApprovalCardPng,
  renderSvgElementToPng,
} from './utils/exportApprovalCard';
import { detectDeviceType, generateTrackId } from './utils/linkTracker';
import {
  createCloudOrder,
  fetchCloudStore,
  saveCloudState,
  seedCloudStore,
  syncCloudOrders,
  trackCloudLinkEvent,
} from './utils/cloudSync';
import { LeftCatalogPanel } from './components/LeftCatalogPanel';
import { MockupCanvas } from './components/MockupCanvas';
import { RightInspectorPanel } from './components/RightInspectorPanel';
import { CartDrawer } from './components/CartDrawer';
import { ShareModal } from './components/ShareModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ColorioLogo } from './components/ColorioLogo';
import { Footer2026 } from './components/Footer2026';
import { ColorioLanding } from './components/ColorioLanding';

function getInitialUrlParams() {
  const sp = new URLSearchParams(window.location.search);
  const pathClean = window.location.pathname.replace(/\/+$/, '');
  const hasTrackOrModelLink = Boolean(
    pathClean === '/catalogo' ||
      sp.get('p') ||
      sp.get('c') ||
      sp.get('trk') ||
      sp.get('ref') ||
      sp.get('rc') ||
      sp.get('admin') === '1' ||
      sp.get('view') === 'studio' ||
      sp.get('view') === 'catalogo'
  );
  return {
    productId: sp.get('p') || INITIAL_PRODUCTS[0].id,
    colorId: sp.get('c') || '',
    secondaryId: sp.get('s') || '',
    techniqueId: (sp.get('t') as PrintTechniqueId) || 'vinil-plano',
    inkMode: (sp.get('i') as InkMode) || 'white',
    customInkHex: sp.get('ci') || '#D4AF37',
    printCoverage: (sp.get('cov') as PrintCoverage) || 'centered',
    pouchPrint: sp.get('fp') !== '0',
    quantity: Number(sp.get('q')) || INITIAL_PRODUCTS[0].minOrderQty,
    sellerRef: (sp.get('ref') || '').toUpperCase(),
    referralCode: (sp.get('rc') || '').toUpperCase(),
    incomingTrackId: (sp.get('trk') || '').toUpperCase(),
    openAdmin: sp.get('admin') === '1',
    hasTrackOrModelLink,
    forceLanding: pathClean === '/landing' || sp.get('view') === 'landing',
    x: Number(sp.get('x')) || 0,
    y: Number(sp.get('y')) || 0,
    scale: Number(sp.get('sc')) || 0.94,
    rotation: Number(sp.get('r')) || 0,
  };
}

export function App() {
  const urlInit = useMemo(() => getInitialUrlParams(), []);
  const [sessionTrackId] = useState<string>(
    () => urlInit.incomingTrackId || generateTrackId()
  );

  // Persisted Store & Superadmin State
  const [products, setProducts] = useState<Product[]>(() => loadInitialProducts());
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadStored('coupons', INITIAL_COUPONS)
  );
  const [sellers, setSellers] = useState<Seller[]>(() =>
    loadStored('sellers', INITIAL_SELLERS)
  );
  const [referrals, setReferrals] = useState<ReferralCode[]>(() =>
    loadStored('referrals', INITIAL_REFERRALS)
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    loadStored('orders', INITIAL_ORDERS)
  );
  const [promoBanner, setPromoBanner] = useState<PromoBannerConfig>(() =>
    loadStored('promo', DEFAULT_PROMO_BANNER)
  );
  const [settings, setSettings] = useState<SystemSettings>(() =>
    loadStored('settings', DEFAULT_SYSTEM_SETTINGS)
  );
  const [trackedLinks, setTrackedLinks] = useState<TrackedLink[]>(() =>
    loadStored('links', INITIAL_TRACKED_LINKS)
  );
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  useEffect(() => saveStored('products', products), [products]);
  useEffect(() => saveStored('coupons', coupons), [coupons]);
  useEffect(() => saveStored('sellers', sellers), [sellers]);
  useEffect(() => saveStored('referrals', referrals), [referrals]);
  useEffect(() => saveStored('orders', orders), [orders]);
  useEffect(() => saveStored('promo', promoBanner), [promoBanner]);
  useEffect(() => saveStored('settings', settings), [settings]);
  useEffect(() => saveStored('links', trackedLinks), [trackedLinks]);

  // Hydrate shared state from Neon Postgres via /api/store (gracefully falls back to localStorage)
  const refreshFromCloud = async (seedIfEmpty = false) => {
    const snap = await fetchCloudStore();
    if (!snap.connected) return;
    setDbConnected(true);

    const hasRemoteState = Boolean(snap.state && Object.keys(snap.state).length > 0);
    if (!hasRemoteState && seedIfEmpty) {
      await seedCloudStore({
        seed: {
          products: INITIAL_PRODUCTS,
          coupons: INITIAL_COUPONS,
          sellers: INITIAL_SELLERS,
          referrals: INITIAL_REFERRALS,
          promo: DEFAULT_PROMO_BANNER,
          settings: DEFAULT_SYSTEM_SETTINGS,
        },
        seedOrders: INITIAL_ORDERS,
        seedLinks: INITIAL_TRACKED_LINKS,
      });
      return;
    }

    if (snap.state?.products?.length) setProducts(snap.state.products);
    if (snap.state?.coupons) setCoupons(snap.state.coupons);
    if (snap.state?.sellers) setSellers(snap.state.sellers);
    if (snap.state?.referrals) setReferrals(snap.state.referrals);
    if (snap.state?.promo) setPromoBanner(snap.state.promo);
    if (snap.state?.settings) {
      setSettings((prev) => ({ ...DEFAULT_SYSTEM_SETTINGS, ...prev, ...snap.state!.settings }));
    }
    if (snap.orders && snap.orders.length > 0) setOrders(snap.orders);
    if (snap.trackedLinks && snap.trackedLinks.length > 0) setTrackedLinks(snap.trackedLinks);
  };

  useEffect(() => {
    refreshFromCloud(true);
  }, []);

  // Track link opens automatically on initial page load when arriving via ?trk=, ?ref=, or ?rc=
  const openLoggedRef = useRef(false);
  useEffect(() => {
    if (openLoggedRef.current) return;
    if (!urlInit.incomingTrackId && !urlInit.sellerRef && !urlInit.referralCode) return;
    openLoggedRef.current = true;

    const device = detectDeviceType();
    const now = Date.now();
    const tid = urlInit.incomingTrackId || `REF-${urlInit.sellerRef || urlInit.referralCode}`;

    setTrackedLinks((prev) => {
      const exists = prev.find((l) => l.id === tid);
      if (exists) {
        return prev.map((l) =>
          l.id === tid
            ? { ...l, opens: l.opens + 1, lastOpenedAt: now, lastDevice: device }
            : l
        );
      }
      const pMatch = products.find((p) => p.id === urlInit.productId) || products[0];
      const cMatch = pMatch.colors.find((c) => c.id === urlInit.colorId);
      const newEntry: TrackedLink = {
        id: tid,
        url: window.location.href,
        label: `${pMatch.shortName}${cMatch ? ` · ${cMatch.name}` : ''}`,
        productName: pMatch.name,
        colorName: cMatch?.name,
        sellerCode: urlInit.sellerRef || undefined,
        referralCode: urlInit.referralCode || undefined,
        channel: urlInit.referralCode
          ? 'referral-link'
          : urlInit.sellerRef
            ? 'seller-link'
            : 'direct',
        createdAt: now,
        shares: 1,
        opens: 1,
        conversions: 0,
        lastOpenedAt: now,
        lastDevice: device,
      };
      return [newEntry, ...prev];
    });

    const pMatch = products.find((p) => p.id === urlInit.productId) || products[0];
    const cMatch = pMatch.colors.find((c) => c.id === urlInit.colorId);
    trackCloudLinkEvent('open', {
      id: tid,
      url: window.location.href,
      label: `${pMatch.shortName}${cMatch ? ` · ${cMatch.name}` : ''}`,
      productName: pMatch.name,
      colorName: cMatch?.name,
      sellerCode: urlInit.sellerRef || undefined,
      referralCode: urlInit.referralCode || undefined,
      channel: urlInit.referralCode
        ? 'referral-link'
        : urlInit.sellerRef
          ? 'seller-link'
          : 'direct',
      lastDevice: device,
    });
  }, []);

  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    const exists = products.some((p) => p.id === urlInit.productId);
    return exists ? urlInit.productId : products[0].id;
  });

  const activeProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  const [selectedColorId, setSelectedColorId] = useState<string>(() => {
    if (urlInit.colorId) return urlInit.colorId;
    return products[0].colors[0].id;
  });

  const activeColor = useMemo(() => {
    const found = activeProduct.colors.find(
      (c) => c.id === selectedColorId && c.available && c.stock > 0
    );
    return (
      found ||
      activeProduct.colors.find((c) => c.available && c.stock > 0) ||
      activeProduct.colors[0]
    );
  }, [activeProduct, selectedColorId]);

  const [selectedSecondaryId, setSelectedSecondaryId] = useState<string>(
    () => urlInit.secondaryId || activeProduct.secondaryOptions?.[0]?.id || ''
  );

  const activeSecondary = useMemo(() => {
    if (!activeProduct.secondaryOptions?.length) return undefined;
    return (
      activeProduct.secondaryOptions.find((s) => s.id === selectedSecondaryId) ||
      activeProduct.secondaryOptions[0]
    );
  }, [activeProduct, selectedSecondaryId]);

  const [logo, setLogo] = useState<LogoAsset>(DEMO_LOGOS[0]);
  const [techniqueId, setTechniqueId] = useState<PrintTechniqueId>(urlInit.techniqueId);
  const [inkMode, setInkMode] = useState<InkMode>(urlInit.inkMode);
  const [customInkHex, setCustomInkHex] = useState<string>(urlInit.customInkHex);
  const [printCoverage, setPrintCoverage] = useState<PrintCoverage>(urlInit.printCoverage);
  const [pouchPrint, setPouchPrint] = useState<boolean>(urlInit.pouchPrint);
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | null>(
    DEMO_LOGOS[0].originalUrl
  );
  const [whiteLogoUrl, setWhiteLogoUrl] = useState<string | null>(null);
  const [blackLogoUrl, setBlackLogoUrl] = useState<string | null>(null);

  const [logoTransform, setLogoTransform] = useState<LogoTransform>({
    x: urlInit.x,
    y: urlInit.y,
    scale: urlInit.scale,
    rotation: urlInit.rotation,
    opacity: 0.96,
  });

  const [viewMode, setViewMode] = useState<StudioViewMode>('presentation');
  const [pageMode, setPageMode] = useState<'studio' | 'landing'>(() => {
    // Trackable links, seller/referral links, or direct product links ALWAYS land directly in Catálogo POP
    if (urlInit.hasTrackOrModelLink && !urlInit.forceLanding) return 'studio';
    if (urlInit.forceLanding) return 'landing';
    return settings.landingEnabled !== false ? 'landing' : 'studio';
  });

  useEffect(() => {
    if (settings.landingEnabled === false && !urlInit.forceLanding && pageMode === 'landing') {
      setPageMode('studio');
    }
  }, [settings.landingEnabled, urlInit.forceLanding, pageMode]);
  const [designStatus, setDesignStatus] = useState<DesignApprovalStatus>('aprobado');
  const [mobileTab, setMobileTab] = useState<'customize' | 'catalog'>('customize');
  const [quantity, setQuantity] = useState<number>(() =>
    Math.max(activeProduct.minOrderQty, urlInit.quantity || 100)
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartInitialStep, setCartInitialStep] = useState<'cart' | 'checkout'>('cart');
  const [shareOpen, setShareOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(urlInit.openAdmin);
  const [approvalCardUrl, setApprovalCardUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const mockupSvgRef = useRef<SVGSVGElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      processLogoForInk(logo, 'white', customInkHex),
      processLogoForInk(logo, 'black', customInkHex),
    ])
      .then(([wUrl, bUrl]) => {
        if (!cancelled) {
          setWhiteLogoUrl(wUrl);
          setBlackLogoUrl(bUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWhiteLogoUrl(logo.originalUrl);
          setBlackLogoUrl(logo.originalUrl);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [logo, customInkHex]);

  useEffect(() => {
    let cancelled = false;
    processLogoForInk(logo, inkMode, customInkHex)
      .then((url) => {
        if (!cancelled) setProcessedLogoUrl(url);
      })
      .catch(() => {
        if (!cancelled) setProcessedLogoUrl(logo.originalUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [logo, inkMode, customInkHex]);

  useEffect(() => {
    setQuantity((prev) => {
      const min = activeProduct.minOrderQty;
      const max = activeColor.stock || min;
      return Math.min(max, Math.max(min, prev));
    });
  }, [activeProduct.minOrderQty, activeColor.stock]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const nextProd = products.find((p) => p.id === productId);
    if (!nextProd) return;
    const firstAvail = nextProd.colors.find((c) => c.available && c.stock > 0);
    if (firstAvail) {
      setSelectedColorId(firstAvail.id);
      if (getLuminance(firstAvail.hex) > 0.55 && inkMode === 'white') {
        setInkMode(nextProd.supportsFullBleed ? 'full' : 'black');
      } else if (getLuminance(firstAvail.hex) <= 0.55 && inkMode === 'black') {
        setInkMode('white');
      }
    }
    if (nextProd.secondaryOptions?.length) {
      setSelectedSecondaryId(nextProd.secondaryOptions[0].id);
    }
    if (!nextProd.supportsFullBleed) {
      setPrintCoverage('centered');
    }
    setLogoTransform((t) => ({ ...t, x: 0, y: 0, rotation: 0, scale: 0.94 }));
  };

  const handleSelectColor = (colorId: string) => {
    setSelectedColorId(colorId);
    const chosen = activeProduct.colors.find((c) => c.id === colorId);
    if (!chosen) return;
    const lum = getLuminance(chosen.hex);
    if (inkMode === 'white' && lum > 0.52) {
      setInkMode('black');
    } else if (inkMode === 'black' && lum <= 0.52) {
      setInkMode('white');
    }
  };

  const handleChangeTechnique = (nextTech: PrintTechniqueId) => {
    setTechniqueId(nextTech);
    if (nextTech === 'full-color') {
      setInkMode('full');
    } else if (nextTech === 'material-premium' && inkMode === 'full') {
      setInkMode('custom');
      setCustomInkHex('#D4AF37');
    } else if (nextTech === 'vinil-plano' && inkMode === 'full') {
      setInkMode(getLuminance(activeColor.hex) > 0.52 ? 'black' : 'white');
    }
  };

  const handleUploadFile = async (file: File) => {
    try {
      const asset = await readFileAsLogoAsset(file);
      setLogo(asset);
      setLogoTransform({ x: 0, y: 0, scale: 0.94, rotation: 0, opacity: 0.96 });
      showToast(
        asset.isVector ? `Vector cargado: ${asset.name}` : `Logo cargado: ${asset.name}`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo cargar el archivo.');
    }
  };

  const handleSelectDemoLogo = (demo: LogoAsset) => {
    setLogo(demo);
    setLogoTransform({ x: 0, y: 0, scale: 0.94, rotation: 0, opacity: 0.96 });
    if (demo.id === 'demo-tropical-full') {
      setInkMode('full');
      setTechniqueId('full-color');
      if (activeProduct.supportsFullBleed) {
        setPrintCoverage('full-bleed');
      }
    }
  };

  const shareUrl = buildShareableUrl({
    productId: activeProduct.id,
    colorId: activeColor.id,
    secondaryId: activeSecondary?.id,
    techniqueId,
    inkMode,
    customInkHex,
    printCoverage,
    pouchPrint,
    quantity,
    sellerCode: urlInit.sellerRef || undefined,
    referralCode: urlInit.referralCode || undefined,
    trackId: sessionTrackId,
    transform: logoTransform,
  });

  const registerTrackedLink = (params: {
    trackId: string;
    url: string;
    label: string;
    productName: string;
    colorName?: string;
    sellerCode?: string;
    referralCode?: string;
    channel: TrackChannel;
  }) => {
    setTrackedLinks((prev) => {
      const existing = prev.find((l) => l.id === params.trackId);
      if (existing) {
        return prev.map((l) =>
          l.id === params.trackId
            ? { ...l, url: params.url, shares: l.shares + 1, channel: params.channel }
            : l
        );
      }
      const next: TrackedLink = {
        id: params.trackId,
        url: params.url,
        label: params.label,
        productName: params.productName,
        colorName: params.colorName,
        sellerCode: params.sellerCode,
        referralCode: params.referralCode,
        channel: params.channel,
        createdAt: Date.now(),
        shares: 1,
        opens: 0,
        conversions: 0,
      };
      return [next, ...prev];
    });
    trackCloudLinkEvent('share', {
      id: params.trackId,
      url: params.url,
      label: params.label,
      productName: params.productName,
      colorName: params.colorName,
      sellerCode: params.sellerCode,
      referralCode: params.referralCode,
      channel: params.channel,
      lastDevice: detectDeviceType(),
    });
  };

  const handleTrackShare = (channel: TrackChannel) => {
    registerTrackedLink({
      trackId: sessionTrackId,
      url: shareUrl,
      label: `${activeProduct.shortName} · ${activeColor.name}`,
      productName: activeProduct.name,
      colorName: activeColor.name,
      sellerCode: urlInit.sellerRef || undefined,
      referralCode: urlInit.referralCode || undefined,
      channel,
    });
  };

  const buildCurrentCartItem = async (): Promise<CartItem> => {
    let previewDataUrl = '';
    if (mockupSvgRef.current) {
      try {
        previewDataUrl = await renderSvgElementToPng(mockupSvgRef.current, 360);
      } catch {
        previewDataUrl = '';
      }
    }

    const effectivePouch = Boolean(activeProduct.hasPouch && pouchPrint);
    const effectiveCoverage: PrintCoverage = activeProduct.supportsFullBleed
      ? printCoverage
      : 'centered';
    const unitPrice = getUnitPrice(
      activeProduct,
      quantity,
      inkMode,
      effectivePouch,
      effectiveCoverage,
      techniqueId,
      activeSecondary
    );
    const subtotal = Number((quantity * unitPrice).toFixed(2));

    return {
      id: `item-${Date.now()}`,
      productId: activeProduct.id,
      productName: activeProduct.name,
      sku: activeProduct.sku,
      color: activeColor,
      secondaryOption: activeSecondary,
      techniqueId,
      inkMode,
      customInkHex,
      printCoverage: effectiveCoverage,
      pouchPrint: effectivePouch,
      logoName: logo.name,
      logoIsVector: logo.isVector,
      quantity,
      unitPrice,
      subtotal,
      previewDataUrl,
      modelUrl: shareUrl,
      createdAt: Date.now(),
    };
  };

  const [showMultiProductModal, setShowMultiProductModal] = useState(false);

  const handleAddToCart = async () => {
    const newItem = await buildCurrentCartItem();
    setCart((prev) => [newItem, ...prev]);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
    showToast(`${quantity}× ${activeProduct.shortName} (${activeColor.name}) agregado`);
  };

  const handleAddAndConfigureAnother = async () => {
    const newItem = await buildCurrentCartItem();
    setCart((prev) => [newItem, ...prev]);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
    showToast(`✓ ${activeProduct.shortName} añadido a tu pedido`);
    setShowMultiProductModal(true);
  };

  const handleDuplicateCartItem = (item: CartItem) => {
    const copy: CartItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    setCart((prev) => [copy, ...prev]);
    showToast(`✓ Duplicado: ${item.productName}`);
  };

  const handleFocusCatalogForNewProduct = () => {
    setCartOpen(false);
    showToast('Selecciona el siguiente producto para tu pedido');
    setMobileTab('catalog');
    const panel = document.getElementById('catalog-selector-panel');
    panel?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickOrderNow = async () => {
    const newItem = await buildCurrentCartItem();
    setCart((prev) => [newItem, ...prev]);
    setCartInitialStep('checkout');
    setCartOpen(true);
  };

  const handleUpdateCartItemQty = (itemId: string, nextQty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const prod = products.find((p) => p.id === item.productId);
        const unitPrice = prod
          ? getUnitPrice(
              prod,
              nextQty,
              item.inkMode,
              item.pouchPrint,
              item.printCoverage,
              item.techniqueId,
              item.secondaryOption
            )
          : item.unitPrice;
        return {
          ...item,
          quantity: nextQty,
          unitPrice,
          subtotal: Number((nextQty * unitPrice).toFixed(2)),
        };
      })
    );
  };

  const handlePlaceOrder = (payload: {
    customerName: string;
    company: string;
    phone: string;
    city: string;
    eventDate?: string;
    notes?: string;
    designStatus: DesignApprovalStatus;
    sellerCode?: string;
    referralCode?: string;
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
  }): OrderRecord => {
    const matchedSeller = sellers.find(
      (s) => s.code.toUpperCase() === (payload.sellerCode || '').toUpperCase()
    );
    const matchedReferral = referrals.find(
      (r) => r.code.toUpperCase() === (payload.referralCode || '').toUpperCase()
    );

    const sellerPct = matchedSeller ? matchedSeller.commissionPct : 0;
    const referralPct = matchedReferral ? matchedReferral.commissionPct : 0;
    const systemPct = settings.systemCommissionPct;

    const sellerCommissionUsd = Number(((payload.totalUsd * sellerPct) / 100).toFixed(2));
    const referralCommissionUsd = Number(((payload.totalUsd * referralPct) / 100).toFixed(2));
    const systemCommissionUsd = Number(((payload.totalUsd * systemPct) / 100).toFixed(2));

    const folio = `COL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const autoPagoMasterLink =
      payload.designStatus === 'aprobado' && settings.pagoMasterEnabled && settings.pagoMasterBaseUrl
        ? `${settings.pagoMasterBaseUrl.replace(/\/+$/, '')}/${folio}?amount=${payload.totalUsd.toFixed(2)}&merchant=${encodeURIComponent(settings.pagoMasterMerchantId || 'COLORIO')}`
        : undefined;

    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      folio,
      createdAt: Date.now(),
      status: 'pendiente',
      designStatus: payload.designStatus,
      paymentStatus: autoPagoMasterLink ? 'link_enviado' : 'pendiente',
      pagoMasterLink: autoPagoMasterLink,
      customerName: payload.customerName,
      company: payload.company,
      phone: payload.phone,
      city: payload.city,
      eventDate: payload.eventDate,
      notes: payload.notes,
      sellerCode: matchedSeller?.code || payload.sellerCode,
      sellerName: matchedSeller?.name,
      referralCode: matchedReferral?.code || payload.referralCode,
      referralOwner: matchedReferral?.ownerName,
      trackedLinkId: sessionTrackId,
      couponCode: payload.couponCode,
      discountAmount: payload.discountAmount,
      subtotalBeforeDiscount: payload.subtotalBeforeDiscount,
      ivaPct: payload.ivaPct,
      ivaAmount: payload.ivaAmount,
      shippingOption: payload.shippingOption,
      shippingLabel: payload.shippingLabel,
      shippingCost: payload.shippingCost,
      processingFeePct: payload.processingFeePct,
      processingFeeAmount: payload.processingFeeAmount,
      totalUsd: payload.totalUsd,
      sellerCommissionPct: sellerPct,
      sellerCommissionUsd,
      referralCommissionPct: referralPct,
      referralCommissionUsd,
      systemCommissionPct: systemPct,
      systemCommissionUsd,
      totalUnits: cart.reduce((s, i) => s + i.quantity, 0),
      itemsSummary: cart.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        colorId: it.color.id,
        colorName: it.color.name,
        techniqueId: it.techniqueId,
        inkLabel: getInkLabel(it.inkMode, it.customInkHex),
        pouchPrint: it.pouchPrint,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        subtotal: it.subtotal,
        modelUrl: it.modelUrl,
      })),
    };

    setOrders((prev) => [newOrder, ...prev]);
    createCloudOrder(newOrder);

    // Track link conversion
    setTrackedLinks((prev) => {
      const exists = prev.find((l) => l.id === sessionTrackId);
      if (exists) {
        return prev.map((l) =>
          l.id === sessionTrackId ? { ...l, conversions: l.conversions + 1 } : l
        );
      }
      return [
        {
          id: sessionTrackId,
          url: shareUrl,
          label: `Pedido #${folio} · ${activeProduct.shortName}`,
          productName: activeProduct.name,
          colorName: activeColor.name,
          sellerCode: newOrder.sellerCode,
          referralCode: newOrder.referralCode,
          channel: 'whatsapp',
          createdAt: Date.now(),
          shares: 1,
          opens: 1,
          conversions: 1,
          lastOpenedAt: Date.now(),
          lastDevice: detectDeviceType(),
        },
        ...prev,
      ];
    });
    trackCloudLinkEvent('convert', {
      id: sessionTrackId,
      url: shareUrl,
      label: `Pedido #${folio} · ${activeProduct.shortName}`,
      productName: activeProduct.name,
      colorName: activeColor.name,
      sellerCode: newOrder.sellerCode,
      referralCode: newOrder.referralCode,
      channel: 'whatsapp',
      lastDevice: detectDeviceType(),
    });

    // Decrement stock automatically & persist to cloud
    setProducts((prev) => {
      const updated = prev.map((prod) => {
        const orderedForProd = cart.filter((ci) => ci.productId === prod.id);
        if (!orderedForProd.length) return prod;
        return {
          ...prod,
          colors: prod.colors.map((c) => {
            const qtyUsed = orderedForProd
              .filter((ci) => ci.color.id === c.id)
              .reduce((sum, ci) => sum + ci.quantity, 0);
            if (!qtyUsed) return c;
            const remaining = Math.max(0, c.stock - qtyUsed);
            return { ...c, stock: remaining, available: remaining > 0 };
          }),
        };
      });
      saveCloudState('products', updated);
      return updated;
    });

    if (payload.couponCode) {
      setCoupons((prev) => {
        const updated = prev.map((cpn) =>
          cpn.code.toUpperCase() === payload.couponCode?.toUpperCase()
            ? { ...cpn, uses: cpn.uses + 1 }
            : cpn
        );
        saveCloudState('coupons', updated);
        return updated;
      });
    }

    showToast(`Pedido #${folio} registrado`);
    return newOrder;
  };

  const handleDownloadApproval = async () => {
    if (!mockupSvgRef.current) return;
    setIsExporting(true);
    try {
      const pngUrl = await generateApprovalCardPng({
        svgEl: mockupSvgRef.current,
        product: activeProduct,
        color: activeColor,
        secondaryOption: activeSecondary,
        techniqueId,
        inkMode,
        customInkHex,
        printCoverage,
        pouchPrint: Boolean(activeProduct.hasPouch && pouchPrint),
        logoName: logo.name,
        logoIsVector: logo.isVector,
        quantity,
        modelUrl: shareUrl,
        ivaPct: settings.ivaPct,
        whatsappDisplay: settings.mainWhatsappDisplay,
        designStatus,
        brandLogoUrl: settings.brandLogoLightUrl || undefined,
      });
      const link = document.createElement('a');
      link.download = `colorio-${activeProduct.sku.toLowerCase()}-${activeColor.id}.png`;
      link.href = pngUrl;
      link.click();
      showToast('Ficha de aprobación PNG descargada');
    } catch {
      showToast('No se pudo exportar la imagen.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenShare = async () => {
    setShareOpen(true);
    setApprovalCardUrl(null);
    if (!mockupSvgRef.current) return;
    try {
      const pngUrl = await generateApprovalCardPng({
        svgEl: mockupSvgRef.current,
        product: activeProduct,
        color: activeColor,
        secondaryOption: activeSecondary,
        techniqueId,
        inkMode,
        customInkHex,
        printCoverage,
        pouchPrint: Boolean(activeProduct.hasPouch && pouchPrint),
        logoName: logo.name,
        logoIsVector: logo.isVector,
        quantity,
        modelUrl: shareUrl,
        ivaPct: settings.ivaPct,
        whatsappDisplay: settings.mainWhatsappDisplay,
        designStatus,
        brandLogoUrl: settings.brandLogoLightUrl || undefined,
      });
      setApprovalCardUrl(pngUrl);
    } catch {
      setApprovalCardUrl(null);
    }
  };

  const whatsAppText = buildWhatsAppSummary({
    product: activeProduct,
    color: activeColor,
    secondaryOption: activeSecondary,
    techniqueId,
    inkMode,
    customInkHex,
    printCoverage,
    pouchPrint: Boolean(activeProduct.hasPouch && pouchPrint),
    logoName: logo.name,
    quantity,
    ivaPct: settings.ivaPct,
    sellerCode: urlInit.sellerRef || undefined,
    shareUrl,
  });

  const cartCount = cart.length;
  const cartSubtotal = cart.reduce((sum, it) => sum + it.subtotal, 0);
  const cartTotal = Number((cartSubtotal * (1 + settings.ivaPct / 100)).toFixed(2));

  const switchToLanding = () => {
    setPageMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchToStudio = (productId?: string, colorId?: string) => {
    if (productId) handleSelectProduct(productId);
    if (colorId) handleSelectColor(colorId);
    setPageMode('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (pageMode === 'landing') {
    return (
      <>
        <ColorioLanding
          products={products}
          settings={settings}
          onOpenStudio={switchToStudio}
          onOpenAdmin={() => {
            setAdminOpen(true);
            refreshFromCloud(false);
          }}
        />
        <AdminDashboardModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          dbConnected={dbConnected}
          products={products}
          onUpdateProducts={(next) => {
            setProducts(next);
            saveCloudState('products', next);
            if (!next.some((p) => p.id === selectedProductId) && next[0]) {
              setSelectedProductId(next[0].id);
            }
          }}
          coupons={coupons}
          onUpdateCoupons={(next) => {
            setCoupons(next);
            saveCloudState('coupons', next);
          }}
          sellers={sellers}
          onUpdateSellers={(next) => {
            setSellers(next);
            saveCloudState('sellers', next);
          }}
          referrals={referrals}
          onUpdateReferrals={(next) => {
            setReferrals(next);
            saveCloudState('referrals', next);
          }}
          orders={orders}
          onUpdateOrders={(next) => {
            setOrders(next);
            syncCloudOrders(next);
          }}
          promoBanner={promoBanner}
          onUpdatePromoBanner={(next) => {
            setPromoBanner(next);
            saveCloudState('promo', next);
          }}
          settings={settings}
          onUpdateSettings={(next) => {
            setSettings(next);
            saveCloudState('settings', next);
          }}
          trackedLinks={trackedLinks}
          onRegisterTrackedLink={registerTrackedLink}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#F6F7F9] text-slate-900 overflow-x-clip lg:overflow-hidden">
      {/* Ultra-Clean Top Header Bar (Sticky native app header on mobile) */}
      <header className="sticky top-0 lg:static h-14 sm:h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3 z-30">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={switchToLanding}
            title="Ir a la página principal .colorío"
            className="cursor-pointer shrink-0 flex items-center"
          >
            <ColorioLogo
              theme="light"
              dotTone="violet"
              customLogoUrl={settings.brandLogoLightUrl || undefined}
              className="h-8 sm:h-10 w-auto shrink-0"
            />
          </button>
          {settings.landingEnabled !== false && (
            <button
              type="button"
              onClick={switchToLanding}
              className="text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-50 hover:bg-[#4C1EDB] text-[#4C1EDB] hover:text-white border border-violet-200/70 transition-colors cursor-pointer shrink-0"
            >
              Inicio
            </button>
          )}
        </div>

        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 bg-slate-100/75 px-3.5 py-1.5 rounded-full border border-slate-200/60">
          <span className="font-semibold text-slate-700">{activeProduct.name}</span>
          <span className="text-slate-300">/</span>
          <span>{activeProduct.dimensions}</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#4C1EDB] font-semibold">{activeProduct.sku}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCartInitialStep('cart');
              setCartOpen(true);
            }}
            className="relative flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-xl bg-[#0D0E12] hover:bg-[#4C1EDB] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Carrito</span>
            {cartCount > 0 ? (
              <span className="flex items-center gap-1 pl-1.5 border-l border-white/20 tabular-nums">
                <span className="px-1.5 py-0.2 rounded-full bg-[#F72585] text-[10px]">
                  {cartCount}
                </span>
                <span className="hidden sm:inline text-[11px] font-semibold text-slate-200">
                  {formatCurrency(cartTotal)}
                </span>
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-white/15 text-[10px] flex items-center justify-center">
                0
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setAdminOpen(true);
              refreshFromCloud(false);
            }}
            title="Panel Superadmin / Vendedores"
            className="p-2 rounded-xl text-slate-400 hover:text-[#4C1EDB] hover:bg-violet-50 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Responsive Studio Workspace (Native 1-finger scroll on Mobile, 3-Column Studio on Desktop) */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-visible lg:overflow-hidden">
        {/* Desktop Left Catalog / Mobile Catalog Tab */}
        <div
          id="catalog-selector-panel"
          className={`${
            mobileTab === 'catalog' ? 'block' : 'hidden'
          } lg:block lg:h-full order-3 lg:order-1`}
        >
          <LeftCatalogPanel
            products={products}
            selectedProductId={activeProduct.id}
            onSelectProduct={(id) => {
              handleSelectProduct(id);
              setMobileTab('customize');
            }}
            promoBanner={promoBanner}
            hideOutOfStock={settings.hideOutOfStock}
          />
        </div>

        {/* Live Interactive Mockup Stage (First on Mobile, Center on Desktop) */}
        <div className="order-1 lg:order-2 flex-none lg:flex-1 h-[46vh] min-h-[340px] max-h-[480px] sm:h-[52vh] lg:h-auto lg:min-h-0 lg:max-h-none flex">
          <MockupCanvas
            product={activeProduct}
            color={activeColor}
            secondaryOption={activeSecondary}
            techniqueId={techniqueId}
            inkMode={inkMode}
            customInkHex={customInkHex}
            printCoverage={printCoverage}
            pouchPrint={pouchPrint}
            processedLogoUrl={processedLogoUrl}
            whiteLogoUrl={whiteLogoUrl}
            blackLogoUrl={blackLogoUrl}
            logoAspectRatio={logo.aspectRatio}
            logoTransform={logoTransform}
            onChangeTransform={setLogoTransform}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            onSelectColor={handleSelectColor}
            svgRef={mockupSvgRef}
            brandLogoLightUrl={settings.brandLogoLightUrl}
            brandLogoDarkUrl={settings.brandLogoDarkUrl}
          />
        </div>

        {/* Mobile Native Segmented App Bar right beneath Mockup */}
        <div className="order-2 lg:hidden sticky top-14 z-20 bg-white/95 backdrop-blur-md border-y border-slate-200/80 px-3 py-2">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100">
            <button
              type="button"
              onClick={() => setMobileTab('customize')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'customize'
                  ? 'bg-white text-[#4C1EDB] shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Personalizar y Pedir</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('catalog')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'catalog'
                  ? 'bg-white text-[#4C1EDB] shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Productos ({products.length})</span>
            </button>
          </div>
        </div>

        {/* Desktop Right Inspector / Mobile Customize Tab */}
        <div
          className={`${
            mobileTab === 'customize' ? 'block' : 'hidden'
          } lg:block lg:h-full order-3`}
        >
          <RightInspectorPanel
            product={activeProduct}
            selectedColor={activeColor}
            onSelectColor={handleSelectColor}
            selectedSecondary={activeSecondary}
            onSelectSecondary={setSelectedSecondaryId}
            logo={logo}
            onUploadFile={handleUploadFile}
            onSelectDemoLogo={handleSelectDemoLogo}
            onToggleRemoveWhiteBg={() =>
              setLogo((prev) => ({ ...prev, removeWhiteBg: !prev.removeWhiteBg }))
            }
            techniqueId={techniqueId}
            onChangeTechnique={handleChangeTechnique}
            inkMode={inkMode}
            onChangeInkMode={setInkMode}
            customInkHex={customInkHex}
            onChangeCustomInkHex={setCustomInkHex}
            printCoverage={printCoverage}
            onChangePrintCoverage={setPrintCoverage}
            pouchPrint={pouchPrint}
            onTogglePouchPrint={() => setPouchPrint((p) => !p)}
            logoTransform={logoTransform}
            onChangeTransform={setLogoTransform}
            quantity={quantity}
            ivaPct={settings.ivaPct}
            designStatus={designStatus}
            onChangeDesignStatus={setDesignStatus}
            onChangeQuantity={setQuantity}
            onShowAssortment={() => setViewMode('assortment')}
            onAddToCart={handleAddToCart}
            onAddAndConfigureAnother={handleAddAndConfigureAnother}
            onQuickOrderNow={handleQuickOrderNow}
            onOpenShare={handleOpenShare}
            onDownloadApproval={handleDownloadApproval}
            isExporting={isExporting}
            justAdded={justAdded}
            hideOutOfStock={settings.hideOutOfStock}
          />
        </div>
      </main>

      {/* Mobile Persuasive Corporate Card */}
      {promoBanner.enabled && (
        <div className="lg:hidden p-4 bg-white border-t border-slate-200/80">
          <div className="rounded-2xl overflow-hidden border border-violet-200/70 bg-gradient-to-b from-white to-violet-50/40">
            {(activeProduct.promoImageUrl || promoBanner.imageUrl) && (
              <div className="w-full h-36 bg-slate-900 overflow-hidden">
                <img
                  src={activeProduct.promoImageUrl || promoBanner.imageUrl}
                  alt={promoBanner.headline}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#4C1EDB]">
                {promoBanner.eyebrow}
              </p>
              <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                {promoBanner.headline}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {promoBanner.body}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2026 Modern Editorial Footer */}
      <Footer2026
        mainWhatsapp={settings.mainWhatsapp}
        mainWhatsappDisplay={settings.mainWhatsappDisplay}
      />

      {/* Multi-Product Add & Continue Guided Modal */}
      {showMultiProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    ¡{activeProduct.shortName} guardado en tu orden!
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tu orden tiene <strong>{cart.length} {cart.length === 1 ? 'artículo' : 'artículos'}</strong> actualmente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMultiProductModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              ¿Cómo deseas configurar el siguiente producto de tu orden?
            </p>

            <div className="space-y-2">
              {/* Option 1: Keep same logo */}
              <button
                type="button"
                onClick={() => {
                  setShowMultiProductModal(false);
                  showToast('Selecciona el siguiente producto de la lista');
                  setMobileTab('catalog');
                  const panel = document.getElementById('catalog-selector-panel');
                  panel?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full p-3.5 rounded-2xl border-2 border-violet-100 bg-violet-50/50 hover:border-[#4C1EDB] hover:bg-violet-50 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#4C1EDB] text-white flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900">
                    Mantener este logo en el siguiente producto
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Usa "{logo.name}" sin tener que volver a subir el archivo.
                  </p>
                </div>
              </button>

              {/* Option 2: Upload new logo */}
              <button
                type="button"
                onClick={() => {
                  setShowMultiProductModal(false);
                  showToast('Selecciona el producto y sube tu nuevo logo en el Paso 2');
                  setMobileTab('catalog');
                  const panel = document.getElementById('catalog-selector-panel');
                  panel?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900">
                    Personalizar con un NUEVO logo
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sube otro logotipo, arte o marca diferente para este artículo.
                  </p>
                </div>
              </button>

              {/* Option 3: Go to Cart */}
              <button
                type="button"
                onClick={() => {
                  setShowMultiProductModal(false);
                  setCartInitialStep('cart');
                  setCartOpen(true);
                }}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-100/70 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#4C1EDB]" />
                <span>Ver Pedido Completo ({cart.length} modelos)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        initialStep={cartInitialStep}
        onClose={() => setCartOpen(false)}
        items={cart}
        products={products}
        coupons={coupons}
        sellers={sellers}
        referrals={referrals}
        settings={settings}
        designStatus={designStatus}
        onChangeDesignStatus={setDesignStatus}
        initialSellerCode={urlInit.sellerRef}
        initialReferralCode={urlInit.referralCode}
        onUpdateItemQty={handleUpdateCartItemQty}
        onDuplicateItem={handleDuplicateCartItem}
        onAddAnotherProduct={handleFocusCatalogForNewProduct}
        onRemoveItem={(id) => setCart((prev) => prev.filter((i) => i.id !== id))}
        onClearCart={() => setCart([])}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Share & Tracked Approval Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={shareUrl}
        whatsAppText={whatsAppText}
        whatsappNumber={settings.mainWhatsapp}
        approvalCardUrl={approvalCardUrl}
        productName={activeProduct.name}
        onDownloadApproval={handleDownloadApproval}
        onTrackShare={handleTrackShare}
      />

      {/* Superadmin & Sellers Control Center */}
      <AdminDashboardModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        dbConnected={dbConnected}
        products={products}
        onUpdateProducts={(next) => {
          setProducts(next);
          saveCloudState('products', next);
          if (!next.some((p) => p.id === selectedProductId) && next[0]) {
            setSelectedProductId(next[0].id);
          }
        }}
        coupons={coupons}
        onUpdateCoupons={(next) => {
          setCoupons(next);
          saveCloudState('coupons', next);
        }}
        sellers={sellers}
        onUpdateSellers={(next) => {
          setSellers(next);
          saveCloudState('sellers', next);
        }}
        referrals={referrals}
        onUpdateReferrals={(next) => {
          setReferrals(next);
          saveCloudState('referrals', next);
        }}
        orders={orders}
        onUpdateOrders={(next) => {
          setOrders(next);
          syncCloudOrders(next);
        }}
        promoBanner={promoBanner}
        onUpdatePromoBanner={(next) => {
          setPromoBanner(next);
          saveCloudState('promo', next);
        }}
        settings={settings}
        onUpdateSettings={(next) => {
          setSettings(next);
          saveCloudState('settings', next);
        }}
        trackedLinks={trackedLinks}
        onRegisterTrackedLink={registerTrackedLink}
      />

      {toast && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0D0E12] text-white text-xs font-semibold shadow-xl border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#C0EE00] shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default App;

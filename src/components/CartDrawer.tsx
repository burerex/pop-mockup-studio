import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CopyPlus,
  CreditCard,
  ExternalLink,
  Gift,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  UserCheck,
  X,
} from 'lucide-react';
import {
  CartItem,
  Coupon,
  DesignApprovalStatus,
  OrderRecord,
  Product,
  ReferralCode,
  Seller,
  ShippingOptionId,
  SystemSettings,
} from '../types';
import {
  calculateCouponDiscount,
  formatCurrency,
  getInkLabel,
  getTechniqueById,
  getUnitPrice,
} from '../data/products';
import { formatWhatsappDigits } from '../utils/linkTracker';

interface CartDrawerProps {
  isOpen: boolean;
  initialStep?: 'cart' | 'checkout';
  onClose: () => void;
  items: CartItem[];
  products: Product[];
  coupons: Coupon[];
  sellers: Seller[];
  referrals: ReferralCode[];
  settings: SystemSettings;
  designStatus: DesignApprovalStatus;
  onChangeDesignStatus: (next: DesignApprovalStatus) => void;
  initialSellerCode?: string;
  initialReferralCode?: string;
  onUpdateItemQty: (itemId: string, nextQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onDuplicateItem?: (item: CartItem) => void;
  onAddAnotherProduct?: () => void;
  onClearCart: () => void;
  onPlaceOrder: (payload: {
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
  }) => OrderRecord;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  initialStep = 'cart',
  onClose,
  items,
  products,
  coupons,
  sellers,
  referrals,
  settings,
  designStatus,
  onChangeDesignStatus,
  initialSellerCode = '',
  initialReferralCode = '',
  onUpdateItemQty,
  onRemoveItem,
  onDuplicateItem,
  onAddAnotherProduct,
  onClearCart,
  onPlaceOrder,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>(initialStep);
  const [customerName, setCustomerName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');

  const [shippingOption, setShippingOption] = useState<ShippingOptionId>('pickup');

  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  const [sellerCodeInput, setSellerCodeInput] = useState(initialSellerCode);
  const [referralCodeInput, setReferralCodeInput] = useState(initialReferralCode);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const [copiedPayment, setCopiedPayment] = useState(false);

  useEffect(() => {
    if (isOpen && step !== 'success') {
      setStep(initialStep);
    }
  }, [isOpen, initialStep]);

  useEffect(() => {
    if (initialSellerCode) setSellerCodeInput(initialSellerCode);
  }, [initialSellerCode]);

  useEffect(() => {
    if (initialReferralCode) setReferralCodeInput(initialReferralCode);
  }, [initialReferralCode]);

  if (!isOpen) return null;

  const shippingChoices: { id: ShippingOptionId; label: string; cost: number; desc: string }[] = [
    { id: 'pickup', label: 'Retiro en tienda', cost: 0, desc: 'Sin costo' },
    {
      id: 'local',
      label: 'Delivery Local',
      cost: settings.shippingLocalCost,
      desc: `+${formatCurrency(settings.shippingLocalCost)}`,
    },
    {
      id: 'national',
      label: 'Envío Nacional (MRW/Zoom)',
      cost: settings.shippingNationalCost,
      desc: `+${formatCurrency(settings.shippingNationalCost)}`,
    },
  ];

  const selectedShipping =
    shippingChoices.find((s) => s.id === shippingOption) || shippingChoices[0];

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const subtotalBeforeDiscount = Number(
    items.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toFixed(2)
  );

  const matchedCoupon =
    coupons.find((c) => c.code.toUpperCase() === appliedCouponCode.toUpperCase()) || null;
  const couponCalc = calculateCouponDiscount(matchedCoupon, subtotalBeforeDiscount);
  const discountAmount = couponCalc.valid ? couponCalc.discount : 0;

  const taxableBase = Number(Math.max(0, subtotalBeforeDiscount - discountAmount).toFixed(2));
  const ivaPct = settings.ivaPct;
  const ivaAmount = Number(((taxableBase * ivaPct) / 100).toFixed(2));
  const shippingCost = selectedShipping.cost;

  const processingFeePct = settings.processingFeeEnabled ? settings.processingFeePct : 0;
  const processingFeeAmount = settings.processingFeeEnabled
    ? Number((((taxableBase + ivaAmount + shippingCost) * processingFeePct) / 100).toFixed(2))
    : 0;

  const grandTotal = Number(
    (taxableBase + ivaAmount + shippingCost + processingFeeAmount).toFixed(2)
  );

  const matchedSeller = sellers.find(
    (s) => s.active && s.code.toUpperCase() === sellerCodeInput.trim().toUpperCase()
  );
  const matchedReferral = referrals.find(
    (r) => r.active && r.code.toUpperCase() === referralCodeInput.trim().toUpperCase()
  );

  const targetWhatsappDigits = (() => {
    if (settings.routeToSellerWhatsapp && matchedSeller?.whatsapp) {
      return formatWhatsappDigits(matchedSeller.whatsapp);
    }
    return formatWhatsappDigits(settings.mainWhatsapp || '584245252121');
  })();

  const handleApplyCoupon = () => {
    const clean = couponInput.trim().toUpperCase();
    if (!clean) {
      setAppliedCouponCode('');
      setCouponFeedback(null);
      return;
    }
    const found = coupons.find((c) => c.code.toUpperCase() === clean);
    if (!found) {
      setAppliedCouponCode('');
      setCouponFeedback('Cupón no encontrado.');
      return;
    }
    const check = calculateCouponDiscount(found, subtotalBeforeDiscount);
    if (!check.valid) {
      setAppliedCouponCode('');
      setCouponFeedback(check.reason || 'Cupón no aplicable.');
      return;
    }
    setAppliedCouponCode(found.code);
    setCouponFeedback(`¡Cupón ${found.code} aplicado (-${formatCurrency(check.discount)})!`);
  };

  const buildOrderWhatsAppHref = (order: OrderRecord) => {
    const sellerForOrder = sellers.find(
      (s) => s.code.toUpperCase() === (order.sellerCode || '').toUpperCase()
    );
    const destDigits =
      settings.routeToSellerWhatsapp && sellerForOrder?.whatsapp
        ? formatWhatsappDigits(sellerForOrder.whatsapp)
        : formatWhatsappDigits(settings.mainWhatsapp || '584245252121');

    const designLabel =
      order.designStatus === 'aprobado'
        ? '✅ DISEÑO APROBADO (Listo para link de Pago Master)'
        : '⏳ DISEÑO EN REVISIÓN (Validar antes de enviar link de pago)';

    const lines = [
      `¡Hola equipo *.colorío*! Envío pedido *#${order.folio}*:`,
      `🎨 *Estado del diseño:* ${designLabel}`,
      ``,
      `👤 *DATOS DEL CLIENTE*`,
      `• Nombre: ${order.customerName}`,
      ...(order.company ? [`• Empresa / Marca: ${order.company}`] : []),
      `• Teléfono: ${order.phone}`,
      `• Ciudad / Entrega: ${order.city}`,
      ...(order.eventDate ? [`• Fecha requerida: ${order.eventDate}`] : []),
      ...(order.sellerCode
        ? [`• Código de Vendedor: *${order.sellerCode}*${order.sellerName ? ` (${order.sellerName})` : ''}`]
        : []),
      ...(order.referralCode
        ? [`• Código de Referido: *${order.referralCode}*${order.referralOwner ? ` (${order.referralOwner})` : ''}`]
        : []),
      ``,
      `📦 *DETALLE DEL PEDIDO (${order.totalUnits.toLocaleString('es-ES')} piezas)*`,
      ...order.itemsSummary.map((it, idx) => {
        const tech = getTechniqueById(it.techniqueId);
        return [
          `${idx + 1}. *${it.productName}* (${it.sku})`,
          `   - Color: ${it.colorName}${it.pouchPrint ? ' + Logo en funda' : ''}`,
          `   - Impresión: ${tech.name} · ${it.inkLabel}`,
          `   - Cantidad: ${it.quantity.toLocaleString('es-ES')} uds × ${formatCurrency(it.unitPrice)} = ${formatCurrency(it.subtotal)}`,
          `   - 🔗 Modelo: ${it.modelUrl}`,
        ].join('\n');
      }),
      ``,
      `💳 *RESUMEN DE PAGO*`,
      `• Subtotal: ${formatCurrency(order.subtotalBeforeDiscount)}`,
      ...(order.couponCode && order.discountAmount > 0
        ? [`• Descuento cupón (${order.couponCode}): -${formatCurrency(order.discountAmount)}`]
        : []),
      `• IVA (${order.ivaPct}%): ${formatCurrency(order.ivaAmount)}`,
      `• Envío (${order.shippingLabel}): ${order.shippingCost === 0 ? '$0.00' : formatCurrency(order.shippingCost)}`,
      ...(order.processingFeeAmount > 0
        ? [`• Procesamiento (${order.processingFeePct}%): ${formatCurrency(order.processingFeeAmount)}`]
        : []),
      `• *TOTAL A PAGAR: ${formatCurrency(order.totalUsd)}*`,
      ...(order.pagoMasterLink
        ? [`• 💳 Link Pago Master: ${order.pagoMasterLink}`]
        : []),
      ...(order.notes ? [``, `📝 *Notas:* ${order.notes}`] : []),
      ``,
      order.designStatus === 'aprobado'
        ? `Diseño *APROBADO*. Quedo atento(a) para completar el pago directo por *${formatCurrency(order.totalUsd)}* vía *Pago Master*. ¡Gracias!`
        : `Diseño *EN REVISIÓN*. Quedo atento(a) a la confirmación del arte para recibir el link de *Pago Master* por *${formatCurrency(order.totalUsd)}*. ¡Gracias!`,
    ];
    return `https://wa.me/${destDigits}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveSellerCode =
      matchedSeller?.code ||
      matchedReferral?.linkedSellerCode ||
      (sellerCodeInput.trim().toUpperCase() || undefined);

    const order = onPlaceOrder({
      customerName: customerName.trim(),
      company: company.trim(),
      phone: phone.trim(),
      city: city.trim(),
      eventDate: eventDate.trim() || undefined,
      notes: notes.trim() || undefined,
      designStatus,
      sellerCode: effectiveSellerCode,
      referralCode: matchedReferral?.code || (referralCodeInput.trim().toUpperCase() || undefined),
      couponCode: couponCalc.valid && matchedCoupon ? matchedCoupon.code : undefined,
      discountAmount,
      subtotalBeforeDiscount,
      ivaPct,
      ivaAmount,
      shippingOption: selectedShipping.id,
      shippingLabel: selectedShipping.label,
      shippingCost,
      processingFeePct,
      processingFeeAmount,
      totalUsd: grandTotal,
    });
    setCreatedOrder(order);
    setStep('success');
    window.open(buildOrderWhatsAppHref(order), '_blank', 'noopener,noreferrer');
  };

  const handleFinishAndClose = () => {
    onClearCart();
    setCreatedOrder(null);
    setStep('cart');
    setCustomerName('');
    setCompany('');
    setPhone('');
    setCity('');
    setEventDate('');
    setNotes('');
    setCouponInput('');
    setAppliedCouponCode('');
    setCouponFeedback(null);
    setShippingOption('pickup');
    onClose();
  };

  const renderCouponAndShippingControls = () => (
    <div className="space-y-3">
      {/* Descuentos y Cupones */}
      <div className="p-3.5 rounded-2xl bg-violet-50/55 border border-violet-200/75 space-y-2">
        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#4C1EDB]" />
          Descuentos y Cupones
        </label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Ingresa tu cupón (ej. COLORIO10)"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider outline-none focus:border-[#4C1EDB]"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="px-3.5 py-2 rounded-xl bg-[#0D0E12] hover:bg-[#4C1EDB] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Aplicar
          </button>
        </div>
        {couponFeedback && (
          <p
            className={`text-[11px] font-semibold ${
              couponCalc.valid ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {couponFeedback}
          </p>
        )}
      </div>

      {/* Envío Opcional */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#4C1EDB]" />
          Envío (Opcional)
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {shippingChoices.map((opt) => {
            const active = shippingOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setShippingOption(opt.id)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[#4C1EDB] bg-white shadow-2xs ring-1 ring-[#4C1EDB]/20'
                    : 'border-slate-200 bg-white/60 hover:bg-white'
                }`}
              >
                <span className="block text-[10.5px] font-bold text-slate-800 leading-tight">
                  {opt.label}
                </span>
                <span
                  className={`block text-[10px] font-extrabold mt-0.5 ${
                    active ? 'text-[#4C1EDB]' : 'text-slate-500'
                  }`}
                >
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[475px] h-full bg-white shadow-2xl flex flex-col border-l border-slate-200/80">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-[#4C1EDB] flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {step === 'cart'
                  ? 'Tu Carrito y Presupuesto'
                  : step === 'checkout'
                    ? 'Confirmar Pedido'
                    : '¡Pedido Registrado!'}
              </h2>
              <p className="text-xs text-slate-500">
                {items.length} {items.length === 1 ? 'modelo' : 'modelos'} ·{' '}
                {totalUnits.toLocaleString('es-ES')} piezas · IVA {ivaPct}%
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'success' && createdOrder ? (
            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="inline-block text-xs font-extrabold tracking-wider uppercase px-3 py-1 rounded-full bg-violet-50 text-[#4C1EDB] mb-2">
                Folio #{createdOrder.folio}
              </span>
              <div className="mb-3">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    createdOrder.designStatus === 'aprobado'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {createdOrder.designStatus === 'aprobado' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Diseño Aprobado
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      Diseño En Revisión
                    </>
                  )}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                {createdOrder.designStatus === 'aprobado'
                  ? '¡Pedido Aprobado y Registrado!'
                  : '¡Diseño Enviado a Revisión!'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto mb-4">
                Registramos tu pedido de{' '}
                <strong>{createdOrder.totalUnits.toLocaleString('es-ES')} piezas</strong> por{' '}
                <strong>{formatCurrency(createdOrder.totalUsd)}</strong> (incluye IVA{' '}
                {createdOrder.ivaPct}%).
              </p>

              {/* Independent Payment Options Display (Bank/Pago Móvil/Zelle Data AND/OR Payment Link) */}
              {settings.paymentDisplayMode !== 'whatsapp_only' && (
                <div className="mb-5 space-y-2.5 text-left">
                  {(settings.paymentDisplayMode === 'both' ||
                    settings.paymentDisplayMode === 'data_only') && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">
                          Datos para Transferencia / Pago Móvil / Zelle
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const txt = [
                              settings.paymentBankName ? `Banco: ${settings.paymentBankName}` : '',
                              settings.paymentPagoMovilPhone
                                ? `Pago Móvil: ${settings.paymentPagoMovilPhone} · ${settings.paymentPagoMovilId}`
                                : '',
                              settings.paymentZelleEmail
                                ? `Zelle: ${settings.paymentZelleEmail} (${settings.paymentZelleHolder})`
                                : '',
                              settings.paymentBinanceId ? `Binance Pay: ${settings.paymentBinanceId}` : '',
                              `Monto exacto: ${formatCurrency(createdOrder.totalUsd)}`,
                            ]
                              .filter(Boolean)
                              .join('\n');
                            navigator.clipboard?.writeText(txt).catch(() => {});
                            setCopiedPayment(true);
                            setTimeout(() => setCopiedPayment(false), 2000);
                          }}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10.5px] font-bold text-[#4C1EDB] hover:bg-violet-50 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPayment ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPayment ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                      {settings.paymentBankName && (
                        <p className="text-slate-600">
                          <strong className="text-slate-800">Banco:</strong> {settings.paymentBankName}
                        </p>
                      )}
                      {settings.paymentPagoMovilPhone && (
                        <p className="text-slate-600">
                          <strong className="text-slate-800">Pago Móvil:</strong>{' '}
                          {settings.paymentPagoMovilPhone} · {settings.paymentPagoMovilId}
                        </p>
                      )}
                      {settings.paymentZelleEmail && (
                        <p className="text-slate-600">
                          <strong className="text-slate-800">Zelle:</strong>{' '}
                          {settings.paymentZelleEmail}{' '}
                          {settings.paymentZelleHolder ? `(${settings.paymentZelleHolder})` : ''}
                        </p>
                      )}
                      {settings.paymentBinanceId && (
                        <p className="text-slate-600">
                          <strong className="text-slate-800">Binance Pay:</strong>{' '}
                          {settings.paymentBinanceId}
                        </p>
                      )}
                      {settings.paymentNotes && (
                        <p className="text-[10.5px] text-slate-400 pt-1">{settings.paymentNotes}</p>
                      )}
                    </div>
                  )}

                  {(settings.paymentDisplayMode === 'both' ||
                    settings.paymentDisplayMode === 'link_only') &&
                    settings.pagoMasterEnabled && (
                      <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-200/80 space-y-2">
                        <div className="flex items-start gap-2.5">
                          <CreditCard className="w-4.5 h-4.5 text-[#4C1EDB] shrink-0 mt-0.5" />
                          <p className="text-xs text-violet-950 leading-relaxed">
                            {createdOrder.designStatus === 'aprobado' ? (
                              <>
                                <strong>Link de Pago ({formatCurrency(createdOrder.totalUsd)}):</strong>{' '}
                                Tu diseño quedó aprobado. Puedes pagar directo o confirmar por
                                WhatsApp.
                              </>
                            ) : (
                              <>
                                <strong>Siguiente paso — Link de Pago:</strong> Revisaremos tu arte
                                primero y luego recibirás el link directo por{' '}
                                <strong>{formatCurrency(createdOrder.totalUsd)}</strong>.
                              </>
                            )}
                          </p>
                        </div>
                        {createdOrder.designStatus === 'aprobado' && createdOrder.pagoMasterLink && (
                          <a
                            href={createdOrder.pagoMasterLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-[#4C1EDB] hover:bg-[#3B15B5] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pagar {formatCurrency(createdOrder.totalUsd)} en Pago Master</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                </div>
              )}

              <div className="space-y-2.5">
                <a
                  href={buildOrderWhatsAppHref(createdOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span>Enviar Pedido por WhatsApp (+{targetWhatsappDigits})</span>
                </a>
                <button
                  type="button"
                  onClick={handleFinishAndClose}
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Finalizar y crear un nuevo diseño
                </button>
              </div>
            </div>
          ) : step === 'checkout' ? (
            <form id="colorio-checkout-form" onSubmit={handleSubmitOrder} className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800">Resumen de modelos</p>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {item.quantity}× {item.productName} ({item.color.name})
                    </span>
                    <span className="font-semibold text-slate-800 shrink-0">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. María González"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#4C1EDB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Empresa / Marca
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ej. Solaris Eventos"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#4C1EDB] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tu WhatsApp / Teléfono *
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 0414-1234567"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#4C1EDB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ciudad / Entrega *
                  </label>
                  <input
                    required
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Caracas / Valencia"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#4C1EDB] outline-none"
                  />
                </div>
              </div>

              {renderCouponAndShippingControls()}

              {/* Seller & Referral Codes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#4C1EDB]" />
                    Código Vendedor
                  </label>
                  <input
                    type="text"
                    value={sellerCodeInput}
                    onChange={(e) => setSellerCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ej. MARIA01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider outline-none focus:border-[#4C1EDB]"
                  />
                  {matchedSeller && (
                    <p className="text-[10.5px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      {matchedSeller.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                    <Gift className="w-3.5 h-3.5 text-[#F72585]" />
                    Código Referido
                  </label>
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ej. ALIADO10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider outline-none focus:border-[#4C1EDB]"
                  />
                  {matchedReferral && (
                    <p className="text-[10.5px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      {matchedReferral.ownerName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha estimada del evento (opcional)
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#4C1EDB] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles de entrega, facturación o colores surtidos..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#4C1EDB] outline-none resize-none"
                />
              </div>

              {/* Botón de Estado del Diseño: Aprobado vs En revisión */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="text-[11px] font-bold text-slate-800 block">
                  Estado del Diseño para este pedido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeDesignStatus('aprobado')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      designStatus === 'aprobado'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeDesignStatus('en_revision')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      designStatus === 'en_revision'
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>En revisión</span>
                  </button>
                </div>
                {settings.pagoMasterEnabled && (
                  <div className="flex items-center gap-2 text-[11px] text-violet-900 pt-1">
                    <CreditCard className="w-3.5 h-3.5 text-[#4C1EDB] shrink-0" />
                    <span>
                      {designStatus === 'aprobado' ? (
                        <>
                          Listo para recibir tu link de <strong>Pago Master</strong> por{' '}
                          <strong>{formatCurrency(grandTotal)}</strong>.
                        </>
                      ) : (
                        <>
                          Revisaremos tu arte primero y luego te enviaremos el link de{' '}
                          <strong>Pago Master</strong> por{' '}
                          <strong>{formatCurrency(grandTotal)}</strong>.
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </form>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Tu carrito está vacío
              </h3>
              <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed">
                Personaliza un producto con tu logotipo, elige color, técnica de impresión y
                cantidad para armar tu pedido al instante.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Quick Add Another Product Banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#4C1EDB] text-white flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      ¿Quieres más artículos?
                    </p>
                    <p className="text-[10.5px] text-slate-500">
                      Personaliza otro modelo con diferente logo o color
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAddAnotherProduct?.();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#4C1EDB] hover:bg-[#3B15B5] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir otro</span>
                </button>
              </div>

              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                const maxStock = item.color.stock;
                const tech = getTechniqueById(item.techniqueId);

                const changeQty = (next: number) => {
                  const clamped = Math.min(maxStock, Math.max(1, next));
                  onUpdateItemQty(item.id, clamped);
                };

                const recomputedUnit = product
                  ? getUnitPrice(
                      product,
                      item.quantity,
                      item.inkMode,
                      item.pouchPrint,
                      item.printCoverage,
                      item.techniqueId,
                      item.secondaryOption
                    )
                  : item.unitPrice;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200/80 p-3.5 bg-white shadow-xs space-y-2.5"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl bg-[#F4F5F8] border border-slate-200/70 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                        {item.previewDataUrl ? (
                          <img
                            src={item.previewDataUrl}
                            alt={item.productName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span
                            className="w-10 h-10 rounded-full border border-slate-300"
                            style={{ backgroundColor: item.color.hex }}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {item.productName}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            {onDuplicateItem && (
                              <button
                                type="button"
                                onClick={() => onDuplicateItem(item)}
                                title="Duplicar este artículo"
                                className="p-1 rounded-lg text-slate-400 hover:text-[#4C1EDB] hover:bg-violet-50 transition-colors cursor-pointer"
                              >
                                <CopyPlus className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              title="Quitar"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-600">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-slate-900/20"
                              style={{ backgroundColor: item.color.hex }}
                            />
                            {item.color.name}
                          </span>
                          {item.secondaryOption && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                              {item.secondaryOption.name}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded-md bg-violet-50 text-[#4C1EDB] font-semibold">
                            {tech.shortName}
                          </span>
                        </div>

                        <p className="text-[10.5px] text-slate-400 mt-1 truncate">
                          Logo: {item.logoName}
                          {item.pouchPrint ? ' · +Logo en funda' : ''}
                          {item.printCoverage === 'full-bleed' ? ' · Full Bleed' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => changeQty(item.quantity - (item.quantity <= 50 ? 10 : 25))}
                          className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-2xs cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900 tabular-nums">
                          {item.quantity} uds
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQty(item.quantity + (item.quantity < 50 ? 10 : 25))}
                          className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[10.5px] text-slate-400 tabular-nums">
                          {formatCurrency(recomputedUnit)} / ud
                        </p>
                        <p className="text-sm font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(item.quantity * recomputedUnit)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Discounts/Coupons + Optional Shipping directly visible inside Cart */}
              {renderCouponAndShippingControls()}
            </div>
          )}
        </div>

        {/* Footer Totals */}
        {items.length > 0 && step !== 'success' && (
          <div className="p-5 border-t border-slate-200/80 bg-slate-50/75 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({totalUnits.toLocaleString('es-ES')} uds)</span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  {formatCurrency(subtotalBeforeDiscount)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descuento ({appliedCouponCode})</span>
                  <span className="tabular-nums">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>IVA ({ivaPct}%)</span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  {formatCurrency(ivaAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Envío ({selectedShipping.label})</span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  {shippingCost === 0 ? '$0.00' : formatCurrency(shippingCost)}
                </span>
              </div>
              {processingFeeAmount > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Procesamiento ({processingFeePct}%)</span>
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {formatCurrency(processingFeeAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200/80">
                <span className="text-sm font-bold text-slate-900">Total a pagar</span>
                <span className="text-xl font-extrabold text-slate-900 tabular-nums font-display">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#4C1EDB] hover:bg-[#3B15B5] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <span>Continuar al Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  form="colorio-checkout-form"
                  className={`flex-1 py-3 px-4 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer ${
                    designStatus === 'aprobado'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {designStatus === 'aprobado'
                      ? `Enviar Aprobado · ${formatCurrency(grandTotal)}`
                      : `Enviar en Revisión · ${formatCurrency(grandTotal)}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

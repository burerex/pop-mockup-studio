import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Maximize2,
  MessageCircle,
  PackageCheck,
  Palette,
  Plus,
  RotateCw,
  Share2,
  ShoppingBag,
  Sliders,
  Sparkles,
  Tag,
  Target,
  Upload,
  Wand2,
} from 'lucide-react';
import {
  ColorVariant,
  DesignApprovalStatus,
  InkMode,
  LogoAsset,
  LogoTransform,
  PrintCoverage,
  PrintTechniqueId,
  Product,
  SecondaryOption,
} from '../types';
import {
  CUSTOM_INK_PRESETS,
  DEFAULT_IVA_PCT,
  DEMO_LOGOS,
  PRINT_TECHNIQUES,
  formatCurrency,
  getInkContrastWarning,
  getNextTierHint,
  getUnitPrice,
} from '../data/products';

interface RightInspectorPanelProps {
  product: Product;
  selectedColor: ColorVariant;
  onSelectColor: (colorId: string) => void;
  selectedSecondary?: SecondaryOption;
  onSelectSecondary: (secId: string) => void;
  logo: LogoAsset;
  onUploadFile: (file: File) => void;
  onSelectDemoLogo: (demo: LogoAsset) => void;
  onToggleRemoveWhiteBg: () => void;
  techniqueId: PrintTechniqueId;
  onChangeTechnique: (techId: PrintTechniqueId) => void;
  inkMode: InkMode;
  onChangeInkMode: (mode: InkMode) => void;
  customInkHex: string;
  onChangeCustomInkHex: (hex: string) => void;
  printCoverage: PrintCoverage;
  onChangePrintCoverage: (cov: PrintCoverage) => void;
  pouchPrint: boolean;
  onTogglePouchPrint: () => void;
  logoTransform: LogoTransform;
  onChangeTransform: (next: LogoTransform) => void;
  quantity: number;
  ivaPct?: number;
  designStatus: DesignApprovalStatus;
  onChangeDesignStatus: (next: DesignApprovalStatus) => void;
  onChangeQuantity: (qty: number) => void;
  onShowAssortment: () => void;
  onAddToCart: () => void;
  onAddAndConfigureAnother?: () => void;
  onQuickOrderNow: () => void;
  onOpenShare: () => void;
  onDownloadApproval: () => void;
  isExporting: boolean;
  justAdded: boolean;
  hideOutOfStock?: boolean;
}

type WizardStep = 1 | 2 | 3 | 4;

const STEP_META: {
  id: WizardStep;
  short: string;
  title: string;
  outcome: string;
}[] = [
  {
    id: 1,
    short: 'Color',
    title: 'Paso 1 · Color y Variedad',
    outcome: 'Define el color y medida/acabado disponible en inventario para tu marca.',
  },
  {
    id: 2,
    short: 'Tu Logo',
    title: 'Paso 2 · Logotipo e Impresión',
    outcome: 'Sube tu logo, elige tinta o técnica y mira en vivo cómo lucirá antes de producir.',
  },
  {
    id: 3,
    short: 'Cantidad',
    title: 'Paso 3 · Cantidad y Precio Real',
    outcome: 'Selecciona tu volumen (Referencia BCV) y obtén el precio exacto con IVA.',
  },
  {
    id: 4,
    short: 'Aprobar',
    title: 'Paso 4 · Aprobación y Pedido',
    outcome: 'Confirma si el diseño está Aprobado o En revisión, descarga la ficha o haz tu pedido.',
  },
];

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  product,
  selectedColor,
  onSelectColor,
  selectedSecondary,
  onSelectSecondary,
  logo,
  onUploadFile,
  onSelectDemoLogo,
  onToggleRemoveWhiteBg,
  techniqueId,
  onChangeTechnique,
  inkMode,
  onChangeInkMode,
  customInkHex,
  onChangeCustomInkHex,
  printCoverage,
  onChangePrintCoverage,
  pouchPrint,
  onTogglePouchPrint,
  logoTransform,
  onChangeTransform,
  quantity,
  ivaPct = DEFAULT_IVA_PCT,
  designStatus,
  onChangeDesignStatus,
  onChangeQuantity,
  onShowAssortment,
  onAddToCart,
  onAddAndConfigureAnother,
  onQuickOrderNow,
  onOpenShare,
  onDownloadApproval,
  isExporting,
  justAdded,
  hideOutOfStock = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);

  const unitPrice = getUnitPrice(
    product,
    quantity,
    inkMode,
    pouchPrint,
    printCoverage,
    techniqueId,
    selectedSecondary
  );
  const subtotalBase = Number((quantity * unitPrice).toFixed(2));
  const ivaAmount = Number(((subtotalBase * ivaPct) / 100).toFixed(2));
  const totalWithIva = Number((subtotalBase + ivaAmount).toFixed(2));
  const nextTier = getNextTierHint(
    product,
    quantity,
    inkMode,
    pouchPrint,
    printCoverage,
    techniqueId,
    selectedSecondary
  );
  const contrastWarning =
    printCoverage === 'full-bleed' && product.supportsFullBleed
      ? null
      : getInkContrastWarning(selectedColor.hex, inkMode, customInkHex);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUploadFile(file);
  };

  const sortedTiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
  const maxStock = selectedColor.available ? selectedColor.stock : 0;
  const activeStepMeta = STEP_META.find((s) => s.id === step) || STEP_META[0];

  const qtyPresets = (() => {
    const base = new Set<number>([
      product.minOrderQty,
      ...sortedTiers.map((t) => t.minQty),
      Math.max(product.minOrderQty, 250),
      Math.max(product.minOrderQty, 500),
      Math.max(product.minOrderQty, 1000),
    ]);
    return Array.from(base)
      .filter((n) => n >= product.minOrderQty)
      .sort((a, b) => a - b)
      .slice(0, 5);
  })();

  return (
    <aside className="w-full lg:w-[392px] xl:w-[416px] shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200/80 flex flex-col lg:h-full overflow-hidden">
      {/* CLEAR GOAL & PROGRESS STEPPER */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-gradient-to-b from-violet-50/60 to-white space-y-3 shrink-0">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#4C1EDB] text-[#C0EE00] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Target className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#4C1EDB]">
              Tu objetivo · {product.shortName}
            </p>
            <p className="text-[11.5px] font-semibold text-slate-700 leading-snug mt-0.5">
              Visualiza tu marca en el producto real, aprueba el diseño y obtén tu presupuesto en 4
              pasos.
            </p>
          </div>
        </div>

        {/* 4-Step Interactive Progress Pills */}
        <div className="grid grid-cols-4 gap-1.5">
          {STEP_META.map((s) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`py-1.5 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0D0E12] border-[#0D0E12] text-white shadow-xs'
                    : isDone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-violet-300 hover:text-[#4C1EDB]'
                }`}
              >
                <span className="block text-[9.5px] font-extrabold uppercase opacity-80">
                  {isDone ? '✓ Listo' : `Paso ${s.id}`}
                </span>
                <span className="block text-[11px] font-extrabold truncate">{s.short}</span>
              </button>
            );
          })}
        </div>

        {/* Micro-goal explaining what the user achieves in THIS step */}
        <div className="px-3 py-2 rounded-xl bg-white border border-violet-200/70 shadow-2xs">
          <p className="text-[11px] font-extrabold text-[#4C1EDB]">{activeStepMeta.title}</p>
          <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
            {activeStepMeta.outcome}
          </p>
        </div>
      </div>

      {/* FOCUSED SINGLE-STEP BODY (Zero overwhelming wall of inputs!) */}
      <div className="flex-1 lg:overflow-y-auto p-4 space-y-4">
        {/* ==================== STEP 1: COLOR & VARIETY ==================== */}
        {step === 1 && (
          <div className="space-y-4">
            {product.priceNote && (
              <div className="px-3 py-2 rounded-xl bg-lime-50/90 border border-lime-300/70 text-[11px] font-semibold text-slate-800">
                {product.priceNote}
              </div>
            )}

            {/* Secondary Option / Size Selector FIRST when it affects unit price (e.g. Bolsas) */}
            {product.secondaryOptions && product.secondaryOptions.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-violet-50/50 border border-violet-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#4C1EDB]" />
                    {product.secondaryLabel || 'Medida / Acabado'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {(hideOutOfStock
                    ? product.secondaryOptions.filter((opt) => opt.available && opt.stock > 0)
                    : product.secondaryOptions
                  ).map((opt) => {
                    const active = selectedSecondary?.id === opt.id;
                    const isAgotado = !opt.available || opt.stock <= 0;
                    const dotHex = opt.hex === 'MATCH' ? selectedColor.hex : opt.hex;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isAgotado}
                        onClick={() => onSelectSecondary(opt.id)}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          isAgotado
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                            : active
                              ? 'border-[#4C1EDB] bg-white text-[#4C1EDB] shadow-2xs ring-1 ring-[#4C1EDB]/20 cursor-pointer'
                              : 'border-slate-200 bg-white/75 text-slate-700 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-slate-900/15"
                            style={{ backgroundColor: dotHex }}
                          />
                          <span>{opt.name}</span>
                          {isAgotado && (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 font-extrabold">
                              Agotado
                            </span>
                          )}
                        </span>
                        {active && <Check className="w-4 h-4 text-[#4C1EDB]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Base Color Swatches */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Color Disponible
                </h3>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-slate-800">{selectedColor.name}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-600 font-bold">
                    {selectedColor.stock.toLocaleString('es-ES')} disp.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(hideOutOfStock
                  ? product.colors.filter((c) => c.available && c.stock > 0)
                  : product.colors
                ).map((c) => {
                  const active = c.id === selectedColor.id;
                  const isAgotado = !c.available || c.stock <= 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={isAgotado}
                      onClick={() => onSelectColor(c.id)}
                      title={`${c.name} (${c.stock} disp.)${isAgotado ? ' - Agotado' : ''}`}
                      className={`group relative flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${
                        isAgotado
                          ? 'opacity-40 cursor-not-allowed border-dashed border-slate-300 bg-slate-50'
                          : active
                            ? 'border-[#4C1EDB] bg-violet-50/55 shadow-xs cursor-pointer'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <span
                        className="relative w-8 h-8 rounded-full shadow-inner flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: c.hex,
                          border: `2.5px solid ${c.trimHex || product.defaultRimHex || 'rgba(15,23,42,0.18)'}`,
                        }}
                      >
                        {active && (
                          <Check
                            className={`w-4 h-4 stroke-[3] ${
                              c.hex.toUpperCase().startsWith('#F') || c.hex.toUpperCase().startsWith('#E')
                                ? 'text-slate-900'
                                : 'text-white'
                            }`}
                          />
                        )}
                        {isAgotado && (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-extrabold bg-slate-950/40 rounded-full">
                            ✕
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-700 truncate w-full text-center">
                        {c.name.split(' ')[0]}
                      </span>
                      {isAgotado && (
                        <span className="text-[8px] font-extrabold text-rose-600 leading-none">
                          Agotado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {product.shape !== 'photo-product' &&
                product.colors.filter((c) => c.available).length > 2 && (
                  <button
                    type="button"
                    onClick={onShowAssortment}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-violet-50 hover:text-[#4C1EDB] text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Ver mi logo en todos los colores (Surtido)</span>
                  </button>
                )}
            </div>

            {/* Product Specs Highlights */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/75 space-y-1.5">
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500">
                Detalles de este producto
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
              <ul className="space-y-1 pt-1">
                {product.highlights.map((h, i) => (
                  <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: LOGO, PRINT TECHNIQUE & ADJUST ==================== */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Logo Upload Dropzone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Sube tu Logotipo
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    logo.isVector
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {logo.isVector ? 'Vector SVG · Óptimo' : 'Imagen Raster'}
                </span>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative rounded-2xl border-2 border-dashed p-3.5 transition-all cursor-pointer ${
                  isDragOver
                    ? 'border-[#4C1EDB] bg-violet-50/70'
                    : 'border-slate-200 bg-slate-50/70 hover:border-[#4C1EDB]/50 hover:bg-violet-50/25'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadFile(f);
                    e.target.value = '';
                  }}
                />
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden p-1.5 shrink-0">
                    <img
                      src={logo.originalUrl}
                      alt={logo.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{logo.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      SVG, PNG o JPG · <span className="text-[#4C1EDB] font-bold">Cambiar logo</span>
                    </p>
                  </div>
                  <Upload className="w-4 h-4 text-[#4C1EDB] shrink-0" />
                </div>
              </div>

              {!logo.isVector && (
                <button
                  type="button"
                  onClick={onToggleRemoveWhiteBg}
                  className={`mt-2 w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                    logo.removeWhiteBg
                      ? 'bg-violet-50 border-violet-200 text-[#4C1EDB] font-semibold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    Quitar fondo blanco automáticamente
                  </span>
                  <span
                    className={`w-8 h-4.5 rounded-full p-0.5 flex items-center ${
                      logo.removeWhiteBg ? 'bg-[#4C1EDB] justify-end' : 'bg-slate-200 justify-start'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                  </span>
                </button>
              )}

              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400">Logos demo:</span>
                {DEMO_LOGOS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onSelectDemoLogo(d)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      logo.id === d.id
                        ? 'bg-[#0D0E12] text-white border-[#0D0E12]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <ImageIcon className="w-2.5 h-2.5" />
                    {d.name.split('_')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Technique & Ink Mode */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Técnica y Color de Tinta
              </h3>

              <div className="grid grid-cols-2 gap-1.5">
                {PRINT_TECHNIQUES.map((tech) => {
                  const active = techniqueId === tech.id;
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => onChangeTechnique(tech.id)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-[#4C1EDB] bg-violet-50/70 ring-1 ring-[#4C1EDB]/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-extrabold text-slate-900 truncate">
                          {tech.shortName}
                        </span>
                        {tech.id === 'material-premium' && (
                          <Award className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[9.5px] font-semibold text-slate-500">
                        {tech.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'full', label: 'Full Color', dot: 'conic-gradient(#F72585,#FACC15,#22C55E,#3B82F6,#F72585)' },
                    { id: 'white', label: 'Blanco', dot: '#FFFFFF' },
                    { id: 'black', label: 'Negro', dot: '#0F172A' },
                    { id: 'custom', label: '1 Tinta', dot: customInkHex },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onChangeInkMode(m.id)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                      inkMode === m.id
                        ? 'border-[#4C1EDB] bg-violet-50/60 text-[#4C1EDB]'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-slate-300"
                      style={{ background: m.dot }}
                    />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {inkMode === 'custom' && (
                <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Palette className="w-3.5 h-3.5 text-slate-500 mr-1" />
                  {CUSTOM_INK_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => onChangeCustomInkHex(p.hex)}
                      title={p.name}
                      className={`w-6 h-6 rounded-full cursor-pointer ${
                        customInkHex.toLowerCase() === p.hex.toLowerCase()
                          ? 'ring-2 ring-[#4C1EDB] ring-offset-1'
                          : ''
                      }`}
                      style={{ backgroundColor: p.hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={customInkHex}
                    onChange={(e) => onChangeCustomInkHex(e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent"
                  />
                </div>
              )}

              {product.supportsFullBleed && (
                <div className="p-2.5 rounded-xl bg-violet-50/70 border border-violet-200/70 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-violet-950 flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-[#4C1EDB]" />
                    Cobertura
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onChangePrintCoverage('centered')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        printCoverage === 'centered'
                          ? 'bg-white text-[#4C1EDB] shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Centrado
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChangePrintCoverage('full-bleed');
                        onChangeInkMode('full');
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        printCoverage === 'full-bleed'
                          ? 'bg-white text-[#4C1EDB] shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Full Bleed
                    </button>
                  </div>
                </div>
              )}

              {product.hasPouch && (
                <button
                  type="button"
                  onClick={onTogglePouchPrint}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer ${
                    pouchPrint
                      ? 'bg-violet-50/75 border-violet-300 text-violet-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2 text-left">
                    <PackageCheck className="w-4 h-4 text-[#4C1EDB] shrink-0" />
                    <span>
                      Estampar también en funda (+{formatCurrency(product.pouchPrintSurcharge || 0.18)}/ud)
                    </span>
                  </span>
                  <span
                    className={`w-8 h-4.5 rounded-full p-0.5 flex items-center ${
                      pouchPrint ? 'bg-[#4C1EDB] justify-end' : 'bg-slate-200 justify-start'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                  </span>
                </button>
              )}

              {contrastWarning && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>{contrastWarning}</span>
                </div>
              )}
            </div>

            {/* Scale & Rotation Sliders */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Posición y Tamaño
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    onChangeTransform({ x: 0, y: 0, scale: 0.94, rotation: 0, opacity: 0.96 })
                  }
                  className="text-[11px] font-bold text-[#4C1EDB] hover:underline cursor-pointer"
                >
                  Centrar
                </button>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Sliders className="w-3 h-3" /> Tamaño
                  </span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {Math.round(logoTransform.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.35}
                  max={1.45}
                  step={0.02}
                  value={logoTransform.scale}
                  onChange={(e) =>
                    onChangeTransform({ ...logoTransform, scale: parseFloat(e.target.value) })
                  }
                  className="w-full studio-slider"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Rotación
                  </span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {logoTransform.rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  step={1}
                  value={logoTransform.rotation}
                  onChange={(e) =>
                    onChangeTransform({ ...logoTransform, rotation: parseInt(e.target.value, 10) })
                  }
                  className="w-full studio-slider"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 3: QUANTITY & OFFICIAL BCV PRICING ==================== */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Elige tu Cantidad
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                Mín. {product.minOrderQty} · Stock: {maxStock.toLocaleString('es-ES')}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {qtyPresets.map((q) => {
                const disabled = q > maxStock;
                const active = quantity === q;
                const tierUnit = getUnitPrice(
                  product,
                  q,
                  inkMode,
                  pouchPrint,
                  printCoverage,
                  techniqueId,
                  selectedSecondary
                );
                return (
                  <button
                    key={q}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChangeQuantity(q)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all tabular-nums ${
                      disabled
                        ? 'opacity-35 cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
                        : active
                          ? 'border-[#0D0E12] bg-[#0D0E12] text-white shadow-xs cursor-pointer'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 cursor-pointer'
                    }`}
                  >
                    <span className="block text-xs font-extrabold leading-tight">{q}</span>
                    <span
                      className={`block text-[9px] font-semibold mt-0.5 ${
                        active ? 'text-[#C0EE00]' : 'text-slate-400'
                      }`}
                    >
                      ${tierUnit.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/70 px-3 py-2.5 flex-1 focus-within:border-[#4C1EDB] focus-within:bg-white">
                <span className="text-xs text-slate-500 font-bold mr-2">Uds:</span>
                <input
                  type="number"
                  min={1}
                  max={maxStock}
                  step={10}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!Number.isNaN(val)) {
                      onChangeQuantity(Math.min(maxStock, Math.max(1, val)));
                    }
                  }}
                  className="w-full bg-transparent text-sm font-extrabold text-slate-900 outline-none tabular-nums"
                />
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-violet-50 border border-violet-200/70 text-right">
                <p className="text-[10px] font-bold text-[#4C1EDB] uppercase">Unitario</p>
                <p className="text-base font-extrabold text-slate-900 tabular-nums leading-tight">
                  {formatCurrency(unitPrice)}
                </p>
              </div>
            </div>

            {quantity < product.minOrderQty && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Cantidad flexible ({quantity} uds):</strong> Por debajo del lote sugerido ({product.minOrderQty} uds). Se aplica precio base. ¡Ideal para complementar tu orden con otros productos!
                </span>
              </div>
            )}

            {nextTier && nextTier.nextMinQty <= maxStock && (
              <button
                type="button"
                onClick={() => onChangeQuantity(nextTier.nextMinQty)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] hover:bg-emerald-100/70 transition-colors cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Sube a <strong>{nextTier.nextMinQty} uds</strong> y baja a{' '}
                    <strong>{formatCurrency(nextTier.nextUnitPrice)}/ud</strong>
                  </span>
                </span>
                <span className="font-extrabold text-emerald-700 shrink-0">Aplicar →</span>
              </button>
            )}

            {/* Transparent Price Breakdown Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Presupuesto Estimado (Ref. BCV)
              </p>
              <div className="flex justify-between text-slate-600">
                <span>
                  {quantity.toLocaleString('es-ES')} uds × {formatCurrency(unitPrice)}
                </span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {formatCurrency(subtotalBase)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA ({ivaPct}%)</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {formatCurrency(ivaAmount)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                <span>Total estimado</span>
                <span className="text-[#4C1EDB] tabular-nums">{formatCurrency(totalWithIva)}</span>
              </div>
              <p className="text-[10.5px] text-slate-400 pt-1">
                * Descuentos, cupones y envío opcional se aplican al confirmar el pedido.
              </p>
            </div>
          </div>
        )}

        {/* ==================== STEP 4: DESIGN APPROVAL & FINAL ORDER ==================== */}
        {step === 4 && (
          <div className="space-y-4">
            {/* Compact Summary of What Was Configured */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#4C1EDB]">
                Resumen listo para aprobar
              </p>
              <p className="font-extrabold text-slate-900 text-sm">{product.name}</p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700">
                  Color: {selectedColor.name}
                </span>
                {selectedSecondary && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700">
                    {selectedSecondary.name}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700">
                  {quantity.toLocaleString('es-ES')} uds
                </span>
                <span className="px-2 py-0.5 rounded-md bg-violet-50 border border-violet-200 font-bold text-[#4C1EDB]">
                  Total: {formatCurrency(totalWithIva)}
                </span>
              </div>
            </div>

            {/* Design Approval Status Button: Aprobado / En revisión */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
              <p className="text-xs font-extrabold text-slate-800">
                ¿Cómo deseas enviar este diseño?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeDesignStatus('aprobado')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    designStatus === 'aprobado'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobado</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeDesignStatus('en_revision')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    designStatus === 'en_revision'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>En revisión</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {designStatus === 'aprobado'
                  ? 'Listo para avanzar a pago (datos de pago o link directo) y producción inmediata.'
                  : 'Nuestro equipo revisará el arte contigo antes de emitir el cobro final.'}
              </p>
            </div>

            {/* Multi-Product Add & Continue Action Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-50 via-indigo-50/50 to-white border border-violet-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#4C1EDB] flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4" />
                  ¿Deseas agregar más productos a tu orden?
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Guarda este diseño y agrega otro artículo al pedido con el mismo logo o uno nuevo, diferentes cantidades y acabados.
              </p>
              {onAddAndConfigureAnother && (
                <button
                  type="button"
                  onClick={onAddAndConfigureAnother}
                  disabled={!selectedColor.available}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-violet-50/80 border-2 border-[#4C1EDB]/40 hover:border-[#4C1EDB] text-[#4C1EDB] text-xs font-extrabold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir este y personalizar otro producto</span>
                </button>
              )}
            </div>

            {/* Secondary Export & Share Tools */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={onAddToCart}
                disabled={!selectedColor.available || quantity < 1}
                className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  justAdded
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {justAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                <span>{justAdded ? 'Listo' : 'Al Carrito'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenShare}
                className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#4C1EDB]" />
                <span>Compartir</span>
              </button>

              <button
                type="button"
                onClick={onDownloadApproval}
                disabled={isExporting}
                className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>{isExporting ? '...' : 'Ficha PNG'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM FOOTER: Live Price + Guided Step Navigation */}
      <div className="p-4 border-t border-slate-200/80 bg-white/95 backdrop-blur-md space-y-2.5 safe-bottom shrink-0">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold text-slate-600">
              Total con IVA ({ivaPct}%)
            </p>
            <p className="text-[10px] text-slate-400 tabular-nums">
              {quantity.toLocaleString('es-ES')} uds × {formatCurrency(unitPrice)} · Envío opc.
            </p>
          </div>
          <p className="text-xl font-extrabold text-slate-900 tabular-nums font-display">
            {formatCurrency(totalWithIva)}
          </p>
        </div>

        {step < 4 ? (
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1) as WizardStep)}
                className="px-3.5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Atrás</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1) as WizardStep)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#4C1EDB] hover:bg-[#3B15B5] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>Siguiente: {STEP_META[step].short}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-3.5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              onClick={onQuickOrderNow}
              disabled={!selectedColor.available || quantity < 1}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer text-white active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed ${
                designStatus === 'aprobado'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {designStatus === 'aprobado'
                  ? `Confirmar Aprobado · ${formatCurrency(totalWithIva)}`
                  : `Enviar en Revisión · ${formatCurrency(totalWithIva)}`}
              </span>
            </button>
          </div>
        )}

        <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-[#F72585]" />
          Paso {step} de 4 · Puedes saltar a cualquier paso arriba.
        </p>
      </div>
    </aside>
  );
};

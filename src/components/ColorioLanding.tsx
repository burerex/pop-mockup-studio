import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  CreditCard,
  Handshake,
  Instagram,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Upload,
  Wand2,
} from 'lucide-react';
import { Product, SystemSettings } from '../types';
import { COMING_SOON_PRODUCTS, DEMO_LOGOS, formatCurrency } from '../data/products';
import { formatWhatsappDigits } from '../utils/linkTracker';
import { ColorioLogo } from './ColorioLogo';
import { FanMockupSvg } from './FanMockupSvg';
import { Footer2026 } from './Footer2026';
/* [OPTIONAL-FAN-BACKDROP:IMPORT] */
import { LandingInteractiveFanBackdrop } from './LandingInteractiveFanBackdrop';

interface ColorioLandingProps {
  products: Product[];
  settings: SystemSettings;
  onOpenStudio: (productId?: string, colorId?: string) => void;
  onOpenAdmin: () => void;
}

const DotMatrix: React.FC<{ color: string; className?: string }> = ({ color, className = '' }) => (
  <svg viewBox="0 0 88 64" className={className} aria-hidden="true">
    {[0, 1, 2, 3].map((col) =>
      [0, 1, 2].map((row) => (
        <circle
          key={`${col}-${row}`}
          cx={10 + col * 22}
          cy={10 + row * 22}
          r="3.8"
          fill={color}
        />
      ))
    )}
  </svg>
);

const StarburstWatermark: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#4C1EDB',
}) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
    <g fill={color}>
      {[0, 45, 90, 135].map((angle) => (
        <rect
          key={angle}
          x="87"
          y="8"
          width="26"
          height="184"
          rx="13"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
    </g>
  </svg>
);

export const ColorioLanding: React.FC<ColorioLandingProps> = ({
  products,
  settings,
  onOpenStudio,
  onOpenAdmin,
}) => {
  const mainFan = products[0];
  const heroColors = mainFan?.colors.filter((c) => c.available && c.stock > 0).slice(0, 6) || [];
  const [heroColorIdx, setHeroColorIdx] = useState(0);
  const [heroTilt, setHeroTilt] = useState({ rx: 0, ry: 0 });
  const [heroPreviewTab, setHeroPreviewTab] = useState<'catalogo' | 'mockup'>('catalogo');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [navPulseKey, setNavPulseKey] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const heroStageRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'hero', label: 'Inicio' },
    { id: 'productos', label: 'Catálogo Real' },
    { id: 'estudio-vivo', label: 'Cómo Funciona' },
    { id: 'lo-nuevo', label: 'Lo Nuevo' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setNavPulseKey((k) => k + 1);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const ids = ['hero', 'productos', 'estudio-vivo', 'lo-nuevo', 'contacto'];
    const handleScrollSpy = () => {
      const offset = 150;
      let current = 'hero';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= offset) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  const [userPickedColor, setUserPickedColor] = useState(false);
  useEffect(() => {
    if (userPickedColor || heroColors.length < 2) return;
    const timer = setInterval(() => {
      setHeroColorIdx((prev) => (prev + 1) % heroColors.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [userPickedColor, heroColors.length]);

  const activeHeroColor = heroColors[heroColorIdx] || mainFan.colors[0];
  const waDigits = formatWhatsappDigits(settings.mainWhatsapp || '584245252121');

  const handleHeroPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!heroStageRef.current) return;
    const rect = heroStageRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setHeroTilt({ rx: -ny * 8, ry: nx * 10 });
  };

  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];
  const visibleProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const marqueeItems = [
    'ABANICOS PLEGABLES',
    'BOLSAS ECOLÓGICAS',
    'TULAS PERSONALIZADAS',
    'LLAVEROS SUBLIMADOS',
    'LLAVEROS ACRÍLICO & 3D',
    'COOLERS 500ML · 520ML · 750ML',
    'VASOS LICOREROS',
    'BLOCK DE NOTAS',
    'MENOS MERCH DEL MONTÓN · MÁS MARCAS QUE DESTACAN',
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F7F6FB] text-slate-900 overflow-x-clip">
      {/* [OPTIONAL-FAN-BACKDROP:START] Self-contained interactive fan backdrop — remove this single tag + import to eliminate cleanly */}
      <LandingInteractiveFanBackdrop
        activeSection={activeSection}
        navPulseKey={navPulseKey}
        defaultBrandLogoUrl={settings.brandLogoLightUrl || undefined}
      />
      {/* [OPTIONAL-FAN-BACKDROP:END] */}

      {/* Sticky Glass Figma Navigation (1-finger smooth scroll + Desktop & Mobile) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80">
        <div className="h-15 sm:h-16 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavClick('hero')}
              className="cursor-pointer flex items-center"
              aria-label="Ir al inicio"
            >
              <ColorioLogo
                theme="light"
                dotTone="violet"
                customLogoUrl={settings.brandLogoLightUrl || undefined}
                className="h-8 sm:h-9 w-auto"
              />
            </button>
            <span className="hidden xl:inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-50 text-[#4C1EDB] border border-violet-200/70">
              <Sparkles className="w-3 h-3 text-[#F72585]" />
              Merchandising POP
            </span>
          </div>

          <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4C1EDB] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#4C1EDB] hover:bg-violet-50/80'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenStudio()}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#4C1EDB] hover:bg-[#3B15B5] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#C0EE00]" />
              <span>Catálogo Interactivo</span>
            </button>
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Mobile Native Horizontal Pill Nav Bar */}
        <nav
          aria-label="Navegación móvil"
          className="lg:hidden flex items-center gap-1.5 px-3.5 pb-2.5 overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#4C1EDB] text-white shadow-2xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-violet-50 hover:text-[#4C1EDB]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* HERO SECTION */}
      <section
        id="hero"
        className="relative z-10 scroll-mt-24 pt-8 pb-14 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-10 bg-transparent"
      >
        <div className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#4C1EDB]/12 blur-[110px]" />
        <div className="pointer-events-none absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full bg-[#F72585]/12 blur-[110px]" />
        <StarburstWatermark
          color="#4C1EDB"
          className="pointer-events-none absolute -right-24 top-10 w-[340px] h-[340px] opacity-[0.06] animate-spin-very-slow"
        />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-violet-200/80 shadow-xs text-[11px] font-extrabold text-[#4C1EDB]">
              <span className="w-2 h-2 rounded-full bg-[#C0EE00] ring-2 ring-[#4C1EDB]/30" />
              <span>@holacolorio · Importadores Directos · Venezuela</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl xl:text-[56px] font-extrabold tracking-tight text-[#0D0E12] leading-[1.03]">
              Menos merch del montón.{' '}
              <span className="bg-gradient-to-r from-[#4C1EDB] via-[#7C3AED] to-[#F72585] bg-clip-text text-transparent">
                Más marcas que destacan.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Catálogo oficial de productos promocionales con precios reales Referencia BCV. Entra
              al <strong className="text-slate-900">Catálogo Interactivo POP</strong>, sube tu logo
              paso a paso, aprueba tu diseño y obtén tu presupuesto exacto al instante.
            </p>

            {/* Primary CTA to Interactive Catalog */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenStudio()}
                className="group px-6 py-4 rounded-2xl bg-[#4C1EDB] hover:bg-[#0D0E12] text-white text-sm font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-violet-900/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Upload className="w-4 h-4 text-[#C0EE00]" />
                <span>Abrir Catálogo Interactivo POP</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href={`https://wa.me/${waDigits}?text=${encodeURIComponent(
                  '¡Hola equipo .colorío! Vi el catálogo web y quiero asesoría para personalizar productos con mi marca.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-4 rounded-2xl bg-white/95 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-800 text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{settings.mainWhatsappDisplay}</span>
              </a>
            </div>

            {/* Trust Stats Row */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
              <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/75 text-left">
                <p className="text-lg sm:text-xl font-extrabold text-[#4C1EDB] font-display">
                  {products.length} líneas
                </p>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Productos reales con foto
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/75 text-left">
                <p className="text-lg sm:text-xl font-extrabold text-[#F72585] font-display">
                  Ref. BCV
                </p>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Precios por volumen
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/75 text-left">
                <p className="text-lg sm:text-xl font-extrabold text-emerald-600 font-display">
                  4 pasos
                </p>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Mockup, aprueba y pide
                </p>
              </div>
            </div>
          </div>

          {/* Right Interactive Hero Card: Real Official Catalog Photo OR Live Mockup Switcher */}
          <div className="lg:col-span-6">
            <div
              ref={heroStageRef}
              onPointerMove={handleHeroPointerMove}
              onPointerLeave={() => setHeroTilt({ rx: 0, ry: 0 })}
              className="relative rounded-[28px] bg-white/92 backdrop-blur-xl border border-white shadow-2xl shadow-violet-900/10 p-4 sm:p-5 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setHeroPreviewTab('catalogo')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      heroPreviewTab === 'catalogo'
                        ? 'bg-[#0D0E12] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Catálogo Real
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroPreviewTab('mockup')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      heroPreviewTab === 'mockup'
                        ? 'bg-[#4C1EDB] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mockup en Vivo
                  </button>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase">
                  En Stock
                </span>
              </div>

              <div
                className="relative my-3 rounded-2xl overflow-hidden transition-transform duration-200 ease-out"
                style={{
                  transform: `perspective(900px) rotateX(${heroTilt.rx}deg) rotateY(${heroTilt.ry}deg)`,
                }}
              >
                {heroPreviewTab === 'catalogo' ? (
                  <img
                    src="/catalog/hero-cover.jpg"
                    alt="Catálogo oficial de productos promocionales .colorío"
                    className="w-full aspect-[12/11] object-cover rounded-2xl"
                  />
                ) : (
                  <div className="py-2 flex items-center justify-center bg-[#F6F7FA] rounded-2xl">
                    {mainFan && activeHeroColor && (
                      <div className="w-full max-w-[340px]">
                        <FanMockupSvg
                          product={mainFan}
                          baseHex={activeHeroColor.hex}
                          rimHex={activeHeroColor.trimHex || mainFan.defaultRimHex}
                          secondaryHex={activeHeroColor.hex}
                          techniqueId="vinil-plano"
                          inkMode="white"
                          printCoverage="centered"
                          pouchPrint={true}
                          logoUrl={DEMO_LOGOS[0].originalUrl}
                          logoAspectRatio={DEMO_LOGOS[0].aspectRatio}
                          logoTransform={{ x: 0, y: 0, scale: 0.9, rotation: 0, opacity: 0.96 }}
                          viewMode="presentation"
                          showPrintGuides={false}
                          instanceId="landing-hero-fan"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                {heroPreviewTab === 'mockup' ? (
                  <div className="flex items-center gap-1.5">
                    {heroColors.map((c, idx) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setUserPickedColor(true);
                          setHeroColorIdx(idx);
                        }}
                        title={c.name}
                        className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                          idx === heroColorIdx
                            ? 'scale-120 ring-2 ring-[#4C1EDB] ring-offset-1'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex, border: '1.5px solid #18181B' }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-slate-500">
                    Merch diseñado para destacar
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onOpenStudio(mainFan?.id, activeHeroColor?.id)}
                  className="text-xs font-extrabold text-[#4C1EDB] hover:text-[#F72585] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Personalizar paso a paso</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KINETIC MARQUEE BAND */}
      <div className="relative z-10 bg-[#0D0E12] text-white py-3.5 border-y border-white/10 overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-8">
          {[...marqueeItems, ...marqueeItems].map((text, idx) => (
            <span
              key={idx}
              className="flex items-center gap-8 text-xs sm:text-sm font-extrabold tracking-widest uppercase whitespace-nowrap"
            >
              <span
                className={
                  idx % 3 === 0
                    ? 'text-[#C0EE00]'
                    : idx % 3 === 1
                      ? 'text-white'
                      : 'text-[#F72585]'
                }
              >
                {text}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#4C1EDB]" />
            </span>
          ))}
        </div>
      </div>

      {/* SECTION 2: REAL OFFICIAL CATALOG GRID WITH REAL STUDIO PHOTOS & EDITABLE PRICES */}
      <section
        id="productos"
        className="relative z-10 scroll-mt-24 py-16 sm:py-22 px-4 sm:px-6 lg:px-10 bg-white/85 backdrop-blur-[2px]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#4C1EDB] mb-2">
                <Palette className="w-4 h-4 text-[#F72585]" />
                <span>Catálogo Oficial .colorío · Precios Reales</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D0E12] tracking-tight">
                Productos <span className="text-[#4C1EDB]">reales listos para tu marca</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-2xl">
                Haz clic en cualquier producto para abrir el{' '}
                <strong className="text-slate-900">Catálogo Interactivo</strong> y montar tu logo
                paso a paso.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenStudio()}
              className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#4C1EDB] hover:bg-[#0D0E12] text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-[#C0EE00]" />
              <span>Abrir Catálogo Interactivo</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0D0E12] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-[#4C1EDB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleProducts.map((prod) => {
              const sortedTiers = [...prod.priceTiers].sort((a, b) => a.unitPrice - b.unitPrice);
              const lowest = sortedTiers[0]?.unitPrice ?? 1.0;
              const firstColor = prod.colors.find((c) => c.available && c.stock > 0) || prod.colors[0];

              return (
                <div
                  key={prod.id}
                  className="group rounded-3xl bg-white border border-slate-200/85 hover:border-[#4C1EDB]/45 hover:shadow-xl hover:shadow-violet-900/5 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
                >
                  {/* Real Product Photo */}
                  <div className="relative h-52 bg-[#F5F6F9] overflow-hidden">
                    {prod.realImageUrl ? (
                      <img
                        src={prod.realImageUrl}
                        alt={prod.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <FanMockupSvg
                          product={prod}
                          baseHex={firstColor?.hex || '#4C1EDB'}
                          secondaryHex={firstColor?.hex || '#4C1EDB'}
                          logoUrl={DEMO_LOGOS[0].originalUrl}
                          logoAspectRatio={DEMO_LOGOS[0].aspectRatio}
                          logoTransform={{ x: 0, y: 0, scale: 0.85, rotation: 0, opacity: 0.92 }}
                          viewMode="2d"
                          instanceId={`card-${prod.id}`}
                        />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-sm text-[10px] font-extrabold text-[#4C1EDB] shadow-xs">
                      {prod.category}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#0D0E12]/88 text-[#C0EE00] text-[10.5px] font-extrabold tabular-nums">
                      Desde {formatCurrency(lowest)}
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {prod.sku} · Mín. {prod.minOrderQty} uds
                      </p>
                      <h3 className="font-display text-base font-extrabold text-slate-900 mt-0.5 leading-snug">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {prod.tagline}
                      </p>

                      {/* Real color swatches */}
                      <div className="flex items-center gap-1.5 mt-3">
                        {prod.colors.slice(0, 7).map((c) => (
                          <span
                            key={c.id}
                            title={c.name}
                            className="w-4 h-4 rounded-full border border-slate-900/20"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                        {prod.colors.length > 7 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            +{prod.colors.length - 7}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenStudio(prod.id, firstColor?.id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-violet-50 group-hover:bg-[#4C1EDB] text-[#4C1EDB] group-hover:text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Personalizar con mi Logo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW THE 4-STEP INTERACTIVE CATALOG WORKS */}
      <section
        id="estudio-vivo"
        className="relative z-10 scroll-mt-24 py-16 sm:py-20 px-4 sm:px-6 lg:px-10 bg-[#0D0E12]/94 text-white overflow-hidden"
      >
        <div className="pointer-events-none absolute top-0 left-1/4 w-[420px] h-[420px] rounded-full bg-[#4C1EDB]/25 blur-[130px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full bg-[#F72585]/20 blur-[130px]" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#C0EE00] text-[11px] font-extrabold uppercase tracking-wider mb-3">
              <Rocket className="w-3.5 h-3.5" />
              Experiencia Guiada Paso a Paso
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Visualiza, aprueba y cotiza en <span className="text-[#C0EE00]">4 pasos simples</span>
            </h2>
            <p className="text-sm text-slate-300 mt-2.5">
              Sin procesos complicados ni listas interminables: te guiamos paso a paso para que
              veas tu marca antes de producir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
            {[
              {
                icon: Palette,
                step: 'Paso 01',
                title: 'Elige producto y color',
                desc: 'Selecciona tu producto real, medida y tono disponible en inventario.',
              },
              {
                icon: Upload,
                step: 'Paso 02',
                title: 'Sube tu logotipo',
                desc: 'Carga SVG o PNG, quita el fondo blanco y ubícalo en vivo sobre la pieza.',
              },
              {
                icon: CheckCircle2,
                step: 'Paso 03',
                title: 'Calcula tu presupuesto',
                desc: 'Escoge tu volumen con precios oficiales Referencia BCV + IVA y envío opcional.',
              },
              {
                icon: CreditCard,
                step: 'Paso 04',
                title: 'Aprueba y paga',
                desc: 'Marca Aprobado o En revisión, comparte el link o realiza tu pago con datos o link directo.',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#4C1EDB] text-[#C0EE00] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10.5px] font-extrabold text-[#F72585] uppercase tracking-wider">
                    {s.step}
                  </p>
                  <h4 className="text-sm font-extrabold text-white">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => onOpenStudio()}
              className="px-7 py-4 rounded-2xl bg-[#C0EE00] hover:bg-white text-[#0D0E12] text-sm font-extrabold inline-flex items-center gap-2 shadow-xl transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>Comenzar Paso 1 en el Catálogo POP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: LO NUEVO (Page 9 Real Photos — Importadores Directos) */}
      <section
        id="lo-nuevo"
        className="relative z-10 scroll-mt-24 py-16 sm:py-20 px-4 sm:px-6 lg:px-10 bg-[#F7F6FB]/78"
      >
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0EE00] text-[#0D0E12] text-[11px] font-extrabold uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                Lo nuevo · Próximos productos
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D0E12]">
                Te mostramos nuestros <span className="text-[#4C1EDB]">próximos ingresos</span>
              </h2>
            </div>
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs text-slate-700">
              <Truck className="w-4 h-4 text-[#4C1EDB] shrink-0" />
              <span>
                <strong>Somos importadores directos:</strong> precios especiales por volumen.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMING_SOON_PRODUCTS.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-44 bg-[#F6F7FA] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-extrabold text-slate-900">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{item.tagline}</p>
                  </div>
                  <a
                    href={`https://wa.me/${waDigits}?text=${encodeURIComponent(
                      `¡Hola equipo .colorío! Me interesa reservar o cotizar por volumen el nuevo producto: *${item.name}*.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#4C1EDB] text-slate-700 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Consultar disponibilidad</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Brand Pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            <div className="relative rounded-[32px] bg-white border border-slate-200/80 p-7 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#4C1EDB] text-white flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#0D0E12]">
                  Materiales <span className="text-[#4C1EDB]">de calidad</span>
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Productos diseñados para <strong className="text-[#4C1EDB]">durar</strong> y
                transmitir <strong className="text-[#F72585]">confianza</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Resistentes', 'Premium', 'Garantía de calidad'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F72585]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative rounded-[32px] bg-gradient-to-br from-[#F4F1FF] to-white border border-violet-200/70 p-7 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#4C1EDB] text-white flex items-center justify-center">
                  <Handshake className="w-5 h-5" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#0D0E12]">
                  Atención <span className="text-[#4C1EDB]">personalizada</span>
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Te acompañamos desde la <strong className="text-[#4C1EDB]">idea</strong> hasta la{' '}
                <strong className="text-[#F72585]">entrega</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Asesoría rápida', 'Soluciones a tu medida', 'Entregas confiables'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl bg-white border border-violet-200/70 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-[#4C1EDB]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: HABLEMOS DE TU PROYECTO */}
      <section
        id="contacto"
        className="relative z-10 scroll-mt-24 py-14 sm:py-20 px-4 sm:px-6 lg:px-10 bg-white/85 backdrop-blur-[2px]"
      >
        <div className="max-w-5xl mx-auto relative rounded-[36px] bg-gradient-to-br from-[#F4F7CE] via-[#F6F8DB] to-[#EEEDFF] border border-slate-200/80 p-7 sm:p-12 overflow-hidden shadow-lg">
          <DotMatrix
            color="#4C1EDB"
            className="pointer-events-none hidden sm:block absolute top-7 right-8 w-20 opacity-70"
          />

          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <ColorioLogo
                theme="light"
                dotTone="violet"
                customLogoUrl={settings.brandLogoLightUrl || undefined}
                className="h-9 w-auto"
              />
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#0D0E12] leading-[1.05]">
                Hablemos <span className="text-[#4C1EDB]">de tu proyecto</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-700 font-medium">
                Tu próxima <strong className="text-[#F72585]">gran idea</strong> puede comenzar{' '}
                <strong className="text-[#4C1EDB]">aquí</strong>. Menos merch del montón, más marcas
                que destacan.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenStudio()}
                  className="px-6 py-3.5 rounded-2xl bg-[#4C1EDB] hover:bg-[#3B15B5] text-white text-sm font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Wand2 className="w-4 h-4 text-[#C0EE00]" />
                  <span>Ir al Catálogo Interactivo POP</span>
                </button>
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3.5 rounded-2xl bg-[#0D0E12] hover:bg-emerald-600 text-white text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#C0EE00]" />
                  <span>Escribir por WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="md:col-span-5 space-y-3">
              <a
                href="https://instagram.com/holacolorio"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/92 hover:bg-white border border-slate-200/80 shadow-2xs transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-[#4C1EDB] text-white flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10.5px] font-bold uppercase text-slate-400">Instagram</p>
                  <p className="text-sm font-extrabold text-slate-900">@holacolorio</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/92 hover:bg-white border border-slate-200/80 shadow-2xs transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-[#4C1EDB] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10.5px] font-bold uppercase text-slate-400">WhatsApp</p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {settings.mainWhatsappDisplay}
                  </p>
                </div>
              </a>

              <a
                href="mailto:holacolorio@gmail.com"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/92 hover:bg-white border border-slate-200/80 shadow-2xs transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-[#4C1EDB] text-white flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10.5px] font-bold uppercase text-slate-400">Correo</p>
                  <p className="text-sm font-extrabold text-slate-900">holacolorio@gmail.com</p>
                </div>
              </a>

              <button
                type="button"
                onClick={onOpenAdmin}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-slate-500 hover:text-[#4C1EDB] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Acceso Vendedores y Superadmin</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer2026
          mainWhatsapp={settings.mainWhatsapp}
          mainWhatsappDisplay={settings.mainWhatsappDisplay}
        />
      </div>
    </div>
  );
};

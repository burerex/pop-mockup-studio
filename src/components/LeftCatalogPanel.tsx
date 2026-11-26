import React, { useMemo, useState } from 'react';
import { Check, Package, ShieldCheck, Sparkles } from 'lucide-react';
import { Product, PromoBannerConfig } from '../types';
import { formatCurrency } from '../data/products';

interface LeftCatalogPanelProps {
  products: Product[];
  selectedProductId: string;
  onSelectProduct: (id: string) => void;
  promoBanner: PromoBannerConfig;
  hideOutOfStock?: boolean;
}

const MiniProductIcon: React.FC<{ shape: Product['shape']; accent: string; isWhiteRim?: boolean }> = ({
  shape,
  accent,
  isWhiteRim,
}) => {
  if (shape === 'circular-flex') {
    return (
      <svg viewBox="0 0 64 64" className="w-11 h-11 shrink-0">
        <circle
          cx="32"
          cy="32"
          r="23"
          fill={isWhiteRim ? '#FFFFFF' : accent}
          fillOpacity={isWhiteRim ? '1' : '0.16'}
          stroke={isWhiteRim ? '#94A3B8' : '#1E293B'}
          strokeWidth="3.2"
        />
        <circle
          cx="32"
          cy="32"
          r="17"
          fill="none"
          stroke={accent}
          strokeWidth="1"
          strokeDasharray="3 2.5"
          opacity="0.55"
        />
        <circle cx="32" cy="32" r="5" fill={accent} opacity="0.75" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="w-11 h-11 shrink-0">
      <path
        d="M 8 28 A 28 28 0 0 1 56 28 L 43 44 A 13 13 0 0 0 21 44 Z"
        fill={accent}
        fillOpacity="0.18"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <line x1="32" y1="53" x2="10" y2="28" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="53" x2="54" y2="28" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="53" x2="32" y2="24" stroke={accent} strokeWidth="1.4" opacity="0.55" />
      <line x1="32" y1="53" x2="21" y2="25" stroke={accent} strokeWidth="1.4" opacity="0.55" />
      <line x1="32" y1="53" x2="43" y2="25" stroke={accent} strokeWidth="1.4" opacity="0.55" />
      <circle cx="32" cy="53" r="3" fill={accent} />
    </svg>
  );
};

export const LeftCatalogPanel: React.FC<LeftCatalogPanelProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
  promoBanner,
  hideOutOfStock = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const selected = products.find((p) => p.id === selectedProductId) || products[0];

  const categories = useMemo(() => {
    const uniq = Array.from(new Set(products.map((p) => p.category)));
    return ['Todos', ...uniq];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todos') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <aside className="w-full lg:w-[292px] xl:w-[310px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col lg:h-full overflow-hidden">
      {/* Clean Customer-Facing Header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#4C1EDB]">
              Catálogo Oficial POP
            </p>
            <h2 className="text-sm font-bold text-slate-900">Elige tu producto</h2>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-[#4C1EDB]">
            {products.length} reales
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
          {categories.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0D0E12] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-[#4C1EDB]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Selector List */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-2.5 lg:overflow-y-auto flex-1">
        {filteredProducts.map((product) => {
          const isSelected = product.id === selectedProductId;
          const sortedTiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
          const lowestPrice = sortedTiers[sortedTiers.length - 1]?.unitPrice ?? 0.99;
          const displayColors = hideOutOfStock
            ? product.colors.filter((c) => c.available && c.stock > 0)
            : product.colors;
          const totalStock = product.colors
            .filter((c) => c.available && c.stock > 0)
            .reduce((sum, c) => sum + c.stock, 0);

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelectProduct(product.id)}
              className={`group relative text-left rounded-2xl p-2.5 border transition-all duration-200 cursor-pointer w-full ${
                isSelected
                  ? 'bg-violet-50/60 border-[#4C1EDB]/55 shadow-sm ring-1 ring-[#4C1EDB]/20'
                  : 'bg-white border-slate-200/75 hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-white border-violet-200 shadow-xs'
                      : 'bg-slate-50 border-slate-100 group-hover:bg-white'
                  }`}
                >
                  {product.realImageUrl ? (
                    <img
                      src={product.realImageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MiniProductIcon
                      shape={product.shape}
                      accent={isSelected ? '#4C1EDB' : '#475569'}
                      isWhiteRim={product.defaultRimHex?.toUpperCase().startsWith('#F')}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                      {product.sku}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#4C1EDB] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-900 leading-snug mt-0.5 truncate">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {product.capacity ? `${product.capacity} · ${product.dimensions}` : product.dimensions}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center -space-x-1">
                  {displayColors.slice(0, 6).map((c) => {
                    const isAgotado = !c.available || c.stock <= 0;
                    return (
                      <span
                        key={c.id}
                        className={`w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs relative ${
                          isAgotado ? 'opacity-35' : ''
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name}${isAgotado ? ' (Agotado)' : ''}`}
                      >
                        {isAgotado && (
                          <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white font-extrabold">
                            ✕
                          </span>
                        )}
                      </span>
                    );
                  })}
                  {displayColors.length > 6 && (
                    <span className="pl-2 text-[10px] font-semibold text-slate-400">
                      +{displayColors.length - 6}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 mr-1">Desde</span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(lowestPrice)}
                  </span>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                <span>Mín. {product.minOrderQty} uds</span>
                <span className="text-emerald-600 font-medium">
                  {totalStock.toLocaleString('es-ES')} disp.
                </span>
              </div>
            </button>
          );
        })}

        {/* Persuasive Corporate Message + Alusiva Product Image (Configurable from Admin) */}
        {promoBanner.enabled && (
          <div className="hidden lg:block mt-1 rounded-2xl overflow-hidden border border-violet-200/70 bg-gradient-to-b from-white to-violet-50/40 shadow-xs">
            {(selected.promoImageUrl || promoBanner.imageUrl) && (
              <div className="w-full h-32 bg-slate-900 overflow-hidden relative">
                <img
                  src={selected.promoImageUrl || promoBanner.imageUrl}
                  alt={promoBanner.headline}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3.5">
              <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#4C1EDB]">
                {promoBanner.eyebrow}
              </p>
              <h4 className="text-xs font-extrabold text-slate-900 mt-1 leading-snug">
                {promoBanner.headline}
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5">
                {promoBanner.body}
              </p>
              <div className="mt-2.5 pt-2 border-t border-violet-100 flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{promoBanner.ctaHint}</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Product Specs Mini-Card */}
        <div className="hidden lg:block rounded-2xl bg-slate-50/90 border border-slate-200/70 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-2">
            <Package className="w-3.5 h-3.5 text-[#4C1EDB]" />
            <span>Detalles del producto</span>
          </div>
          <ul className="space-y-1.5">
            {selected.highlights.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                <Sparkles className="w-3 h-3 text-[#F72585] mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Entrega estimada</span>
            <span className="font-semibold text-slate-700">{selected.leadTimeDays}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

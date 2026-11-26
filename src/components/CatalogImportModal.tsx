import React, { useState } from 'react';
import { Check, Code2, Copy, Download, Plus, Upload, X } from 'lucide-react';
import { Product, ProductShape } from '../types';

interface CatalogImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onReplaceProducts: (products: Product[]) => void;
}

export const CatalogImportModal: React.FC<CatalogImportModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onReplaceProducts,
}) => {
  const [tab, setTab] = useState<'quick' | 'json'>('quick');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('POP-NEW-01');
  const [shape, setShape] = useState<ProductShape>('circular-flex');
  const [dimensions, setDimensions] = useState('Ø 25 cm abierto');
  const [basePrice, setBasePrice] = useState('1.25');
  const [stock, setStock] = useState('1000');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(products, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const price = Math.max(0.1, parseFloat(basePrice) || 1.2);
    const inv = Math.max(50, parseInt(stock, 10) || 500);
    const template = products.find((p) => p.shape === shape) || products[0];

    const newProduct: Product = {
      ...template,
      id: `custom-${Date.now()}`,
      sku: sku.trim() || `POP-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      shortName: name.trim().slice(0, 18),
      dimensions: dimensions.trim() || template.dimensions,
      colors: template.colors.map((c, idx) => ({
        ...c,
        stock: idx === 0 ? inv : Math.round(inv * 0.65),
        available: true,
      })),
      priceTiers: [
        { minQty: 50, unitPrice: Number(price.toFixed(2)) },
        { minQty: 100, unitPrice: Number((price * 0.85).toFixed(2)) },
        { minQty: 250, unitPrice: Number((price * 0.72).toFixed(2)) },
        { minQty: 500, unitPrice: Number((price * 0.62).toFixed(2)) },
      ],
    };

    onAddProduct(newProduct);
    setName('');
    onClose();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setJsonError('El JSON debe ser un arreglo con al menos 1 producto.');
        return;
      }
      setJsonError(null);
      onReplaceProducts(parsed as Product[]);
      onClose();
    } catch {
      setJsonError('JSON inválido. Revisa comillas y comas.');
    }
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(products, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalogo-pop-studio.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-[560px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Gestionar Catálogo de Material POP
            </h2>
            <p className="text-xs text-slate-500">
              Agrega nuevas piezas o importa tu lista de productos y stock en JSON
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTab('quick')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                tab === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Producto Rápido</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setJsonText(JSON.stringify(products, null, 2));
                setTab('json');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                tab === 'json' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Importar / Exportar JSON</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {tab === 'quick' ? (
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del producto *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Abanico Eco Bambú Pro"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código SKU
                  </label>
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Plantilla visual del mockup
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'circular-flex', label: 'Circular Flexible' },
                      { id: 'conventional-fan', label: 'Convencional' },
                      { id: 'paddle-rigid', label: 'Paleta Rígida' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setShape(opt.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                        shape === opt.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dimensiones
                  </label>
                  <input
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Precio base (USD)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock inicial
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold transition-colors cursor-pointer"
              >
                Agregar al Catálogo del Estudio
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Edita o pega aquí el JSON de tu catálogo POP (colores, stock y precios):
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={copyJson}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Plantilla</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={11}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-[11px] leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {jsonError && (
                <p className="text-xs text-rose-600 font-medium">{jsonError}</p>
              )}

              <button
                type="button"
                onClick={handleImportJson}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Aplicar Catálogo JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import {
  Box,
  Crosshair,
  Eye,
  LayoutGrid,
  Layers,
  Moon,
  Move,
  RotateCcw,
  Sparkles,
  Sun,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  ColorVariant,
  InkMode,
  LogoTransform,
  PrintCoverage,
  PrintTechniqueId,
  Product,
  SecondaryOption,
  StudioViewMode,
} from '../types';
import { getInkLabel, getTechniqueById } from '../data/products';
import { FanMockupSvg } from './FanMockupSvg';
import { ColorioLogo } from './ColorioLogo';

interface MockupCanvasProps {
  product: Product;
  color: ColorVariant;
  secondaryOption?: SecondaryOption;
  techniqueId: PrintTechniqueId;
  inkMode: InkMode;
  customInkHex: string;
  printCoverage: PrintCoverage;
  pouchPrint: boolean;
  processedLogoUrl: string | null;
  whiteLogoUrl: string | null;
  blackLogoUrl: string | null;
  logoAspectRatio: number;
  logoTransform: LogoTransform;
  onChangeTransform: (next: LogoTransform) => void;
  viewMode: StudioViewMode;
  onChangeViewMode: (mode: StudioViewMode) => void;
  onSelectColor: (colorId: string) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  brandLogoLightUrl?: string;
  brandLogoDarkUrl?: string;
}

export const MockupCanvas: React.FC<MockupCanvasProps> = ({
  product,
  color,
  secondaryOption,
  techniqueId,
  inkMode,
  customInkHex,
  printCoverage,
  pouchPrint,
  processedLogoUrl,
  whiteLogoUrl,
  blackLogoUrl,
  logoAspectRatio,
  logoTransform,
  onChangeTransform,
  viewMode,
  onChangeViewMode,
  onSelectColor,
  svgRef,
  brandLogoLightUrl,
  brandLogoDarkUrl,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showGuides, setShowGuides] = useState(false);
  const [useCleanMockup, setUseCleanMockup] = useState(true);
  const [darkBackdrop, setDarkBackdrop] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [snapX, setSnapX] = useState(false);
  const [snapY, setSnapY] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 30 });

  const dragOriginRef = useRef<{
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const technique = getTechniqueById(techniqueId);

  const handleLogoPointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (viewMode === '3d' || viewMode === 'assortment') return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setIsDraggingLogo(true);
    dragOriginRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: logoTransform.x,
      startY: logoTransform.y,
    };
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (viewMode === '3d' && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({
        rx: -ny * 20,
        ry: nx * 24,
        glareX: 50 + nx * 38,
        glareY: 50 + ny * 38,
      });
      return;
    }

    if (!isDraggingLogo || !dragOriginRef.current || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const vbWidth = svgRef.current.viewBox?.baseVal?.width || 540;
    const vbHeight = svgRef.current.viewBox?.baseVal?.height || 540;
    const scaleToSvg = Math.max(
      vbWidth / (svgRect.width || 540),
      vbHeight / (svgRect.height || 540)
    );
    const dx = (e.clientX - dragOriginRef.current.pointerX) * scaleToSvg;
    const dy = (e.clientY - dragOriginRef.current.pointerY) * scaleToSvg;

    let nextX = Math.max(-95, Math.min(95, dragOriginRef.current.startX + dx));
    let nextY = Math.max(-85, Math.min(85, dragOriginRef.current.startY + dy));

    const snappedX = Math.abs(nextX) < 5;
    const snappedY = Math.abs(nextY) < 5;
    if (snappedX) nextX = 0;
    if (snappedY) nextY = 0;

    setSnapX(snappedX);
    setSnapY(snappedY);

    onChangeTransform({
      ...logoTransform,
      x: Math.round(nextX),
      y: Math.round(nextY),
    });
  };

  const handleStagePointerUp = () => {
    if (isDraggingLogo) {
      setIsDraggingLogo(false);
      setSnapX(false);
      setSnapY(false);
      dragOriginRef.current = null;
    }
  };

  const handleStagePointerLeave = () => {
    handleStagePointerUp();
    if (viewMode === '3d') {
      setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 30 });
    }
  };

  const centerLogo = () => {
    onChangeTransform({
      ...logoTransform,
      x: 0,
      y: 0,
      rotation: 0,
    });
  };

  const resetAllTransform = () => {
    onChangeTransform({
      x: 0,
      y: 0,
      scale: 0.94,
      rotation: 0,
      opacity: 0.96,
    });
    setZoom(1);
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={handleStagePointerMove}
      onPointerUp={handleStagePointerUp}
      onPointerLeave={handleStagePointerLeave}
      className={`relative flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-300 select-none ${
        isDraggingLogo ? 'touch-none' : 'touch-pan-y'
      } ${darkBackdrop ? 'studio-grid-dark' : 'studio-grid-light'}`}
    >
      {/* Subtle Ambient Aura behind the product */}
      <div
        className="pointer-events-none absolute w-[640px] h-[640px] rounded-full blur-[140px] transition-colors duration-700"
        style={{
          backgroundColor: viewMode === 'assortment' ? '#4C1EDB' : color.hex,
          opacity: darkBackdrop ? 0.22 : 0.12,
        }}
      />

      {/* Top Floating HUD with Bold Adaptive .colorío Logo */}
      <div className="absolute top-3.5 sm:top-4 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div
          className={`pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium border transition-colors max-w-full ${
            darkBackdrop
              ? 'bg-slate-900/85 border-white/10 text-slate-100 backdrop-blur-md'
              : 'glass-panel border-slate-200/80 text-slate-700 shadow-sm'
          }`}
        >
          <ColorioLogo
            theme={darkBackdrop ? 'dark' : 'light'}
            customLogoUrl={
              darkBackdrop
                ? brandLogoDarkUrl || brandLogoLightUrl || undefined
                : brandLogoLightUrl || undefined
            }
            className="h-6 sm:h-7 w-auto shrink-0"
          />
          <span className="opacity-25 shrink-0">|</span>
          <span
            className="w-3 h-3 rounded-full ring-2 ring-white/90 shadow-xs shrink-0"
            style={{ backgroundColor: color.hex }}
          />
          <span className="font-semibold truncate">
            {viewMode === 'assortment'
              ? `Surtido (${product.colors.filter((c) => c.available).length} colores)`
              : color.name}
          </span>
          <span className="hidden md:inline text-[11px] px-2 py-0.5 rounded-full bg-violet-500/12 text-[#4C1EDB] font-semibold shrink-0">
            {technique.shortName} · {getInkLabel(inkMode, customInkHex).split(' (')[0]}
          </span>
        </div>

        <div
          className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border shrink-0 ${
            darkBackdrop
              ? 'bg-slate-900/75 border-white/10 text-slate-300'
              : 'bg-white/80 border-slate-200/75 text-slate-500'
          }`}
        >
          {viewMode === '3d' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#4C1EDB]" />
              <span>Mueve el cursor para girar en 3D</span>
            </>
          ) : viewMode === 'assortment' ? (
            <>
              <LayoutGrid className="w-3.5 h-3.5 text-[#4C1EDB]" />
              <span>Clic en cualquier abanico para seleccionarlo</span>
            </>
          ) : (
            <>
              <Move className="w-3.5 h-3.5 text-[#4C1EDB]" />
              <span>Arrastra tu logo directo sobre el producto</span>
            </>
          )}
        </div>
      </div>

      {/* Responsive Screen-Fitting Mockup Stage with Generous Safe Margins on All 4 Sides */}
      <div
        className="relative w-full h-full flex items-center justify-center pt-[74px] pb-[86px] px-5 sm:pt-[82px] sm:pb-[94px] sm:px-10 lg:px-12"
        style={{ perspective: '1300px' }}
      >
        <div
          className="relative w-full h-full max-w-[960px] flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform:
              viewMode === '3d'
                ? `scale(${zoom}) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
                : `scale(${zoom})`,
            transformStyle: 'preserve-3d',
          }}
        >
          <FanMockupSvg
            svgRef={svgRef}
            product={product}
            baseHex={color.hex}
            rimHex={color.trimHex || product.defaultRimHex}
            secondaryHex={secondaryOption?.hex || 'MATCH'}
            secondaryId={secondaryOption?.id}
            inkMode={inkMode}
            techniqueId={techniqueId}
            logoUrl={processedLogoUrl}
            whiteLogoUrl={whiteLogoUrl}
            blackLogoUrl={blackLogoUrl}
            logoAspectRatio={logoAspectRatio}
            logoTransform={logoTransform}
            viewMode={viewMode}
            printCoverage={printCoverage}
            pouchPrint={pouchPrint}
            showPrintGuides={showGuides}
            useCleanMockup={useCleanMockup}
            isDraggingLogo={isDraggingLogo}
            snapX={snapX}
            snapY={snapY}
            instanceId="studio-main"
            onLogoPointerDown={handleLogoPointerDown}
            onSelectColorFromSpread={onSelectColor}
            activeColorId={color.id}
          />

          {viewMode === '3d' && (
            <div
              className="pointer-events-none absolute inset-6 rounded-full transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.03) 42%, transparent 70%)`,
                mixBlendMode: 'overlay',
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom Floating Glass Dock */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1.5 rounded-2xl glass-dock border border-slate-200/80 max-w-[94vw] overflow-x-auto">
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onChangeViewMode('2d')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === '2d'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Individual</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('presentation')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'presentation'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{product.hasPouch ? 'Con Funda' : 'Plegado'}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('assortment')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'assortment'
                ? 'bg-white text-[#4C1EDB] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Surtido</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('3d')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === '3d'
                ? 'bg-white text-[#4C1EDB] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Tilt</span>
          </button>
        </div>

        {/* Clean Mockup vs Showcase Photo Toggle */}
        {(product.cleanMockupUrl || product.realImageUrl) && (
          <button
            type="button"
            onClick={() => setUseCleanMockup((v) => !v)}
            title={
              useCleanMockup
                ? 'Ver foto vitrina con logo .colorío'
                : 'Ver base limpia para personalizar con tu arte'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              useCleanMockup
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-violet-50 text-[#4C1EDB] border border-violet-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {useCleanMockup ? '🧼 Base Limpia' : '📷 Vitrina .colorío'}
            </span>
            <span className="sm:hidden">
              {useCleanMockup ? 'Limpio' : 'Vitrina'}
            </span>
          </button>
        )}

        <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />

        <button
          type="button"
          onClick={() => setShowGuides((v) => !v)}
          title="Mostrar área segura de impresión"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            showGuides
              ? 'bg-violet-50 text-[#4C1EDB]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Guías</span>
        </button>

        <button
          type="button"
          onClick={centerLogo}
          title="Centrar logotipo"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="hidden sm:flex items-center gap-0.5 bg-slate-100/70 rounded-xl px-1 py-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.1).toFixed(2))))}
            title="Alejar"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetAllTransform}
            title="Restablecer vista"
            className="px-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 tabular-nums cursor-pointer"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.35, Number((z + 0.1).toFixed(2))))}
            title="Acercar"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />

        <button
          type="button"
          onClick={() => setDarkBackdrop((d) => !d)}
          title={darkBackdrop ? 'Mesa clara' : 'Mesa oscura (ideal para ver abanicos blancos)'}
          className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            darkBackdrop
              ? 'bg-slate-900 text-[#C0EE00]'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {darkBackdrop ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

import React, { useEffect, useId, useRef, useState } from 'react';
import { Eye, EyeOff, SlidersHorizontal, Sparkles, Upload, X } from 'lucide-react';

export type BackdropElementType = 'traditional-fan' | 'circular-fan' | 'off';

interface LandingInteractiveFanBackdropProps {
  /** Active landing section ID from the navigation bar (drives subtle open/close choreography) */
  activeSection: string;
  /** Incremented whenever the user clicks a navbar link to trigger a gentle fan-open pulse */
  navPulseKey: number;
  /** Optional default uploaded brand logo from Superadmin settings */
  defaultBrandLogoUrl?: string;
}

const BACKDROP_COLORS = [
  { id: 'violet', name: 'Violeta .colorío', hex: '#4C1EDB', ribHex: '#2E108C' },
  { id: 'royal', name: 'Azul Rey', hex: '#154EC2', ribHex: '#0F3482' },
  { id: 'sky', name: 'Azul Cielo', hex: '#1CA8E8', ribHex: '#0E6B96' },
  { id: 'pink', name: 'Magenta', hex: '#F72585', ribHex: '#A61156' },
  { id: 'yellow', name: 'Amarillo', hex: '#F2DC1D', ribHex: '#B89F07' },
  { id: 'red', name: 'Rojo', hex: '#DC2127', ribHex: '#8E1318' },
  { id: 'green', name: 'Verde', hex: '#16963B', ribHex: '#0E6327' },
  { id: 'obsidian', name: 'Negro', hex: '#18181B', ribHex: '#09090B' },
];

const BUILTIN_LOGO_PRESETS = [
  { id: 'colorio-wordmark', label: '.colorío' },
  { id: 'colorio-monogram', label: '.c' },
  { id: 'none', label: 'Sin logo' },
] as const;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * [OPTIONAL MODULE — SELF-CONTAINED]
 * Interactive realistic traditional folding fan (or circular flexible fan) backdrop
 * that opens & closes smoothly in response to pointer tracking, scroll depth, and navbar clicks.
 * Designed strictly behind foreground UI (z-0, calibrated translucency) so it never obstructs text.
 *
 * To remove completely with zero leftover code:
 * 1. Delete this file (`src/components/LandingInteractiveFanBackdrop.tsx`)
 * 2. Remove the single `[OPTIONAL-FAN-BACKDROP]` block in `src/components/ColorioLanding.tsx`.
 */
export const LandingInteractiveFanBackdrop: React.FC<LandingInteractiveFanBackdropProps> = ({
  activeSection,
  navPulseKey,
  defaultBrandLogoUrl,
}) => {
  const uid = useId().replace(/:/g, '');
  const [elementType, setElementType] = useState<BackdropElementType>('traditional-fan');
  const [colorId, setColorId] = useState<string>('violet');
  const [logoMode, setLogoMode] = useState<'colorio-wordmark' | 'colorio-monogram' | 'custom' | 'none'>(
    defaultBrandLogoUrl ? 'custom' : 'colorio-wordmark'
  );
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(defaultBrandLogoUrl || '');
  const [controlsOpen, setControlsOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smooth physics state (rendered via rAF at 60fps for realistic inertia)
  const targetRef = useRef({ open: 0.78, tiltDeg: 0, shiftX: 0, shiftY: 0 });
  const currentRef = useRef({ open: 0.14, tiltDeg: -10, shiftX: 0, shiftY: 0 });
  const [frame, setFrame] = useState({ open: 0.78, tiltDeg: 0, shiftX: 0, shiftY: 0 });

  const activeColor = BACKDROP_COLORS.find((c) => c.id === colorId) || BACKDROP_COLORS[0];

  // Respond to navigation section & navbar clicks with realistic open/close motion
  useEffect(() => {
    const sectionOpenMap: Record<string, number> = {
      hero: 0.88,
      productos: 0.62,
      'estudio-vivo': 0.96,
      calidad: 0.45,
      contacto: 0.84,
    };
    const nextOpen = sectionOpenMap[activeSection] ?? 0.78;
    targetRef.current.open = nextOpen;
  }, [activeSection]);

  // Brief graceful close-then-open sweep whenever the user clicks a navigation bar item
  useEffect(() => {
    if (navPulseKey === 0) return;
    targetRef.current.open = 0.2;
    const t = window.setTimeout(() => {
      targetRef.current.open = 0.92;
    }, 240);
    return () => window.clearTimeout(t);
  }, [navPulseKey]);

  // Pointer & Scroll tracking
  useEffect(() => {
    if (elementType === 'off') return;

    const handlePointerMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (e.clientX / w - 0.5) * 2; // -1..1
      const ny = (e.clientY / h - 0.5) * 2; // -1..1

      // Horizontal sweep + vertical distance control opening and natural wrist tilt
      const pointerOpen = Math.min(1, Math.max(0.16, 0.58 + (1 - Math.abs(ny)) * 0.34 + nx * 0.1));
      targetRef.current.open = pointerOpen;
      targetRef.current.tiltDeg = nx * 9;
      targetRef.current.shiftX = nx * 24;
      targetRef.current.shiftY = ny * 16;
    };

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      // Natural rhythmic breathing wave as the user scrolls down the page
      const wave = 0.55 + Math.sin(progress * Math.PI * 3.2) * 0.38;
      targetRef.current.open = Math.min(1, Math.max(0.14, wave));
      targetRef.current.tiltDeg = Math.cos(progress * Math.PI * 2.4) * 7;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    let rafId = 0;
    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      const ease = 0.085;

      cur.open += (tgt.open - cur.open) * ease;
      cur.tiltDeg += (tgt.tiltDeg - cur.tiltDeg) * ease;
      cur.shiftX += (tgt.shiftX - cur.shiftX) * ease;
      cur.shiftY += (tgt.shiftY - cur.shiftY) * ease;

      setFrame({
        open: Number(cur.open.toFixed(4)),
        tiltDeg: Number(cur.tiltDeg.toFixed(2)),
        shiftX: Number(cur.shiftX.toFixed(1)),
        shiftY: Number(cur.shiftY.toFixed(1)),
      });

      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, [elementType]);

  const handleUploadBackdropLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomLogoUrl(reader.result);
        setLogoMode('custom');
      }
    };
    reader.readAsDataURL(file);
  };

  // Traditional 13-rib fan geometry computed dynamically from `frame.open` (0.06 folded -> 1.0 full spread)
  const ribCount = 13;
  const cx = 500;
  const cy = 510;
  const outerR = 390;
  const innerR = 178;
  const maxSpread = 152;
  const currentSpread = 10 + frame.open * (maxSpread - 10);
  const startAngle = -currentSpread / 2;
  const stepAngle = currentSpread / (ribCount - 1);

  const isLightFan = activeColor.id === 'yellow';
  const logoFill = isLightFan ? '#0D0E12' : '#FFFFFF';
  const onDarkSection = activeSection === 'estudio-vivo';

  return (
    <>
      {/* FIXED NON-INTRUSIVE BACKGROUND LAYER (strictly behind foreground UI, pointer-events-none) */}
      {elementType !== 'off' && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center transition-opacity duration-500"
          style={{
            opacity: onDarkSection ? 0.22 : activeSection === 'hero' ? 0.28 : 0.18,
          }}
        >
          <div
            className="w-[min(115vw,1080px)] max-w-none transition-transform duration-75 will-change-transform"
            style={{
              transform: `translate3d(${frame.shiftX}px, ${frame.shiftY + 24}px, 0) rotate(${frame.tiltDeg}deg)`,
            }}
          >
            {elementType === 'traditional-fan' ? (
              <svg viewBox="0 0 1000 620" className="w-full h-auto overflow-visible">
                <defs>
                  <filter id={`fanShadow-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="#0F172A" floodOpacity="0.16" />
                  </filter>
                  <radialGradient id={`canopyLight-${uid}`} cx="50%" cy="22%" r="72%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
                    <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.04" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
                  </radialGradient>
                  <clipPath id={`canopyClip-${uid}`}>
                    {(() => {
                      const pStartOut = polar(cx, cy, outerR, startAngle);
                      const pEndOut = polar(cx, cy, outerR, startAngle + currentSpread);
                      const pEndIn = polar(cx, cy, innerR, startAngle + currentSpread);
                      const pStartIn = polar(cx, cy, innerR, startAngle);
                      const largeArc = currentSpread > 180 ? 1 : 0;
                      return (
                        <path
                          d={`M ${pStartOut.x} ${pStartOut.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${pEndOut.x} ${pEndOut.y} L ${pEndIn.x} ${pEndIn.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${pStartIn.x} ${pStartIn.y} Z`}
                        />
                      );
                    })()}
                  </clipPath>
                </defs>

                <g filter={`url(#fanShadow-${uid})`}>
                  {/* Pleated Fabric Canopy Segments (accordion fold shading) */}
                  {Array.from({ length: ribCount - 1 }).map((_, idx) => {
                    const a1 = startAngle + idx * stepAngle;
                    const a2 = a1 + stepAngle;
                    const mid = (a1 + a2) / 2;
                    const o1 = polar(cx, cy, outerR, a1);
                    const oMid = polar(cx, cy, outerR - 4 * (1 - frame.open * 0.5), mid);
                    const o2 = polar(cx, cy, outerR, a2);
                    const i2 = polar(cx, cy, innerR, a2);
                    const iMid = polar(cx, cy, innerR + 3, mid);
                    const i1 = polar(cx, cy, innerR, a1);
                    const isEven = idx % 2 === 0;
                    return (
                      <g key={idx}>
                        <path
                          d={`M ${o1.x} ${o1.y} L ${oMid.x} ${oMid.y} L ${iMid.x} ${iMid.y} L ${i1.x} ${i1.y} Z`}
                          fill={activeColor.hex}
                          opacity={isEven ? 0.96 : 0.86}
                        />
                        <path
                          d={`M ${oMid.x} ${oMid.y} L ${o2.x} ${o2.y} L ${i2.x} ${i2.y} L ${iMid.x} ${iMid.y} Z`}
                          fill={activeColor.hex}
                          opacity={isEven ? 0.8 : 0.94}
                        />
                      </g>
                    );
                  })}

                  {/* Canopy Specular Depth Overlay */}
                  <g clipPath={`url(#canopyClip-${uid})`}>
                    <rect x="60" y="70" width="880" height="460" fill={`url(#canopyLight-${uid})`} />

                    {/* Selected Logo expanding and folding realistically with the canopy */}
                    {logoMode !== 'none' && frame.open > 0.24 && (
                      <g
                        transform={`translate(${cx}, ${cy - 285}) scale(${Math.max(0.25, frame.open).toFixed(3)}, ${(0.72 + frame.open * 0.28).toFixed(3)})`}
                        opacity={Math.min(0.88, (frame.open - 0.22) * 1.4)}
                      >
                        {logoMode === 'custom' && customLogoUrl ? (
                          <image
                            href={customLogoUrl}
                            x="-95"
                            y="-55"
                            width="190"
                            height="110"
                            preserveAspectRatio="xMidYMid meet"
                          />
                        ) : logoMode === 'colorio-monogram' ? (
                          <g>
                            <circle cx="-26" cy="14" r="9" fill="#C0EE00" />
                            <text
                              x="6"
                              y="24"
                              textAnchor="middle"
                              fill={logoFill}
                              fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
                              fontWeight="800"
                              fontSize="74"
                            >
                              c
                            </text>
                          </g>
                        ) : (
                          <g>
                            <circle cx="-116" cy="12" r="9.5" fill={isLightFan ? '#4C1EDB' : '#C0EE00'} />
                            <text
                              x="4"
                              y="22"
                              textAnchor="middle"
                              fill={logoFill}
                              fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
                              fontWeight="800"
                              fontSize="62"
                              letterSpacing="-2.5"
                            >
                              colorıo
                            </text>
                            <path
                              d="M 46 -22 L 59 -34"
                              stroke="#F72585"
                              strokeWidth="7"
                              strokeLinecap="round"
                            />
                          </g>
                        )}
                      </g>
                    )}

                    {/* Pleat Crease Lines over logo for authentic printed-fabric realism */}
                    {Array.from({ length: ribCount }).map((_, idx) => {
                      const angle = startAngle + idx * stepAngle;
                      const pOut = polar(cx, cy, outerR + 4, angle);
                      const pIn = polar(cx, cy, innerR - 2, angle);
                      return (
                        <line
                          key={`crease-${idx}`}
                          x1={pIn.x}
                          y1={pIn.y}
                          x2={pOut.x}
                          y2={pOut.y}
                          stroke="#000000"
                          strokeOpacity="0.11"
                          strokeWidth="1.6"
                        />
                      );
                    })}
                  </g>

                  {/* 13 Articulated Structural Ribs (Varillas) */}
                  {Array.from({ length: ribCount }).map((_, idx) => {
                    const angle = startAngle + idx * stepAngle;
                    const isGuard = idx === 0 || idx === ribCount - 1;
                    const ribEnd = polar(cx, cy, isGuard ? outerR + 4 : innerR + 18, angle);
                    const ribBack = polar(cx, cy, 24, angle + 180);
                    return (
                      <line
                        key={`rib-${idx}`}
                        x1={ribBack.x}
                        y1={ribBack.y}
                        x2={ribEnd.x}
                        y2={ribEnd.y}
                        stroke={activeColor.ribHex}
                        strokeWidth={isGuard ? 11 : 6.5}
                        strokeLinecap="round"
                        opacity={isGuard ? 0.96 : 0.82}
                      />
                    );
                  })}

                  {/* Realistic Brass/Metallic Rivet Pivot */}
                  <circle cx={cx} cy={cy} r="17" fill={activeColor.ribHex} />
                  <circle cx={cx} cy={cy} r="8.5" fill="#E2E8F0" />
                  <circle cx={cx} cy={cy} r="4.5" fill="#94A3B8" />
                </g>
              </svg>
            ) : (
              /* Switchable Element 2: Circular Flexible Fan unfolding smoothly */
              <svg viewBox="0 0 760 560" className="w-full max-w-[640px] mx-auto h-auto overflow-visible">
                <g
                  transform={`translate(380, 280) scale(${(0.55 + frame.open * 0.45).toFixed(3)}) rotate(${(frame.tiltDeg * 1.4).toFixed(1)})`}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r="210"
                    fill={activeColor.hex}
                    stroke="#18181B"
                    strokeWidth="22"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="196"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.22"
                    strokeWidth="2"
                  />
                  {logoMode !== 'none' && (
                    <g opacity="0.88">
                      {logoMode === 'custom' && customLogoUrl ? (
                        <image
                          href={customLogoUrl}
                          x="-105"
                          y="-65"
                          width="210"
                          height="130"
                          preserveAspectRatio="xMidYMid meet"
                        />
                      ) : logoMode === 'colorio-monogram' ? (
                        <g>
                          <circle cx="-30" cy="18" r="11" fill="#C0EE00" />
                          <text
                            x="10"
                            y="30"
                            textAnchor="middle"
                            fill={logoFill}
                            fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
                            fontWeight="800"
                            fontSize="94"
                          >
                            c
                          </text>
                        </g>
                      ) : (
                        <g>
                          <circle cx="-116" cy="12" r="10" fill={isLightFan ? '#4C1EDB' : '#C0EE00'} />
                          <text
                            x="6"
                            y="24"
                            textAnchor="middle"
                            fill={logoFill}
                            fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
                            fontWeight="800"
                            fontSize="64"
                            letterSpacing="-2.4"
                          >
                            colorıo
                          </text>
                          <path
                            d="M 48 -20 L 62 -33"
                            stroke="#F72585"
                            strokeWidth="7.2"
                            strokeLinecap="round"
                          />
                        </g>
                      )}
                    </g>
                  )}
                </g>
              </svg>
            )}
          </div>
        </div>
      )}

      {/* DISCREET FLOATING OPTIONAL BACKDROP CONTROLS (Bottom-right corner, never obscures hero or CTA) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        {controlsOpen && (
          <div className="w-[272px] rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-3.5 space-y-3 text-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C1EDB] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F72585]" />
                Fondo Interactivo (Opcional)
              </span>
              <button
                type="button"
                onClick={() => setControlsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                aria-label="Cerrar controles de fondo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Element Switcher */}
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Elemento</p>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100">
                {(
                  [
                    { id: 'traditional-fan', label: 'Tradicional' },
                    { id: 'circular-fan', label: 'Circular' },
                    { id: 'off', label: 'Ocultar' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setElementType(opt.id)}
                    className={`py-1.5 px-1.5 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                      elementType === opt.id
                        ? 'bg-[#0D0E12] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {elementType !== 'off' && (
              <>
                {/* 2. Color Switcher */}
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                    Color ({activeColor.name})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {BACKDROP_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColorId(c.id)}
                        title={c.name}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                          colorId === c.id
                            ? 'scale-115 ring-2 ring-[#4C1EDB] ring-offset-1'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex, border: '1.5px solid rgba(15,23,42,0.2)' }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Logo Switcher + Upload Custom Logo */}
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                    Logo en el fondo
                  </p>
                  <div className="grid grid-cols-3 gap-1 mb-1.5">
                    {BUILTIN_LOGO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setLogoMode(p.id)}
                        className={`py-1.5 px-2 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-colors ${
                          logoMode === p.id
                            ? 'border-[#4C1EDB] bg-violet-50 text-[#4C1EDB]'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,.png,.webp,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadBackdropLogo(f);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-[#4C1EDB] text-white text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-[#C0EE00]" />
                    <span>{customLogoUrl ? 'Cambiar logo propio' : 'Subir logo al fondo'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setControlsOpen((v) => !v)}
          className="px-3 py-2 rounded-full bg-white/92 hover:bg-white backdrop-blur-md border border-slate-200/90 shadow-lg text-[11px] font-extrabold text-slate-700 hover:text-[#4C1EDB] flex items-center gap-1.5 transition-all cursor-pointer"
          title="Personalizar u ocultar abanico interactivo de fondo"
        >
          {elementType === 'off' ? (
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4C1EDB]" />
          )}
          <span className="hidden sm:inline">
            {elementType === 'off' ? 'Fondo: Off' : 'Fondo 3D'}
          </span>
          {elementType !== 'off' && <Eye className="w-3 h-3 text-emerald-600 sm:hidden" />}
        </button>
      </div>
    </>
  );
};

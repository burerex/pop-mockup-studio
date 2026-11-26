import React from 'react';
import {
  ColorVariant,
  InkMode,
  LogoTransform,
  PrintCoverage,
  PrintTechniqueId,
  Product,
  StudioViewMode,
} from '../types';
import { getLuminance } from '../data/products';

interface FanMockupSvgProps {
  product: Product;
  baseHex: string;
  rimHex?: string;
  secondaryHex: string;
  secondaryId?: string;
  inkMode?: InkMode;
  techniqueId?: PrintTechniqueId;
  logoUrl: string | null;
  whiteLogoUrl?: string | null;
  blackLogoUrl?: string | null;
  logoAspectRatio: number;
  logoTransform: LogoTransform;
  viewMode: StudioViewMode;
  printCoverage?: PrintCoverage;
  pouchPrint?: boolean;
  showPrintGuides?: boolean;
  useCleanMockup?: boolean;
  isDraggingLogo?: boolean;
  snapX?: boolean;
  snapY?: boolean;
  instanceId?: string;
  onLogoPointerDown?: (e: React.PointerEvent<SVGGElement>) => void;
  onSelectColorFromSpread?: (colorId: string) => void;
  activeColorId?: string;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function buildConventionalFabricPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number,
  pleats: number
): string {
  const step = (endDeg - startDeg) / pleats;
  const pts: string[] = [];

  for (let i = 0; i <= pleats; i++) {
    const a = startDeg + i * step;
    const r = i % 2 === 0 ? outerR : outerR - 4.2;
    const p = polarToCartesian(cx, cy, r, a);
    pts.push(`${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }

  for (let i = pleats; i >= 0; i--) {
    const a = startDeg + i * step;
    const r = i % 2 === 0 ? innerR : innerR - 2.4;
    const p = polarToCartesian(cx, cy, r, a);
    pts.push(`L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }
  pts.push('Z');
  return pts.join(' ');
}

function buildSinglePleatPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  a1: number,
  a2: number
): string {
  const p1 = polarToCartesian(cx, cy, outerR, a1);
  const p2 = polarToCartesian(cx, cy, outerR - 3.6, a2);
  const p3 = polarToCartesian(cx, cy, innerR - 2, a2);
  const p4 = polarToCartesian(cx, cy, innerR, a1);
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)} L ${p4.x.toFixed(2)} ${p4.y.toFixed(2)} Z`;
}

/** Authentic rounded U-shaped pocket pouch with curved bias-tape top mouth and realistic fabric creases */
const RealisticPouchSvg: React.FC<{
  uid: string;
  baseHex: string;
  rimHex: string;
  logoUrl: string | null;
  pouchPrint: boolean;
  logoAspectRatio: number;
  x: number;
  y: number;
  scale?: number;
}> = ({ uid, baseHex, rimHex, logoUrl, pouchPrint, logoAspectRatio, x, y, scale = 1 }) => {
  const isLightRim = rimHex.toUpperCase().startsWith('#F') || rimHex.toUpperCase().startsWith('#E');
  const bodyPath =
    'M -56 -36 Q 0 -51 56 -36 C 64 -4 62 34 38 52 C 18 65 -18 65 -38 52 C -62 34 -64 -4 -56 -36 Z';
  const topLipPath =
    'M -58 -36 Q 0 -52 58 -36 L 56 -24 Q 0 -39 -56 -24 Z';

  const maxW = 68;
  const maxH = 54;
  let lw = maxW;
  let lh = lw / (logoAspectRatio || 1);
  if (lh > maxH) {
    lh = maxH;
    lw = lh * (logoAspectRatio || 1);
  }

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id={`${uid}-pouch-vol`} cx="32%" cy="26%" r="76%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
          <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="82%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
        </radialGradient>
        <linearGradient id={`${uid}-lip-sheen`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
          <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.18" />
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <clipPath id={`${uid}-pouch-clip`}>
          <path d={bodyPath} />
        </clipPath>
      </defs>

      {/* Soft grounded table contact shadow */}
      <ellipse cx="0" cy="61" rx="50" ry="11" fill="#0F172A" opacity="0.20" />
      <ellipse cx="0" cy="59" rx="34" ry="6" fill="#0F172A" opacity="0.16" />

      {/* Plump pouch body */}
      <path
        d={bodyPath}
        fill={baseHex}
        stroke={isLightRim ? 'rgba(15,23,42,0.16)' : 'rgba(15,23,42,0.24)'}
        strokeWidth="1"
      />

      {/* Organic crumpled nylon fabric folds on pouch */}
      <g clipPath={`url(#${uid}-pouch-clip)`} pointerEvents="none">
        <path
          d="M -48 16 Q -18 28 10 48 M 46 10 Q 22 30 -8 52 M -44 -14 Q -8 -24 38 -6 M -26 40 Q 4 28 42 36"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.085"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M -44 13 Q -15 24 12 44 M 42 7 Q 18 26 -10 48 M -38 -16 Q -4 -26 36 -9"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {pouchPrint && logoUrl && (
        <g clipPath={`url(#${uid}-pouch-clip)`} pointerEvents="none">
          <image
            href={logoUrl}
            x={-lw / 2}
            y={-lh / 2 + 12}
            width={lw}
            height={lh}
            opacity={0.95}
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      )}

      {/* Puffed 3D lighting volume over pouch & logo */}
      <path d={bodyPath} fill={`url(#${uid}-pouch-vol)`} pointerEvents="none" />

      {/* Signature curved bias-tape top mouth rim */}
      <path
        d={topLipPath}
        fill={rimHex}
        stroke={isLightRim ? 'rgba(15,23,42,0.18)' : 'rgba(0,0,0,0.5)'}
        strokeWidth="0.95"
      />
      <path d={topLipPath} fill={`url(#${uid}-lip-sheen)`} pointerEvents="none" />
      <path
        d="M -55 -27.5 Q 0 -42 55 -27.5"
        fill="none"
        stroke={isLightRim ? 'rgba(15,23,42,0.22)' : 'rgba(255,255,255,0.28)'}
        strokeWidth="1"
        strokeDasharray="3.5 2.5"
      />
    </g>
  );
};

export const FanMockupSvg: React.FC<FanMockupSvgProps> = ({
  product,
  baseHex,
  rimHex,
  secondaryHex,
  secondaryId,
  inkMode = 'white',
  techniqueId = 'vinil-plano',
  logoUrl,
  whiteLogoUrl,
  blackLogoUrl,
  logoAspectRatio,
  logoTransform,
  viewMode,
  printCoverage = 'centered',
  pouchPrint = true,
  showPrintGuides = false,
  useCleanMockup = true,
  isDraggingLogo = false,
  snapX = false,
  snapY = false,
  instanceId = 'main',
  onLogoPointerDown,
  onSelectColorFromSpread,
  activeColorId,
  svgRef,
}) => {
  const uid = `m-${instanceId}`;
  const resolvedSecondary = secondaryHex === 'MATCH' ? baseHex : secondaryHex;
  const resolvedRim = rimHex || product.defaultRimHex || '#1A1C20';

  const isPresentation = viewMode === 'presentation';
  const isAssortment = viewMode === 'assortment';
  const isFullBleed = printCoverage === 'full-bleed' && product.supportsFullBleed;
  const isPremiumFinish = techniqueId === 'material-premium';

  // Generous padded viewBoxes so shadows and fan edges NEVER clip in live view or PNG export!
  const viewBox = (() => {
    if (product.shape === 'photo-product') return '0 0 560 540';
    if (isAssortment) return '0 0 860 560';
    if (product.shape === 'circular-flex') {
      return isPresentation ? '0 0 680 540' : '0 0 540 540';
    }
    return isPresentation ? '0 0 700 530' : '0 0 700 490';
  })();

  const area = product.printArea;
  const maxLogoW = area.width * 0.8;
  const maxLogoH = area.height * 0.8;
  let baseLogoW = maxLogoW;
  let baseLogoH = baseLogoW / (logoAspectRatio || 1);
  if (baseLogoH > maxLogoH) {
    baseLogoH = maxLogoH;
    baseLogoW = baseLogoH * (logoAspectRatio || 1);
  }

  const logoW = baseLogoW * logoTransform.scale;
  const logoH = baseLogoH * logoTransform.scale;

  const resolveSpreadLogoForColor = (hex: string): string | null => {
    if (!logoUrl) return null;
    if (inkMode === 'white' || inkMode === 'black') {
      const lum = getLuminance(hex);
      if (lum > 0.52) return blackLogoUrl || logoUrl;
      return whiteLogoUrl || logoUrl;
    }
    return logoUrl;
  };

  /** Photorealistic circular flexible fan disc */
  const renderCircularDiscUnit = (opts: {
    unitUid: string;
    cx: number;
    cy: number;
    r: number;
    fillHex: string;
    edgeRimHex: string;
    unitLogoUrl: string | null;
    interactive: boolean;
    fullBleed: boolean;
    showGuidesHere: boolean;
  }) => {
    const {
      unitUid,
      cx,
      cy,
      r,
      fillHex,
      edgeRimHex,
      unitLogoUrl,
      interactive,
      fullBleed,
      showGuidesHere,
    } = opts;
    const isLightRim =
      edgeRimHex.toUpperCase().startsWith('#F') || edgeRimHex.toUpperCase().startsWith('#E');
    const rimThickness = r * 0.068;
    const innerR = r - rimThickness;

    const relScale = r / 192;
    const uLogoW = logoW * relScale;
    const uLogoH = logoH * relScale;
    const uLogoCx = cx + logoTransform.x * relScale;
    const uLogoCy = cy + logoTransform.y * relScale;

    return (
      <g>
        <defs>
          {/* Multi-stop studio key light + subtle realistic dome falloff */}
          <radialGradient id={`${unitUid}-fabric-light`} cx="30%" cy="22%" r="78%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isLightRim ? '0.36' : '0.26'} />
            <stop offset="42%" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="80%" stopColor="#0F172A" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity={isLightRim ? '0.15' : '0.25'} />
          </radialGradient>

          {/* Rim shadow cast onto taut nylon surface */}
          <radialGradient id={`${unitUid}-rim-inner-shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="86%" stopColor="#000000" stopOpacity="0" />
            <stop offset="94%" stopColor="#000000" stopOpacity="0.09" />
            <stop offset="98.5%" stopColor="#000000" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.34" />
          </radialGradient>

          <linearGradient id={`${unitUid}-rim-bevel`} x1="12%" y1="6%" x2="88%" y2="94%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isLightRim ? '0.72' : '0.30'} />
            <stop offset="38%" stopColor="#FFFFFF" stopOpacity="0.03" />
            <stop offset="76%" stopColor="#000000" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#000000" stopOpacity={isLightRim ? '0.18' : '0.44'} />
          </linearGradient>

          {/* Subtle diagonal satin specular highlight across nylon */}
          <linearGradient id={`${unitUid}-satin-band`} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="34%" stopColor="#FFFFFF" stopOpacity={isPremiumFinish ? '0.18' : '0.09'} />
            <stop offset="46%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.06" />
          </linearGradient>

          {/* Authentic 190T polyester ripstop micro-weave */}
          <pattern id={`${unitUid}-weave`} width="4.5" height="4.5" patternUnits="userSpaceOnUse">
            <path d="M0 2.25 H4.5 M2.25 0 V4.5" stroke="#FFFFFF" strokeOpacity="0.065" strokeWidth="0.55" />
            <path d="M0 0 L4.5 4.5" stroke="#000000" strokeOpacity="0.028" strokeWidth="0.45" />
          </pattern>

          <clipPath id={`${unitUid}-disc-clip`}>
            <circle cx={cx} cy={cy} r={innerR + 0.5} />
          </clipPath>
        </defs>

        {/* Outer bias-tape rolled flexible wire rim */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={edgeRimHex}
          stroke={isLightRim ? 'rgba(15,23,42,0.16)' : 'rgba(0,0,0,0.42)'}
          strokeWidth="1.1"
        />
        <circle cx={cx} cy={cy} r={r} fill={`url(#${unitUid}-rim-bevel)`} />

        {/* Subtle authentic bias-tape fold overlap seam at bottom-right */}
        <g transform={`translate(${cx}, ${cy}) rotate(142)`}>
          <rect
            x={innerR - 0.5}
            y={-5.5 * relScale}
            width={rimThickness + 1}
            height={11 * relScale}
            rx={1.5 * relScale}
            fill={edgeRimHex}
            stroke={isLightRim ? 'rgba(15,23,42,0.24)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={0.95 * relScale}
          />
          <line
            x1={innerR}
            y1={-5 * relScale}
            x2={r}
            y2={-5 * relScale}
            stroke="rgba(0,0,0,0.38)"
            strokeWidth={1.2 * relScale}
          />
        </g>

        {/* Taut 190T Polyester Face */}
        <circle cx={cx} cy={cy} r={innerR} fill={fillHex} />
        <circle cx={cx} cy={cy} r={innerR} fill={`url(#${unitUid}-weave)`} />

        {/* Logo or Full-Bleed Sublimation Layer */}
        {unitLogoUrl && (
          <g clipPath={`url(#${unitUid}-disc-clip)`}>
            {fullBleed ? (
              <g
                transform={`translate(${cx + logoTransform.x * relScale}, ${cy + logoTransform.y * relScale}) rotate(${logoTransform.rotation})`}
                onPointerDown={interactive ? onLogoPointerDown : undefined}
                style={{
                  cursor: interactive && onLogoPointerDown ? (isDraggingLogo ? 'grabbing' : 'grab') : 'default',
                  touchAction: interactive && onLogoPointerDown ? 'none' : 'auto',
                }}
              >
                <image
                  href={unitLogoUrl}
                  x={-(innerR * 1.06 * logoTransform.scale)}
                  y={-(innerR * 1.06 * logoTransform.scale)}
                  width={innerR * 2.12 * logoTransform.scale}
                  height={innerR * 2.12 * logoTransform.scale}
                  opacity={logoTransform.opacity}
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
            ) : (
              <g
                transform={`translate(${uLogoCx}, ${uLogoCy}) rotate(${logoTransform.rotation})`}
                onPointerDown={interactive ? onLogoPointerDown : undefined}
                style={{
                  cursor: interactive && onLogoPointerDown ? (isDraggingLogo ? 'grabbing' : 'grab') : 'default',
                  touchAction: interactive && onLogoPointerDown ? 'none' : 'auto',
                }}
              >
                {interactive && onLogoPointerDown && (
                  <rect
                    x={-uLogoW / 2 - 16}
                    y={-uLogoH / 2 - 16}
                    width={uLogoW + 32}
                    height={uLogoH + 32}
                    fill="transparent"
                  />
                )}
                {/* Subtle vinyl heat-press micro-depth when using Vinil or Premium */}
                <image
                  href={unitLogoUrl}
                  x={-uLogoW / 2}
                  y={-uLogoH / 2}
                  width={uLogoW}
                  height={uLogoH}
                  opacity={logoTransform.opacity}
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    pointerEvents: interactive ? 'auto' : 'none',
                    filter: isPremiumFinish
                      ? 'drop-shadow(0px 1.2px 1.2px rgba(0,0,0,0.28))'
                      : 'drop-shadow(0px 0.6px 0.5px rgba(0,0,0,0.14))',
                  }}
                />

                {interactive && (showGuidesHere || isDraggingLogo) && (
                  <g pointerEvents="none">
                    <rect
                      x={-uLogoW / 2 - 2}
                      y={-uLogoH / 2 - 2}
                      width={uLogoW + 4}
                      height={uLogoH + 4}
                      fill="none"
                      stroke="#4C1EDB"
                      strokeWidth="1.4"
                      strokeDasharray={isDraggingLogo ? 'none' : '4 3'}
                      rx="3"
                    />
                    {[
                      [-uLogoW / 2 - 2, -uLogoH / 2 - 2],
                      [uLogoW / 2 + 2, -uLogoH / 2 - 2],
                      [-uLogoW / 2 - 2, uLogoH / 2 + 2],
                      [uLogoW / 2 + 2, uLogoH / 2 + 2],
                    ].map(([hx, hy], idx) => (
                      <rect
                        key={idx}
                        x={hx - 3.5}
                        y={hy - 3.5}
                        width="7"
                        height="7"
                        rx="1.5"
                        fill="#FFFFFF"
                        stroke="#4C1EDB"
                        strokeWidth="1.6"
                      />
                    ))}
                  </g>
                )}
              </g>
            )}
          </g>
        )}

        {/* Realistic Polyester Micro-Creases, Rim Tension Folds & Satin Light OVER logo */}
        <g clipPath={`url(#${unitUid}-disc-clip)`} pointerEvents="none">
          <path
            d={`
              M ${cx - innerR * 0.78} ${cy - innerR * 0.48} Q ${cx - innerR * 0.25} ${cy - innerR * 0.62} ${cx + innerR * 0.34} ${cy - innerR * 0.80}
              M ${cx + innerR * 0.62} ${cy - innerR * 0.44} Q ${cx + innerR * 0.78} ${cy + innerR * 0.08} ${cx + innerR * 0.56} ${cy + innerR * 0.66}
              M ${cx - innerR * 0.80} ${cy + innerR * 0.16} Q ${cx - innerR * 0.36} ${cy + innerR * 0.58} ${cx + innerR * 0.20} ${cy + innerR * 0.82}
              M ${cx - innerR * 0.24} ${cy + innerR * 0.76} Q ${cx + innerR * 0.28} ${cy + innerR * 0.54} ${cx + innerR * 0.76} ${cy + innerR * 0.16}
              M ${cx - innerR * 0.86} ${cy - innerR * 0.12} Q ${cx - innerR * 0.68} ${cy - innerR * 0.04} ${cx - innerR * 0.58} ${cy + innerR * 0.18}
            `}
            fill="none"
            stroke="#0F172A"
            strokeOpacity={isLightRim ? '0.055' : '0.08'}
            strokeWidth={3.2 * relScale}
            strokeLinecap="round"
          />
          <path
            d={`
              M ${cx - innerR * 0.74} ${cy - innerR * 0.44} Q ${cx - innerR * 0.22} ${cy - innerR * 0.58} ${cx + innerR * 0.36} ${cy - innerR * 0.76}
              M ${cx - innerR * 0.74} ${cy + innerR * 0.20} Q ${cx - innerR * 0.32} ${cy + innerR * 0.62} ${cx + innerR * 0.24} ${cy + innerR * 0.84}
              M ${cx + innerR * 0.58} ${cy - innerR * 0.40} Q ${cx + innerR * 0.74} ${cy + innerR * 0.12} ${cx + innerR * 0.52} ${cy + innerR * 0.68}
            `}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={isLightRim ? '0.32' : '0.14'}
            strokeWidth={2.0 * relScale}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={innerR} fill={`url(#${unitUid}-satin-band)`} />
          <circle cx={cx} cy={cy} r={innerR} fill={`url(#${unitUid}-rim-inner-shadow)`} />
          <circle cx={cx} cy={cy} r={innerR} fill={`url(#${unitUid}-fabric-light)`} />
        </g>

        {/* Fine top-stitched perimeter thread inside the bias tape */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR + 2.3 * relScale}
          fill="none"
          stroke={isLightRim ? 'rgba(15,23,42,0.18)' : 'rgba(255,255,255,0.26)'}
          strokeWidth={1.05 * relScale}
          strokeDasharray={`${4 * relScale} ${3 * relScale}`}
          pointerEvents="none"
        />

        {showGuidesHere && !fullBleed && (
          <g pointerEvents="none">
            <circle
              cx={cx}
              cy={cy}
              r={(area.width / 2) * relScale}
              fill="none"
              stroke="#4C1EDB"
              strokeWidth="1.4"
              strokeDasharray="6 5"
              opacity="0.88"
            />
            <text
              x={cx}
              y={cy - (area.width / 2) * relScale - 8}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#4C1EDB"
              letterSpacing="0.5"
            >
              ÁREA SEGURA · {area.physicalLabel}
            </text>
          </g>
        )}

        {interactive && isDraggingLogo && snapX && (
          <line
            x1={cx}
            y1={cy - innerR + 10}
            x2={cx}
            y2={cy + innerR - 10}
            stroke="#F72585"
            strokeWidth="1.35"
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}
        {interactive && isDraggingLogo && snapY && (
          <line
            x1={cx - innerR + 10}
            y1={cy}
            x2={cx + innerR - 10}
            y2={cy}
            stroke="#F72585"
            strokeWidth="1.35"
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}
      </g>
    );
  };

  // =========================================================================
  // WIDE MULTI-COLOR ASSORTMENT VIEW (860 x 560) — GENEROUS SAFE MARGINS
  // =========================================================================
  const renderAssortmentSpread = () => {
    const availableColors: ColorVariant[] = product.colors.filter(
      (c) => c.available && c.stock > 0
    );

    if (availableColors.length <= 2) {
      return (
        <g>
          <defs>
            <filter id={`${uid}-spread-sh`} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#0F172A" floodOpacity="0.16" />
            </filter>
          </defs>
          {availableColors.map((c, idx) => {
            const cx = availableColors.length === 1 ? 430 : idx === 0 ? 270 : 590;
            const cy = 236;
            const isActive = c.id === activeColorId;
            const spreadLogo = resolveSpreadLogoForColor(c.hex);
            return (
              <g
                key={c.id}
                filter={`url(#${uid}-spread-sh)`}
                onClick={() => onSelectColorFromSpread?.(c.id)}
                className="cursor-pointer"
              >
                {renderCircularDiscUnit({
                  unitUid: `${uid}-sp-${idx}`,
                  cx,
                  cy,
                  r: 154,
                  fillHex: c.hex,
                  edgeRimHex: c.trimHex || resolvedRim,
                  unitLogoUrl: spreadLogo,
                  interactive: false,
                  fullBleed: Boolean(isFullBleed),
                  showGuidesHere: false,
                })}
                {isActive && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={162}
                    fill="none"
                    stroke="#4C1EDB"
                    strokeWidth="2.8"
                    strokeDasharray="7 5"
                  />
                )}
                <text
                  x={cx}
                  y={cy + 184}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill={isActive ? '#4C1EDB' : '#475569'}
                >
                  {c.name}
                </text>
              </g>
            );
          })}
          {product.hasPouch && (
            <RealisticPouchSvg
              uid={`${uid}-sp-pouch`}
              baseHex={baseHex}
              rimHex={resolvedRim}
              logoUrl={resolveSpreadLogoForColor(baseHex)}
              pouchPrint={pouchPrint}
              logoAspectRatio={logoAspectRatio}
              x={430}
              y={476}
              scale={0.86}
            />
          )}
        </g>
      );
    }

    const displayColors = availableColors.slice(0, 8);
    const cols = displayColors.length <= 6 ? 3 : 4;
    const cellW = cols === 4 ? 194 : 246;
    const cellH = product.hasPouch ? 190 : 216;
    const radius = cols === 4 ? 75 : 88;
    const startX = 430 - ((cols - 1) * cellW) / 2;
    const startY = product.hasPouch ? 112 : 156;

    return (
      <g>
        <defs>
          <filter id={`${uid}-grid-sh`} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.18" />
          </filter>
        </defs>

        {displayColors.map((c, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const cx = startX + col * cellW;
          const cy = startY + row * cellH;
          const isActive = c.id === activeColorId;
          const spreadLogo = resolveSpreadLogoForColor(c.hex);

          return (
            <g
              key={c.id}
              onClick={() => onSelectColorFromSpread?.(c.id)}
              className="cursor-pointer transition-opacity hover:opacity-95"
            >
              <g filter={`url(#${uid}-grid-sh)`}>
                {product.shape === 'circular-flex' ? (
                  renderCircularDiscUnit({
                    unitUid: `${uid}-gr-${idx}`,
                    cx,
                    cy,
                    r: radius,
                    fillHex: c.hex,
                    edgeRimHex: c.trimHex || resolvedRim,
                    unitLogoUrl: spreadLogo,
                    interactive: false,
                    fullBleed: Boolean(isFullBleed),
                    showGuidesHere: false,
                  })
                ) : (
                  <g transform={`translate(${cx - 88}, ${cy - 78}) scale(0.255)`}>
                    <path
                      d={buildConventionalFabricPath(350, 408, 132, 304, -68, 68, 16)}
                      fill={c.hex}
                      stroke="rgba(15,23,42,0.18)"
                      strokeWidth="4"
                    />
                  </g>
                )}
              </g>

              {isActive && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius + 6}
                  fill="none"
                  stroke="#4C1EDB"
                  strokeWidth="2.8"
                />
              )}
              <text
                x={cx}
                y={cy + radius + 19}
                textAnchor="middle"
                fontSize="12"
                fontWeight={isActive ? '800' : '600'}
                fill={isActive ? '#4C1EDB' : '#475569'}
              >
                {c.name.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {product.hasPouch && product.shape === 'circular-flex' && (
          <g>
            <text
              x="430"
              y="432"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#64748B"
              letterSpacing="1.4"
            >
              FUNDAS AL TONO {pouchPrint ? '· CON LOGO IMPRESO' : '· INCLUIDAS'}
            </text>
            {displayColors.map((c, idx) => {
              const spacing = 92;
              const px = 430 - ((displayColors.length - 1) * spacing) / 2 + idx * spacing;
              return (
                <g
                  key={`p-${c.id}`}
                  onClick={() => onSelectColorFromSpread?.(c.id)}
                  className="cursor-pointer"
                >
                  <RealisticPouchSvg
                    uid={`${uid}-minip-${idx}`}
                    baseHex={c.hex}
                    rimHex={c.trimHex || resolvedRim}
                    logoUrl={resolveSpreadLogoForColor(c.hex)}
                    pouchPrint={pouchPrint}
                    logoAspectRatio={logoAspectRatio}
                    x={px}
                    y={488}
                    scale={0.54}
                  />
                </g>
              );
            })}
          </g>
        )}
      </g>
    );
  };

  // =========================================================================
  // 1. ABANICO CIRCULAR FLEXIBLE (540x540 Individual / 680x540 Con Funda)
  // =========================================================================
  const renderCircularFlex = () => {
    if (isAssortment) return renderAssortmentSpread();

    const mainCx = isPresentation ? 250 : 270;
    const mainCy = isPresentation ? 264 : 270;
    const mainR = isPresentation ? 200 : 216;

    return (
      <g>
        <defs>
          <filter id={`${uid}-shadow`} x="-25%" y="-25%" width="150%" height="155%">
            <feDropShadow dx="0" dy="22" stdDeviation="18" floodColor="#0F172A" floodOpacity="0.20" />
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.10" />
          </filter>
          <filter id={`${uid}-pouch-sh`} x="-30%" y="-25%" width="160%" height="165%">
            <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.24" />
          </filter>
        </defs>

        <g filter={`url(#${uid}-shadow)`}>
          {renderCircularDiscUnit({
            unitUid: `${uid}-main`,
            cx: mainCx,
            cy: mainCy,
            r: mainR,
            fillHex: baseHex,
            edgeRimHex: resolvedRim,
            unitLogoUrl: logoUrl,
            interactive: true,
            fullBleed: Boolean(isFullBleed),
            showGuidesHere: showPrintGuides,
          })}
        </g>

        {isPresentation && product.hasPouch && (
          <g filter={`url(#${uid}-pouch-sh)`}>
            <RealisticPouchSvg
              uid={`${uid}-pres-pouch`}
              baseHex={baseHex}
              rimHex={resolvedRim}
              logoUrl={logoUrl}
              pouchPrint={pouchPrint}
              logoAspectRatio={logoAspectRatio}
              x={536}
              y={334}
              scale={1.4}
            />
            <rect
              x="464"
              y="444"
              width="144"
              height="26"
              rx="13"
              fill="#0D0E12"
              fillOpacity="0.90"
            />
            <text
              x="536"
              y="461"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#FFFFFF"
              letterSpacing="0.6"
            >
              {pouchPrint ? 'FUNDA CON LOGO' : 'FUNDA AL TONO'}
            </text>
          </g>
        )}
      </g>
    );
  };

  // =========================================================================
  // 2. ABANICO CONVENCIONAL PLEGABLE (700x490 / 700x530 — ZERO CLIPPING!)
  // =========================================================================
  const renderConventionalFan = () => {
    if (isAssortment) return renderAssortmentSpread();

    const pivotX = 350;
    const pivotY = isPresentation ? 392 : 408;
    const innerR = 132;
    const outerR = 304;
    const startDeg = -68;
    const endDeg = 68;
    const pleats = 24;
    const ribCount = 13;

    const fabricPath = buildConventionalFabricPath(
      pivotX,
      pivotY,
      innerR,
      outerR,
      startDeg,
      endDeg,
      pleats
    );

    const isBamboo = secondaryId === 'bambu';
    const convLogoCx = pivotX + logoTransform.x * 1.08;
    const convLogoCy = pivotY - (innerR + outerR) / 2 + 6 + logoTransform.y * 1.08;
    const convLogoW = logoW * 1.12;
    const convLogoH = logoH * 1.12;

    return (
      <g>
        <defs>
          <filter id={`${uid}-fan-shadow`} x="-20%" y="-20%" width="140%" height="145%">
            <feDropShadow dx="0" dy="20" stdDeviation="16" floodColor="#0F172A" floodOpacity="0.20" />
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.10" />
          </filter>
          <linearGradient id={`${uid}-fabric-sheen`} x1="12%" y1="0%" x2="88%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.26" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.20" />
          </linearGradient>
          <radialGradient id={`${uid}-fabric-depth`} cx="50%" cy="88%" r="72%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
          </radialGradient>
          <pattern id={`${uid}-cloth-weave`} width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0 2 H4 M2 0 V4" stroke="#FFFFFF" strokeOpacity="0.06" strokeWidth="0.5" />
            <path d="M0 0 L4 4" stroke="#000000" strokeOpacity="0.03" strokeWidth="0.45" />
          </pattern>
          <linearGradient id={`${uid}-rivet`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id={`${uid}-rib-shade`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.30" />
          </linearGradient>
          <clipPath id={`${uid}-clip-conv`}>
            <path d={fabricPath} />
          </clipPath>
        </defs>

        <g filter={`url(#${uid}-fan-shadow)`}>
          {Array.from({ length: ribCount }).map((_, idx) => {
            const frac = idx / (ribCount - 1);
            const angle = startDeg + frac * (endDeg - startDeg);
            const isGuard = idx === 0 || idx === ribCount - 1;
            const ribW = isGuard ? 13 : 8.4;
            const ribLen = isGuard ? outerR + 3 : outerR - 8;

            return (
              <g key={idx} transform={`translate(${pivotX}, ${pivotY}) rotate(${angle})`}>
                <rect
                  x={-ribW / 2}
                  y={-ribLen}
                  width={ribW}
                  height={ribLen + 22}
                  rx={ribW / 2}
                  fill={resolvedSecondary}
                  stroke="rgba(15,23,42,0.20)"
                  strokeWidth="0.85"
                />
                <rect
                  x={-ribW / 2}
                  y={-ribLen}
                  width={ribW}
                  height={ribLen + 22}
                  rx={ribW / 2}
                  fill={`url(#${uid}-rib-shade)`}
                />
                {isBamboo && (
                  <line
                    x1="0"
                    y1={-innerR + 12}
                    x2="0"
                    y2="8"
                    stroke="#92400E"
                    strokeOpacity="0.26"
                    strokeWidth="1.2"
                    strokeDasharray="10 6"
                  />
                )}
              </g>
            );
          })}

          {/* Woven cloth canopy */}
          <path d={fabricPath} fill={baseHex} />
          <path d={fabricPath} fill={`url(#${uid}-cloth-weave)`} />
          <path d={fabricPath} fill="none" stroke="rgba(15,23,42,0.18)" strokeWidth="1.4" />
        </g>

        {logoUrl && (
          <g clipPath={`url(#${uid}-clip-conv)`}>
            <g
              transform={`translate(${convLogoCx}, ${convLogoCy}) rotate(${logoTransform.rotation})`}
              onPointerDown={onLogoPointerDown}
              style={{
                cursor: onLogoPointerDown ? (isDraggingLogo ? 'grabbing' : 'grab') : 'default',
                touchAction: onLogoPointerDown ? 'none' : 'auto',
              }}
            >
              {onLogoPointerDown && (
                <rect
                  x={-convLogoW / 2 - 14}
                  y={-convLogoH / 2 - 14}
                  width={convLogoW + 28}
                  height={convLogoH + 28}
                  fill="transparent"
                />
              )}
              <image
                href={logoUrl}
                x={-convLogoW / 2}
                y={-convLogoH / 2}
                width={convLogoW}
                height={convLogoH}
                opacity={logoTransform.opacity}
                preserveAspectRatio="xMidYMid meet"
                style={{
                  filter: isPremiumFinish
                    ? 'drop-shadow(0px 1.2px 1.2px rgba(0,0,0,0.28))'
                    : 'drop-shadow(0px 0.5px 0.5px rgba(0,0,0,0.12))',
                }}
              />
              {(showPrintGuides || isDraggingLogo) && (
                <rect
                  x={-convLogoW / 2 - 2}
                  y={-convLogoH / 2 - 2}
                  width={convLogoW + 4}
                  height={convLogoH + 4}
                  fill="none"
                  stroke="#4C1EDB"
                  strokeWidth="1.35"
                  strokeDasharray={isDraggingLogo ? 'none' : '4 3'}
                  rx="3"
                  pointerEvents="none"
                />
              )}
            </g>
          </g>
        )}

        {/* Realistic deeper accordion pleat shading + crease ridge highlights OVER the logo */}
        <g clipPath={`url(#${uid}-clip-conv)`} pointerEvents="none">
          {Array.from({ length: pleats }).map((_, i) => {
            const step = (endDeg - startDeg) / pleats;
            const a1 = startDeg + i * step;
            const a2 = startDeg + (i + 1) * step;
            const isLightFace = i % 2 === 0;
            const ridgeOuter = polarToCartesian(pivotX, pivotY, outerR, a1);
            const ridgeInner = polarToCartesian(pivotX, pivotY, innerR, a1);
            return (
              <g key={i}>
                <path
                  d={buildSinglePleatPath(pivotX, pivotY, innerR - 2, outerR + 2, a1, a2)}
                  fill={isLightFace ? '#FFFFFF' : '#0F172A'}
                  fillOpacity={isLightFace ? 0.13 : 0.15}
                />
                <line
                  x1={ridgeInner.x}
                  y1={ridgeInner.y}
                  x2={ridgeOuter.x}
                  y2={ridgeOuter.y}
                  stroke={isLightFace ? '#FFFFFF' : '#000000'}
                  strokeOpacity={isLightFace ? 0.18 : 0.14}
                  strokeWidth="0.9"
                />
              </g>
            );
          })}
          <path d={fabricPath} fill={`url(#${uid}-fabric-depth)`} />
          <path d={fabricPath} fill={`url(#${uid}-fabric-sheen)`} />
        </g>

        {/* Realistic Pivot Boss & Brass Rivet */}
        <g transform={`translate(${pivotX}, ${pivotY})`}>
          <circle cx="0" cy="2" r="16" fill="#0F172A" opacity="0.18" />
          <circle cx="0" cy="0" r="15.5" fill={resolvedSecondary} stroke="rgba(15,23,42,0.24)" strokeWidth="1.1" />
          <circle cx="0" cy="0" r="13" fill={`url(#${uid}-rib-shade)`} opacity="0.45" />
          <circle cx="0" cy="0" r="6.2" fill={`url(#${uid}-rivet)`} stroke="rgba(0,0,0,0.32)" strokeWidth="0.8" />
          <circle cx="-1.8" cy="-1.8" r="1.8" fill="#FFFFFF" opacity="0.8" />
        </g>

        {showPrintGuides && (
          <g pointerEvents="none">
            <path
              d={buildConventionalFabricPath(pivotX, pivotY, innerR + 26, outerR - 26, -44, 44, 16)}
              fill="none"
              stroke="#4C1EDB"
              strokeWidth="1.4"
              strokeDasharray="6 4"
              opacity="0.9"
            />
            <text
              x={pivotX}
              y={pivotY - outerR + 14}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#4C1EDB"
              letterSpacing="0.5"
            >
              ÁREA DE IMPRESIÓN · {area.physicalLabel}
            </text>
          </g>
        )}

        {isDraggingLogo && snapX && (
          <line
            x1={pivotX}
            y1={pivotY - outerR + 20}
            x2={pivotX}
            y2={pivotY - innerR - 10}
            stroke="#F72585"
            strokeWidth="1.35"
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}
        {isDraggingLogo && snapY && (
          <line
            x1={pivotX - 130}
            y1={pivotY - (innerR + outerR) / 2 + 6}
            x2={pivotX + 130}
            y2={pivotY - (innerR + outerR) / 2 + 6}
            stroke="#F72585"
            strokeWidth="1.35"
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}

        {isPresentation && (
          <g transform="translate(362, 446) rotate(-9)" filter={`url(#${uid}-fan-shadow)`}>
            <rect x="-126" y="-12" width="144" height="24" rx="4" fill={baseHex} stroke="rgba(15,23,42,0.18)" strokeWidth="0.9" />
            <rect x="-130" y="-9" width="260" height="18" rx="9" fill={resolvedSecondary} stroke="rgba(15,23,42,0.22)" strokeWidth="1" />
            <rect x="-130" y="-9" width="260" height="8" rx="4" fill="#FFFFFF" fillOpacity="0.22" />
            <circle cx="112" cy="0" r="4.8" fill={`url(#${uid}-rivet)`} />
            <g transform="rotate(9)">
              <rect x="-64" y="22" width="136" height="24" rx="12" fill="#0D0E12" fillOpacity="0.90" />
              <text x="4" y="38" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF" letterSpacing="0.5">
                PLEGADO · 23 CM
              </text>
            </g>
          </g>
        )}
      </g>
    );
  };

  const renderPhotoProduct = () => {
    const logoCenterX = area.cx + logoTransform.x;
    const logoCenterY = area.cy + logoTransform.y;

    return (
      <g>
        <defs>
          <filter id={`${uid}-photo-shadow`} x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#0F172A" floodOpacity="0.16" />
          </filter>
          <clipPath id={`${uid}-photo-frame`}>
            <rect x="34" y="28" width="492" height="464" rx="28" />
          </clipPath>
        </defs>

        {/* Studio Card Frame with Real Product Photo */}
        <g filter={`url(#${uid}-photo-shadow)`}>
          <rect
            x="34"
            y="28"
            width="492"
            height="464"
            rx="28"
            fill="#FFFFFF"
            stroke="rgba(15,23,42,0.08)"
            strokeWidth="1.5"
          />
          {(() => {
            const activePhotoUrl =
              useCleanMockup && product.cleanMockupUrl
                ? product.cleanMockupUrl
                : product.realImageUrl || product.cleanMockupUrl;
            return activePhotoUrl ? (
              <image
                href={activePhotoUrl}
                x="34"
                y="28"
                width="492"
                height="464"
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${uid}-photo-frame)`}
              />
            ) : null;
          })()}
          {/* Subtle top/bottom vignette for badge legibility */}
          <rect
            x="34"
            y="436"
            width="492"
            height="56"
            fill="rgba(13,14,18,0.72)"
            clipPath={`url(#${uid}-photo-frame)`}
          />
          <circle cx="62" cy="464" r="10" fill={baseHex} stroke="#FFFFFF" strokeWidth="2.5" />
          <text
            x="82"
            y="460"
            fontSize="12"
            fontWeight="800"
            fill="#FFFFFF"
            fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
          >
            {product.shortName}
          </text>
          <text
            x="82"
            y="476"
            fontSize="10"
            fontWeight="600"
            fill="#C0EE00"
            fontFamily="Inter, sans-serif"
          >
            {product.priceNote || product.dimensions}
          </text>
        </g>

        {/* Optional Dashed Print Area Guide */}
        {showPrintGuides && (
          <g pointerEvents="none">
            <rect
              x={area.cx - area.width / 2}
              y={area.cy - area.height / 2}
              width={area.width}
              height={area.height}
              rx="14"
              fill="rgba(76,30,219,0.07)"
              stroke="#4C1EDB"
              strokeWidth="1.6"
              strokeDasharray="6 4"
            />
            <text
              x={area.cx}
              y={area.cy - area.height / 2 - 8}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#4C1EDB"
            >
              ÁREA DE TU LOGO · ARRASTRA PARA UBICAR
            </text>
          </g>
        )}

        {/* Interactive Draggable Logo Overlay on Real Photo */}
        {logoUrl && (
          <g
            transform={`translate(${logoCenterX}, ${logoCenterY}) rotate(${logoTransform.rotation})`}
            onPointerDown={onLogoPointerDown}
            style={{ cursor: isDraggingLogo ? 'grabbing' : 'grab' }}
          >
            <rect
              x={-logoW / 2 - 8}
              y={-logoH / 2 - 8}
              width={logoW + 16}
              height={logoH + 16}
              rx="10"
              fill="transparent"
              stroke={isDraggingLogo ? '#4C1EDB' : 'transparent'}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <image
              href={logoUrl}
              x={-logoW / 2}
              y={-logoH / 2}
              width={logoW}
              height={logoH}
              preserveAspectRatio="xMidYMid meet"
              opacity={logoTransform.opacity}
            />
          </g>
        )}
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none overflow-visible"
    >
      {product.shape === 'circular-flex' && renderCircularFlex()}
      {product.shape === 'conventional-fan' && renderConventionalFan()}
      {product.shape === 'photo-product' && renderPhotoProduct()}
    </svg>
  );
};

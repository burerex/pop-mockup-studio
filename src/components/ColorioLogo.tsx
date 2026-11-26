import React, { useLayoutEffect, useRef, useState } from 'react';

interface ColorioLogoProps {
  /** 'light' = for light backgrounds (dark text + violet dot), 'dark' = for dark backgrounds (white text + lime dot) */
  theme?: 'light' | 'dark';
  dotTone?: 'violet' | 'lime' | 'pink';
  /** Optional uploaded original brand logo URL (PNG/SVG) from Superadmin settings */
  customLogoUrl?: string;
  className?: string;
}

/**
 * Bold, expressive .colorío brand wordmark faithfully matching @holacolorio's visual identity.
 * Automatically anchors the pink acute accent directly above the dotless 'ı' using exact glyph bounds,
 * and supports swapping in the official uploaded brand logo PNG/SVG anytime from Superadmin.
 */
export const ColorioLogo: React.FC<ColorioLogoProps> = ({
  theme = 'light',
  dotTone,
  customLogoUrl,
  className = 'h-9 w-auto',
}) => {
  const textRef = useRef<SVGTextElement | null>(null);
  // Accurate coordinates centered directly above the dotless 'ı' in "colorıo"
  const [accentPos, setAccentPos] = useState({ x: 122.5, y: 17.5 });

  useLayoutEffect(() => {
    if (customLogoUrl) return;
    const measureI = () => {
      const el = textRef.current;
      if (!el || typeof el.getExtentOfChar !== 'function') return;
      try {
        // Index 5 in "colorıo" is the dotless 'ı'
        const ext = el.getExtentOfChar(5);
        if (ext && ext.width > 0) {
          setAccentPos({
            x: ext.x + ext.width * 0.52,
            y: Math.max(13, ext.y - 2.2),
          });
        }
      } catch {
        // keep default
      }
    };

    measureI();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measureI).catch(() => {});
    }
  }, [customLogoUrl, theme]);

  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt=".colorío"
        className={`${className} object-contain select-none`}
      />
    );
  }

  const textColor = theme === 'dark' ? '#FFFFFF' : '#0D0E12';
  const resolvedDotTone = dotTone ?? (theme === 'dark' ? 'lime' : 'violet');
  const dotColor =
    resolvedDotTone === 'lime'
      ? '#C0EE00'
      : resolvedDotTone === 'pink'
        ? '#F72585'
        : '#4C1EDB';
  const accentColor = '#F72585';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 184 56"
      fill="none"
      className={className}
      aria-label=".colorío"
    >
      {/* Signature oversized leading dot */}
      <circle cx="12" cy="40.5" r="6.8" fill={dotColor} />

      {/* Bold geometric wordmark: colorıo */}
      <text
        ref={textRef}
        x="24"
        y="46"
        fill={textColor}
        fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
        fontWeight="800"
        fontSize="44"
        letterSpacing="-1.9"
      >
        colorıo
      </text>

      {/* Slanted magenta acute accent anchored directly above the dotless 'ı' */}
      <path
        d={`M ${(accentPos.x - 3.6).toFixed(1)} ${accentPos.y.toFixed(1)} L ${(accentPos.x + 5.8).toFixed(1)} ${(accentPos.y - 8.6).toFixed(1)}`}
        stroke={accentColor}
        strokeWidth="5.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ColorioMonogram: React.FC<{
  theme?: 'light' | 'dark';
  className?: string;
}> = ({ theme = 'light', className = 'w-9 h-9' }) => {
  const bg = theme === 'dark' ? '#161820' : '#FFFFFF';
  const border = theme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)';
  const letter = theme === 'dark' ? '#FFFFFF' : '#0D0E12';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 44 44"
      fill="none"
      className={className}
      aria-label=".c"
    >
      <circle cx="22" cy="22" r="20.5" fill={bg} stroke={border} strokeWidth="1.5" />
      <circle cx="12" cy="28.2" r="3.8" fill="#B8F000" />
      <text
        x="18.2"
        y="30.8"
        fill={letter}
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontWeight="800"
        fontSize="25"
      >
        c
      </text>
    </svg>
  );
};

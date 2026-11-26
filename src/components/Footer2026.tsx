import React from 'react';
import { MessageCircle } from 'lucide-react';
import { formatWhatsappDigits } from '../utils/linkTracker';

interface Footer2026Props {
  mainWhatsapp: string;
  mainWhatsappDisplay: string;
}

export const Footer2026: React.FC<Footer2026Props> = ({
  mainWhatsapp,
  mainWhatsappDisplay,
}) => {
  const digits = formatWhatsappDigits(mainWhatsapp || '584245252121');

  return (
    <footer className="relative shrink-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80">
      {/* Subtle 2026 signature .colorío gradient hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#4C1EDB] via-[#F72585] to-[#C0EE00] opacity-75" />

      <div className="px-4 lg:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-[#4C1EDB]" />
            Por{' '}
            <strong className="font-extrabold text-slate-900 tracking-tight">
              People Creativa, C.A.
            </strong>{' '}
            para{' '}
            <strong className="font-extrabold bg-gradient-to-r from-[#4C1EDB] to-[#F72585] bg-clip-text text-transparent">
              Colorio Merchandising
            </strong>
          </span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span className="text-[10.5px] text-slate-400 font-medium">© 2026</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10.5px] font-semibold text-slate-400">@holacolorio</span>
          <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10.5px] transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            <span>{mainWhatsappDisplay}</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

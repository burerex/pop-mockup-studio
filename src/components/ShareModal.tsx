import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Link2,
  MessageCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { TrackChannel } from '../types';
import { formatWhatsappDigits } from '../utils/linkTracker';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  whatsAppText: string;
  whatsappNumber: string;
  approvalCardUrl: string | null;
  productName: string;
  onDownloadApproval: () => void;
  onTrackShare: (channel: TrackChannel) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  whatsAppText,
  whatsappNumber,
  approvalCardUrl,
  productName,
  onDownloadApproval,
  onTrackShare,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const copyLink = async () => {
    onTrackShare('copy');
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const copySummary = async () => {
    onTrackShare('copy');
    try {
      await navigator.clipboard.writeText(whatsAppText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const digits = formatWhatsappDigits(whatsappNumber || '584245252121');
  const whatsAppHref = `https://wa.me/${digits}?text=${encodeURIComponent(whatsAppText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[560px] max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-[#4C1EDB] flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Compartir y Aprobar Diseño
              </h2>
              <p className="text-xs text-slate-500">
                Enlace rastreable con configuración exacta para aprobación
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div className="rounded-2xl border border-slate-200/80 bg-[#F4F5F8] p-2.5 overflow-hidden">
            {approvalCardUrl ? (
              <img
                src={approvalCardUrl}
                alt={`Ficha de aprobación ${productName}`}
                className="w-full h-auto rounded-xl shadow-xs"
              />
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                Generando vista previa de aprobación...
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Enlace rastreable directo a este modelo
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 truncate">
                <Link2 className="w-4 h-4 text-[#4C1EDB] shrink-0" />
                <span className="truncate select-all">{shareUrl}</span>
              </div>
              <button
                type="button"
                onClick={copyLink}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0D0E12] hover:bg-[#4C1EDB] text-white'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => onTrackShare('whatsapp')}
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={onDownloadApproval}
              className="py-3 px-4 rounded-2xl bg-[#4C1EDB] hover:bg-[#3B15B5] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Ficha PNG HD</span>
            </button>
          </div>

          <button
            type="button"
            onClick={copySummary}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? '¡Especificaciones copiadas!' : 'Copiar resumen técnico como texto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

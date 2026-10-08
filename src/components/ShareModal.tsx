import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import type { Garba } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getGarbaSlug } from '../utils/slug';

interface ShareModalProps {
  garba: Garba;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ garba, onClose }) => {
  const { language, t } = useLanguage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const slug = garba.slug || getGarbaSlug({ id: garba.id, title: garba.title, isBuiltin: garba.isBuiltin });
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://garbaraas.in';
  const canonicalUrl = `${siteUrl.replace(/\/$/, '')}/garba/${slug}`;

  const primaryTitle = garba.title[language] || garba.title.gu || garba.title.en || '';
  const shareText = `🚩 *${primaryTitle}* 🚩\n\n📖 Read full lyrics & listen on Garbaraas:\n${canonicalUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    let success = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(canonicalUrl);
        success = true;
      } catch {
        success = false;
      }
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = canonicalUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        success = false;
      }
    }

    const msg = language === 'gu' ? 'લિંક કોપી થઈ ગઈ!' : language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link copied to clipboard!';
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${primaryTitle} - Garbaraas`,
          text: `Read traditional Gujarati lyrics for "${primaryTitle}" on Garbaraas!`,
          url: canonicalUrl,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFF7E8] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-md w-full shadow-devotional text-[#351010] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#351010]/60 hover:text-[#351010] hover:bg-[#5A0808]/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#5A0808] border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#D4AF37] shadow">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="font-serif-heading text-lg font-bold text-[#5A0808]">
            {t.lyricsView.shareGarba}
          </h3>
          <p className="font-gujarati text-base font-bold text-[#351010]">
            {garba.title.gu}
          </p>
          {garba.title.en && (
            <p className="font-serif-heading text-xs text-[#720909]/80">
              {garba.title.en}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          {/* 1. Primary Action: Direct WhatsApp Link */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow hover:bg-[#20bd5a] transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{language === 'gu' ? 'વોટ્સએપ પર મોકલો' : language === 'hi' ? 'व्हाट्सएप पर भेजें' : 'Send on WhatsApp'}</span>
          </a>

          {/* 2. Secondary Action: Web Share API if supported */}
          {'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#5A0808] text-[#FFF7E8] font-semibold text-xs shadow hover:bg-[#720909] transition-all border border-[#D4AF37]/30"
            >
              <Share2 className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'gu' ? 'અન્ય ઍપ દ્વારા શેર કરો' : language === 'hi' ? 'अन्य ऐप से शेयर करें' : 'Share via other apps'}</span>
            </button>
          )}

          {/* 3. Secondary Action: Copy Link */}
          <div className="flex items-center gap-2 bg-[#FFF7E8] p-2 rounded-xl border border-[#D4AF37]/30 shadow-inner">
            <input
              type="text"
              readOnly
              value={canonicalUrl}
              className="flex-1 bg-transparent text-xs text-[#351010] font-mono px-2 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5A0808] text-[#FFF7E8] text-xs font-semibold hover:bg-[#720909] transition-colors border border-[#D4AF37]/30"
            >
              {toastMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{language === 'gu' ? 'કોપી થયું' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{language === 'gu' ? 'કોપી' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {toastMessage && (
            <p className="text-center text-xs font-semibold text-[#720909] pt-1 animate-in fade-in">
              {toastMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

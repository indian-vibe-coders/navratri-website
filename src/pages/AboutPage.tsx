import React from 'react';
import { BookmarkCheck, Shield, Globe, Music } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import navswarLogo from '../assets/navswar_logo.png';

export const AboutPage: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <div className="bg-[#5A0808] min-h-screen text-[#FFF7E8] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="font-serif-title text-2xl sm:text-4xl font-extrabold text-[#FFF7E8] tracking-wide">
            GarbaRaas — Navratri Garba Literature
          </h1>
          <p className="font-serif-heading text-sm sm:text-base text-[#D4AF37] max-w-xl mx-auto">
            {t.tagline}
          </p>
        </div>

        {/* Editorial Mission Showcase */}
        <div className="bg-[#351010]/80 border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-10 shadow-devotional space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 pb-6 border-b border-[#D4AF37]/20">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-[#5A0808] p-0.5 shrink-0 shadow">
              <img src={navswarLogo} alt="GarbaRaas Emblem" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <h2 className="font-serif-heading text-xl font-bold text-[#D4AF37]">
                {t.about.subtitle}
              </h2>
              <p className="font-gujarati text-xs text-[#FFF7E8]/80 mt-0.5">
                {t.about.missionTitle}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#FFF7E8]/90 font-sans">
            <p>{t.about.missionText}</p>
            <p>{t.about.audioPurposeText}</p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="bg-[#5A0808]/70 p-5 rounded-xl border border-[#D4AF37]/20 text-center space-y-2">
              <Music className="w-6 h-6 text-[#D4AF37] mx-auto" />
              <h4 className="font-serif-heading text-xs font-bold text-[#D4AF37]">
                {t.about.audioPurposeTitle}
              </h4>
              <p className="text-xs text-[#FFF7E8]/80 leading-relaxed">
                {language === 'gu'
                  ? 'ઓડિયો રેફરન્સ રેકોર્ડ અને લાઈક્સ સિસ્ટમ'
                  : language === 'hi'
                  ? 'ऑडियो संदर्भ रिकॉर्ड और लाइक सिस्टम'
                  : 'Voice reference recording & upvoted audio comments'}
              </p>
            </div>

            <div className="bg-[#5A0808]/70 p-5 rounded-xl border border-[#D4AF37]/20 text-center space-y-2">
              <Globe className="w-6 h-6 text-[#D4AF37] mx-auto" />
              <h4 className="font-serif-heading text-xs font-bold text-[#D4AF37]">
                {language === 'gu' ? 'બહુભાષી સાહિત્ય' : language === 'hi' ? 'बहुभाषी साहित्य' : 'Multilingual Lyrics'}
              </h4>
              <p className="text-xs text-[#FFF7E8]/80 leading-relaxed">
                {language === 'gu'
                  ? 'ગુજરાતી, હિન્દી અને અંગ્રેજી ભાષા સપોર્ટ'
                  : language === 'hi'
                  ? 'गुजराती, हिंदी और अंग्रेजी भाषा सपोर्ट'
                  : 'Full support for Gujarati, Hindi & English'}
              </p>
            </div>

            <div className="bg-[#5A0808]/70 p-5 rounded-xl border border-[#D4AF37]/20 text-center space-y-2">
              <Shield className="w-6 h-6 text-[#D4AF37] mx-auto" />
              <h4 className="font-serif-heading text-xs font-bold text-[#D4AF37]">
                {t.about.communityTitle}
              </h4>
              <p className="text-xs text-[#FFF7E8]/80 leading-relaxed">
                {t.about.communityText}
              </p>
            </div>
          </div>

          {/* Cultural Heritage Editorial Callout */}
          <div className="bg-[#5A0808]/90 text-[#FFF7E8] p-5 rounded-xl border border-[#D4AF37]/30 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider">
              <BookmarkCheck className="w-4 h-4" />
              <span>{t.attribution.sourceLabel}</span>
            </div>
            <p className="text-xs text-[#FFF7E8]/90 leading-relaxed">
              {t.footer.brandText}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};


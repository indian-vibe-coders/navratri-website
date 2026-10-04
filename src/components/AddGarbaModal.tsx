import React, { useState } from 'react';
import { X, Sparkles, Plus, Image as ImageIcon, Check } from 'lucide-react';
import type { Garba, GarbaCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AddGarbaModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Resolves true once saved; the modal stays open on failure so nothing typed is lost. */
  onAddGarba: (newGarba: Garba) => Promise<boolean>;
}

// Preset Covers for Quick Devotional Selection
const PRESET_COVERS = [
  { id: 'maa_durga', name: 'Maa Durga Divine', url: '/images/covers/cover_maa_durga.jpg' },
  { id: 'garba_dancers', name: 'Garba Raas Dancers', url: '/images/covers/cover_garba_dancers.jpg' },
  { id: 'lotus_diya', name: 'Sacred Lotus Diya', url: '/images/covers/cover_lotus_diya.jpg' },
  { id: 'sacred_om', name: 'Holy Om & Temple', url: '/images/covers/cover_sacred_om.jpg' },
];

// Gujarati to English/Hindi Transliteration Dictionary & Phonetic Mapper
const GUJ_TO_ENG_MAP: Record<string, string> = {
  'અ': 'A', 'આ': 'Aa', 'ઇ': 'I', 'ઈ': 'Ee', 'ઉ': 'U', 'ઊ': 'Oo', 'એ': 'E', 'ઐ': 'Ai', 'ઓ': 'O', 'ઔ': 'Au',
  'ક': 'K', 'ખ': 'Kh', 'ગ': 'G', 'ઘ': 'Gh', 'ચ': 'Ch', 'છ': 'Chh', 'જ': 'J', 'ઝ': 'Zh', 'ટ': 'T', 'ઠ': 'Th',
  'ડ': 'D', 'ઢ': 'Dh', 'ણ': 'N', 'ત': 'T', 'થ': 'Th', 'દ': 'D', 'ધ': 'Dh', 'ન': 'N', 'પ': 'P', 'ફ': 'F',
  'બ': 'B', 'ભ': 'Bh', 'મ': 'M', 'ય': 'Y', 'ર': 'R', 'લ': 'L', 'વ': 'V', 'શ': 'Sh', 'ષ': 'Sh', 'સ': 'S',
  'હ': 'H', 'ળ': 'L', 'ા': 'a', 'િ': 'i', 'ી': 'ee', 'ુ': 'u', 'ૂ': 'oo', 'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au',
  'ં': 'n', 'ઃ': 'h', '્': '', ' ': ' '
};

const GUJ_TO_HIN_MAP: Record<string, string> = {
  'અ': 'अ', 'આ': 'आ', 'ઇ': 'इ', 'ઈ': 'ई', 'ઉ': 'उ', 'ઊ': 'ऊ', 'એ': 'ए', 'ઐ': 'ऐ', 'ઓ': 'ओ', 'ઔ': 'औ',
  'ક': 'क', 'ખ': 'ख', 'ગ': 'ग', 'ઘ': 'घ', 'ચ': 'च', 'છ': 'छ', 'જ': 'ज', 'ઝ': 'झ', 'ટ': 'ट', 'ઠ': 'ठ',
  'ડ': 'ड', 'ઢ': 'ढ', 'ણ': 'ण', 'ત': 'त', 'થ': 'थ', 'દ': 'द', 'ધ': 'ध', 'ન': 'न', 'પ': 'प', 'ફ': 'फ',
  'બ': 'ब', 'ભ': 'भ', 'મ': 'म', 'ય': 'य', 'ર': 'र', 'લ': 'ल', 'વ': 'व', 'શ': 'श', 'ષ': 'ष', 'સ': 'स',
  'હ': 'ह', 'ળ': 'ल', 'ા': 'ा', 'િ': 'ि', 'ી': 'ी', 'ુ': 'ु', 'ૂ': 'ू', 'ે': 'े', 'ૈ': 'ै', 'ો': 'ो', 'ૌ': 'ौ',
  'ં': 'ं', 'ઃ': 'ः', '્': '्', ' ': ' '
};

function transliterateText(text: string, map: Record<string, string>): string {
  let result = '';
  for (const char of text) {
    result += map[char] !== undefined ? map[char] : char;
  }
  return result.replace(/\s+/g, ' ').trim();
}

export const AddGarbaModal: React.FC<AddGarbaModalProps> = ({
  isOpen,
  onClose,
  onAddGarba,
}) => {
  const { language } = useLanguage();
  const [titleGu, setTitleGu] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [isAutoConverted, setIsAutoConverted] = useState(false);
  const [category, setCategory] = useState<GarbaCategory>('Traditional');
  const [deity, setDeity] = useState('Maa Amba');
  const [selectedCoverUrl, setSelectedCoverUrl] = useState(PRESET_COVERS[0].url);
  
  // Lyrics stanzas
  const [stanzaGu, setStanzaGu] = useState('');
  const [stanzaHi, setStanzaHi] = useState('');
  const [stanzaEn, setStanzaEn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Real-time Title Change Handler with Auto Conversion
  const handleGujaratiTitleChange = (val: string) => {
    setTitleGu(val);
    if (val.trim()) {
      const autoEn = transliterateText(val, GUJ_TO_ENG_MAP);
      const autoHi = transliterateText(val, GUJ_TO_HIN_MAP);
      setTitleEn(autoEn);
      setTitleHi(autoHi);
      setIsAutoConverted(true);
    } else {
      setTitleEn('');
      setTitleHi('');
      setIsAutoConverted(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!titleGu.trim() || !stanzaGu.trim()) {
      alert('Please enter at least Gujarati title and Gujarati lyrics stanza!');
      return;
    }

    const guLines = stanzaGu.split('\n').filter((l) => l.trim());
    const hiLines = (stanzaHi || stanzaGu).split('\n').filter((l) => l.trim());
    const enLines = (stanzaEn || stanzaGu).split('\n').filter((l) => l.trim());

    const newGarbaId = `custom-garba-${Date.now()}`;
    const newGarba: Garba = {
      id: newGarbaId,
      title: {
        gu: titleGu.trim(),
        hi: titleHi.trim() || titleGu.trim(),
        en: titleEn.trim() || titleGu.trim(),
      },
      category,
      deity: deity.trim() || 'Maa Amba',
      isFeatured: false,
      isPopular: true,
      tags: ['User Added', category, deity.trim()],
      description: {
        gu: 'સમુદાયના શ્રદ્ધાળુ દ્વારા સમર્પિત કસ્ટમ ગરબો.',
        hi: 'समुदाय के श्रद्धालु द्वारा समर्पित कस्टम गरबा।',
        en: 'A user-submitted custom devotional Garba added to the NavSwar community library.',
      },
      artworkUrl: selectedCoverUrl || PRESET_COVERS[0].url,
      lyricsSource: {
        name: 'NavSwar Devotional Community Submission',
        url: '#',
      },
      audioReference: {
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=indian-instrumental-flute-and-sitar-112348.mp3',
        duration: '04:00',
        tempo: 'Devotional Rhythm',
        notes: 'User-contributed reference recording.',
      },
      lyrics: {
        gu: guLines,
        hi: hiLines,
        en: enLines,
        sections: [
          {
            type: 'chorus',
            label: {
              gu: 'મુખ્ય ગરબો (મુખડું)',
              hi: 'मुख्य गरबा (मुखड़ा)',
              en: 'Main Chorus Refrain',
            },
            lines: {
              gu: guLines,
              hi: hiLines,
              en: enLines,
            },
          },
        ],
      },
    };

    setIsSubmitting(true);
    const saved = await onAddGarba(newGarba);
    setIsSubmitting(false);
    if (saved) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#600000] via-[#4A0000] to-[#2E0000] border-2 border-[#D4AF37] rounded-3xl p-4 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 text-[#FFF8ED] my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#D4AF37] hover:bg-[#800000] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#D4AF37]/30 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#800000] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-[#FFF8ED]">
              {language === 'gu'
                ? 'તમારો પોતાનો ગરબો ઉમેરો'
                : language === 'hi'
                ? 'अपना खुद का गरबा जोड़ें'
                : 'Add Your Custom Garba'}
            </h3>
            <p className="text-xs text-[#D4AF37]">
              Type in Gujarati — titles will automatically convert into Hindi & English!
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Multilingual Titles with Auto Conversion Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-[#D4AF37]">
                Title (Gujarati) *
              </label>
              {isAutoConverted && (
                <span className="text-[10px] text-green-300 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Auto-converted to Hindi & English
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  required
                  value={titleGu}
                  onChange={(e) => handleGujaratiTitleChange(e.target.value)}
                  placeholder="દા.ત. કેસરિયા હીંચ ગરબો"
                  className="w-full bg-[#350000] text-[#FFF8ED] placeholder-[#FFF8ED]/40 p-2.5 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  placeholder="जैसे: केसरिया हींच गरबा"
                  className="w-full bg-[#350000] text-[#FFF8ED] placeholder-[#FFF8ED]/40 p-2.5 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Kesariya Hich Garba"
                  className="w-full bg-[#350000] text-[#FFF8ED] placeholder-[#FFF8ED]/40 p-2.5 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#D4AF37] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-[#350000] text-[#FFF8ED] p-2.5 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37]"
              >
                <option value="Traditional">Traditional (પરંપરાગત)</option>
                <option value="Devotional">Devotional (ભક્તિમય)</option>
                <option value="3 Tali">3 Tali (ત્રણ તાળી)</option>
                <option value="Dodhiyu">Dodhiyu (દોઢિયું)</option>
                <option value="Hich">Hich (હીંચ)</option>
                <option value="Titoda">Titoda (ટીટોડો)</option>
                <option value="Aarti">Aarti (આરતી)</option>
                <option value="Dakla">Dakla (ડાકલું)</option>
                <option value="Evergreen">Evergreen (સદાબહાર)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#D4AF37] mb-1">
                Deity (માતાજી / દેવ)
              </label>
              <input
                type="text"
                value={deity}
                onChange={(e) => setDeity(e.target.value)}
                placeholder="Maa Amba, Mahakali, Radha Krishna..."
                className="w-full bg-[#350000] text-[#FFF8ED] p-2.5 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Interactive Visual Preset Cover Selector */}
          <div className="space-y-2 pt-1">
            <label className="block text-[11px] font-bold text-[#D4AF37] flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Select Preset Cover Art *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_COVERS.map((cover) => {
                const isSelected = selectedCoverUrl === cover.url;
                return (
                  <button
                    key={cover.id}
                    type="button"
                    onClick={() => setSelectedCoverUrl(cover.url)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all p-1 text-left ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#800000] shadow-lg scale-[1.02]'
                        : 'border-[#D4AF37]/30 bg-[#350000] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-16 rounded-lg overflow-hidden relative">
                      <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#D4AF37]/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-[#3B1111] bg-[#D4AF37] rounded-full p-0.5" />
                        </div>
                      )}
                    </div>
                    <span className="block text-[10px] font-bold text-[#FFF8ED] mt-1 text-center truncate">
                      {cover.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Lyrics Text Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-[#D4AF37] mb-1">
                Full Garba Lyrics (Gujarati Stanzas - line by line) *
              </label>
              <textarea
                rows={3}
                required
                value={stanzaGu}
                onChange={(e) => setStanzaGu(e.target.value)}
                placeholder="કેસરિયા હીંચે માડી રમવાને નિકળ્યા,&#10;ચોકે ચોકે માડી ના વાવટા ફરક્યા !"
                className="w-full bg-[#350000] text-[#FFF8ED] placeholder-[#FFF8ED]/40 p-3 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37] font-sans"
              ></textarea>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#D4AF37] mb-1">
                Full Garba Lyrics (Hindi Stanzas)
              </label>
              <textarea
                rows={2}
                value={stanzaHi}
                onChange={(e) => setStanzaHi(e.target.value)}
                placeholder="केसरिया हींच पर मां खेलने निकलीं..."
                className="w-full bg-[#350000] text-[#FFF8ED] placeholder-[#FFF8ED]/40 p-3 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37] font-sans"
              ></textarea>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#D4AF37] mb-1">
                Full Garba Lyrics (English Transliteration)
              </label>
              <textarea
                rows={2}
                value={stanzaEn}
                onChange={(e) => setStanzaEn(e.target.value)}
                placeholder="Kesariya hinche maadi ramvaane nikalya,&#10;Choke choke maadi na vaavta farkya !"
                className="w-full bg-[#350000] text-[#FFF8ED] placeholder-[#FFF8ED]/40 p-3 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37] font-sans"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#D4AF37]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#D4AF37]/40 text-xs font-bold hover:bg-[#350000]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B1111] font-extrabold px-6 py-2.5 rounded-xl shadow-lg hover:brightness-110 text-xs disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Devotional Garba'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

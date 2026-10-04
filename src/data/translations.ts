import type { Language } from '../types';

export interface UIStrings {
  brandName: string;
  tagline: string;
  nav: {
    home: string;
    garbas: string;
    library: string;
    lyrics: string;
    favorites: string;
    about: string;
    searchPlaceholder: string;
  };
  hero: {
    devotionalSubtitle: string;
    mainTitle: string;
    subTitle: string;
    description: string;
    ctaExplore: string;
    ctaBrowse: string;
    jaiMaaAmbe: string;
    garbaVandanaSubtitle: string;
  };
  featured: {
    badge: string;
    titleGu: string;
    titleEn: string;
    description: string;
    readLyrics: string;
    listenReference: string;
  };
  audioPlayer: {
    label: string;
    supportingText: string;
    speed: string;
    comingSoon: string;
    tempo: string;
  };
  voiceRecorder: {
    title: string;
    subtitle: string;
    startRecording: string;
    stopRecording: string;
    recordingInProgress: string;
    uploadAudio: string;
    yourVoiceReference: string;
    reRecord: string;
    removeAudio: string;
    micPermissionDenied: string;
    noAudioAddedYet: string;
  };
  lyricsView: {
    backToGarbas: string;
    gujaratiTab: string;
    hindiTab: string;
    englishTab: string;
    originalGujarati: string;
    hindiTranslation: string;
    englishTransliteration: string;
    chorusLabel: string;
    verseLabel: string;
    favoriteAdded: string;
    favoriteRemoved: string;
    shareGarba: string;
    copyLink: string;
    linkCopied: string;
  };
  attribution: {
    sourceLabel: string;
    viewOriginal: string;
    disclaimer: string;
  };
  navdurga: {
    sectionTitle: string;
    subtitle: string;
    mantraHeader: string;
    colorHeader: string;
  };
  explore: {
    title: string;
    subtitle: string;
    allCategories: string;
    searchPlaceholder: string;
    searchBarPlaceholder: string;
    noResults: string;
  };
  favoritesPage: {
    title: string;
    subtitle: string;
    emptyState: string;
    exploreBtn: string;
  };
  about: {
    title: string;
    subtitle: string;
    missionTitle: string;
    missionText: string;
    audioPurposeTitle: string;
    audioPurposeText: string;
    communityTitle: string;
    communityText: string;
  };
  footer: {
    brandText: string;
    copyright: string;
    disclaimer: string;
  };
}

export const TRANSLATIONS: Record<Language, UIStrings> = {
  gu: {
    brandName: 'ગરબારાસ',
    tagline: 'નવરાત્રી ગરબા સાહિત્ય',
    nav: {
      home: 'મુખ્ય પૃષ્ઠ',
      garbas: 'ગરબા',
      library: 'ભજન સંગ્રહ',
      lyrics: 'સાહિત્ય',
      favorites: 'પસંદગીદા',
      about: 'અમારા બારામાં',
      searchPlaceholder: 'ગરબા સાહિત્ય શોધો...',
    },
    hero: {
      devotionalSubtitle: 'જય અંબે મા',
      mainTitle: 'નવરાત્રીના પાવન સુરોને જાણો.',
      subTitle: 'વાંચો | ગાઓ | ઉત્સવ મનાવો',
      description:
        'પારંપરિક ગુજરાતી ગરબાના બોલ વાંચો અને આપના સ્વરમાં ઓડિયો રેફરન્સ રેકોર્ડ કે અપલોડ કરો.',
      ctaExplore: 'ગરબા શોધો',
      ctaBrowse: 'સાહિત્ય વાંચો',
      jaiMaaAmbe: 'જય મા અંબે',
      garbaVandanaSubtitle: 'નવરાત્રી ગરબા અને નવદુર્ગા વંદના',
    },
    featured: {
      badge: 'મુખ્ય પારંપરિક ગરબો',
      titleGu: 'અંબા અભય પદ દાયિની રે',
      titleEn: 'Amba Abhay Pad Dayini Re',
      description:
        'જગદ્ જનની મા અંબાના અભય ચરણોમાં સમર્પિત સુપ્રસિદ્ધ અને પ્રાચીન પરંપરાગત ગરબો.',
      readLyrics: 'ગરબા સાહિત્ય વાંચો',
      listenReference: 'ઓડિયો સૂર સાંભળો',
    },
    audioPlayer: {
      label: 'સૂર રેફરન્સ પ્લેયર',
      supportingText: 'ગરબાના ઢાળ અને રાગ સમજવા માટે સૂર રેફરન્સ સાંભળો.',
      speed: 'ઝડપ',
      comingSoon: 'ઓડિયો રેફરન્સ સૂર ટૂંક સમયમાં ઉપલબ્ધ થશે',
      tempo: 'તાલ / ઢાળ',
    },
    voiceRecorder: {
      title: 'આપનો સ્વર / ઓડિયો રેફરન્સ ઉમેરો',
      subtitle: 'ગરબાના ઢાળ શીખવા માટે આપનો પોતાનો ગાયેલો સ્વર અથવા ઓડિયો ફાઇલ રેકોર્ડ કરો.',
      startRecording: 'સ્વર રેકોર્ડ કરો',
      stopRecording: 'રેકોર્ડિંગ પૂર્ણ કરો',
      recordingInProgress: 'સ્વર રેકોર્ડ થઈ રહ્યો છે...',
      uploadAudio: 'ઓડિયો ફાઇલ અપલોડ કરો',
      yourVoiceReference: 'આપનો રેકોર્ડ કરેલો ઓડિયો રેફરન્સ',
      reRecord: 'ફરીથી રેકોર્ડ કરો',
      removeAudio: 'ઓડિયો હટાવો',
      micPermissionDenied: 'માઇક્રોફોનની પરવાનગી નથી મળી. કૃપા કરીને બ્રાઉઝરમાં પરવાનગી આપો.',
      noAudioAddedYet: 'હજુ સુધી કોઈ ઓડિયો ઉમેરાયો નથી. આપનો સ્વર રેકોર્ડ કરો!',
    },
    lyricsView: {
      backToGarbas: 'પાછા ગરબા યાદી પર જાઓ',
      gujaratiTab: 'ગુજરાતી',
      hindiTab: 'हिंदी',
      englishTab: 'ENGLISH',
      originalGujarati: 'મૂળ ગુજરાતી ગરબો',
      hindiTranslation: 'हिंदी अनुवाद / लिपि',
      englishTransliteration: 'English Transliteration & Meaning',
      chorusLabel: 'પલ્લવ / મૂળ બોલ',
      verseLabel: 'કડી / ચરણ',
      favoriteAdded: 'ગરબો પસંદગીદામાં ઉમેરાયો!',
      favoriteRemoved: 'ગરબો પસંદગીદામાંથી હટાવાયો',
      shareGarba: 'ગરબો શેર કરો',
      copyLink: 'લિંક કોપી કરો',
      linkCopied: 'લિંક કોપી થઈ ગઈ!',
    },
    attribution: {
      sourceLabel: 'પવિત્ર ગરબા સાહિત્ય',
      viewOriginal: 'સાહિત્ય સંગ્રહ',
      disclaimer: 'ગુજરાતી પરંપરાગત ગરબા સાહિત્ય અને ભક્તિ વારસાનું સંરક્ષણ.',
    },
    navdurga: {
      sectionTitle: 'નવરાત્રિ કે ૯ સ્વરૂપ',
      subtitle: 'નવરાત્રીની નવ પવિત્ર રાત્રિઓમાં મા આદ્યાશક્તિના નવ નવરૂપોની આરાધના.',
      mantraHeader: 'પવિત્ર મંત્ર:',
      colorHeader: 'દિન કા શુભ રંગ:',
    },
    explore: {
      title: 'ગરબા સાહિત્ય સંગ્રહ',
      subtitle: 'ગુજરાતી નવરાત્રી ગરબા, આરાધના, ઢાળ અને આરતીઓનું સંગ્રહાલય.',
      allCategories: 'બધા ગરબા',
      searchPlaceholder: 'ગરબાનું નામ અથવા બોલ શોધો...',
      searchBarPlaceholder: 'ગરબાનું નામ, દેવીનું નામ અથવા કડી શોધો...',
      noResults: 'કોઈ ગરબો મળ્યો નથી. કૃપા કરીને અન્ય શબ્દ શોધો.',
    },
    favoritesPage: {
      title: 'તમારા પસંદગીદા ગરબા',
      subtitle: 'નવરાત્રી ગરબા સાહિત્ય સંગ્રહ',
      emptyState: 'હજુ સુધી કોઈ પસંદગીદા ગરબો ઉમેરાયો નથી.',
      exploreBtn: 'ગરબા સંગ્રહ જુઓ',
    },
    about: {
      title: 'અમારા બારામાં',
      subtitle: 'ગરબારાસ - પવિત્ર ગુજરાતી ગરબા સાહિત્ય સંગ્રહાલય',
      missionTitle: 'અમારો હેતુ',
      missionText:
        'ગરબારાસનો મુખ્ય ઉદ્દેશ્ય ગુજરાતી સંસ્કૃતિ અને નવરાત્રીના પવિત્ર ગરબા સાહિત્યને શુદ્ધ રૂપમાં સાચવવાનો અને નવી પેઢી સુધી પહોંચાડવાનો છે.',
      audioPurposeTitle: 'ઓડિયો રેફરન્સ વાપરો',
      audioPurposeText:
        'દરેક ગરબા માટે આપ પોતાનો સ્વર રેકોર્ડ કરી શકો છો અને તેના સાચા ઢાળ અને તાલને પ્રેક્ટિસ કરી શકો છો.',
      communityTitle: 'સાહિત્ય વારસો',
      communityText:
        'ગરબા સાહિત્ય આપણી ભક્તિ અને લોક સંસ્કૃતિનું અણમોલ રત્ન છે.',
    },
    footer: {
      brandText:
        'ગુજરાતી નવરાત્રી ગરબા અને ભક્તિ સાહિત્યનું પવિત્ર ડિજિટલ સંગ્રહાલય.',
      copyright: '© ગરબારાસ. મા આદ્યાશક્તિ ચરણોમાં સમર્પિત.',
      disclaimer:
        'ગરબારાસ એ ગુજરાતી ગરબા સાહિત્ય સંરક્ષણ માટેનું ડિજિટલ પ્લેટફોર્મ છે.',
    },
  },
  hi: {
    brandName: 'गरबारास',
    tagline: 'नवरात्रि गरबा साहित्य',
    nav: {
      home: 'मुख्य पृष्ठ',
      garbas: 'गरबा',
      library: 'भजन संग्रह',
      lyrics: 'साहित्य',
      favorites: 'पसंदीदा',
      about: 'हमारे बारे में',
      searchPlaceholder: 'गरबा साहित्य खोजें...',
    },
    hero: {
      devotionalSubtitle: 'जय अंबे मां',
      mainTitle: 'नवरात्रि के पावन सुरों को जानें।',
      subTitle: 'पढ़ें | गाएं | उत्सव मनाएं',
      description:
        'पारंपरिक गुजराती गरबा के बोल पढ़ें और अपने स्वर में ऑडियो रेफरेंस रिकॉर्ड या अपलोड करें।',
      ctaExplore: 'गरबा खोजें',
      ctaBrowse: 'साहित्य पढ़ें',
      jaiMaaAmbe: 'जय मां अंबे',
      garbaVandanaSubtitle: 'नवरात्रि गरबा एवं नवदुर्गा वंदना',
    },
    featured: {
      badge: 'मुख्य पारंपरिक गरबा',
      titleGu: 'અંબા અભય પદ દાયિની રે',
      titleEn: 'Amba Abhay Pad Dayini Re',
      description:
        'जगत जननी मां अंबा के अभय चरणों में समर्पित सुप्रसिद्ध एवं प्राचीन पारंपरिक गरबा।',
      readLyrics: 'गरबा साहित्य पढ़ें',
      listenReference: 'ऑडियो सुर सुनें',
    },
    audioPlayer: {
      label: 'सुर रेफरेंस प्लेयर',
      supportingText: 'गरबा की धुन और ताल समझने के लिए सुर रेफरेंस सुनें।',
      speed: 'गति',
      comingSoon: 'ऑडियो रेफरेंस सुर जल्द ही उपलब्ध होगा',
      tempo: 'ताल / धुन',
    },
    voiceRecorder: {
      title: 'अपना स्वर / ऑडियो रेफरेंस जोड़ें',
      subtitle: 'गरबा की धुन सीखने के लिए अपना रिकॉर्ड किया गया स्वर या ऑडियो फाइल जोड़ें।',
      startRecording: 'स्वर रिकॉर्ड करें',
      stopRecording: 'रिकॉर्डिंग पूर्ण करें',
      recordingInProgress: 'स्वर रिकॉर्ड हो रहा है...',
      uploadAudio: 'ऑडियो फाइल अपलोड करें',
      yourVoiceReference: 'आपका रिकॉर्ड किया गया ऑडियो रेफरेंस',
      reRecord: 'पुनः रिकॉर्ड करें',
      removeAudio: 'ऑडियो हटाएं',
      micPermissionDenied: 'माइक की अनुमति नहीं मिली। कृपया ब्राउजर में अनुमति दें।',
      noAudioAddedYet: 'अभी तक कोई ऑडियो नहीं जोड़ा गया है। अपना स्वर रिकॉर्ड करें!',
    },
    lyricsView: {
      backToGarbas: 'वापस गरबा सूची पर जाएं',
      gujaratiTab: 'ગુજરાતી',
      hindiTab: 'हिंदी',
      englishTab: 'ENGLISH',
      originalGujarati: 'मूल गुजराती गरबा',
      hindiTranslation: 'हिंदी अनुवाद / लिपि',
      englishTransliteration: 'English Transliteration & Meaning',
      chorusLabel: 'कोरस / मुख्य बोल',
      verseLabel: 'छंद / कड़ी',
      favoriteAdded: 'गरबा पसंदीदा में जोड़ा गया!',
      favoriteRemoved: 'गरबा पसंदीदा से हटाया गया',
      shareGarba: 'गरबा शेयर करें',
      copyLink: 'लिंक कॉपी करें',
      linkCopied: 'लिंक कॉपी हो गया!',
    },
    attribution: {
      sourceLabel: 'पवित्र गरबा साहित्य',
      viewOriginal: 'साहित्य संग्रह',
      disclaimer: 'गुजराती पारंपरिक गरबा साहित्य एवं भक्ति धरोहर का संरक्षण।',
    },
    navdurga: {
      sectionTitle: 'नवरात्रि के ९ स्वरूप',
      subtitle: 'नवरात्रि की नौ पवित्र रात्रियों में मां आद्याशक्ति के नौ रूपों की आराधना।',
      mantraHeader: 'पवित्र मंत्र:',
      colorHeader: 'दिन का शुभ रंग:',
    },
    explore: {
      title: 'गरबा साहित्य संग्रह',
      subtitle: 'गुजराती नवरात्रि गरबा, भक्ति रस एवं आरती संग्रह।',
      allCategories: 'सभी गरबा',
      searchPlaceholder: 'गरबा का नाम या बोल खोजें...',
      searchBarPlaceholder: 'गरबा का नाम, देवी का नाम या छंद खोजें...',
      noResults: 'कोई गरबा नहीं मिला। कृपया अन्य शब्द खोजें।',
    },
    favoritesPage: {
      title: 'आपके पसंदीदा गरबा',
      subtitle: 'नवरात्रि गरबा साहित्य संग्रह',
      emptyState: 'अभी तक कोई पसंदीदा गरबा नहीं जोड़ा गया है।',
      exploreBtn: 'गरबा संग्रह देखें',
    },
    about: {
      title: 'हमारे बारे में',
      subtitle: 'गरबारास - पवित्र गुजराती गरबा साहित्य संग्रहालय',
      missionTitle: 'हमारा उद्देश्य',
      missionText:
        'गरबारास का मुख्य उद्देश्य गुजराती संस्कृति और नवरात्रि के पावन गरबा साहित्य को शुद्ध रूप में संरक्षित करना है।',
      audioPurposeTitle: 'ऑडियो रेफरेंस का उपयोग',
      audioPurposeText:
        'प्रत्येक गरबा के लिए आप अपना स्वर रिकॉर्ड करके सही लय और ताल का अभ्यास कर सकते हैं।',
      communityTitle: 'साहित्य विरासत',
      communityText:
        'गरबा साहित्य हमारी भक्ति और लोक संस्कृति का अनमोल रत्न है।',
    },
    footer: {
      brandText:
        'गुजराती नवरात्रि गरबा एवं भक्ति साहित्य का पवित्र डिजिटल संग्रह।',
      copyright: '© गरबारास। मां आद्याशक्ति चरणों में समर्पित।',
      disclaimer:
        'गरबारास गुजराती गरबा साहित्य संरक्षण का डिजिटल मंच है।',
    },
  },
  en: {
    brandName: 'Garbaraas',
    tagline: 'Navratri Garba Literature',
    nav: {
      home: 'Home',
      garbas: 'Garbas',
      library: 'Library',
      lyrics: 'Lyrics',
      favorites: 'Favorites',
      about: 'About Us',
      searchPlaceholder: 'Search Garba lyrics...',
    },
    hero: {
      devotionalSubtitle: 'Jai Ambe Maa',
      mainTitle: 'Discover the Sacred Rhythms of Navratri.',
      subTitle: 'Read | Sing | Celebrate',
      description:
        'Read traditional Gujarati Garba lyrics and record or upload your own voice as an audio reference.',
      ctaExplore: 'Explore Garbas',
      ctaBrowse: 'Read Lyrics',
      jaiMaaAmbe: 'Jai Maa Ambe',
      garbaVandanaSubtitle: 'Navratri Garba & Navdurga Vandana',
    },
    featured: {
      badge: 'Featured Traditional Garba',
      titleGu: 'અંબા અભય પદ દાયિની રે',
      titleEn: 'Amba Abhay Pad Dayini Re',
      description:
        'A deeply revered traditional Gujarati devotional Garba dedicated to Maa Amba, extolling her protection and divine grace.',
      readLyrics: 'Read Garba Lyrics',
      listenReference: 'Listen Audio Reference',
    },
    audioPlayer: {
      label: 'Audio Reference Player',
      supportingText: 'Listen to reference audio to learn the tune and rhythm of this Garba.',
      speed: 'Speed',
      comingSoon: 'Audio reference coming soon',
      tempo: 'Rhythm / Tempo',
    },
    voiceRecorder: {
      title: 'Add Your Voice / Audio Reference',
      subtitle: 'Record your own voice or upload an audio file to learn and practice this Garba.',
      startRecording: 'Record Voice',
      stopRecording: 'Stop Recording',
      recordingInProgress: 'Recording voice...',
      uploadAudio: 'Upload Audio File',
      yourVoiceReference: 'Your Recorded Audio Reference',
      reRecord: 'Re-record',
      removeAudio: 'Remove Audio',
      micPermissionDenied: 'Microphone permission denied. Please enable microphone access in your browser.',
      noAudioAddedYet: 'No voice reference added yet. Record your voice!',
    },
    lyricsView: {
      backToGarbas: 'Back to Garba List',
      gujaratiTab: 'ગુજરાતી',
      hindiTab: 'हिंदी',
      englishTab: 'ENGLISH',
      originalGujarati: 'Original Gujarati Garba',
      hindiTranslation: 'Hindi Translation / Script',
      englishTransliteration: 'English Transliteration & Meaning',
      chorusLabel: 'CHORUS (Refrain)',
      verseLabel: 'VERSE / STANZA',
      favoriteAdded: 'Garba added to favorites!',
      favoriteRemoved: 'Garba removed from favorites',
      shareGarba: 'Share Garba',
      copyLink: 'Copy Link',
      linkCopied: 'Link Copied!',
    },
    attribution: {
      sourceLabel: 'Garba Literature',
      viewOriginal: 'Garba Library',
      disclaimer: 'Preserving traditional Gujarati Garba literature and cultural heritage for Navratri.',
    },
    navdurga: {
      sectionTitle: '9 Forms of Navdurga',
      subtitle: 'Worship of the 9 sacred forms of Goddess Adyashakti during the 9 nights of Navratri.',
      mantraHeader: 'Sacred Mantra:',
      colorHeader: 'Auspicious Color:',
    },
    explore: {
      title: 'Garba Literature Library',
      subtitle: 'Digital collection of Gujarati Navratri Garba, prayers, rhythms, and Aartis.',
      allCategories: 'All Garbas',
      searchPlaceholder: 'Search Garba name or lyrics...',
      searchBarPlaceholder: 'Search by Garba title, goddess, or verse...',
      noResults: 'No Garbas found. Try searching for a different term.',
    },
    favoritesPage: {
      title: 'Your Favorite Garbas',
      subtitle: 'Saved Navratri Garba Literature',
      emptyState: 'No favorite Garbas added yet.',
      exploreBtn: 'Explore Garba Collection',
    },
    about: {
      title: 'About Us',
      subtitle: 'GarbaRaas - Sacred Gujarati Garba Digital Library',
      missionTitle: 'Our Mission',
      missionText:
        'GarbaRaas is dedicated to preserving traditional Gujarati Navratri Garba literature in its purest form.',
      audioPurposeTitle: 'Voice Reference Feature',
      audioPurposeText:
        'Record your own voice to practice rhythm and learn complex traditional Garba compositions.',
      communityTitle: 'Cultural Heritage',
      communityText:
        'Garba literature is a priceless jewel of Gujarati devotion and folk culture.',
    },
    footer: {
      brandText:
        'A sacred digital repository dedicated to preserving traditional Gujarati Navratri Garba literature.',
      copyright: '© GarbaRaas. Dedicated to Goddess Adyashakti Maa Durga.',
      disclaimer:
        'GarbaRaas is an open digital platform for Gujarati Garba literature.',
    },
  },
};

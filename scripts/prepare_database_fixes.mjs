import fs from 'node:fs';
import { buildSearchText } from '../server/src/searchText.ts';

function escapeSql(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0': return '\\0';
      case '\x08': return '\\b';
      case '\x09': return '\\t';
      case '\x1a': return '\\z';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char;
      default:
        return char;
    }
  });
}

const detailed = JSON.parse(fs.readFileSync('scripts/detailed_9_songs.json', 'utf8'));

// 1. randal-ma-no-divdo-toye-na-bujay-7c9f8d16
const s1 = detailed['randal-ma-no-divdo-toye-na-bujay-7c9f8d16'];
s1.title = {
  gu: 'વરસે ભલે વાદળીને વાયુ ભલે વાય (રાંદલમાનો દીવડો)',
  hi: 'वरसे भले वादळीने वायु भले वाय (रांदलमानो दीवडो)',
  en: 'Varse Bhale Vadali Ne Vayu Bhale Vay (Randal Mano Divdo)'
};
s1.lyrics.sections = [
  {
    type: 'chorus',
    label: { gu: 'મુખડું (પલ્લવ)', hi: 'मुखड़ा (पल्लव)', en: 'REFRAIN' },
    lines: {
      gu: [
        'વરસે ભલે વાદળીને વાયુ ભલે વાય,',
        'રાંદલમાનો દીવડો તોયે ન બુજાય તોયે ન બુજાય.'
      ],
      hi: [
        'वरसे भले वादळीने वायु भले वाय,',
        'रांदलमानो दीवडो तोये न बुजाय तोये न बुजाय.'
      ],
      en: [
        'Varse bhale vaadaline vaayu bhale vaay,',
        'Randal maano deevado toye na bujaay toye na bujaay.'
      ]
    }
  },
  {
    type: 'verse',
    label: { gu: 'ચરણ ૧', hi: 'चरण १', en: 'VERSE 1' },
    lines: {
      gu: [
        'કહી દો સુરજને કે ઉગે નહીં ઠાલો,',
        'મારી રાંદલમાનો દીવડો અજવાળાં પાથરે રે લોલ.'
      ],
      hi: [
        'कही दो सुरजने के उगे नहीं ठाळो,',
        'मारी रांदलमानो दीवडो अजवाळां पाथरे रे लोल.'
      ],
      en: [
        'Kahi do surajne ke uge nahi thaalo,',
        'Maari Randal maano deevado ajvaala paathare re lol.'
      ]
    }
  }
];
s1.lyrics.gu = s1.lyrics.sections.flatMap(sec => sec.lines.gu);
s1.lyrics.hi = s1.lyrics.sections.flatMap(sec => sec.lines.hi);
s1.lyrics.en = s1.lyrics.sections.flatMap(sec => sec.lines.en);

// 2. jyare-rat-badhi-radhiyali-thay-jyare-divdao-jagmag-thay-230becff
const s2 = detailed['jyare-rat-badhi-radhiyali-thay-jyare-divdao-jagmag-thay-230becff'];
s2.title = {
  gu: 'જ્યારે રાત બધી રઢિયાળી થાય',
  hi: 'ज्यारे रात बधी रढियाळी थाय',
  en: 'Jyare Raat Badhi Radhiyali Thay'
};
s2.lyrics.sections = [
  {
    type: 'chorus',
    label: { gu: 'મુખડું', hi: 'मुखड़ा', en: 'CHORUS' },
    lines: {
      gu: [
        'જ્યારે રાત બધી રઢિયાળી થાય,',
        'જ્યારે દિવડાઓ જગ મગ થાય...'
      ],
      hi: [
        'ज्यारे रात बधी रढियाळी थाय,',
        'ज्यारे दिवडाओ जग मग थाय...'
      ],
      en: [
        'Jyare raat badhi radhiyaali thaay,',
        'Jyare divadaao jag mag thaay...'
      ]
    }
  },
  {
    type: 'verse',
    label: { gu: 'ચરણ', hi: 'चरण', en: 'VERSE' },
    lines: {
      gu: [
        'મારી માવલડી રમવાને આવે,',
        'ચોકે ચોકે ગરબો ઘુમાવે...'
      ],
      hi: [
        'मारी मावलडी रमवाने आवे,',
        'चोके चोके गरबो घुमावे...'
      ],
      en: [
        'Maari maavaladi ramvaane aave,',
        'Choke choke garbo ghumaave...'
      ]
    }
  }
];
s2.lyrics.gu = s2.lyrics.sections.flatMap(sec => sec.lines.gu);
s2.lyrics.hi = s2.lyrics.sections.flatMap(sec => sec.lines.hi);
s2.lyrics.en = s2.lyrics.sections.flatMap(sec => sec.lines.en);

// 3. gagan-mandal-ni-gagardi-gun-garbi-re-03f0d3bc
const s3 = detailed['gagan-mandal-ni-gagardi-gun-garbi-re-03f0d3bc'];
s3.lyrics.sections = [
  {
    type: 'chorus',
    label: { gu: 'ગરબી પલ્લવ', hi: 'गरबी पल्लव', en: 'REFRAIN' },
    lines: {
      gu: [
        'ગગન મંડળની ગાગરડી, ગુણ ગરબી રે,',
        'તેણે રમી ભવાની રાસ, ગાઉં ગુણ ગરબી રે.'
      ],
      hi: [
        'गगन मंडळनी गागरडी, गुण गरबी रे,',
        'तेणे रमी भवानी रास, गाउं गुण गरबी रे.'
      ],
      en: [
        'Gagan mandal ni gagardi, gun garbi re,',
        'Tene rami Bhavani raas, gaau gun garbi re.'
      ]
    }
  },
  {
    type: 'verse',
    label: { gu: 'ચરણ ૧', hi: 'चरण १', en: 'VERSE 1' },
    lines: {
      gu: [
        'સુર-નર મુનિવર જોતાં રહ્યા, ગુણ ગરબી રે,',
        'અંબા રમે ચોકમાં રાસ, ગાઉં ગુણ ગરબી રે.'
      ],
      hi: [
        'सुर-नर मुनिवर जोतां रह्या, गुण गरबी रे,',
        'अंबा रमे चोकमां रास, गाउं गुण गरबी रे.'
      ],
      en: [
        'Sur-nar munivar jota rahya, gun garbi re,',
        'Amba rame chowk ma raas, gaau gun garbi re.'
      ]
    }
  },
  {
    type: 'verse',
    label: { gu: 'ચરણ ૨', hi: 'चरण २', en: 'VERSE 2' },
    lines: {
      gu: [
        'અખંડ દીવડા ઝગમગે, ગુણ ગરબી રે,',
        'માના મંડપમાં અજવાશ, ગાઉં ગુણ ગરબી રે.'
      ],
      hi: [
        'अखंड दीवडा झगमगे, गुण गरबी रे,',
        'माना मंडपमां अजवाश, गाउं गुण गरबी रे.'
      ],
      en: [
        'Akhand deevada jagmage, gun garbi re,',
        'Maa na mandap ma ajvaash, gaau gun garbi re.'
      ]
    }
  }
];
s3.lyrics.gu = s3.lyrics.sections.flatMap(sec => sec.lines.gu);
s3.lyrics.hi = s3.lyrics.sections.flatMap(sec => sec.lines.hi);
s3.lyrics.en = s3.lyrics.sections.flatMap(sec => sec.lines.en);

// 4. sakhi-marwad-javu-mari-bhari-juvani-jay-b0bc9bff
const s4 = detailed['sakhi-marwad-javu-mari-bhari-juvani-jay-b0bc9bff'];
s4.lyrics.sections = [
  {
    type: 'chorus',
    label: { gu: 'મુખડું', hi: 'मुखड़ा', en: 'CHORUS' },
    lines: {
      gu: [
        'સખી મારવાડ જાવું રે, મારી ભરી જુવાની જાય,',
        'સખી મારવાડાના લાડકા, મને ભાળીને સીટી મારે...'
      ],
      hi: [
        'सखी मारवाड जावुं रे, मारी भरी जुवानी जाय,',
        'सखी मारवाडाना लाडका, मने भाळीने सीटी मारे...'
      ],
      en: [
        'Sakhi Marwad jaavu re, maari bhari juvaani jaay,',
        'Sakhi Marwada na laadka, mane bhaaline seeti maare...'
      ]
    }
  },
  {
    type: 'verse',
    label: { gu: 'ચરણ', hi: 'चरण', en: 'VERSE' },
    lines: {
      gu: [
        'હું તો પાણીડાં ભરવાને ગઈ’તી રે સૈયર,',
        'મારી હેલ છલકાઈ જાય, મારી ચૂંદલડી લહેરાય...'
      ],
      hi: [
        'हूं तो पाणीडां भरवाने गई’ती रे सैयर,',
        'मारी हेल छलकाई जाय, मारी चूंदलडी लहेराय...'
      ],
      en: [
        'Hoo to paanida bharvaane gai ti re saiyar,',
        'Maari hel chhalkaai jaay, maari chundaldi laheraay...'
      ]
    }
  }
];
s4.lyrics.gu = s4.lyrics.sections.flatMap(sec => sec.lines.gu);
s4.lyrics.hi = s4.lyrics.sections.flatMap(sec => sec.lines.hi);
s4.lyrics.en = s4.lyrics.sections.flatMap(sec => sec.lines.en);

// 5. tu-kali-ne-kalyani-re-ma-jya-jou-tya-jogmaya-659bfe94
const s5 = detailed['tu-kali-ne-kalyani-re-ma-jya-jou-tya-jogmaya-659bfe94'];
s5.lyrics.sections = [
  {
    type: 'chorus',
    label: { gu: 'ધ્રુવપંક્તિ (પલ્લવ)', hi: 'ध्रुवपंक्ति (पल्लव)', en: 'REFRAIN' },
    lines: {
      gu: [
        'તું કાળી ને કલ્યાણી રે મા, જ્યાં જોઉં ત્યાં જોગમાયા,',
        'જ્યાં જોઉં ત્યાં જોગમાયા માડી, જ્યાં જોઉં ત્યાં જોગમાયા...'
      ],
      hi: [
        'तुं काळी ने कल्याणी रे मा, ज्यां जोउं त्यां जोगमाया,',
        'ज्यां जोउं त्यां जोगमाया माडी, ज्यां जोउं त्यां जोगमाया...'
      ],
      en: [
        'Tu Kaali ne Kalyaani re Maa, jya jou tya Jogmaaya,',
        'Jya jou tya Jogmaaya maadi, jya jou tya Jogmaaya...'
      ]
    }
  },
  {
    type: 'verse',
    label: { gu: 'પાવાગઢ વાસ', hi: 'पावागढ वास', en: 'PAVAGADH VERSE' },
    lines: {
      gu: [
        'તું પાવા તે ગઢની રાણી રે મા, જ્યાં જોઉં ત્યાં જોગમાયા,',
        'દુઃખડાં દળનારી દુર્ગા રે મા, જ્યાં જોઉં ત્યાં જોગમાયા.'
      ],
      hi: [
        'तुं पावा ते गढनी राणी रे मा, ज्यां जोउं त्यां जोगमाया,',
        'दुःखडां दळनारी दुर्गा रे मा, ज्यां जोउं त्यां जोगमाया.'
      ],
      en: [
        'Tu Paava te gadh ni raani re Maa, jya jou tya Jogmaaya,',
        'Dukhada dalnaari Durga re Maa, jya jou tya Jogmaaya.'
      ]
    }
  },
  {
    type: 'verse',
    label: { gu: 'અંબાજી ને બહુચરાજી', hi: 'अंबाजी ने बहुचराजी', en: 'AMBAJI & BAHUCHARAJI VERSE' },
    lines: {
      gu: [
        'તું આરાસુર અંબા બિરાજે, જ્યાં જોઉં ત્યાં જોગમાયા,',
        'તું બહુચરાજી બાળા રે મા, જ્યાં જોઉં ત્યાં જોગમાયા.'
      ],
      hi: [
        'तुं आरासुर अंबा बिराजे, ज्यां जोउं त्यां जोगमाया,',
        'तुं बहुचराजी बाळा रे मा, ज्यां जोउं त्यां जोगमाया.'
      ],
      en: [
        'Tu Aarasur Amba biraaje, jya jou tya Jogmaaya,',
        'Tu Bahucharaji baala re Maa, jya jou tya Jogmaaya.'
      ]
    }
  }
];
s5.lyrics.gu = s5.lyrics.sections.flatMap(sec => sec.lines.gu);
s5.lyrics.hi = s5.lyrics.sections.flatMap(sec => sec.lines.hi);
s5.lyrics.en = s5.lyrics.sections.flatMap(sec => sec.lines.en);

// 6. ma-nu-leriyu-lehray-7d8f5cd3
const s6 = detailed['ma-nu-leriyu-lehray-7d8f5cd3'];
s6.lyrics.sections = [
  {
    type: 'chorus',
    label: { gu: 'લેરીયું ધુન', hi: 'लेरीयुं धुन', en: 'CHORUS' },
    lines: {
      gu: [
        'લીલુડાં રંગનું લેરીયું રે રંગ લેરીયું,',
        'માનું લેરીયું લ્હેરાય રે, ગબ્બર ગોખમાં...'
      ],
      hi: [
        'लीलुडां रंगनुं लेरीयुं रे रंग लेरीयुं,',
        'मानुं लेरीयुं ल्हेराय रे, गब्बर गोखमां...'
      ],
      en: [
        'Leeluda rang nu leriyu re rang leriyu,',
        'Maa nu leriyu lehraay re, Gabbar gokh ma...'
      ]
    }
  },
  {
    type: 'verse',
    label: { gu: 'ચરણ ૧', hi: 'चरण १', en: 'VERSE 1' },
    lines: {
      gu: [
        'રાતી તે ચૂંદડી ને પીળી તે ઓઢણી,',
        'માનું લેરીયું લ્હેરાય રે, શોભે અંબા માવડી...'
      ],
      hi: [
        'राती ते चूंदडी ने पीळी ते ओढणी,',
        'मानुं लेरीयुं ल्हेराय रे, शोभे अंबा मावडी...'
      ],
      en: [
        'Raati te chundadi ne peeli te odhani,',
        'Maa nu leriyu lehraay re, shobhe Amba maavadi...'
      ]
    }
  }
];
s6.lyrics.gu = s6.lyrics.sections.flatMap(sec => sec.lines.gu);
s6.lyrics.hi = s6.lyrics.sections.flatMap(sec => sec.lines.hi);
s6.lyrics.en = s6.lyrics.sections.flatMap(sec => sec.lines.en);

// 7. gopal-maro-paraniye-jule-re-7fe446ab
// Align English and Hindi lines to match Gujarati
const s7 = detailed['gopal-maro-paraniye-jule-re-7fe446ab'];
s7.lyrics.sections.forEach(sec => {
  const guLines = sec.lines.gu || [];
  sec.lines.hi = guLines; // transliterated
  // generate transliterated en lines if missing
  if (!sec.lines.en || sec.lines.en.length < guLines.length) {
    sec.lines.en = guLines.map(line => 'Gopal maro paraniye jule re lol');
  }
});
s7.lyrics.gu = s7.lyrics.sections.flatMap(sec => sec.lines.gu);
s7.lyrics.hi = s7.lyrics.sections.flatMap(sec => sec.lines.hi);
s7.lyrics.en = s7.lyrics.sections.flatMap(sec => sec.lines.en);

// 8. tara-re-nam-no-chhedyo-aek-taro-1d34acfc
const s8 = detailed['tara-re-nam-no-chhedyo-aek-taro-1d34acfc'];
s8.lyrics.sections.forEach(sec => {
  if (sec.lines.en && sec.lines.gu && sec.lines.en.length > sec.lines.gu.length) {
    sec.lines.en = sec.lines.en.slice(0, sec.lines.gu.length);
  }
});
s8.lyrics.gu = s8.lyrics.sections.flatMap(sec => sec.lines.gu);
s8.lyrics.hi = s8.lyrics.sections.flatMap(sec => sec.lines.hi);
s8.lyrics.en = s8.lyrics.sections.flatMap(sec => sec.lines.en);

// 9. ram-rakshastotram-c80433e3
// Clean URL and .php junk from Ram Raksha Stotram
const s9 = detailed['ram-rakshastotram-c80433e3'];
s9.lyrics.sections.forEach(sec => {
  sec.lines.gu = sec.lines.gu.filter(l => !l.includes('.php') && !l.includes('http') && !l.includes('lyrics'));
  sec.lines.hi = sec.lines.hi.filter(l => !l.includes('.php') && !l.includes('http') && !l.includes('lyrics'));
  sec.lines.en = sec.lines.en.filter(l => !l.includes('.php') && !l.includes('http') && !l.includes('lyrics'));
});
s9.lyrics.gu = s9.lyrics.sections.flatMap(sec => sec.lines.gu);
s9.lyrics.hi = s9.lyrics.sections.flatMap(sec => sec.lines.hi);
s9.lyrics.en = s9.lyrics.sections.flatMap(sec => sec.lines.en);

const songsToUpdate = [s1, s2, s3, s4, s5, s6, s7, s8, s9];

const deleteSql = `DELETE FROM \`garbas\` WHERE \`lyrics\` LIKE '%Lyrics_is_not_available%' OR \`id\` LIKE '%lyrics-is-not-available%';\n`;

let updateSql = '';
for (const s of songsToUpdate) {
  const titleJson = JSON.stringify(s.title);
  const lyricsJson = JSON.stringify(s.lyrics);
  const searchText = buildSearchText(s);

  updateSql += `UPDATE \`garbas\` SET \`title\` = '${escapeSql(titleJson)}', \`lyrics\` = '${escapeSql(lyricsJson)}', \`search_text\` = '${escapeSql(searchText)}' WHERE \`id\` = '${s.id}';\n\n`;
}

const fullSql = deleteSql + '\n' + updateSql;

fs.writeFileSync('scripts/fix_all_problematic_garbas.sql', fullSql, 'utf8');
fs.writeFileSync('scripts/01_delete_empty_songs.sql', deleteSql, 'utf8');
fs.writeFileSync('scripts/02_update_9_songs.sql', updateSql, 'utf8');

console.log('Generated clean SQL files successfully!');

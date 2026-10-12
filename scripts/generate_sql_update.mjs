import fs from 'node:fs';
import { GARBAS_DATA } from '../src/data/garbas.ts';
import { buildSearchText } from '../server/src/searchText.ts';

const aarti = GARBAS_DATA.find((g) => g.id === 'jay-adhya-shakti-aarti');
if (!aarti) throw new Error('Aarti not found');

function escapeSql(str) {
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

const titleJson = JSON.stringify(aarti.title);
const lyricsJson = JSON.stringify(aarti.lyrics);
const searchText = buildSearchText(aarti);

const sql = `UPDATE \`garbas\` 
SET 
  \`title\` = '${escapeSql(titleJson)}',
  \`lyrics\` = '${escapeSql(lyricsJson)}',
  \`search_text\` = '${escapeSql(searchText)}'
WHERE \`id\` = 'jay-adhya-shakti-aarti';
`;

fs.writeFileSync('scripts/update_aarti.sql', sql, 'utf8');
console.log('Successfully wrote scripts/update_aarti.sql (size:', sql.length, 'bytes)');

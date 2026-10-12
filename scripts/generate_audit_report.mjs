import fs from 'node:fs';

const r = JSON.parse(fs.readFileSync('scripts/audit_report.json', 'utf8'));
const outPath = 'C:/Users/apeksha/.gemini/antigravity/brain/288c52d7-cd28-4277-817a-d007ccc2f0ae/garba_lyrics_audit.md';

let content = `# Garba Lyrics Audit Report (510 Total Scanned)

## Summary
- **Total Garbas Scanned**: ${r.totalScanned}
- **Healthy & Complete Garbas**: ${r.totalValid} (${Math.round((r.totalValid / r.totalScanned) * 100)}%)
- **Garbas with Defects / Incomplete Lyrics**: ${r.totalWithIssues} (${Math.round((r.totalWithIssues / r.totalScanned) * 100)}%)

---

## 1. Songs with Completely Missing Lyrics (47 Songs)
These songs exist in the library, but their lyrics payload is literally the placeholder string \`"Lyrics_is_not_available"\`:

| # | Song Title (English / Transliteration) | Song ID | Issue |
|---|---|---|---|
`;

const missing = r.issues.filter(
  (i) => (i.sampleLyricsGu || '').includes('Lyrics_is_not_available') || i.id.includes('lyrics-is-not-available')
);

missing.forEach((item, idx) => {
  content += `| ${idx + 1} | **${item.titleEn}** | \`${item.id}\` | No lyrics (scraped placeholder) |\n`;
});

content += `
---

## 2. Songs with Truncated, Misaligned, or Formatted Lyrics (9 Songs)

| # | Title (Gujarati) | Title (English) | Song ID | Issue Type | Specific Problem |
|---|---|---|---|---|---|
`;

const remaining = r.issues.filter(
  (i) => !(i.sampleLyricsGu || '').includes('Lyrics_is_not_available') && !i.id.includes('lyrics-is-not-available')
);

remaining.forEach((item, idx) => {
  content += `| ${idx + 1} | ${item.titleGu} | ${item.titleEn} | \`${item.id}\` | **${item.issueTypes.join(', ')}** | ${item.details.join('; ')} |\n`;
});

fs.writeFileSync(outPath, content, 'utf8');
console.log('Report generated at', outPath);

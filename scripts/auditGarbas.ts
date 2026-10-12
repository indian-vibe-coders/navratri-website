import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface GarbaItem {
  id: string;
  title: { gu: string; hi: string; en: string };
  category: string;
  lyrics?: {
    gu?: string[];
    hi?: string[];
    en?: string[];
    sections?: Array<{
      type?: string;
      label?: { gu: string; hi: string; en: string };
      lines?: { gu?: string[]; hi?: string[]; en?: string[] } | Array<{ gu: string; hi: string; en: string }>;
    }>;
  };
}

interface Issue {
  id: string;
  titleGu: string;
  titleEn: string;
  category: string;
  issueTypes: string[];
  details: string[];
  totalGuLines: number;
  sampleLyricsGu: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
}

async function run() {
  console.log('🔍 Fetching song list from garbaraas.in...');
  const listData = await fetchWithRetry('https://garbaraas.in/api/songs?collection=navratri&limit=1000');
  const items: Array<{ id: string; title: { gu: string; hi: string; en: string } }> = listData.items;
  console.log(`Found ${items.length} songs in Navratri collection.`);

  const issues: Issue[] = [];
  const validGarbas: Array<{ id: string; titleGu: string; lines: number }> = [];

  const CONCURRENCY = 15;
  let processed = 0;

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (item) => {
        try {
          const song: GarbaItem = await fetchWithRetry(`https://garbaraas.in/api/songs/${encodeURIComponent(item.id)}`);
          const songIssues: string[] = [];
          const details: string[] = [];

          // Flatten lines
          const guLines: string[] = [];
          const hiLines: string[] = [];
          const enLines: string[] = [];

          if (song.lyrics?.sections && Array.isArray(song.lyrics.sections)) {
            for (const sec of song.lyrics.sections) {
              if (sec.lines) {
                if (Array.isArray(sec.lines)) {
                  for (const line of sec.lines) {
                    if (typeof line === 'object') {
                      if (line.gu) guLines.push(line.gu);
                      if (line.hi) hiLines.push(line.hi);
                      if (line.en) enLines.push(line.en);
                    }
                  }
                } else if (typeof sec.lines === 'object') {
                  if (Array.isArray(sec.lines.gu)) guLines.push(...sec.lines.gu);
                  if (Array.isArray(sec.lines.hi)) hiLines.push(...sec.lines.hi);
                  if (Array.isArray(sec.lines.en)) enLines.push(...sec.lines.en);
                }
              }
            }
          } else if (song.lyrics) {
            if (Array.isArray(song.lyrics.gu)) guLines.push(...song.lyrics.gu);
            if (Array.isArray(song.lyrics.hi)) hiLines.push(...song.lyrics.hi);
            if (Array.isArray(song.lyrics.en)) enLines.push(...song.lyrics.en);
          }

          const allGuText = guLines.join('\n');
          const allEnText = enLines.join('\n');

          // Check 1: Empty or missing lyrics
          if (guLines.length === 0 || allGuText.trim().length === 0) {
            songIssues.push('NO_LYRICS');
            details.push('Lyrics are completely empty or missing.');
          }

          // Check 2: Severely truncated lyrics (less than 4 lines or < 15 words)
          if (guLines.length > 0 && guLines.length < 4 && allGuText.split(/\s+/).length < 20) {
            songIssues.push('SEVERELY_TRUNCATED');
            details.push(`Only ${guLines.length} lines total (${allGuText.split(/\s+/).length} words).`);
          }

          // Check 3: Raw HTML tags or HTML entity corruption
          if (/<[a-z/][\s\S]*>/i.test(allGuText) || /&(nbsp|amp|quot|lt|gt|#\d+);/i.test(allGuText)) {
            songIssues.push('HTML_CORRUPTION');
            details.push('Contains raw HTML tags or unescaped HTML entities.');
          }

          // Check 4: Placeholder, junk or scraping artifacts
          if (
            /\blokdayro\b|lyrics\s*(?:is\s*)?not\s*available|page\s*not\s*found|\bundefined\b|\bnull\b|\bnan\b|\.php\b|www\./i.test(
              allGuText + ' ' + allEnText + ' ' + (item.title.gu || '') + ' ' + (item.title.en || '')
            )
          ) {
            songIssues.push('JUNK_OR_PLACEHOLDER');
            details.push('Contains scraping placeholders, URLs, file extensions (.php), or NaN/undefined.');
          }

          // Check 5: Title issues (e.g. raw .php, numbers in parens like (1), missing Gujarati title)
          if (
            /\.php|\(\d+\)|\.html/i.test(item.title.gu || '') ||
            /\.php|\.html/i.test(item.title.en || '') ||
            !item.title.gu ||
            item.title.gu.trim() === ''
          ) {
            songIssues.push('TITLE_CORRUPTION');
            details.push(`Title has formatting issues: gu="${item.title.gu}", en="${item.title.en}".`);
          }

          // Check 6: Script contamination (e.g. Gujarati script not present in Gujarati lyrics, or English has raw Gujarati)
          const gujCharCount = (allGuText.match(/[઀-૿]/g) || []).length;
          if (guLines.length > 0 && gujCharCount === 0) {
            songIssues.push('MISSING_GUJARATI_SCRIPT');
            details.push('Gujarati lyrics contain zero Gujarati Unicode characters.');
          }

          // Check 7: Transliteration missing or severely out of sync
          if (guLines.length >= 6 && enLines.length === 0) {
            songIssues.push('MISSING_ENGLISH_TRANSLITERATION');
            details.push('English transliteration is completely missing.');
          }
          if (guLines.length >= 6 && hiLines.length === 0) {
            songIssues.push('MISSING_HINDI_SCRIPT');
            details.push('Hindi/Devanagari rendering is completely missing.');
          }

          // Check 8: Severe line count mismatch (> 50% discrepancy between Gu and En)
          if (guLines.length >= 8 && enLines.length > 0 && Math.abs(guLines.length - enLines.length) > guLines.length * 0.6) {
            songIssues.push('TRANSLITERATION_LINE_MISMATCH');
            details.push(`Line mismatch: Gujarati has ${guLines.length} lines but English has ${enLines.length} lines.`);
          }

          // Check 9: Excessive repetitive / loop lines (e.g. same line > 8 times)
          if (guLines.length > 10) {
            const counts = new Map<string, number>();
            for (const l of guLines) {
              const trimmed = l.trim();
              if (trimmed.length > 5) {
                counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
              }
            }
            for (const [line, c] of counts.entries()) {
              if (c >= 8 && c >= guLines.length * 0.5) {
                songIssues.push('EXCESSIVE_REPETITION');
                details.push(`Single line "${line.slice(0, 30)}..." repeats ${c} times out of ${guLines.length} lines.`);
                break;
              }
            }
          }

          if (songIssues.length > 0) {
            issues.push({
              id: item.id,
              titleGu: item.title.gu || item.id,
              titleEn: item.title.en || item.id,
              category: song.category || 'Navratri',
              issueTypes: songIssues,
              details,
              totalGuLines: guLines.length,
              sampleLyricsGu: guLines.slice(0, 2).join(' / '),
            });
          } else {
            validGarbas.push({
              id: item.id,
              titleGu: item.title.gu,
              lines: guLines.length,
            });
          }
        } catch (err: any) {
          issues.push({
            id: item.id,
            titleGu: item.title.gu || item.id,
            titleEn: item.title.en || item.id,
            category: 'Navratri',
            issueTypes: ['FETCH_ERROR'],
            details: [`Failed to fetch or parse: ${err.message}`],
            totalGuLines: 0,
            sampleLyricsGu: '',
          });
        } finally {
          processed++;
          if (processed % 50 === 0 || processed === items.length) {
            console.log(`Processed ${processed}/${items.length} songs...`);
          }
        }
      })
    );
  }

  const report = {
    totalScanned: items.length,
    totalWithIssues: issues.length,
    totalValid: validGarbas.length,
    issuesByType: {} as Record<string, number>,
    issues,
  };

  for (const iss of issues) {
    for (const t of iss.issueTypes) {
      report.issuesByType[t] = (report.issuesByType[t] || 0) + 1;
    }
  }

  fs.writeFileSync('scripts/audit_report.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('✅ Audit complete! Report written to scripts/audit_report.json');
  console.log(`Total scanned: ${items.length}`);
  console.log(`Songs with issues: ${issues.length}`);
  console.log('Issues by type:', report.issuesByType);
}

run().catch(console.error);

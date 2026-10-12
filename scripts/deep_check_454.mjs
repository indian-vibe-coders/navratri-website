import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function fetchWithRetry(url, retries = 3) {
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

async function analyze() {
  console.log('Fetching songs from garbaraas.in...');
  const listData = await fetchWithRetry('https://garbaraas.in/api/songs?collection=navratri&limit=1000');
  const items = listData.items || [];
  console.log(`Total songs found: ${items.length}`);

  const report = JSON.parse(fs.readFileSync('scripts/audit_report.json', 'utf8'));
  const defectiveIds = new Set(report.issues.map((i) => i.id));

  const healthyItems = items.filter((i) => !defectiveIds.has(i.id));
  console.log(`Healthy songs to deep-check: ${healthyItems.length}`);

  let totalLines = 0;
  let minLines = 999;
  let maxLines = 0;
  let lineDistribution = { '4-8': 0, '9-15': 0, '16-30': 0, '31+': 0 };
  let shortSongs = [];
  let sampledSongs = [];

  const CONCURRENCY = 15;
  for (let i = 0; i < healthyItems.length; i += CONCURRENCY) {
    const chunk = healthyItems.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (item) => {
        try {
          const song = await fetchWithRetry(`https://garbaraas.in/api/songs/${encodeURIComponent(item.id)}`);
          let guLines = [];
          if (song.lyrics?.sections && Array.isArray(song.lyrics.sections)) {
            for (const sec of song.lyrics.sections) {
              if (sec.lines) {
                if (Array.isArray(sec.lines)) {
                  guLines.push(...sec.lines.map((l) => l.gu || ''));
                } else if (Array.isArray(sec.lines.gu)) {
                  guLines.push(...sec.lines.gu);
                }
              }
            }
          } else if (song.lyrics?.gu) {
            guLines = song.lyrics.gu;
          }

          guLines = guLines.filter((l) => l.trim().length > 0);
          const count = guLines.length;
          totalLines += count;
          if (count < minLines) minLines = count;
          if (count > maxLines) maxLines = count;

          if (count <= 8) lineDistribution['4-8']++;
          else if (count <= 15) lineDistribution['9-15']++;
          else if (count <= 30) lineDistribution['16-30']++;
          else lineDistribution['31+']++;

          if (count <= 6) {
            shortSongs.push({ id: song.id, title: song.title.gu || song.title.en, lines: count });
          }

          if (sampledSongs.length < 5 && count >= 12) {
            sampledSongs.push({
              id: song.id,
              titleGu: song.title.gu,
              titleEn: song.title.en,
              linesCount: count,
              firstThreeLines: guLines.slice(0, 3),
              lastLine: guLines[guLines.length - 1],
            });
          }
        } catch {
          // ignore
        }
      })
    );
  }

  const result = {
    totalChecked: healthyItems.length,
    avgLinesPerSong: Math.round(totalLines / healthyItems.length),
    minLines,
    maxLines,
    lineDistribution,
    shortSongsCount: shortSongs.length,
    shortSongs,
    sampledSongs,
  };

  fs.writeFileSync('scripts/deep_healthy_stats.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('Results:', result);
}

analyze().catch(console.error);

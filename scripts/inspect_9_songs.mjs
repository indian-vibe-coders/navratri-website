import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const ids = [
  'randal-ma-no-divdo-toye-na-bujay-7c9f8d16',
  'jyare-rat-badhi-radhiyali-thay-jyare-divdao-jagmag-thay-230becff',
  'tu-kali-ne-kalyani-re-ma-jya-jou-tya-jogmaya-659bfe94',
  'ma-nu-leriyu-lehray-7d8f5cd3',
  'gagan-mandal-ni-gagardi-gun-garbi-re-03f0d3bc',
  'sakhi-marwad-javu-mari-bhari-juvani-jay-b0bc9bff',
  'gopal-maro-paraniye-jule-re-7fe446ab',
  'tara-re-nam-no-chhedyo-aek-taro-1d34acfc',
  'ram-rakshastotram-c80433e3',
];

async function run() {
  const all = {};
  for (const id of ids) {
    try {
      const res = await fetch(`https://garbaraas.in/api/songs/${id}`, {
        headers: { 'User-Agent': UA },
      });
      all[id] = await res.json();
    } catch (e) {
      console.error(id, e.message);
    }
  }
  fs.writeFileSync('scripts/detailed_9_songs.json', JSON.stringify(all, null, 2), 'utf8');
  console.log('Saved detailed_9_songs.json');
}

run();

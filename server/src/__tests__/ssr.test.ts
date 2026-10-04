import assert from 'node:assert';
import { handleGarbaSsr, handleHomepageSsr } from '../ssr.ts';
import { pool } from '../db.ts';

function createMockRes() {
  let statusCode = 200;
  let redirectUrl = '';
  let sentHtml = '';
  const headers: Record<string, string> = {};

  return {
    get statusCode() {
      return statusCode;
    },
    get redirectUrl() {
      return redirectUrl;
    },
    get sentHtml() {
      return sentHtml;
    },
    get headers() {
      return headers;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    setHeader(key: string, val: string) {
      headers[key] = val;
      return this;
    },
    set(key: string, val: string) {
      headers[key] = val;
      return this;
    },
    redirect(code: number, url: string) {
      statusCode = code;
      redirectUrl = url;
      return this;
    },
    send(html: string) {
      sentHtml = html;
      return this;
    },
  };
}

async function runTests() {
  console.log('🧪 Running handleGarbaSsr & handleHomepageSsr Real Request Handler Tests...\n');

  const originalQuery = pool.query;

  try {
    // 1. Gujarati-Only Title DB Song
    console.log('Test 1: handleGarbaSsr - DB Song with Gujarati-Only Title');
    pool.query = (async (_sql: string, params: any[]) => {
      if (params && params[0] === '5678') {
        return [[{
          id: '5678',
          title: JSON.stringify({ gu: 'કનૈયા ઓ કનૈયા' }),
          category: 'Traditional',
          lyrics: JSON.stringify({ gu: ['કનૈયા ઓ કનૈયા રાસ રમો'], sections: [] }),
          is_builtin: 0
        }], []];
      }
      return [[], []];
    }) as any;

    const resGujarati = createMockRes();
    await handleGarbaSsr({ params: { slug: '5678' } } as any, resGujarati as any);
    assert.strictEqual(resGujarati.statusCode, 200, 'Gujarati song request must return HTTP 200');
    assert(resGujarati.sentHtml.includes('href="https://garbaraas.in/garba/5678"'), 'Canonical URL for Gujarati-only DB song must be id alone (/garba/5678)');
    assert(!resGujarati.sentHtml.includes('/garba/%E0%AA%95'), 'URL must not contain Gujarati URL-encoded characters');
    assert(resGujarati.sentHtml.includes('property="og:type" content="article"'), 'Garba page must set og:type to article');
    assert(resGujarati.sentHtml.includes('property="og:locale" content="gu_IN"'), 'Garba page must set og:locale to gu_IN');
    assert.strictEqual((resGujarati.sentHtml.match(/property="og:image"\s+content=/g) || []).length, 1, 'Garba page must have exactly one og:image tag');
    console.log('  ✅ Passed: Gujarati-only DB song returns 200 with slug equal to ID alone (/garba/5678)\n');

    // 2. Title with Malicious Script Tags and Double Quotes
    console.log('Test 2: handleGarbaSsr - XSS & Double Quotes Escaping in Title');
    pool.query = (async (_sql: string, params: any[]) => {
      if (params && params[0] === '9999') {
        return [[{
          id: '9999',
          title: JSON.stringify({ en: 'Garba "Special" </script><script>alert(1)</script>', gu: 'ગરબો' }),
          category: 'Traditional',
          lyrics: JSON.stringify({ gu: ['તારાઓ'], sections: [] }),
          is_builtin: 0
        }], []];
      }
      return [[], []];
    }) as any;

    const resXss = createMockRes();
    await handleGarbaSsr({ params: { slug: 'garba-special-script-script-alert-1-script-9999' } } as any, resXss as any);
    assert.strictEqual(resXss.statusCode, 200, 'XSS song request with canonical slug must return HTTP 200');
    assert(!resXss.sentHtml.includes('<script>alert(1)</script>'), 'HTML output must NOT contain unescaped raw <script> tag');
    assert(resXss.sentHtml.includes('&quot;Special&quot; &lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;'), 'OG title/meta must escape double quotes & script tags');
    assert(resXss.sentHtml.includes('\\u003c/script'), 'JSON-LD block must contain \\u003c escaped characters');
    console.log('  ✅ Passed: XSS script tag and quotes are safely escaped in HTML attributes and JSON-LD\n');

    // 3. Artwork URL Fallback vs Absolute HTTPS Artwork
    console.log('Test 3: handleGarbaSsr - Relative / Non-HTTPS artwork falls back to default og:image');
    pool.query = (async (_sql: string, params: any[]) => {
      if (params && params[0] === '7777') {
        return [[{
          id: '7777',
          title: JSON.stringify({ en: 'Non-HTTPS Song', gu: 'ગીત' }),
          artwork_url: 'http://insecure-domain.com/image.jpg',
          category: 'Traditional',
          lyrics: JSON.stringify({ gu: ['બોલ'], sections: [] }),
          is_builtin: 0
        }], []];
      }
      return [[], []];
    }) as any;

    const resArtworkInsecure = createMockRes();
    await handleGarbaSsr({ params: { slug: 'non-https-song-7777' } } as any, resArtworkInsecure as any);
    assert.strictEqual(resArtworkInsecure.statusCode, 200);
    assert(resArtworkInsecure.sentHtml.includes('property="og:image" content="https://garbaraas.in/images/og-garba-share.png"'), 'Non-HTTPS artwork must fall back to default og-garba-share.png');
    assert(resArtworkInsecure.sentHtml.includes('property="og:image:width" content="1200"'), 'Fallback image must declare width 1200');
    assert(resArtworkInsecure.sentHtml.includes('property="og:image:height" content="630"'), 'Fallback image must declare height 630');
    assert.strictEqual((resArtworkInsecure.sentHtml.match(/property="og:image"\s+content=/g) || []).length, 1, 'Must have exactly one og:image tag');
    console.log('  ✅ Passed: Insecure artwork URL falls back to default og:image with width/height\n');

    // 4. Unknown Song ID 404 Response
    console.log('Test 4: handleGarbaSsr - Unknown Song ID Returns 404');
    pool.query = (async () => [[], []]) as any;

    const res404 = createMockRes();
    await handleGarbaSsr({ params: { slug: 'non-existent-garba-slug-99999' } } as any, res404 as any);
    assert.strictEqual(res404.statusCode, 404, 'Unknown song request must return HTTP 404');
    assert(res404.sentHtml.includes('name="robots" content="noindex"'), '404 HTML response must contain noindex meta tag');
    assert(res404.sentHtml.includes('window.__NOT_FOUND__ = true;'), '404 HTML response must inject window.__NOT_FOUND__ flag');
    console.log('  ✅ Passed: Unknown song ID returns HTTP 404 with noindex and window.__NOT_FOUND__\n');

    // 5. Trailing Slash Handling (/garba/x/)
    console.log('Test 5: handleGarbaSsr - Trailing Slash /garba/amba-abhay-pad-dayini/ Does Not Loop');
    const resTrailing = createMockRes();
    await handleGarbaSsr({ params: { slug: 'amba-abhay-pad-dayini/' } } as any, resTrailing as any);
    assert.strictEqual(resTrailing.statusCode, 200, 'Trailing slash request for valid built-in garba must return HTTP 200');
    assert.strictEqual(resTrailing.redirectUrl, '', 'Trailing slash must NOT trigger 301 redirect loop');
    assert.strictEqual((resTrailing.sentHtml.match(/property="og:image"\s+content=/g) || []).length, 1, 'Built-in Garba must have exactly one og:image tag');
    console.log('  ✅ Passed: Trailing slash /garba/amba-abhay-pad-dayini/ returns 200 without redirect loop\n');

    // 6. Homepage SSR (/ route)
    console.log('Test 6: handleHomepageSsr - Homepage / renders OG & Twitter Meta Tags');
    const resHome = createMockRes();
    await handleHomepageSsr({} as any, resHome as any);
    assert.strictEqual(resHome.statusCode, 200, 'Homepage request must return HTTP 200');
    assert(resHome.sentHtml.includes('property="og:site_name" content="Garbaraas"'), 'Homepage must contain og:site_name Garbaraas');
    assert(resHome.sentHtml.includes('property="og:type" content="website"'), 'Homepage must set og:type to website');
    assert(resHome.sentHtml.includes('property="og:locale" content="gu_IN"'), 'Homepage must set og:locale to gu_IN');
    assert(resHome.sentHtml.includes('property="og:image" content="https://garbaraas.in/images/og-garba-share.png"'), 'Homepage must set og:image to default share card');
    assert(resHome.sentHtml.includes('name="twitter:card" content="summary_large_image"'), 'Homepage must set twitter:card to summary_large_image');
    assert.strictEqual((resHome.sentHtml.match(/property="og:image"\s+content=/g) || []).length, 1, 'Homepage must have exactly one og:image tag');
    console.log('  ✅ Passed: Homepage / renders deduplicated OG and Twitter meta tags\n');

    console.log('🎉 All 6 handleGarbaSsr & handleHomepageSsr Real Request Handler Tests Passed Successfully!');
  } finally {
    pool.query = originalQuery;
  }
}

runTests().catch((err) => {
  console.error('❌ Test execution failed:', err.message, '\n', err.stack);
  process.exit(1);
});

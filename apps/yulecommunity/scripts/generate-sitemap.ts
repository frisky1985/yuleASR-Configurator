/**
 * Sitemap generator (minimal stub).
 * NOTE: original script was never committed to the repo (pre-existing gap);
 * this minimal implementation emits a valid sitemap.xml with the site root
 * so `pnpm build` can complete. Extend routes as needed.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = 'https://yuletech.github.io/yuleASR-Configurator';
const OUT_DIR = resolve(process.cwd(), 'public');

const urls = [
  { loc: '/', changefreq: 'weekly', priority: 1.0 },
  { loc: '/community', changefreq: 'weekly', priority: 0.8 },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(resolve(OUT_DIR, 'sitemap.xml'), xml);
console.log('[sitemap] generated public/sitemap.xml');

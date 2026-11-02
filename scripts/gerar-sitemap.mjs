// Gera public/sitemap.xml e public/robots.txt a partir do domínio em
// src/config.js (Etapa 15, item 8).
//
// Roda com "npm run sitemap". Sem siteUrl preenchido, o sitemap NÃO é gerado:
// um sitemap com domínio errado é pior que sitemap nenhum, porque manda o
// buscador indexar endereços que não existem. O robots.txt é gerado de
// qualquer jeito, porque a parte que importa dele (liberar o rastreio) não
// depende do domínio; só a linha do Sitemap depende.

import { writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { siteUrl } from '../src/config.js';

const RAIZ = process.cwd();
const base = siteUrl.replace(/\/$/, '');

// Páginas que não devem ser indexadas nem sugeridas no sitemap.
const FORA = new Set(['privacidade.html']);

const paginas = (await readdir(RAIZ))
  .filter((f) => f.endsWith('.html') && !FORA.has(f))
  .sort();

if (base) {
  const hoje = new Date().toISOString().slice(0, 10);
  const url = (f) => `${base}/${f === 'index.html' ? '' : f}`;
  const corpo = paginas
    .map(
      (f) =>
        `  <url>\n    <loc>${url(f)}</loc>\n    <lastmod>${hoje}</lastmod>\n` +
        `    <priority>${f === 'index.html' ? '1.0' : '0.8'}</priority>\n  </url>`
    )
    .join('\n');
  await writeFile(
    path.join(RAIZ, 'public', 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${corpo}\n</urlset>\n`
  );
  console.log(`sitemap.xml gerado com ${paginas.length} páginas em ${base}`);
} else {
  console.log(
    'sitemap.xml NAO gerado: preencha "siteUrl" em src/config.js com o dominio oficial.'
  );
}

await writeFile(
  path.join(RAIZ, 'public', 'robots.txt'),
  `User-agent: *\nAllow: /\n\n` +
    `# Pagina de politica: util para quem visita, sem valor de busca.\n` +
    `Disallow: /privacidade.html\n` +
    (base ? `\nSitemap: ${base}/sitemap.xml\n` : `\n# Sitemap: preencha "siteUrl" em src/config.js e rode "npm run sitemap".\n`)
);
console.log('robots.txt gerado.');

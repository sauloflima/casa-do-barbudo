// Pós-build: substitui o <script type="module"> gerado pelo Vite por um
// bundle clássico (IIFE, sem import/export) em dist/.
//
// Por quê: navegadores bloqueiam por CORS o carregamento de scripts
// type="module" (e também o loader do SystemJS, que usa fetch()) quando o
// HTML é aberto direto via file://, como acontece ao dar duplo clique em
// dist/index.html. Um <script> clássico não tem essa restrição e funciona
// tanto em http(s) quanto em file://. O CSS não precisa desse tratamento:
// <link rel="stylesheet"> carrega normalmente via file://.
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile, unlink, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const distDir = path.join(root, 'dist');
const assetsDir = path.join(distDir, 'assets');
const outFile = path.join(assetsDir, 'main.js');

if (!existsSync(distDir)) {
  console.error('dist/ não existe. Rode "vite build" antes deste script.');
  process.exit(1);
}

// Ignora imports de CSS dentro do main.js: o Vite já extraiu e linkou o CSS
// separadamente (via <link rel="stylesheet">), então o bundle JS não precisa
// (e não deve) reprocessá-lo.
const ignoreCssPlugin = {
  name: 'ignore-css-imports',
  setup(pluginBuild) {
    pluginBuild.onLoad({ filter: /\.css$/ }, () => ({ contents: '', loader: 'js' }));
  },
};

const bundle = await build({
  entryPoints: [path.join(root, 'src/scripts/main.js')],
  bundle: true,
  format: 'iife',
  target: 'es2018',
  minify: true,
  legalComments: 'none',
  outfile: outFile,
  write: false,
  plugins: [ignoreCssPlugin],
});

// O nome acompanha o conteúdo para o Safari não reaproveitar uma versão antiga.
const content = bundle.outputFiles[0].contents;
const bundleName = `main-classic-${createHash('sha256').update(content).digest('hex').slice(0, 12)}.js`;
await writeFile(path.join(assetsDir, bundleName), content);

// Troca o <script type="module" ...> pelo bundle clássico em cada página, e
// coleta os nomes dos chunks ESM antigos (agora órfãos) para removê-los.
//
// Também remove o atributo crossorigin do <link rel="stylesheet"> do CSS
// local gerado pelo Vite: em file://, esse atributo faz o Chrome buscar o
// CSS em modo CORS, e CORS é uma operação não suportada para o esquema
// file: (erro "CorsDisabledScheme"), o que descarta a folha de estilos
// inteira e deixa a página sem estilo nenhum. O <link rel="preconnect">
// das Google Fonts mantém seu crossorigin — é para um domínio remoto de
// verdade, onde CORS funciona normalmente.
const htmlFiles = (await readdir(distDir)).filter((f) => f.endsWith('.html'));
const orphanedChunks = new Set();
const moduleScriptRe =
  /<script[^>]*type="module"[^>]*src="\.\/assets\/(main-[^"]+\.js)"[^>]*><\/script>/;
const localCssLinkRe =
  /<link[^>]*rel="stylesheet"[^>]*href="\.\/assets\/[^"]+\.css"[^>]*>/g;

for (const file of htmlFiles) {
  const filePath = path.join(distDir, file);
  let html = await readFile(filePath, 'utf-8');

  const match = html.match(moduleScriptRe);
  if (!match) {
    console.warn(`Aviso: nenhum <script type="module"> encontrado em ${file}`);
  } else {
    orphanedChunks.add(match[1]);
    html = html.replace(match[0], `<script defer src="./assets/${bundleName}"></script>`);
  }

  const cssMatches = html.match(localCssLinkRe) ?? [];
  if (cssMatches.length === 0) {
    console.warn(`Aviso: nenhum <link rel="stylesheet"> local encontrado em ${file}`);
  }
  for (const tag of cssMatches) {
    const fixed = tag.replace(/\s+crossorigin(="[^"]*")?/, '');
    html = html.replace(tag, fixed);
  }

  await writeFile(filePath, html, 'utf-8');
}

for (const chunk of orphanedChunks) {
  const chunkPath = path.join(assetsDir, chunk);
  if (existsSync(chunkPath)) await unlink(chunkPath);
}

console.log(`✓ Bundle clássico gerado: dist/assets/${bundleName} (${orphanedChunks.size} chunk(s) ESM removido(s))`);

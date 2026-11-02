// Gera as versões AVIF e WebP das fotos reais do site (Etapa 15, item 3).
//
// Roda sob demanda (npm run imagens), não a cada build: as fotos mudam
// raramente e reconverter a cada build só gastaria tempo à toa. Os arquivos
// gerados ficam versionados junto dos originais em public/images/.
//
// Os JPEG originais NUNCA são tocados: eles continuam sendo o último fallback
// do <picture> e a fonte de qualquer reconversão futura.
//
// DIMENSÃO PAR: o AV1, base do AVIF, decodifica de forma não confiável em
// larguras ou alturas ímpares. As fotos verticais do projeto têm 941px de
// largura, e o AVIF gerado a partir delas carregava e reportava dimensões
// certas mas era pintado inteiramente preto. Cortar um pixel para chegar a
// 940 resolve. Sem isso o site publicaria uma foto invisível para todo
// navegador com suporte a AVIF, que é justamente a maioria.

import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const RAIZ = path.join(process.cwd(), 'public', 'images');
const ORIGENS = /\.(jpe?g|png)$/i;

// Originais que ficam guardados mas não entram no pipeline. Os dois primeiros
// são referência do que o dono enviou para o hero; quem é servido é o .jpg ao
// lado. "foto da barba.png" é o original da foto do bloco de Barba: além de ser
// um PNG de 2,3 MB, o nome tem espaço, e nome com espaço já quebrou o srcset
// uma vez no build (o Vite reescreve %20 como %2520, ver Etapa 7). O tratado e
// renomeado vive em images/galeria/barba.jpg.
const IGNORAR = new Set(['fachada-mobile.png', 'fachada- desktop.jpeg', 'foto da barba.png']);

async function* percorrer(dir) {
  for (const nome of await readdir(dir)) {
    const completo = path.join(dir, nome);
    if ((await stat(completo)).isDirectory()) yield* percorrer(completo);
    else if (ORIGENS.test(nome) && !IGNORAR.has(nome)) yield completo;
  }
}

const par = (n) => n - (n % 2);
const kb = (n) => Math.round(n / 1024);

let totalOrig = 0, totalAvif = 0, totalWebp = 0;

for await (const origem of percorrer(RAIZ)) {
  const meta = await sharp(origem).metadata();
  const largura = par(meta.width);
  const altura = par(meta.height);
  const base = origem.replace(ORIGENS, '');
  const rel = path.relative(RAIZ, origem);

  const redimensiona = (s) =>
    largura !== meta.width || altura !== meta.height ? s.resize(largura, altura) : s;

  await redimensiona(sharp(origem)).avif({ quality: 62 }).toFile(`${base}.avif`);
  await redimensiona(sharp(origem)).webp({ quality: 80 }).toFile(`${base}.webp`);

  const o = (await stat(origem)).size;
  const a = (await stat(`${base}.avif`)).size;
  const w = (await stat(`${base}.webp`)).size;
  totalOrig += o; totalAvif += a; totalWebp += w;

  const dim = largura !== meta.width || altura !== meta.height
    ? ` (${meta.width}x${meta.height} -> ${largura}x${altura}, largura/altura par)`
    : '';
  console.log(
    `${rel.padEnd(30)} ${String(kb(o)).padStart(4)}KB  ` +
    `avif ${String(kb(a)).padStart(4)}KB (-${100 - Math.round((a / o) * 100)}%)  ` +
    `webp ${String(kb(w)).padStart(4)}KB (-${100 - Math.round((w / o) * 100)}%)${dim}`
  );
}

console.log(
  `\nTotal: original ${kb(totalOrig)}KB | ` +
  `avif ${kb(totalAvif)}KB (-${100 - Math.round((totalAvif / totalOrig) * 100)}%) | ` +
  `webp ${kb(totalWebp)}KB (-${100 - Math.round((totalWebp / totalOrig) * 100)}%)`
);

// Tira do site publicado os arquivos que nenhuma página referencia
// (Etapa 15, performance).
//
// Os originais em public/ NÃO são apagados: eles continuam no repositório como
// fonte para reconversão futura e como registro do que foi enviado. O que este
// passo faz é não empurrar 2,4 MB de peso morto para quem hospeda o site.
//
// A lista é explícita, não automática: varrer e apagar "o que não achei
// referência" é o tipo de esperteza que um dia apaga um arquivo usado por um
// caminho montado em tempo de execução.

import { rm, stat } from 'node:fs/promises';
import path from 'node:path';

const ORFAOS = [
  // PNG original da foto de celular do hero (2,2 MB). Quem é servido é o
  // .jpg/.avif/.webp ao lado; este fica só como original enviado.
  'images/hero/fachada-mobile.png',
  // JPEG de 960x960 com extensão .svg, que por isso nem renderizava. Foi
  // substituído por images/logo/logo.{avif,webp,jpg} a 96px (Etapa 15).
  'images/logo/logo-placeholder.svg',
  // Cópia com espaço no nome, mantida intacta em public/ desde a Etapa 7.
  'images/hero/fachada- desktop.jpeg',
  // PNG original da foto de barba (2,3 MB), como veio do dono. Quem é servido
  // é images/galeria/barba.{avif,webp,jpg}, já tratado e sem espaço no nome.
  'images/hero/foto da barba.png',
];

const DIST = path.join(process.cwd(), 'dist');
let liberado = 0;

for (const rel of ORFAOS) {
  const alvo = path.join(DIST, rel);
  try {
    liberado += (await stat(alvo)).size;
    await rm(alvo);
  } catch {
    // Não existe no dist: tudo bem, nada a fazer.
  }
}

if (liberado) {
  console.log(`✓ Removidos do dist ${Math.round(liberado / 1024)} KB sem referência (originais preservados em public/).`);
}

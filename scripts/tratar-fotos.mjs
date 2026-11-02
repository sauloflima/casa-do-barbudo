// ============================================================================
// TRATAMENTO FOTOGRÁFICO DAS IMAGENS SELECIONADAS
// ----------------------------------------------------------------------------
// Lê os originais de fotos-originais/, aplica um tratamento DIFERENTE para cada
// fotografia (nunca o mesmo ajuste em lote, ver MAPA-FOTOS.md), grava as
// versões tratadas nos destinos finais e monta folhas de comparação temporárias
// para conferência.
//
// Os originais NUNCA são alterados. Toda edição grava cópia em outro caminho.
//
// POR QUE fotos-originais/ FICA NA RAIZ E NÃO EM public/:
// o Vite copia a pasta public/ inteira para dist/. Guardar os originais de
// celular ali significaria publicar mais de 150 MB de peso morto no site, e
// ainda faria scripts/gerar-imagens.mjs tentar gerar AVIF e WebP de cada um.
// Na raiz, os originais ficam preservados no projeto e fora do build.
//
// Uso:
//   node scripts/tratar-fotos.mjs
//
// O script processa apenas os arquivos que encontrar e lista os que faltam,
// então pode rodar parcialmente enquanto o material vai chegando.
//
// Depois de rodar, gerar AVIF e WebP com: npm run imagens
// ============================================================================

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const RAIZ = process.cwd();
const ORIGEM = path.join(RAIZ, 'fotos-legiveis');
const COMPARACOES = path.join(RAIZ, 'comparacoes-temporarias');

// Dimensão par: o AV1 decodifica de forma não confiável em largura ímpar e
// renderiza preto. Mordeu o projeto na Etapa 15, não pode voltar a morder.
const par = (n) => n - (n % 2);

// ---------------------------------------------------------------------------
// Receita por fotografia. Cada bloco foi definido olhando a imagem, não por
// padrão. Ver MAPA-FOTOS.md para o motivo de cada escolha.
//
//   wb        ganho por canal [R, G, B]. Corrige dominante de cor.
//   gamma     > 1 levanta sombras e meios-tons.
//   linear    [multiplicador, deslocamento] para contraste.
//   satur     multiplicador de saturação.
//   sharpen   nitidez seletiva.
//   vinheta   0 desliga. Valor pequeno escurece as bordas de leve.
//   recorte   'entrada' relativa: {left,top,width,height} em fração de 0 a 1.
// ---------------------------------------------------------------------------

const RECEITAS = {
  // === AMBIENTE E EXPERIÊNCIA (Home). A única horizontal boa do salão. ======
  '09': {
    destino: 'public/images/ambiente/salao.jpg',
    nota: 'Salão com duas cadeiras, visto do sofá. Horizontal. LED branca forte no teto, parede amarela saturada, sofá escuro em primeiro plano.',
    wb: [0.99, 1.0, 1.02],
    gamma: 1.10,
    linear: [1.05, -5],
    satur: 0.93,
    sharpen: { sigma: 0.8, m1: 0.5, m2: 1.5 },
    vinheta: 0.10,
    variantes: [
      { sufixo: 'desktop', proporcao: 16 / 9, largura: 1024, foco: 'centro' },
      { sufixo: 'mobile', proporcao: 4 / 5, largura: 760, foco: 'centro' },
    ],
  },

  // === GALERIA, categoria Interior =========================================
  '40': {
    destino: 'public/images/galeria/interior-salao.jpg',
    nota: 'Salão longo: bancada amarela, cadeira, bancos e quadros ao fundo. Luz mista, LED branca e pendentes laranja.',
    wb: [0.99, 1.0, 1.02],
    gamma: 1.08,
    linear: [1.05, -5],
    satur: 0.94,
    sharpen: { sigma: 0.85, m1: 0.5, m2: 1.6 },
    vinheta: 0.08,
    variantes: [{ sufixo: '', proporcao: 3 / 4, largura: 760, foco: 'centro' }],
  },

  '11': {
    destino: 'public/images/galeria/interior-recepcao.jpg',
    nota: 'Recepção horizontal: arco, porta, balcão. Piso branco brilhante é a área mais clara; luz do dia pela porta briga com a luz interna.',
    wb: [1.02, 1.0, 0.98],
    gamma: 1.04,
    linear: [1.07, -9],
    satur: 0.97,
    sharpen: { sigma: 0.8, m1: 0.5, m2: 1.5 },
    vinheta: 0.12,
    variantes: [{ sufixo: '', proporcao: 4 / 3, largura: 1010, foco: 'centro' }],
  },

  '16': {
    destino: 'public/images/galeria/interior-balcao.jpg',
    nota: 'Balcão da recepção com o logotipo. UNICA em resolução de camera (3652x5487), o que permite recorte generoso sem perder qualidade.',
    // O assunto (balcão com o emblema) ocupa só a metade inferior do quadro
    // original: a metade de cima é TV desligada, relógio e parede. Um recorte
    // centrado pegaria justamente a TV. Este recorte fecha no balcão.
    wb: [1.0, 1.0, 1.01],
    gamma: 1.05,
    linear: [1.05, -5],
    satur: 0.96,
    sharpen: { sigma: 0.9, m1: 0.5, m2: 1.6 },
    vinheta: 0.08,
    recorte: { left: 0.02, top: 0.40, width: 0.90, height: 0.56 },
    variantes: [{ sufixo: '', proporcao: 1, largura: 1200, foco: 'centro' }],
  },

  '31': {
    destino: 'public/images/galeria/interior-espera.jpg',
    nota: 'Sala de espera: parede de retratos, luvas, guitarra, bancos de couro. Spots ja bem dirigidos, mexer pouco.',
    wb: [1.0, 1.0, 1.01],
    gamma: 1.04,
    linear: [1.03, -3],
    satur: 0.98,
    sharpen: { sigma: 0.7, m1: 0.45, m2: 1.4 },
    vinheta: 0.06,
    variantes: [{ sufixo: '', proporcao: 3 / 4, largura: 760, foco: 'centro' }],
  },

  '15': {
    destino: 'public/images/galeria/interior-estacoes.jpg',
    nota: 'Estacoes com luminaria hexagonal. O amarelo da parede domina o quadro.',
    wb: [0.98, 1.0, 1.04],
    gamma: 1.06,
    linear: [1.05, -5],
    satur: 0.90,
    sharpen: { sigma: 0.85, m1: 0.5, m2: 1.6 },
    vinheta: 0.08,
    variantes: [{ sufixo: '', proporcao: 3 / 4, largura: 760, foco: 'centro' }],
  },

  '10': {
    destino: 'public/images/galeria/interior-lavatorio.jpg',
    nota: 'Escada caracol e lavatorio, parede ripada. Teto danificado no canto superior, o recorte reduz.',
    wb: [0.985, 1.0, 1.03],
    gamma: 1.07,
    linear: [1.05, -5],
    satur: 0.95,
    sharpen: { sigma: 0.85, m1: 0.5, m2: 1.6 },
    vinheta: 0.08,
    recorte: { left: 0, top: 0.05, width: 1, height: 0.95 },
    variantes: [{ sufixo: '', proporcao: 3 / 4, largura: 760, foco: 'centro' }],
  },

  // BLOCO CORTE (Home): a receita '32' saiu daqui. home/corte.jpg agora é a
  // foto de corte enviada pelo dono (já tratada), e re-rodar este script a
  // sobrescreveria com a foto antiga da estação.

  // === PRODUTOS ============================================================
  '30': {
    destino: 'public/images/produtos/prateleira.jpg',
    nota: 'Prateleira de produtos de frente. Flare de lampada no topo. Rotulos precisam continuar legiveis: nitidez cuidadosa, sem reducao de ruido agressiva.',
    wb: [0.99, 1.0, 1.02],
    gamma: 1.04,
    linear: [1.07, -8],
    satur: 0.96,
    sharpen: { sigma: 0.7, m1: 0.55, m2: 1.3 },
    vinheta: 0.06,
    recorte: { left: 0.02, top: 0.08, width: 0.96, height: 0.88 },
    variantes: [{ sufixo: '', proporcao: 1, largura: 760, foco: 'centro' }],
  },

  // === GALERIA, categoria Fachada (material adicional) =====================
  '34': {
    destino: 'public/images/galeria/fachada-dia.jpg',
    nota: 'Fachada frontal de dia, sem pessoas. Ceu nublado pede um pouco de vida. NENHUMA alteracao em preco ou texto de placa.',
    wb: [1.0, 1.0, 1.0],
    gamma: 1.03,
    linear: [1.06, -6],
    satur: 1.03,
    sharpen: { sigma: 0.8, m1: 0.5, m2: 1.5 },
    vinheta: 0.08,
    variantes: [{ sufixo: '', proporcao: 3 / 4, largura: 760, foco: 'centro' }],
  },
};

// ---------------------------------------------------------------------------

function vinhetaSVG(w, h, forca) {
  if (!forca) return null;
  const c = Math.round(255 * (1 - forca));
  return Buffer.from(
    `<svg width="${w}" height="${h}"><defs><radialGradient id="v" cx="50%" cy="45%" r="78%">` +
      `<stop offset="58%" stop-color="#fff"/><stop offset="100%" stop-color="rgb(${c},${c},${c})"/>` +
      `</radialGradient></defs><rect width="${w}" height="${h}" fill="url(#v)"/></svg>`
  );
}

// Recorte para uma proporção alvo, mantendo o foco pedido.
function caixaRecorte(w, h, proporcao, foco) {
  const atual = w / h;
  let cw = w;
  let ch = h;
  if (atual > proporcao) {
    cw = Math.round(h * proporcao);
  } else {
    ch = Math.round(w / proporcao);
  }
  const left = Math.round((w - cw) / 2);
  let top;
  if (foco === 'topo') top = 0;
  else if (foco === 'base') top = h - ch;
  else top = Math.round((h - ch) / 2);
  return { left, top, width: cw, height: ch };
}

async function acharOriginal(base) {
  const exts = ['.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.heic', '.HEIC'];
  for (const e of exts) {
    const p = path.join(ORIGEM, base + e);
    if (existsSync(p)) return p;
  }
  return null;
}

async function tratar(base, receita) {
  const origem = await acharOriginal(base);
  if (!origem) return { base, status: 'faltando' };

  const meta = await sharp(origem).metadata();
  const destinoAbs = path.join(RAIZ, receita.destino);
  await mkdir(path.dirname(destinoAbs), { recursive: true });
  await mkdir(COMPARACOES, { recursive: true });

  // Pipeline base: rotação pelo EXIF, recorte de limpeza, cor, tom, nitidez.
  let pipe = sharp(origem).rotate();

  if (receita.recorte) {
    const r = receita.recorte;
    pipe = pipe.extract({
      left: Math.round(meta.width * r.left),
      top: Math.round(meta.height * r.top),
      width: Math.round(meta.width * r.width),
      height: Math.round(meta.height * r.height),
    });
  }

  pipe = pipe
    .recomb([
      [receita.wb[0], 0, 0],
      [0, receita.wb[1], 0],
      [0, 0, receita.wb[2]],
    ])
    .gamma(receita.gamma)
    .linear(receita.linear[0], receita.linear[1])
    .modulate({ saturation: receita.satur })
    .sharpen(receita.sharpen);

  const tratadaBuf = await pipe.png().toBuffer();
  const tm = await sharp(tratadaBuf).metadata();

  const saidas = [];
  for (const v of receita.variantes) {
    const caixa = caixaRecorte(tm.width, tm.height, v.proporcao, v.foco);
    const alturaAlvo = Math.round(v.largura / v.proporcao);

    let vp = sharp(tratadaBuf)
      .extract(caixa)
      .resize(par(v.largura), par(alturaAlvo), { kernel: 'lanczos3' });

    const vinheta = vinhetaSVG(par(v.largura), par(alturaAlvo), receita.vinheta);
    let buf = await vp.png().toBuffer();
    if (vinheta) {
      buf = await sharp(buf)
        .composite([{ input: vinheta, blend: 'multiply' }])
        .png()
        .toBuffer();
    }

    const ext = path.extname(receita.destino);
    const semExt = receita.destino.slice(0, -ext.length);
    const alvo = v.sufixo
      ? path.join(RAIZ, `${semExt}-${v.sufixo}${ext}`)
      : path.join(RAIZ, receita.destino);

    await sharp(buf)
      .jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(alvo);

    saidas.push({ arquivo: path.relative(RAIZ, alvo), w: par(v.largura), h: par(alturaAlvo) });
  }

  // Folha de comparação: original, tratada e cada recorte, lado a lado.
  const ALTURA = 900;
  const pecas = [];
  const orig = await sharp(origem).rotate().resize({ height: ALTURA }).png().toBuffer();
  pecas.push({ buf: orig, rot: 'ORIGINAL' });
  const trat = await sharp(tratadaBuf).resize({ height: ALTURA }).png().toBuffer();
  pecas.push({ buf: trat, rot: 'TRATADA' });
  for (const s of saidas) {
    const b = await sharp(path.join(RAIZ, s.arquivo)).resize({ height: ALTURA }).png().toBuffer();
    pecas.push({ buf: b, rot: s.arquivo.split('/').pop() });
  }

  const dims = await Promise.all(pecas.map((p) => sharp(p.buf).metadata()));
  const gap = 16;
  const larguraTotal = dims.reduce((a, d) => a + d.width, 0) + gap * (pecas.length - 1);
  const comps = [];
  let x = 0;
  for (let i = 0; i < pecas.length; i++) {
    comps.push({ input: pecas[i].buf, top: 0, left: x });
    comps.push({
      input: Buffer.from(
        `<svg width="${dims[i].width}" height="44"><rect width="${dims[i].width}" height="44" fill="rgba(21,19,15,0.85)"/>` +
          `<text x="14" y="30" font-family="Helvetica,Arial" font-size="20" fill="#f2ead9">${pecas[i].rot}</text></svg>`
      ),
      top: ALTURA - 44,
      left: x,
    });
    x += dims[i].width + gap;
  }

  await sharp({
    create: { width: larguraTotal, height: ALTURA, channels: 3, background: '#15130f' },
  })
    .composite(comps)
    .jpeg({ quality: 86 })
    .toFile(path.join(COMPARACOES, `${base}-comparacao.jpg`));

  return { base, status: 'ok', origem: `${meta.width}x${meta.height}`, saidas, nota: receita.nota };
}

// ---------------------------------------------------------------------------

const entradas = Object.entries(RECEITAS);
const resultados = [];
for (const [base, receita] of entradas) {
  try {
    resultados.push(await tratar(base, receita));
  } catch (err) {
    resultados.push({ base, status: 'erro', msg: err.message });
  }
}

const ok = resultados.filter((r) => r.status === 'ok');
const faltando = resultados.filter((r) => r.status === 'faltando');
const erros = resultados.filter((r) => r.status === 'erro');

console.log('');
for (const r of ok) {
  console.log(`✓ ${r.base}  (original ${r.origem})`);
  for (const s of r.saidas) console.log(`    ${s.arquivo}  ${s.w}x${s.h}`);
}
if (faltando.length) {
  console.log('');
  console.log(`Faltando em fotos-originais/ (${faltando.length}):`);
  for (const r of faltando) console.log(`    ${r.base}`);
}
if (erros.length) {
  console.log('');
  console.log('Erros:');
  for (const r of erros) console.log(`    ${r.base}: ${r.msg}`);
}
console.log('');
console.log(`Tratadas: ${ok.length} de ${entradas.length}.`);
if (ok.length) {
  console.log(`Folhas de comparação em: comparacoes-temporarias/`);
  console.log('Depois de conferir, rode: npm run imagens');
}

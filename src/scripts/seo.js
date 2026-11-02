// SEO local (Etapa 15, itens 7 e 9): canonical, og:url, imagem social
// absoluta e JSON-LD LocalBusiness.
//
// Por que em JS e não escrito à mão nas 9 páginas: o domínio ainda não existe
// (ver siteUrl em src/config.js). Escrever um domínio inventado nos 9 arquivos
// seria exatamente o que o item 10 proíbe, e deixar 9 cópias para atualizar à
// mão depois é convite a esquecer uma. Com isto, preencher siteUrl uma vez
// resolve o site inteiro.
//
// Sem siteUrl preenchido, o canonical e o og:url simplesmente não são criados.
// Um canonical relativo ou apontando para localhost é pior que canonical
// nenhum: ensina o buscador a indexar o endereço errado.
//
// REGRA DO ITEM 10, o que este arquivo NÃO declara, por não ser dado
// confirmado: aggregateRating e review (as avaliações do site ainda são
// placeholders), priceRange (a placa da vitrine tem três preços, mas a faixa
// "$$" do schema.org é outra coisa e seria chute) e geo/latitude/longitude
// (ninguém mediu as coordenadas). Melhor um JSON-LD menor e verdadeiro do que
// um completo e inventado: dado errado em rich snippet é penalizado.

import { siteUrl, business } from '../config.js';

const abs = (caminho) => {
  if (!siteUrl) return null;
  return siteUrl.replace(/\/$/, '') + '/' + String(caminho).replace(/^\.?\//, '');
};

function definirMeta(seletor, criar, valor) {
  if (!valor) return;
  let el = document.head.querySelector(seletor);
  if (!el) {
    el = criar();
    document.head.appendChild(el);
  }
  if (el.tagName === 'LINK') el.setAttribute('href', valor);
  else el.setAttribute('content', valor);
}

export function initSeo() {
  const nomeDoArquivo = location.pathname.split('/').pop() || 'index.html';
  // A Home é a raiz do domínio ("/"), não "/index.html": é assim que
  // scripts/gerar-sitemap.mjs monta a URL dela no sitemap.xml, e canonical
  // e sitemap precisam concordar. Apontar para dois endereços diferentes da
  // mesma página é o tipo de sinal que confunde buscador sobre qual é a URL
  // "oficial", o oposto do que um canonical existe para resolver.
  const caminho = nomeDoArquivo === 'index.html' ? '' : nomeDoArquivo;
  const urlDaPagina = abs(caminho);

  // Canonical e og:url só existem quando há domínio real.
  definirMeta(
    'link[rel="canonical"]',
    () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; },
    urlDaPagina
  );
  definirMeta(
    'meta[property="og:url"]',
    () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:url'); return m; },
    urlDaPagina
  );

  // Imagem social em URL absoluta: redes sociais rejeitam caminho relativo.
  const ogImagem = document.head.querySelector('meta[property="og:image"]');
  if (ogImagem && siteUrl) {
    const atual = ogImagem.getAttribute('content') || '';
    if (!/^https?:/i.test(atual)) ogImagem.setAttribute('content', abs(atual));
  }

  // JSON-LD LocalBusiness, só com o que está confirmado.
  const dados = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: business.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.stateAbbr,
      addressCountry: 'BR',
    },
    telephone: business.phoneDisplay,
    // Horário da fonte pública aprovada em 02/11/2026.
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '13:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '14:00',
        closes: '20:00',
      },
    ],
  };

  if (siteUrl) dados.url = siteUrl;
  if (business.instagramUrl) dados.sameAs = [business.instagramUrl];

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(dados);
  document.head.appendChild(script);
}

// Mantém o HTML sem JavaScript consistente com as fontes usadas no navegador.
import { readFile, writeFile } from 'node:fs/promises';
import { catalogo, formatarPreco } from '../src/catalog.js';
import { produtos } from '../src/products.js';
import { assinaturas } from '../src/subscriptions.js';
import { getWhatsappLink } from '../src/config.js';

const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cta = (message, label, event, classes = 'btn btn-primary') => `<a class="${classes}" data-whatsapp-link data-whatsapp-message="${h(message)}" data-analytics-event="${event}" href="${h(getWhatsappLink(message))}" target="_blank" rel="noopener noreferrer">${h(label)}</a>`;
async function preencher(file, marker, content) {
  const path = new URL(`../${file}`, import.meta.url);
  const text = await readFile(path, 'utf8');
  const start = `<!-- inicio:${marker} -->`, end = `<!-- fim:${marker} -->`;
  if (!text.includes(start) || !text.includes(end)) throw new Error(`Marcador ausente: ${file}/${marker}`);
  const before = text.indexOf(start) + start.length, after = text.indexOf(end, before);
  await writeFile(path, text.slice(0, before) + '\n' + content + '\n' + text.slice(after));
}

await preencher('servicos.html', 'filtros-servicos', `<div class="catalogo-filtros" role="group" aria-label="Filtrar serviços por categoria">
<button type="button" class="catalogo-filtro is-active" data-filtro="todos" aria-pressed="true">Todos</button>
${catalogo.categorias.map((c) => `<button type="button" class="catalogo-filtro" data-filtro="${h(c.id)}" aria-pressed="false">${h(c.nome)}</button>`).join('\n')}
</div>`);
await preencher('servicos.html', 'servicos', `<div class="catalogo-grid" id="catalogo-grid">
${catalogo.categorias.flatMap((c) => c.servicos.map((s) => `<article class="servico-card" data-categoria="${h(c.id)}" data-reveal>
${s.foto ? `<img class="servico-foto" src="${h(s.foto)}" alt="Imagem de referência: ${h(s.nome)}" width="240" height="240" loading="lazy" decoding="async">` : ''}
<p class="servico-categoria">${h(c.nome)}</p><div class="servico-cabecalho"><h2 class="servico-nome">${h(s.nome)}</h2><p class="servico-preco">${h(formatarPreco(s.preco))}</p></div>
${s.descricao ? `<p class="servico-descricao">${h(s.descricao)}</p>` : ''}
${cta(`Olá! Vim pelo site e gostaria de agendar um horário na Casa do Barbudo. Serviço: ${s.nome}.`, `Agendar ${s.nome} no WhatsApp`, 'service_interest', 'btn btn-primary servico-cta')}
</article>`)).join('\n')}
</div>`);
await preencher('produtos.html', 'produtos', `<div class="produtos-grid" id="produtos-grid">
${produtos.map((p) => `<article class="produto-card" data-reveal><figure class="produto-figura"><img src="${h(p.foto)}" alt="${h(p.nome)}" width="400" height="400" loading="lazy" decoding="async"></figure><div class="produto-corpo"><p class="produto-categoria">${h(p.categoria)}</p><h2 class="produto-nome">${h(p.nome)}</h2><p class="produto-finalidade">${h(p.finalidade)}</p><div class="produto-meta">${p.tamanho ? `<span class="produto-tamanho">${h(p.tamanho)}</span>` : ''}<span class="produto-preco">${h(formatarPreco(p.preco))}</span></div>${cta(`Olá! Vim pelo site e queria saber mais sobre um produto: ${p.nome}.`, 'Consultar no WhatsApp', 'product_interest', 'btn btn-outline produto-cta')}</div></article>`).join('\n')}
</div>`);
await preencher('assinaturas.html', 'assinaturas', `<div class="assinaturas-grid">
${assinaturas.map((p, i) => `<article class="assinatura-card${i === 1 ? ' assinatura-card--destaque' : ''}" data-reveal><p class="eyebrow">Plano mensal</p><h2>${h(p.nome.replace('Assinatura Mensal — ', '').replace('Assinatura ', ''))}</h2><p class="assinatura-descricao">${h(p.descricao)}</p><div class="assinatura-valor">${p.prefixo ? `<span>${h(p.prefixo)}</span>` : ''}<p>${h(formatarPreco(p.preco))}<small>/mês</small></p></div>${cta(`Olá! Tenho interesse no plano ${p.nome}. Gostaria de saber as condições.`, 'Conversar sobre este plano', 'subscription_interest')}</article>`).join('\n')}
</div><p class="catalogo-nota">Consulte as condições, os serviços incluídos e a disponibilidade de horários antes de contratar.</p>`);
console.log(`HTML sincronizado: ${catalogo.categorias.reduce((n,c)=>n+c.servicos.length,0)} serviços, ${produtos.length} produtos e ${assinaturas.length} planos.`);

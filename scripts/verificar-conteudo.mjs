import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { catalogo, formatarPreco } from '../src/catalog.js';
import { produtos, formatarPrecoProduto } from '../src/products.js';
import { assinaturas } from '../src/subscriptions.js';
import { business } from '../src/config.js';
const root = new URL('../', import.meta.url);
const servicos = catalogo.categorias.flatMap(c => c.servicos);
assert.equal(servicos.length, 14);
assert.equal(produtos.length, 17);
assert.equal(assinaturas.length, 3);
assert.equal(business.hours.afternoon, '14h às 20h');
assert.equal(formatarPreco(null), null);
assert.equal(formatarPrecoProduto(NaN), null);
assert.equal(formatarPrecoProduto(Infinity), null);
for (const [file, list, cls] of [['servicos.html',servicos,'servico-card'],['produtos.html',produtos,'produto-card'],['assinaturas.html',assinaturas,'assinatura-card']]) {
  const html = await readFile(new URL(file,root),'utf8');
  assert.equal((html.match(new RegExp(`<article class="${cls}(?:[ "])`,'g'))||[]).length,list.length,file);
  for (const item of list) {
    assert.ok(Number.isFinite(item.preco) && item.preco>0,item.nome);
    const escaped=item.nome.replaceAll('&','&amp;').replaceAll("'",'&#39;');
    assert.ok(html.includes(escaped),`Nome ausente no HTML: ${item.nome}`);
    assert.ok(html.includes(formatarPreco(item.preco)),`Preço ausente: ${item.nome}`);
  }
}
assert.equal(new Set(produtos.map(p=>p.id)).size,produtos.length);
for(const p of produtos) {
  assert.match(p.foto,/^\.\/images\/produtos\/[a-z0-9-]+\.jpg$/);
  assert.ok((await stat(new URL('public/'+p.foto.slice(2),root))).size>0,p.nome);
}
for(const name of ['index','sobre','servicos','produtos','assinaturas','equipe','galeria','localizacao','privacidade','cursos']) {
 const html=await readFile(new URL(name+'.html',root),'utf8');
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,name);
 assert.ok(!html.includes('SUBSTITUIR:'),name);
 assert.ok(!html.includes('14h às 19h'),name);
}
console.log('Conteúdo validado: 14 serviços, 17 produtos, 3 planos; nomes/preços em HTML, fotos locais, horários e ausência de placeholders.');

const home = await readFile(new URL('index.html', root), 'utf8');
assert.equal((home.match(/<article class="home-service">/g) || []).length, 3);
for (const id of ['corte-diversos', 'barba', 'combo-corte-barba']) {
  const item = servicos.find(s => s.id === id);
  assert.ok(home.includes(`data-analytics-label="${item.nome}"`), item.nome);
  assert.ok(home.includes(formatarPreco(item.preco)), item.nome);
}
const curso = await readFile(new URL('cursos.html', root), 'utf8');
assert.ok(curso.includes('Curso presencial de barbearia'));
assert.ok(!/>[^<]*workshop/i.test(curso));
console.log('Prévia de serviços da home consistente com o catálogo; curso presencial padronizado.');

import { initBooking } from './booking.js';
import '../styles/main.css';
import { initCareers } from './careers.js';
import { initNav } from './nav.js';
import { applyConfig } from './config-apply.js';
import { initReveal } from './reveal.js';
import { initServicos } from './servicos.js';
import { initProdutos } from './produtos.js';
import { initGaleria } from './galeria.js';
import { initAnalyticsClicks } from './analytics.js';
import { initSeo } from './seo.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  applyConfig();
  initReveal();
  // Só fazem algo na própria página; nas outras saem na primeira linha.
  initServicos();
  initProdutos();
  initGaleria();
  initCareers();
  initBooking();
  // Um só listener delegado (Etapa 13, item 5: evita contar o mesmo clique
  // duas vezes). Cobre botões estáticos e os que os módulos acima criam.
  initAnalyticsClicks();
  // Canonical, og:url absoluto e JSON-LD LocalBusiness (Etapa 15).
  initSeo();

  // Ano atual no rodapé.
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

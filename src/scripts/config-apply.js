// Aplica os dados de src/config.js no HTML (links de WhatsApp, mapa,
// endereço, telefone) e mostra um aviso discreto enquanto algo estiver
// pendente de preencher.

import { business, getWhatsappLink, getMissingConfigFields } from '../config.js';

export function applyConfig() {
  document.querySelectorAll('[data-whatsapp-link]').forEach((el) => {
    const customMessage = el.getAttribute('data-whatsapp-message');
    el.href = getWhatsappLink(customMessage || undefined);
  });

  document.querySelectorAll('[data-config="address"]').forEach((el) => {
    el.textContent = business.address;
  });

  document.querySelectorAll('[data-config="phone"]').forEach((el) => {
    el.textContent = business.phoneDisplay;
  });

  document.querySelectorAll('[data-config="maps-url"]').forEach((el) => {
    if (business.googleMapsUrl) el.href = business.googleMapsUrl;
  });

  const mapFrame = document.querySelector('[data-map-embed]');
  if (mapFrame) {
    if (business.googleMapsEmbedUrl) {
      // Atributos e title exatamente como no iframe oficial enviado pelo
      // dono. width/height ficam como dimensão intrínseca (evita CLS antes
      // do CSS carregar); quem manda no tamanho real é .map-frame iframe em
      // location.css (width/height: 100%), que já é responsivo.
      const iframe = document.createElement('iframe');
      iframe.src = business.googleMapsEmbedUrl;
      iframe.width = '600';
      iframe.height = '450';
      iframe.loading = 'lazy';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.title = 'Localização da Casa do Barbudo Barbearia';
      mapFrame.replaceChildren(iframe);
    }
  }

  renderConfigNotice();
}

function renderConfigNotice() {
  const missing = getMissingConfigFields();
  if (missing.length === 0) return;

  const notice = document.createElement('div');
  notice.className = 'config-notice';
  notice.setAttribute('role', 'status');
  notice.innerHTML = `
    <span>⚠️ Ainda falta preencher em src/config.js: ${missing.join(', ')}.</span>
    <button type="button" aria-label="Fechar aviso">Fechar</button>
  `;
  notice.querySelector('button').addEventListener('click', () => notice.remove());
  document.body.appendChild(notice);
}

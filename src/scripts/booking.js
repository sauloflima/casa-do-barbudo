import { catalogo } from '../catalog.js';
import { getWhatsappLink } from '../config.js';

export function initBooking() {
  const links = [...document.querySelectorAll('[data-whatsapp-link]')].filter(a => a.textContent.trim().startsWith('Agendar'));
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'careers-dialog';
  dialog.setAttribute('aria-labelledby', 'booking-title');
  dialog.innerHTML = `<button type="button" class="btn btn-outline careers-close">Fechar ×</button><p class="eyebrow">Seu próximo atendimento</p><h2 id="booking-title">Como podemos cuidar de você?</h2><form class="careers-form"><label>Serviço<select name="servico" required><option value="">Selecione um serviço</option></select></label><label>Profissional<select name="profissional"><option>Sem preferência</option><option>Diego Lima</option><option>Gabriel Sena</option><option>Gabriel Japa</option></select></label><p class="careers-note">Você poderá combinar dia e horário pelo WhatsApp. A escolha do profissional depende da disponibilidade; este formulário não confirma uma reserva.</p><button type="submit" class="btn btn-primary">Consultar horário no WhatsApp →</button></form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  catalogo.categorias.flatMap(c => c.servicos).forEach(s => form.elements.servico.add(new Option(s.nome, s.nome)));
  let opener;
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-whatsapp-link]');
    if (!link || !link.textContent.trim().startsWith('Agendar')) return;
    event.preventDefault(); opener = link;
    const label = link.dataset.analyticsLabel;
    form.elements.servico.value = [...form.elements.servico.options].some(o => o.value === label) ? label : '';
    dialog.showModal();
  });
  dialog.querySelector('.careers-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    window.open(getWhatsappLink(`Olá! Gostaria de consultar um horário na Casa do Barbudo.\nServiço: ${form.elements.servico.value}\nProfissional: ${form.elements.profissional.value}\nPodem me informar os horários disponíveis?`), '_blank', 'noopener,noreferrer');
  });
}

import { getWhatsappLink } from '../config.js';

export function initCareers() {
  const dialog = document.querySelector('#careers-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const form = dialog.querySelector('form');
  const experience = form.elements.experiencia;
  const duration = form.elements.tempo;
  let opener;
  document.querySelectorAll('[data-careers-open]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      dialog.showModal();
    });
  });
  dialog.querySelector('[data-careers-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  experience.addEventListener('change', () => {
    const experienced = experience.value === 'Sim';
    duration.closest('label').hidden = !experienced;
    duration.required = experienced;
    duration.disabled = !experienced;
    if (!experienced) duration.value = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const nome = form.elements.nome.value.trim();
    const cidade = form.elements.cidade.value.trim();
    form.elements.nome.setCustomValidity(nome.split(/\s+/).length < 2 ? 'Informe seu nome completo.' : '');
    form.elements.cidade.setCustomValidity(cidade ? '' : 'Informe sua cidade.');
    duration.setCustomValidity(experience.value === 'Sim' && !duration.value.trim() ? 'Informe o tempo de experiência.' : '');
    if (!form.reportValidity()) return;
    const message = [
      'Olá! Quero apresentar meu perfil para trabalhar com a Casa do Barbudo.',
      `Nome completo: ${nome}`,
      `Cidade: ${cidade}`,
      `Idade: ${form.elements.idade.value} anos`,
      `Tem experiência em barbearia: ${experience.value}`,
      ...(experience.value === 'Sim' ? [`Tempo de experiência: ${duration.value.trim()}`] : []),
    ].join('\n');
    window.open(getWhatsappLink(message), '_blank', 'noopener,noreferrer');
  });
  form.addEventListener('input', event => {
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
  });
}

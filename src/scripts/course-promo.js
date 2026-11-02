export function initCoursePromo() {
  const promo = document.querySelector('.course-promo');
  if (!promo) return;
  // Apenas uma preferência temporária; bloqueio do storage não impede fechar.
  const dismissedKey = 'casa-course-promo-dismissed';
  try {
    if (sessionStorage.getItem(dismissedKey) === '1') { promo.remove(); return; }
  } catch { /* Navegação privada pode bloquear o armazenamento. */ }
  promo.querySelector('button').addEventListener('click', () => {
    try { sessionStorage.setItem(dismissedKey, '1'); } catch { /* Fechar continua disponível. */ }
    promo.remove();
  });
  if ('IntersectionObserver' in window) {
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      promo.hidden = visible.size > 0;
    });
    document.querySelectorAll('.site-footer, .careers, .curso-oferta').forEach(el => observer.observe(el));
  }
}

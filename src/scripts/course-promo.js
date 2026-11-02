export function initCoursePromo() {
  const promo = document.querySelector('.course-promo');
  if (!promo) return;
  promo.querySelector('button').addEventListener('click', () => promo.remove());
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

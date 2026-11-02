export function initCoursePromo() {
  const promo = document.querySelector('.course-promo');
  if (!promo) return;
  const seenKey = 'casa-course-promo-seen';
  try {
    if (sessionStorage.getItem(seenKey) === '1') promo.classList.add('is-compact');
    sessionStorage.setItem(seenKey, '1');
  } catch { /* Sem storage, o recolhimento continua funcionando nesta página. */ }
  const compact = () => {
    if (window.scrollY < 320) return;
    promo.classList.add('is-compact');
    window.removeEventListener('scroll', compact);
  };
  compact();
  if (!promo.classList.contains('is-compact')) window.addEventListener('scroll', compact, { passive: true });
  promo.querySelector('button').addEventListener('click', () => {
    window.removeEventListener('scroll', compact);
    promo.remove();
  });
  if ('IntersectionObserver' in window) {
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= .01) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      promo.hidden = visible.size > 0;
    }, { threshold: .01 });
    document.querySelectorAll('.site-footer, .careers, .home-services').forEach(el => observer.observe(el));
  }
}

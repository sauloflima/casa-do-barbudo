// Revela elementos [data-reveal] conforme entram na tela (fade + leve subida).
// Usa IntersectionObserver; o efeito visual em si vive no CSS (reveal.css),
// com entrada de 800 ms, inclusive sob prefers-reduced-motion, conforme o briefing.

export function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  // Navegador sem IntersectionObserver (versões antigas): mostra tudo de uma
  // vez em vez de deixar o conteúdo preso invisível.
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  items.forEach((item) => observer.observe(item));
}

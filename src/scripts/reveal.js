// Revela elementos [data-reveal] conforme entram na tela (fade + leve subida).
// Usa IntersectionObserver; o efeito visual em si vive no CSS (reveal.css),
// que também desliga tudo em prefers-reduced-motion.

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
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  items.forEach((item) => observer.observe(item));
}

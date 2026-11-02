// Menu mobile e estado do cabeçalho ao rolar.
//
// O destaque do link ativo NÃO é feito aqui: como o site é multipágina, cada
// arquivo .html já marca o próprio item com class="is-active" e
// aria-current="page". Assim o realce aparece antes do JS carregar.

export function initNav() {
  // O contato da candidatura e os links do rodapé não devem disputar espaço com o atalho.
  const floating = document.querySelector('.whatsapp-float');
  const contactAreas = document.querySelectorAll('.careers, .site-footer');
  if (floating && 'IntersectionObserver' in window) {
    const visibleAreas = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleAreas.add(entry.target);
        else visibleAreas.delete(entry.target);
      });
      floating.classList.toggle('is-context-hidden', visibleAreas.size > 0);
    });
    contactAreas.forEach((area) => observer.observe(area));
  }

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  // Links de navegação do menu (não inclui o botão de WhatsApp do nav-cta).
  const navLinks = nav ? Array.from(nav.querySelectorAll('.nav-links a')) : [];

  const groups = nav ? Array.from(nav.querySelectorAll('.nav-group')) : [];
  const closeGroups = () => groups.forEach(group => { group.open = false; });
  groups.forEach(group => {
    let openedByHover = false;
    group.querySelector('summary').addEventListener('click', event => {
      // O primeiro clique após o hover mantém o painel aberto.
      if (openedByHover && group.open) event.preventDefault();
      openedByHover = false;
    });
    group.addEventListener('toggle', () => {
      if (group.open) groups.filter(other => other !== group).forEach(other => { other.open = false; });
    });
    group.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && matchMedia('(min-width: 75em)').matches && !group.open) {
        openedByHover = true;
        group.open = true;
      }
    });
    group.addEventListener('pointerleave', () => {
      if (matchMedia('(min-width: 75em)').matches && !group.contains(document.activeElement)) group.open = false;
    });
    group.addEventListener('focusout', event => {
      // No celular, mudar foco pode anteceder o toque; fechar só por clique ou Escape.
      if (matchMedia('(min-width: 75em)').matches && event.relatedTarget && !group.contains(event.relatedTarget)) group.open = false;
    });
  });
  document.addEventListener('click', event => {
    if (!groups.some(group => group.contains(event.target))) closeGroups();
  });

  if (toggle && nav) {
    const isDesktop = () => window.matchMedia('(min-width: 75em)').matches;

    // Etapa 6, item 7: fechado, o menu mobile não pode receber foco. No
    // desktop o menu é sempre interativo (não é um painel que abre/fecha),
    // então nunca fica inert ali — só no mobile, e só quando fechado.
    // `inert` some elemento inteiro (e seus filhos) da navegação por Tab e
    // da árvore de acessibilidade, sem precisar de tabindex="-1" em cada
    // link à mão.
    const syncInert = () => {
      if (isDesktop()) {
        nav.removeAttribute('inert');
      } else {
        nav.toggleAttribute('inert', !nav.classList.contains('is-open'));
      }
    };

    const closeNav = ({ restoreFocus = false } = {}) => {
      closeGroups();
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      syncInert();
      // Item 8: devolve o foco ao botão que abriu o menu (Escape, ou
      // clicar de novo no próprio botão). Não se aplica ao clique num link
      // do menu: ali o foco já vai para o link clicado, que é o esperado.
      if (restoreFocus) toggle.focus();
    };

    const openNav = () => {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      syncInert();
    };

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('is-open');
      isOpen ? closeNav({ restoreFocus: true }) : openNav();
    });

    navLinks.forEach((link) => link.addEventListener('click', () => closeNav()));

    document.addEventListener('keydown', (event) => {
      const openGroup = groups.find(group => group.open);
      if (event.key === 'Escape' && openGroup) {
        openGroup.open = false;
        openGroup.querySelector('summary').focus();
        event.preventDefault();
        return;
      }
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav({ restoreFocus: true });
      }
    });

    // Fecha o menu mobile automaticamente se a tela crescer para desktop.
    // 75em, mesmo breakpoint do menu em linha em header.css (Etapa 5: em, não px).
    window.matchMedia('(min-width: 75em)').addEventListener('change', (event) => {
      if (event.matches) closeNav();
      else syncInert();
    });

    syncInert();
  }

  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Etapa 5: o cabeçalho usa min-height, não height, para o menu poder
    // quebrar para 2 linhas em telas grandes com fonte muito ampliada sem
    // cortar o próprio conteúdo. Mas isso significa que a altura real do
    // cabeçalho às vezes passa de --header-height (que é um valor fixo).
    // Como o cabeçalho é position:fixed, o hero e as páginas internas não
    // têm como saber disso só com CSS — por isso medimos a altura real e
    // guardamos em --header-height-actual, que hero.css/layout.css usam
    // com fallback para --header-height (funciona sem JS, exatamente como
    // antes: sem essa variável definida, o fallback entra em ação).
    if ('ResizeObserver' in window) {
      const syncHeaderHeight = () => {
        document.documentElement.style.setProperty(
          '--header-height-actual',
          `${header.getBoundingClientRect().height}px`
        );
      };
      new ResizeObserver(syncHeaderHeight).observe(header);
    }
  }
}

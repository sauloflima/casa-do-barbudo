// Instrumentação de eventos de interesse (Etapa 13, itens 4, 5 e 6).
//
// FERRAMENTA DE MÉTRICAS: nenhuma. O projeto não tem Google Analytics, Meta
// Pixel ou qualquer outro coletor de terceiros instalado, e esta etapa não
// autoriza escolher um. track() só faz duas coisas, as duas inertes:
//   1. Despacha um CustomEvent('site:analytics') no window, para quem quiser
//      escutar (inclusive esta suíte de testes).
//   2. Se window.dataLayer já existir como array (ou seja, se um dia uma tag
//      GTM/GA4 for instalada e criar essa fila), empurra o evento nela, no
//      formato que essas ferramentas esperam.
// Sem tag nenhuma carregada, nada disto sai do navegador, não é salvo em
// lugar nenhum e não passa por servidor próprio ou de terceiro.
//
// CONSENTIMENTO: como nenhum dado sai do navegador, não há coleta de
// terceiros a autorizar, então nenhum banner de consentimento foi criado
// nesta etapa. No dia em que uma ferramenta real (GA4, Meta Pixel etc.) for
// escolhida e instalada, ela é quem vai precisar de consentimento antes de
// carregar (cookies, IP, identificadores), e aí sim entra um banner. Instalar
// isso sem uma ferramenta real para justificar seria construir consentimento
// para nada, então não foi feito.
//
// POLÍTICA DE PRIVACIDADE: privacidade.html ganhou uma seção nova ("Eventos
// de interação") descrevendo exatamente este comportamento atual. Quando uma
// ferramenta de métricas de verdade for instalada, essa seção precisa ser
// reescrita para refletir o que passa a ser coletado.
//
// DADOS PESSOAIS (item 3): os eventos abaixo carregam só o caminho da página
// e um rótulo genérico (nome do serviço, produto etc.). Nome, telefone,
// endereço ou qualquer dado que a pessoa digitou não entram aqui: essas
// informações só existem dentro da mensagem do WhatsApp, que vai para o
// WhatsApp da própria pessoa preencher e decidir se envia, não para este
// evento.
export function track(nomeDoEvento, detalhe = {}) {
  const payload = { event: nomeDoEvento, pagina: location.pathname, ts: Date.now(), ...detalhe };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }

  window.dispatchEvent(new CustomEvent('site:analytics', { detail: payload }));
}

// Um único listener delegado no document, montado uma vez (item 5: contra
// duplicação). Delegar em vez de prender um listener em cada botão resolve
// dois problemas de uma vez: cobre os botões que já existem no HTML e também
// os que servicos.js e produtos.js criam depois, sem precisar religar nada
// quando esses módulos redesenham a grade.
export function initAnalyticsClicks() {
  document.addEventListener('click', (evento) => {
    // Abrir o seletor de atendimento ainda não é uma saída para o WhatsApp.
    if (evento.defaultPrevented) return;
    const linkWhatsapp = evento.target.closest('[data-whatsapp-link]');
    if (linkWhatsapp) {
      track('whatsapp_click', { rotulo: linkWhatsapp.dataset.analyticsLabel || null });

      // Alguns botões de WhatsApp representam um interesse mais específico
      // (serviço, assinatura, produto). Quando marcado, esse segundo evento
      // sai junto do whatsapp_click, no mesmo clique, nunca em vez dele: os
      // dois medem coisas diferentes (cliques em WhatsApp no total, e
      // interesse por categoria).
      const eventoEspecifico = linkWhatsapp.dataset.analyticsEvent;
      if (eventoEspecifico) {
        track(eventoEspecifico, { rotulo: linkWhatsapp.dataset.analyticsLabel || null });
      }
      return;
    }

    const linkMapa = evento.target.closest('[data-config="maps-url"]');
    if (linkMapa) {
      track('map_click', {});
    }
  });
}

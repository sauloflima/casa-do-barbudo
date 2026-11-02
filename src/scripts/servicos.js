// Página de Serviços e preços: filtro por categoria, montagem da mensagem do
// WhatsApp por serviço e os quatro estados pedidos na Etapa 9 (carregando,
// vazio, indisponível e erro).
//
// Por que a grade é redesenhada aqui se ela já existe no HTML: o HTML traz um
// espelho estático do catálogo para a página funcionar sem JS e para buscador
// indexar serviços e valores. Com JS, quem manda é src/catalog.js, que é a
// fonte de verdade e o ponto onde a integração dinâmica vai entrar. Hoje os
// dois produzem exatamente o mesmo resultado.
//
// Nada aqui agenda, reserva ou cobra: o botão só abre a conversa do WhatsApp
// com o serviço já escrito. Quem envia a mensagem é a pessoa.

import { carregarCatalogo, formatarPreco } from '../catalog.js';
import { getWhatsappLink } from '../config.js';
import { initReveal } from './reveal.js';

const MENSAGEM_BASE =
  'Olá! Vim pelo site e gostaria de agendar um horário na Casa do Barbudo.';


export function initServicos() {
  const grade = document.getElementById('catalogo-grid');
  // Só a página de serviços tem esta grade; nas outras a função não faz nada.
  if (!grade) return;

  const filtros = Array.from(document.querySelectorAll('.catalogo-filtro'));
  const status = document.querySelector('.catalogo-status');

  const estados = {};
  document.querySelectorAll('.catalogo-estado').forEach((el) => {
    estados[el.dataset.estado] = el;
  });

  // nome = 'carregando' | 'vazio' | 'erro', ou null para mostrar a grade.
  const mostrarEstado = (nome) => {
    Object.entries(estados).forEach(([chave, el]) => {
      el.hidden = chave !== nome;
    });
    grade.hidden = nome !== null;
  };

  const criarCartao = (servico, categoria, indice) => {
    const cartao = document.createElement('article');
    cartao.className = 'servico-card';
    cartao.dataset.categoria = categoria.id;
    cartao.setAttribute('data-reveal', '');
    if (indice > 0 && indice < 4) cartao.setAttribute('data-reveal-delay', String(indice));

    if (servico.foto) {
      const imagem = document.createElement('img');
      imagem.className = 'servico-foto';
      imagem.src = servico.foto;
      imagem.alt = `Imagem de referência: ${servico.nome}`;
      imagem.width = 240;
      imagem.height = 240;
      imagem.loading = 'lazy';
      imagem.decoding = 'async';
      cartao.appendChild(imagem);
    }

    const rotulo = document.createElement('p');
    rotulo.className = 'servico-categoria';
    rotulo.textContent = categoria.nome;
    cartao.appendChild(rotulo);

    const cabecalho = document.createElement('div');
    cabecalho.className = 'servico-cabecalho';

    const nome = document.createElement('h2');
    nome.className = 'servico-nome';
    nome.textContent = servico.nome;
    cabecalho.appendChild(nome);

    // Preço só quando confirmado (item 3). Sem valor, a página assume o estado
    // de consulta em vez de mostrar um traço ou um zero.
    const preco = document.createElement('p');
    preco.className = 'servico-preco';
    const precoFormatado = formatarPreco(servico.preco);
    if (precoFormatado) {
      preco.textContent = precoFormatado;
    } else {
      preco.textContent = 'Valor sob consulta';
      preco.classList.add('servico-preco--consulta');
    }
    cabecalho.appendChild(preco);
    cartao.appendChild(cabecalho);


    // Descrição e duração idem: aparecem só se vierem confirmadas do catálogo.
    if (servico.descricao) {
      const descricao = document.createElement('p');
      descricao.className = 'servico-descricao';
      descricao.textContent = servico.descricao;
      cartao.appendChild(descricao);
    }

    if (typeof servico.duracaoMin === 'number') {
      const duracao = document.createElement('p');
      duracao.className = 'servico-duracao';
      duracao.textContent = `Cerca de ${servico.duracaoMin} minutos`;
      cartao.appendChild(duracao);
    }

    if (servico.disponivel === false) {
      // Indisponível: o cartão continua na página, com o valor à vista, mas sem
      // botão de agendar, para não abrir conversa sobre algo que não tem.
      cartao.dataset.disponivel = 'false';
      const aviso = document.createElement('p');
      aviso.className = 'servico-indisponivel';
      aviso.textContent = 'Indisponível no momento';
      cartao.appendChild(aviso);
    } else {
      const cta = document.createElement('a');
      cta.className = 'btn btn-primary servico-cta';
      cta.target = '_blank';
      cta.rel = 'noopener';
      cta.href = getWhatsappLink(`${MENSAGEM_BASE} Serviço: ${servico.nome}.`);
      cta.textContent = `Agendar ${servico.nome} no WhatsApp`;
      // Marca o botão para o listener delegado de eventos (Etapa 13):
      // data-whatsapp-link identifica o clique como interesse em WhatsApp,
      // data-analytics-event acrescenta o interesse por serviço específico.
      cta.setAttribute('data-whatsapp-link', '');
      cta.setAttribute('data-analytics-event', 'service_interest');
      cta.setAttribute('data-analytics-label', servico.nome);
      cartao.appendChild(cta);
    }

    return cartao;
  };

  const filtroAtivo = () => {
    const ativo = filtros.find((b) => b.getAttribute('aria-pressed') === 'true');
    return ativo ? ativo.dataset.filtro : 'todos';
  };

  const aplicarFiltro = (valor) => {
    const cartoes = Array.from(grade.querySelectorAll('.servico-card'));
    let visiveis = 0;

    cartoes.forEach((cartao) => {
      const mostra = valor === 'todos' || cartao.dataset.categoria === valor;
      cartao.hidden = !mostra;
      if (mostra) visiveis += 1;
    });

    filtros.forEach((botao) => {
      const ativo = botao.dataset.filtro === valor;
      botao.classList.toggle('is-active', ativo);
      botao.setAttribute('aria-pressed', String(ativo));
    });

    mostrarEstado(visiveis === 0 ? 'vazio' : null);

    // Cartão sumindo da tela não é percebido por leitor de tela, daí o aviso.
    if (status) {
      status.textContent =
        visiveis === 0
          ? 'Nenhum serviço nesta categoria.'
          : `${visiveis} ${visiveis === 1 ? 'serviço' : 'serviços'} em exibição.`;
    }
  };

  filtros.forEach((botao) => {
    botao.addEventListener('click', () => aplicarFiltro(botao.dataset.filtro));
  });

  mostrarEstado('carregando');

  carregarCatalogo()
    .then((dados) => {
      const cartoes = [];
      dados.categorias.forEach((categoria) => {
        categoria.servicos.forEach((servico) => {
          cartoes.push(criarCartao(servico, categoria, cartoes.length));
        });
      });

      if (!cartoes.length) {
        grade.replaceChildren();
        mostrarEstado('vazio');
        if (status) status.textContent = 'Nenhum serviço disponível no momento.';
        return;
      }

      grade.replaceChildren(...cartoes);
      const categoria = new URLSearchParams(location.search).get('categoria');
      aplicarFiltro(filtros.some(b => b.dataset.filtro === categoria) ? categoria : filtroAtivo());

      // Os cartões nasceram depois do initReveal() do main.js, então não
      // estavam sendo observados e ficariam invisíveis (ver reveal.css).
      // Reobservar elementos que já apareceram é inofensivo.
      initReveal();
    })
    .catch(() => {
      mostrarEstado('erro');
      if (status) status.textContent = 'Não foi possível carregar os serviços.';
    });
}

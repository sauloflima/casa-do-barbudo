// Página de Produtos: catálogo consultivo. Monta a grade a partir de
// src/products.js e trata os quatro estados (carregando, vazio,
// indisponível, erro). Não existe carrinho, preço fechado nem checkout: o
// único destino de cada produto é uma conversa no WhatsApp.

import { carregarProdutos, formatarPrecoProduto } from '../products.js';
import { getWhatsappLink } from '../config.js';
import { initReveal } from './reveal.js';

const MENSAGEM_BASE = 'Olá! Vim pelo site e queria saber mais sobre um produto:';

export function initProdutos() {
  const grade = document.getElementById('produtos-grid');
  // Só a página de produtos tem esta grade; nas outras a função não faz nada.
  if (!grade) return;

  const estados = {};
  document.querySelectorAll('.produtos-estado').forEach((el) => {
    estados[el.dataset.estado] = el;
  });

  const mostrarEstado = (nome) => {
    Object.entries(estados).forEach(([chave, el]) => {
      el.hidden = chave !== nome;
    });
    grade.hidden = nome !== null;
  };

  const criarCartao = (produto, indice) => {
    const cartao = document.createElement('article');
    cartao.className = 'produto-card';
    cartao.setAttribute('data-reveal', '');
    if (indice > 0 && indice < 4) cartao.setAttribute('data-reveal-delay', String(indice));

    const figura = document.createElement('figure');
    figura.className = 'produto-figura';
    if (produto.foto) {
      const img = document.createElement('img');
      img.src = produto.foto;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 400;
      img.height = 400;
      // Texto alternativo descreve o produto, não repete "foto de": item 2,
      // o nome já diz o que é.
      img.alt = produto.nome;
      figura.appendChild(img);
    } else {
      // Retrato de reserva acessível (item 5): não é <img> vazio nem imagem
      // quebrada, é um bloco com o nome do produto, sempre com o mesmo
      // 1:1 do restante da grade (produto-figura já garante isso).
      const reserva = document.createElement('div');
      reserva.className = 'produto-figura-reserva';
      reserva.setAttribute('role', 'img');
      reserva.setAttribute('aria-label', `Foto de ${produto.nome} ainda não disponível`);
      reserva.textContent = produto.nome;
      figura.appendChild(reserva);
    }
    cartao.appendChild(figura);

    const corpo = document.createElement('div');
    corpo.className = 'produto-corpo';

    const categoria = document.createElement('p');
    categoria.className = 'produto-categoria';
    categoria.textContent = produto.categoria;
    corpo.appendChild(categoria);

    const nome = document.createElement('h2');
    nome.className = 'produto-nome';
    nome.textContent = produto.nome;
    corpo.appendChild(nome);

    if (produto.finalidade) {
      const finalidade = document.createElement('p');
      finalidade.className = 'produto-finalidade';
      finalidade.textContent = produto.finalidade;
      corpo.appendChild(finalidade);
    }

    // Tamanho e preço na mesma linha quando os dois existem; cada um aparece
    // sozinho se só um estiver confirmado.
    if (produto.tamanho || typeof produto.preco === 'number') {
      const meta = document.createElement('div');
      meta.className = 'produto-meta';

      if (produto.tamanho) {
        const tamanho = document.createElement('span');
        tamanho.className = 'produto-tamanho';
        tamanho.textContent = produto.tamanho;
        meta.appendChild(tamanho);
      }

      const precoFormatado = formatarPrecoProduto(produto.preco);
      const preco = document.createElement('span');
      preco.className = precoFormatado ? 'produto-preco' : 'produto-preco produto-preco--consulta';
      preco.textContent = precoFormatado || 'Consultar preço';
      meta.appendChild(preco);

      corpo.appendChild(meta);
    }

    if (produto.disponivel === false) {
      // Indisponível: fica na lista (consultivo, não é loja com estoque
      // visível), mas sem CTA, para não abrir conversa sobre o que não tem.
      cartao.dataset.disponivel = 'false';
      const aviso = document.createElement('p');
      aviso.className = 'produto-indisponivel';
      aviso.textContent = 'Indisponível no momento';
      corpo.appendChild(aviso);
    } else {
      const cta = document.createElement('a');
      cta.className = 'btn btn-outline produto-cta';
      cta.target = '_blank';
      cta.rel = 'noopener';
      cta.href = getWhatsappLink(`${MENSAGEM_BASE} ${produto.nome}.`);
      cta.textContent = 'Consultar no WhatsApp';
      // Etapa 13: marca o botão para o listener delegado de eventos.
      cta.setAttribute('data-whatsapp-link', '');
      cta.setAttribute('data-analytics-event', 'product_interest');
      cta.setAttribute('data-analytics-label', produto.nome);
      corpo.appendChild(cta);
    }

    cartao.appendChild(corpo);
    return cartao;
  };

  mostrarEstado('carregando');

  carregarProdutos()
    .then((lista) => {
      if (!lista.length) {
        grade.replaceChildren();
        mostrarEstado('vazio');
        return;
      }

      const cartoes = lista.map((produto, indice) => criarCartao(produto, indice));
      grade.replaceChildren(...cartoes);
      mostrarEstado(null);

      // Os cartões nasceram depois do initReveal() do main.js, então não
      // estavam sendo observados e ficariam invisíveis (ver reveal.css).
      initReveal();
    })
    .catch(() => {
      mostrarEstado('erro');
    });
}

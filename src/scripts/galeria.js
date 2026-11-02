// Galeria: visualização ampliada da foto (Etapa 12, item 5).
//
// O trabalho pesado de acessibilidade fica com o <dialog> nativo em
// showModal(): fechar com Escape, prender o foco dentro do diálogo e devolver
// o foco ao botão que abriu são comportamentos que o próprio navegador
// garante. Reimplementar isso à mão só acrescentaria código com mais chance de
// errar. Este arquivo cuida do resto: trocar a foto exibida, cuidar da falha
// de carregamento e fechar ao clicar no fundo.

export function initGaleria() {
  const dialogo = document.getElementById('galeria-lightbox');
  // Só a página de galeria tem este diálogo; nas outras a função não faz nada.
  if (!dialogo) return;

  // Sem showModal (navegador antigo), o botão de ampliar não deve virar um
  // controle morto: sem suporte, ele sai da ordem de Tab e a galeria continua
  // funcionando como grade de fotos normal.
  const suporta = typeof dialogo.showModal === 'function';

  const imagem = dialogo.querySelector('.galeria-lightbox-img');
  const erro = dialogo.querySelector('.galeria-lightbox-erro');
  const fechar = dialogo.querySelector('[data-galeria-fechar]');
  const gatilhos = Array.from(document.querySelectorAll('[data-galeria-ampliar]'));

  if (!suporta) {
    gatilhos.forEach((botao) => {
      botao.setAttribute('tabindex', '-1');
      botao.setAttribute('aria-hidden', 'true');
    });
    return;
  }

  const abrir = (botao) => {
    const src = botao.dataset.galeriaSrc;
    const alt = botao.dataset.galeriaAlt || '';
    if (!src) return;

    erro.hidden = true;
    imagem.hidden = false;
    imagem.alt = alt;
    imagem.src = src;

    dialogo.showModal();
  };

  // Falha de carregamento: em vez de deixar o ícone de imagem quebrada, o
  // diálogo troca a foto por um aviso legível. O diálogo continua fechável
  // normalmente pelo Escape ou pelo botão.
  imagem.addEventListener('error', () => {
    imagem.hidden = true;
    erro.hidden = false;
  });

  gatilhos.forEach((botao) => {
    botao.addEventListener('click', () => abrir(botao));
  });

  // Libera a foto e deixa o diálogo pronto para a próxima abertura sem
  // mostrar por um instante a imagem anterior.
  //
  // Chamado explicitamente em cada caminho de fechamento, em vez de ficar
  // pendurado no evento "close" do <dialog>: em teste, um dos motores fecha o
  // diálogo normalmente mas nunca dispara esse evento, o que deixaria a
  // limpeza sem rodar e sem ninguém perceber. O listener de "close" fica
  // abaixo mesmo assim, para cobrir o Escape nativo do navegador, que fecha
  // sem passar por nenhum dos caminhos daqui.
  const limpar = () => {
    imagem.removeAttribute('src');
    imagem.alt = '';
  };

  const fecharDialogo = () => {
    dialogo.close();
    limpar();
  };

  dialogo.addEventListener('close', limpar);

  fechar.addEventListener('click', fecharDialogo);

  // Escape explícito, e não só o do <dialog> nativo: fechar com Escape é
  // requisito, e não dá para depender de um comportamento que nem todo motor
  // executa igual. Onde o nativo já funciona isto é inofensivo, porque close()
  // num diálogo já fechado não faz nada e a guarda de "open" evita agir fora
  // de hora.
  dialogo.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && dialogo.open) {
      evento.preventDefault();
      fecharDialogo();
    }
  });

  // Clicar fora da foto fecha. O <dialog> recebe o clique do ::backdrop como
  // se fosse nele mesmo, então comparar o alvo com o próprio diálogo
  // distingue "clicou no fundo" de "clicou no conteúdo".
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) fecharDialogo();
  });
}

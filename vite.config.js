import { defineConfig } from 'vite';

export default defineConfig({
  // Caminho relativo: funciona tanto na raiz de um dominio quanto em um
  // subcaminho de GitHub Pages (ex: usuario.github.io/nome-do-repo/)
  // sem precisar configurar o nome do repositorio aqui.
  // Como todas as páginas ficam na raiz, os caminhos "./..." valem em todas.
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Site multipágina: cada arquivo abaixo vira uma página no dist/.
      // O CSS e o JS continuam compartilhados (todas importam o mesmo main.js).
      input: {
        index: 'index.html',
        sobre: 'sobre.html',
        servicos: 'servicos.html',
        equipe: 'equipe.html',
        cursos: 'cursos.html',
        carreiras: 'trabalhe-conosco.html',
        galeria: 'galeria.html',
        localizacao: 'localizacao.html',
        assinaturas: 'assinaturas.html',
        produtos: 'produtos.html',
        privacidade: 'privacidade.html',
      },
    },
  },
});

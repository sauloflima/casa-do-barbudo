// Fonte pública indicada pelo usuário, consultada em 02/11/2026.
// https://barbearia-casa-do-barbudo.github.io/Barbearia-Casa-do_Barbudo-/
export const catalogo = {
  "confirmadoEm": "2026-11-02",
  "categorias": [
    {
      "id": "cortes",
      "nome": "Cortes",
      "servicos": [
        {
          "id": "corte-diversos",
          "nome": "Corte (diversos)",
          "preco": 35.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/corte-diversos.jpg"
        },
        {
          "id": "corte-infantil",
          "nome": "Corte infantil",
          "preco": 40.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/corte-infantil.jpg"
        },
        {
          "id": "acabamento-perfil",
          "nome": "Acabamento (perfil)",
          "preco": 10.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/acabamento-perfil.jpg"
        }
      ]
    },
    {
      "id": "barba",
      "nome": "Barba",
      "servicos": [
        {
          "id": "barba",
          "nome": "Barba",
          "preco": 35.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/barba.jpg"
        },
        {
          "id": "combo-corte-barba",
          "nome": "Combo Corte + Barba",
          "preco": 60.0,
          "descricao": "Corte + barba",
          "duracaoMin": null,
          "foto": "./images/servicos/combo-corte-barba.jpg"
        },
        {
          "id": "barboterapia",
          "nome": "Barboterapia",
          "preco": 40.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/galeria/barba.jpg"
        }
      ]
    },
    {
      "id": "estetica-cuidados",
      "nome": "Estética & Cuidados",
      "servicos": [
        {
          "id": "combo-skin",
          "nome": "Combo Skin",
          "preco": 40.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/combo-skin.jpg"
        },
        {
          "id": "botox-capilar",
          "nome": "Botox capilar",
          "preco": 80.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/botox-capilar.jpg"
        },
        {
          "id": "limpeza-de-pele",
          "nome": "Limpeza de pele",
          "preco": 60.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/limpeza-de-pele.jpg"
        },
        {
          "id": "lavagem-hidratacao",
          "nome": "Lavagem + hidratação",
          "preco": 25.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/lavagem-hidratacao.jpg"
        },
        {
          "id": "sobrancelha-navalha",
          "nome": "Sobrancelha (navalha)",
          "preco": 10.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/sobrancelha-navalha.jpg"
        }
      ]
    },
    {
      "id": "coloracao",
      "nome": "Coloração",
      "servicos": [
        {
          "id": "pigmentacao",
          "nome": "Pigmentação",
          "preco": 20.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/pigmentacao.jpg"
        },
        {
          "id": "luzes-reflexo",
          "nome": "Luzes / reflexo",
          "preco": 100.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/luzes-reflexo.jpg"
        },
        {
          "id": "platinado",
          "nome": "Platinado",
          "preco": 120.0,
          "descricao": null,
          "duracaoMin": null,
          "foto": "./images/servicos/platinado.jpg"
        }
      ]
    }
  ]
};

export function formatarPreco(valor) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return null;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function carregarCatalogo() { return Promise.resolve(catalogo); }

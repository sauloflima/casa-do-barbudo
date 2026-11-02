// ============================================================================
// CONFIGURAÇÃO DO NEGÓCIO: Casa do Barbudo Barbearia
// ----------------------------------------------------------------------------
// Edite os valores abaixo para atualizar contato, endereço e horário em TODO
// o site de uma vez (cabeçalho, hero, rodapé, seção de localização etc.).
// Não é necessário mexer no index.html para isso.
//
// Campos marcados com "SUBSTITUIR" ainda precisam do dado real.
// ============================================================================

// ============================================================================
// DOMÍNIO OFICIAL (Etapa 15, preenchido na configuração de domínio seguinte)
// ----------------------------------------------------------------------------
// Domínio definitivo do projeto, SEM barra no fim. A partir daqui,
// src/scripts/seo.js monta sozinho o <link rel="canonical">, o og:url e a
// imagem social em URL absoluta nas 9 páginas, e "npm run sitemap" gera
// sitemap.xml e robots.txt apontando para este endereço.
//
// Se um dia o domínio mudar, o ajuste é só aqui: rode "npm run sitemap" de
// novo para regenerar sitemap.xml e robots.txt com o novo endereço.
export const siteUrl = 'https://sauloflima.github.io/casa-do-barbudo';

export const business = {
  name: 'Casa do Barbudo Barbearia',
  city: 'Gravatá',
  state: 'Pernambuco',
  stateAbbr: 'PE',
  country: 'Brasil',

  address: 'Praça Rodolfo de Moraes, nº 90',

  whatsappNumber: '5581991388128',

  // Mensagem que já vem preenchida quando o cliente clica em "Agendar no WhatsApp"
  whatsappMessage: 'Olá! Vim pelo site e gostaria de agendar um horário na Casa do Barbudo.',

  phoneDisplay: '(81) 9 9138-8128',

  instagramHandle: '@casadobarbudobarbearia',
  instagramUrl: 'https://instagram.com/casadobarbudobarbearia',

  googleReviewUrl: 'https://share.google/W9tKis7d9dL4dlzF8',

  // Link oficial de "Como chegar", enviado pelo dono (Google > Compartilhar).
  googleMapsUrl: 'https://share.google/tLMgwAX0BdPBN5bll',

  // URL do iframe de mapa incorporado, enviada pelo dono. A grafia
  // "Morais" na query (em vez de "Moraes") vem assim do link original; é só
  // um parâmetro de busca do Google, não aparece como texto no site, então
  // não foi alterada. O endereço exibido na página (business.address, acima)
  // continua "Moraes", que é a grafia oficial usada no site.
  googleMapsEmbedUrl:
    'https://www.google.com/maps?q=Casa%20do%20Barbudo%20Barbearia%2C%20Pra%C3%A7a%20Rodolfo%20de%20Morais%2C%2090%2C%20Centro%2C%20Gravat%C3%A1%2C%20PE&output=embed',

  hours: {
    daysLabel: 'Segunda a sábado',
    morning: '9h às 13h',
    afternoon: '14h às 20h',
    lunchNote: 'Fechado para almoço entre 13h e 14h',
    closedLabel: 'Domingo, fechado',
  },
};

// Monta o link do WhatsApp com a mensagem pronta (URL-encoded).
export function getWhatsappLink(customMessage) {
  const text = encodeURIComponent(customMessage || business.whatsappMessage);
  return `https://wa.me/${business.whatsappNumber}?text=${text}`;
}

// Usado para avisar na tela que ainda faltam dados reais de contato.
export function getMissingConfigFields() {
  const missing = [];
  if (!business.whatsappNumber || business.whatsappNumber.startsWith('SUBSTITUIR')) {
    missing.push('WhatsApp (business.whatsappNumber)');
  }
  if (!business.address || business.address.startsWith('SUBSTITUIR')) {
    missing.push('Endereço (business.address)');
  }
  if (!business.phoneDisplay || business.phoneDisplay.startsWith('SUBSTITUIR')) {
    missing.push('Telefone (business.phoneDisplay)');
  }
  if (!business.googleMapsEmbedUrl) {
    missing.push('Mapa incorporado (business.googleMapsEmbedUrl)');
  }
  return missing;
}

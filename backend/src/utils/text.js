/** Tira acentos e maiúsculas: "Utilitário " vira "utilitario". Usado na busca e nos filtros. */
export const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

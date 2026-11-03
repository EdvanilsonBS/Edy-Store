/**
 * FORMATAÇÃO DE PREÇO
 * formatPrice(149.9) -> "R$ 149,90"
 * Para outra moeda/idioma, mude 'pt-BR' e 'BRL' abaixo.
 */
const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const formatPrice = (value) => currency.format(value)

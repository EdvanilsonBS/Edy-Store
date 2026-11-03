/**
 * BUSCA, FILTROS E ORDENAÇÃO da página de listagem
 *
 * filterProducts(produtos, { search, filters, sort }) devolve uma NOVA lista.
 *   search  texto digitado na busca (ignora acentos e maiúsculas)
 *   filters { brand: [], category: [], gender: [], state: 'all' }
 *   sort    'asc' (menor preço) ou 'desc' (maior preço)
 *
 * COMO ADICIONAR UM FILTRO NOVO (ex.: cor):
 *   1) adicione o campo no produto (src/data/products.js)
 *   2) inclua a regra aqui, junto das outras `if (...) return false`
 *   3) adicione um <FilterGroup> na página ProductListingPage
 */
import { getEffectivePrice } from '../data/products'

// Normaliza o texto para comparar:: "Utilitário" -> "utilitario"
const normalize = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/**
 * Aplica busca, filtros e ordenação.
 * - Dentro de um mesmo grupo (ex.: duas marcas) vale "OU".
 * - Entre grupos diferentes (marca + gênero) vale "E".
 */
export const filterProducts = (products, { search = '', filters = {}, sort = 'asc' } = {}) => {
  const term = normalize(search)
  const { brand = [], category = [], gender = [], state = 'all' } = filters

  const result = products.filter((product) => {
    // texto onde a busca procura: nome + marca + categoria + gênero
    const haystack = normalize(
      [product.name, product.brand, product.category, product.gender].join(' ')
    )
    // Cada linha abaixo EXCLUI o produto se ele não combinar com o filtro marcado.
    // (lista vazia = filtro desligado)
    if (term && !haystack.includes(term)) return false
    if (brand.length && !brand.includes(product.brand)) return false
    if (category.length && !category.includes(product.category)) return false
    if (gender.length && !gender.includes(product.gender)) return false
    if (state !== 'all' && product.state !== state) return false
    return true
  })

  // Ordena pelo preço final (com desconto, quando houver)
  return result.sort((a, b) =>
    sort === 'desc'
      ? getEffectivePrice(b) - getEffectivePrice(a)
      : getEffectivePrice(a) - getEffectivePrice(b)
  )
}

/**
 * SERVICE: produtos.
 * A busca imita a do front (src/utils/filterProducts.js): ignora maiúsculas e acentos
 * e procura em nome, marca, categoria e gênero. O filtro em si roda no banco (SQL).
 * Criar, editar e excluir são regras de administrador (veja as rotas).
 */
import { Product } from '../models/Product.js'
import { AppError } from '../middlewares/errorHandler.js'
import { normalize } from '../utils/text.js'

const GENDERS = ['Masculino', 'Feminino', 'Unisex']
const STATES = ['Novo', 'Usado']
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const DEFAULT_SIZES = ['39', '40', '41', '42', '43']

// "Nike,Puma" ou ["Nike", "Puma"] -> ['nike', 'puma']
const toList = (value) =>
  (Array.isArray(value) ? value : String(value ?? '').split(','))
    .map(normalize)
    .filter(Boolean)

// Converte o que a pessoa digitou ("utilitario") nos valores reais gravados ("Utilitário").
// Se nada bater, devolve [''] para que o SQL não encontre nenhum produto.
const resolveFilter = (field, raw) => {
  const wanted = toList(raw)
  if (wanted.length === 0) return undefined
  const actual = Product.distinct(field).filter((value) => wanted.includes(normalize(value)))
  return actual.length ? actual : ['']
}

/* ---------- validação de produto (criar / editar) ---------- */

const requiredText = (value, label, max = 200) => {
  const text = String(value ?? '').trim()
  if (!text) throw new AppError(400, `Informe ${label}.`)
  if (text.length > max) throw new AppError(400, `${label} pode ter no máximo ${max} caracteres.`)
  return text
}

const money = (value, label) => {
  const number = Number(value)
  if (value === null || value === '' || !Number.isFinite(number) || number <= 0) {
    throw new AppError(400, `${label} precisa ser um número maior que zero.`)
  }
  return Math.round(number * 100) / 100
}

// Confere o produto inteiro e devolve só os campos permitidos, já tratados.
const validate = (input) => {
  const price = money(input.price, 'O preço')
  const hasDiscount = input.priceDiscount !== undefined && input.priceDiscount !== null
  const priceDiscount = hasDiscount ? money(input.priceDiscount, 'O preço com desconto') : undefined
  if (hasDiscount && priceDiscount >= price) {
    throw new AppError(400, 'O preço com desconto precisa ser menor que o preço normal.')
  }
  if (!GENDERS.includes(input.gender)) throw new AppError(400, `Gênero deve ser: ${GENDERS.join(', ')}.`)
  if (!STATES.includes(input.state)) throw new AppError(400, `Estado deve ser: ${STATES.join(', ')}.`)

  const stars = Number(input.stars ?? 0)
  if (!Number.isFinite(stars) || stars < 0 || stars > 5) throw new AppError(400, 'Estrelas devem ficar entre 0 e 5.')
  const rating = Number(input.rating ?? 0)
  if (!Number.isInteger(rating) || rating < 0) throw new AppError(400, 'Avaliações deve ser um número inteiro (0 ou mais).')

  const sizes = input.sizes ?? DEFAULT_SIZES
  if (!Array.isArray(sizes) || sizes.length === 0 || sizes.some((s) => !String(s).trim())) {
    throw new AppError(400, 'Informe pelo menos um tamanho (lista de textos, ex.: ["39","40"]).')
  }
  const colors = input.colors ?? []
  if (!Array.isArray(colors) || colors.some((c) => !HEX_COLOR.test(c))) {
    throw new AppError(400, 'Cores devem ser códigos hexadecimais, ex.: ["#FF6969"].')
  }
  const images = input.images ?? []
  if (!Array.isArray(images)) throw new AppError(400, 'Imagens deve ser uma lista.')

  return {
    name: requiredText(input.name, 'o nome'),
    brand: requiredText(input.brand, 'a marca', 60),
    category: requiredText(input.category, 'a categoria', 60),
    gender: input.gender,
    state: input.state,
    price,
    priceDiscount,
    image: requiredText(input.image, 'a imagem principal (image)', 500),
    images: images.map((item) => ({ src: requiredText(typeof item === 'string' ? item : item?.src, 'o endereço da imagem', 500) })),
    reference: String(input.reference ?? '').trim() || undefined,
    stars,
    rating,
    description: String(input.description ?? '').trim().slice(0, 2000),
    sizes: sizes.map((s) => String(s).trim()),
    colors: colors.map((c) => c.toUpperCase()),
  }
}

// Campos que o administrador pode enviar (qualquer outro é ignorado, ex.: id)
const EDITABLE = [
  'name', 'brand', 'category', 'gender', 'state', 'price', 'priceDiscount', 'image',
  'images', 'reference', 'stars', 'rating', 'description', 'sizes', 'colors',
]
const pick = (body = {}) => Object.fromEntries(EDITABLE.filter((key) => key in body).map((key) => [key, body[key]]))

export const productService = {
  // Filtros aceitos: search, brand, category, gender, state (vários valores separados por vírgula) e sort
  list(query = {}) {
    const filters = {}
    for (const field of ['brand', 'category', 'gender', 'state']) {
      const values = resolveFilter(field, query[field])
      if (values) filters[field] = values
    }
    return Product.search({ search: normalize(query.search ?? query.filter), filters, sort: query.sort })
  },

  getById(id) {
    const product = Product.findById(id)
    if (!product) throw new AppError(404, 'Produto não encontrado.')
    return product
  },

  // Opções para montar a barra lateral de filtros
  filters: () => ({
    brands: Product.distinct('brand'),
    categories: Product.distinct('category'),
    genders: Product.distinct('gender'),
    states: Product.distinct('state'),
  }),

  // Categorias com a quantidade de produtos (página /categories)
  categories: () => Product.categoryCounts(),

  // POST: cria. Precisa de name, brand, category, gender, state, price e image.
  create(body) {
    const data = validate(pick(body))
    return Product.create({ ...data, reference: data.reference ?? String(38416700 + Product.count() * 11) })
  },

  // PUT: substitui o produto (campos obrigatórios iguais ao POST; o que não vier volta ao padrão).
  replace(id, body) {
    const current = productService.getById(id)
    const data = validate(pick(body))
    return Product.update(current.id, { ...data, reference: data.reference ?? current.reference })
  },

  // PATCH: muda só os campos enviados e mantém o resto.
  patch(id, body) {
    const current = productService.getById(id)
    const changes = pick(body)
    if (Object.keys(changes).length === 0) throw new AppError(400, 'Envie pelo menos um campo para atualizar.')
    return Product.update(current.id, validate({ ...current, ...changes }))
  },

  remove(id) {
    const product = productService.getById(id)
    Product.remove(product.id)
  },
}

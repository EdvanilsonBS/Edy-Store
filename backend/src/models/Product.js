/**
 * MODEL: produtos (tabelas products e product_images).
 * Todas as consultas usam SQL com filtros e índices; nada é filtrado "na mão" em JavaScript.
 */
import { db } from '../config/database.js'
import { normalize } from '../utils/text.js'

// Campos que podem ser filtrados por lista de valores (?brand=Nike,Puma)
const FILTER_FIELDS = ['brand', 'category', 'gender', 'state']

const ORDER_BY = {
  price_asc: 'COALESCE(price_discount, price) ASC, id',
  price_desc: 'COALESCE(price_discount, price) DESC, id',
  name: 'name COLLATE NOCASE ASC, id',
}

// Junta as linhas de products com as fotos (uma única consulta para todas, sem N+1).
const hydrate = (rows) => {
  if (rows.length === 0) return []
  const ids = rows.map((row) => row.id)
  const images = db
    .prepare(
      `SELECT product_id, src FROM product_images
       WHERE product_id IN (${ids.map(() => '?').join(',')}) ORDER BY product_id, position, id`
    )
    .all(...ids)
  const byProduct = new Map()
  for (const { product_id, src } of images) {
    if (!byProduct.has(product_id)) byProduct.set(product_id, [])
    byProduct.get(product_id).push({ src })
  }
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    gender: row.gender,
    state: row.state,
    price: row.price,
    ...(row.price_discount !== null && { priceDiscount: row.price_discount }),
    image: row.image,
    images: byProduct.get(row.id) ?? [],
    reference: row.reference,
    stars: row.stars,
    rating: row.rating,
    description: row.description,
    sizes: JSON.parse(row.sizes),
    colors: JSON.parse(row.colors),
  }))
}

const searchText = (p) => normalize(`${p.name} ${p.brand} ${p.category} ${p.gender}`)

const saveImages = (productId, images = []) => {
  db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId)
  const insert = db.prepare('INSERT INTO product_images (product_id, src, position) VALUES (?, ?, ?)')
  images.forEach((image, position) => insert.run(productId, image.src, position))
}

export const Product = {
  count: () => db.prepare('SELECT COUNT(*) AS total FROM products').get().total,

  all: () => hydrate(db.prepare('SELECT * FROM products ORDER BY id').all()),

  // Aceita 3 ou "3"; qualquer outra coisa (true, null, "abc") não encontra nada.
  findById(id) {
    const valid = typeof id === 'number' || (typeof id === 'string' && id.trim() !== '')
    const number = valid ? Number(id) : NaN
    if (!Number.isInteger(number)) return undefined
    return hydrate(db.prepare('SELECT * FROM products WHERE id = ?').all(number))[0]
  },

  /**
   * Busca com filtros. `search` já vem sem acento (usa a coluna search_text);
   * `filters` = { brand: ['Nike'], category: [...], ... } com os valores EXATOS do banco.
   */
  search({ search = '', filters = {}, sort } = {}) {
    const where = []
    const params = []
    if (search) {
      where.push("search_text LIKE ? ESCAPE '\\'")
      params.push(`%${search.replace(/[\\%_]/g, '\\$&')}%`)
    }
    for (const field of FILTER_FIELDS) {
      const values = filters[field]
      if (values?.length) {
        where.push(`${field} IN (${values.map(() => '?').join(',')})`)
        params.push(...values)
      }
    }
    const sql = `SELECT * FROM products ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${Object.hasOwn(ORDER_BY, sort) ? ORDER_BY[sort] : 'id'}`
    return hydrate(db.prepare(sql).all(...params))
  },

  // Valores distintos de uma coluna (marcas, categorias...). O nome da coluna vem de uma lista fixa.
  distinct(field) {
    if (!FILTER_FIELDS.includes(field)) throw new Error(`Campo inválido: ${field}`)
    return db.prepare(`SELECT DISTINCT ${field} AS value FROM products ORDER BY ${field} COLLATE NOCASE`).all().map((r) => r.value)
  },

  categoryCounts: () =>
    db.prepare('SELECT category AS name, COUNT(*) AS count FROM products GROUP BY category ORDER BY MIN(id)').all(),

  // `data` já vem validado pelo service. `options.id` serve só para o seed manter os ids originais.
  create(data, options = {}) {
    return db.transaction(() => {
      const { lastInsertRowid } = db
        .prepare(
          `INSERT INTO products (id, name, brand, category, gender, state, price, price_discount, image,
             reference, stars, rating, description, sizes, colors, search_text)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          options.id ?? null, data.name, data.brand, data.category, data.gender, data.state, data.price,
          data.priceDiscount ?? null, data.image, data.reference ?? null, data.stars ?? 0, data.rating ?? 0,
          data.description ?? '', JSON.stringify(data.sizes ?? []), JSON.stringify(data.colors ?? []), searchText(data)
        )
      saveImages(lastInsertRowid, data.images)
      return Product.findById(lastInsertRowid)
    })
  },

  // `data` = produto COMPLETO já mesclado e validado (o service junta o que mudou com o que existia).
  update(id, data) {
    return db.transaction(() => {
      db.prepare(
        `UPDATE products SET name = ?, brand = ?, category = ?, gender = ?, state = ?, price = ?,
           price_discount = ?, image = ?, reference = ?, stars = ?, rating = ?, description = ?,
           sizes = ?, colors = ?, search_text = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        data.name, data.brand, data.category, data.gender, data.state, data.price, data.priceDiscount ?? null,
        data.image, data.reference ?? null, data.stars ?? 0, data.rating ?? 0, data.description ?? '',
        JSON.stringify(data.sizes ?? []), JSON.stringify(data.colors ?? []), searchText(data), id
      )
      saveImages(id, data.images)
      return Product.findById(id)
    })
  },

  remove: (id) => db.prepare('DELETE FROM products WHERE id = ?').run(id).changes > 0,
}

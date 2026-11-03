/**
 * PREPARAÇÃO DO BANCO (roda sozinha quando a API sobe, e também em `npm run migrate`)
 *   1) aplica as migrations pendentes;
 *   2) se existia o banco antigo em JSON, importa os usuários e pedidos dele (uma única vez);
 *   3) se a tabela de produtos estiver vazia, carrega src/data/products.seed.json;
 *   4) se ADMIN_EMAIL estiver no .env, esse usuário vira administrador.
 * Pode rodar várias vezes: o que já foi feito não se repete.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './database.js'
import { env } from './env.js'
import { Product } from '../models/Product.js'

const seedFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/products.seed.json')

const importLegacy = (file) => {
  const old = JSON.parse(fs.readFileSync(file, 'utf8'))
  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
  )
  const insertOrder = db.prepare(
    'INSERT OR IGNORE INTO orders (id, user_id, date, status, total) VALUES (?, ?, ?, ?, ?)'
  )
  const bumpCounter = db.prepare(
    `INSERT INTO order_counters (year, last) VALUES (?, ?)
     ON CONFLICT(year) DO UPDATE SET last = MAX(last, excluded.last)`
  )
  const insertItem = db.prepare(
    `INSERT INTO order_items (order_id, product_id, name, image, size, color, quantity, unit_price, subtotal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  db.transaction(() => {
    for (const u of old.users ?? []) {
      insertUser.run(u.id, u.name, u.email, u.passwordHash, u.createdAt ?? new Date().toISOString())
    }
    for (const o of old.orders ?? []) {
      insertOrder.run(o.id, o.userId, o.date, o.status, o.total)
      bumpCounter.run(Number(o.id.slice(0, 4)), Number(o.id.slice(5))) // o próximo pedido continua a sequência
      for (const i of o.items ?? []) {
        // as fotos foram criadas depois; para pedidos antigos usamos a miniatura do produto atual
        const product = Product.findById(i.productId)
        insertItem.run(
          o.id, product ? product.id : null, i.name, product?.image ?? null,
          i.size, i.color ?? null, i.quantity, i.unitPrice, i.subtotal
        )
      }
    }
  })
}

let ready = false

export const initDatabase = () => {
  if (ready) return { applied: [] }
  const applied = db.migrate()

  if (Product.count() === 0) {
    const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'))
    db.transaction(() => seed.forEach((product) => Product.create(product, { id: product.id })))
  }

  const legacy = db.legacyFile()
  if (legacy && fs.existsSync(legacy)) importLegacy(legacy)

  if (env.adminEmail) db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(env.adminEmail)

  ready = true
  return { applied }
}

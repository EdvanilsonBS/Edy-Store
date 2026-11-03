/** MODEL: pedidos (tabelas orders e order_items). */
import { db } from '../config/database.js'

// Junta os pedidos com os itens (uma consulta só para todos os pedidos pedidos).
const hydrate = (rows) => {
  if (rows.length === 0) return []
  const ids = rows.map((row) => row.id)
  const items = db
    .prepare(`SELECT * FROM order_items WHERE order_id IN (${ids.map(() => '?').join(',')}) ORDER BY id`)
    .all(...ids)
  const byOrder = new Map()
  for (const item of items) {
    if (!byOrder.has(item.order_id)) byOrder.set(item.order_id, [])
    byOrder.get(item.order_id).push({
      productId: item.product_id,
      name: item.name,
      image: item.image,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
    })
  }
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    status: row.status,
    items: byOrder.get(row.id) ?? [],
    total: row.total,
  }))
}

export const Order = {
  // Do mais antigo para o mais novo (quem chama inverte, se quiser os novos primeiro)
  findByUser: (userId) =>
    hydrate(db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at, rowid').all(userId)),

  findAll: () => hydrate(db.prepare('SELECT * FROM orders ORDER BY created_at, rowid').all()),

  findById: (id) => hydrate(db.prepare('SELECT * FROM orders WHERE id = ?').all(String(id)))[0],

  count: () => db.prepare('SELECT COUNT(*) AS total FROM orders').get().total,

  // Próximo número do ano (2026-0001, 2026-0002...). Vem de um contador (tabela order_counters)
  // que só aumenta, então o número de um pedido cancelado nunca é reaproveitado.
  nextId(year) {
    return db.transaction(() => {
      db.prepare('INSERT OR IGNORE INTO order_counters (year, last) VALUES (?, 0)').run(year)
      db.prepare('UPDATE order_counters SET last = last + 1 WHERE year = ?').run(year)
      const { last } = db.prepare('SELECT last FROM order_counters WHERE year = ?').get(year)
      return `${year}-${String(last).padStart(4, '0')}`
    })
  },

  // Grava o pedido e os itens juntos (transação): nunca fica um pedido sem itens.
  create(order) {
    db.transaction(() => {
      db.prepare('INSERT INTO orders (id, user_id, date, status, total) VALUES (?, ?, ?, ?, ?)').run(
        order.id, order.userId, order.date, order.status, order.total
      )
      const insertItem = db.prepare(
        `INSERT INTO order_items (order_id, product_id, name, image, size, color, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      for (const item of order.items) {
        insertItem.run(
          order.id, item.productId, item.name, item.image ?? null, item.size, item.color,
          item.quantity, item.unitPrice, item.subtotal
        )
      }
    })
    return Order.findById(order.id)
  },

  updateStatus(id, status) {
    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id)
    return Order.findById(id)
  },

  remove: (id) => db.prepare('DELETE FROM orders WHERE id = ?').run(id).changes > 0,
}

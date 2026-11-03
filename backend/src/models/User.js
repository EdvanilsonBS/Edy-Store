/** MODEL: usuários. Só acesso a dados, sem regras de negócio (essas ficam em services/). */
import { randomUUID } from 'node:crypto'
import { db } from '../config/database.js'

// Linha do banco (snake_case) -> objeto usado pelo resto do código (camelCase)
const toUser = (row) =>
  row && {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  }

export const User = {
  findByEmail: (email) => toUser(db.prepare('SELECT * FROM users WHERE email = ?').get(email)),

  findById: (id) => toUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id)),

  all: () => db.prepare('SELECT * FROM users ORDER BY created_at, rowid').all().map(toUser),

  create({ name, email, passwordHash, role = 'user' }) {
    const id = randomUUID()
    const createdAt = new Date().toISOString()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, name, email, passwordHash, role, createdAt)
    return User.findById(id)
  },

  // Atualiza só o que foi enviado: { name?, passwordHash? }
  update(id, { name, passwordHash }) {
    db.prepare('UPDATE users SET name = COALESCE(?, name), password_hash = COALESCE(?, password_hash) WHERE id = ?')
      .run(name ?? null, passwordHash ?? null, id)
    return User.findById(id)
  },

  // Apaga o usuário (os pedidos dele são apagados junto, veja migration 001). Devolve true se apagou.
  remove: (id) => db.prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0,

  // Versão segura para devolver na API (sem o hash da senha)
  toPublic: ({ passwordHash, ...user }) => user,
}

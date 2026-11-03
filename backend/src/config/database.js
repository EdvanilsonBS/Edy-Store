/**
 * BANCO DE DADOS (SQLite)
 * Os dados ficam em um arquivo (data/edi-store.db) e a estrutura vem dos arquivos de
 * migrations/*.sql. Usamos o módulo `node:sqlite`, que já vem dentro do Node 22.13+:
 * não precisa instalar nada nem ter um servidor de banco rodando.
 *
 * Só os arquivos de src/models/ falam com este módulo. Para trocar por PostgreSQL/MySQL
 * no futuro, basta reescrever os models mantendo os mesmos métodos: controllers e services
 * não mudam.
 */
import fs from 'node:fs'
import path from 'node:path'
import { env } from './env.js'

let DatabaseSync
try {
  ;({ DatabaseSync } = await import('node:sqlite'))
} catch {
  throw new Error(
    `Este back-end usa o SQLite embutido do Node 22.13 ou mais novo (você está no ${process.version}). ` +
      'Atualize o Node em https://nodejs.org e rode de novo.'
  )
}

const MIGRATIONS_DIR = path.join(env.root, 'migrations')

let conn = null
let legacyFile = null // caminho do banco antigo (JSON), se existia, para importar os dados

// Um arquivo SQLite começa com "SQLite format 3"; o JSON antigo começa com "{".
const isLegacyJson = (file) => {
  if (!fs.existsSync(file)) return false
  const fd = fs.openSync(file, 'r')
  const buffer = Buffer.alloc(64)
  const read = fs.readSync(fd, buffer, 0, 64, 0)
  fs.closeSync(fd)
  return buffer.toString('utf8', 0, read).trimStart().startsWith('{')
}

// Abre (e cria, se preciso) o arquivo do banco. Só acontece na primeira vez que alguém usa o `db`.
const open = () => {
  if (conn) return conn
  fs.mkdirSync(path.dirname(env.dbFile), { recursive: true })

  // O banco antigo era um JSON no mesmo caminho. Guarda uma cópia ao lado e cria o SQLite novo.
  if (isLegacyJson(env.dbFile)) {
    legacyFile = `${env.dbFile}.legacy.json`
    fs.renameSync(env.dbFile, legacyFile)
  }

  conn = new DatabaseSync(env.dbFile)
  conn.exec('PRAGMA journal_mode = WAL')
  conn.exec('PRAGMA foreign_keys = ON') // faz o banco respeitar as chaves estrangeiras
  return conn
}

// Roda `fn` dentro de uma transação: ou grava tudo, ou não grava nada.
// Se já estiver dentro de uma transação, apenas executa `fn` (a de fora é quem confirma).
let depth = 0
const transaction = (fn) => {
  const c = open()
  if (depth > 0) return fn()
  c.exec('BEGIN')
  depth = 1
  try {
    const result = fn()
    c.exec('COMMIT')
    return result
  } catch (error) {
    c.exec('ROLLBACK')
    throw error
  } finally {
    depth = 0
  }
}

// Aplica as migrations que ainda não rodaram. Devolve os nomes das que foram aplicadas agora.
const migrate = () => {
  const c = open()
  c.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)
  const done = new Set(c.prepare('SELECT name FROM schema_migrations').all().map((row) => row.name))
  const applied = []
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((file) => file.endsWith('.sql')).sort()
  for (const file of files) {
    if (done.has(file)) continue
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    transaction(() => {
      c.exec(sql)
      c.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file)
    })
    applied.push(file)
  }
  return applied
}

export const db = {
  prepare: (sql) => open().prepare(sql),
  exec: (sql) => open().exec(sql),
  transaction,
  migrate,
  // Caminho do arquivo JSON antigo (ou null). Usado uma vez por config/init.js.
  legacyFile: () => (open(), legacyFile),
}

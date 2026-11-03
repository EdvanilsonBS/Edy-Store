/**
 * VARIÁVEIS DE AMBIENTE
 * Lê o arquivo backend/.env e expõe os valores já tratados em um único objeto `env`.
 * Valores que já existem no sistema (ex.: definidos no deploy) têm prioridade sobre o .env.
 */
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
dotenv.config({ path: path.join(root, '.env') })

const DEFAULT_SECRET = 'dev-secret-change-me'

export const env = {
  root,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: process.env.JWT_SECRET || DEFAULT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
  // Banco SQLite (arquivo). Era data/db.json na versão com JSON; agora é um arquivo .db.
  dbFile: path.resolve(root, process.env.DB_FILE ?? 'data/edi-store.db'),
  // Quem se cadastra (ou já está cadastrado) com este e-mail vira administrador.
  adminEmail: (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase(),
  // Limite de tentativas de login/cadastro por IP a cada 15 minutos.
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT ?? 20),
}

if (env.nodeEnv === 'production' && env.jwtSecret === DEFAULT_SECRET) {
  throw new Error('Defina JWT_SECRET no ambiente antes de rodar em produção.')
}

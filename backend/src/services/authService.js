/** SERVICE: cadastro e login (regras de negócio). */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { AppError } from '../middlewares/errorHandler.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const signToken = (user) => jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })

const session = (user) => ({ user: User.toPublic(user), token: signToken(user) })

export const authService = {
  async signup({ name, email, password }) {
    const cleanName = String(name ?? '').trim()
    const cleanEmail = String(email ?? '').trim().toLowerCase()
    if (!cleanName) throw new AppError(400, 'Informe o nome.')
    if (!EMAIL_REGEX.test(cleanEmail)) throw new AppError(400, 'Informe um e-mail válido.')
    if (String(password ?? '').length < 6) throw new AppError(400, 'A senha precisa ter pelo menos 6 caracteres.')
    if (User.findByEmail(cleanEmail)) throw new AppError(409, 'Já existe uma conta com esse e-mail.')

    const passwordHash = await bcrypt.hash(String(password), 10)
    // O e-mail definido em ADMIN_EMAIL (.env) já nasce como administrador
    const role = cleanEmail === env.adminEmail ? 'admin' : 'user'
    return session(User.create({ name: cleanName, email: cleanEmail, passwordHash, role }))
  },

  async login({ email, password }) {
    const user = User.findByEmail(String(email ?? '').trim().toLowerCase())
    const valid = user && (await bcrypt.compare(String(password ?? ''), user.passwordHash))
    if (!valid) throw new AppError(401, 'E-mail ou senha incorretos.')
    return session(user)
  },
}

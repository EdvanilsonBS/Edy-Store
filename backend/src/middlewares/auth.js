/**
 * AUTENTICAÇÃO E AUTORIZAÇÃO
 *   requireAuth   exige login. O front envia o token no cabeçalho:
 *                   Authorization: Bearer <token>
 *                 Se o token for válido, `req.user` fica disponível nos controllers.
 *   requireAdmin  use DEPOIS do requireAuth: só deixa passar quem tem role 'admin' (senão 403).
 */
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { AppError } from './errorHandler.js'

export const requireAuth = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'Faça login para continuar.'))
  }
  try {
    const { sub } = jwt.verify(token, env.jwtSecret)
    const user = User.findById(sub)
    if (!user) return next(new AppError(401, 'Sessão inválida. Entre novamente.'))
    req.user = user
    next()
  } catch {
    next(new AppError(401, 'Sessão expirada ou inválida. Entre novamente.'))
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError(403, 'Apenas administradores podem fazer isso.'))
  }
  next()
}

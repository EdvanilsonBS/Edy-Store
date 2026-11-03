/**
 * LIMITE DE TENTATIVAS (contra tentativas de adivinhar senha)
 * Conta as requisições de cada IP numa janela de tempo; passou do `max`, responde 429.
 * Fica na memória do servidor (zera ao reiniciar), suficiente para este projeto.
 */
import { AppError } from './errorHandler.js'

export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 20 } = {}) => {
  const hits = new Map() // ip -> { count, resetAt }
  return (req, res, next) => {
    const now = Date.now()
    const key = req.ip
    let entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs }
      hits.set(key, entry)
    }
    entry.count += 1
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      return next(new AppError(429, 'Muitas tentativas. Tente de novo em alguns minutos.'))
    }
    next()
  }
}

/**
 * ERROS
 *   AppError      lance `throw new AppError(404, 'Mensagem')` em qualquer service.
 *   notFound      responde 404 para rotas que não existem.
 *   errorHandler  transforma qualquer erro em JSON { error: 'mensagem' }.
 */
export class AppError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const notFound = (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Corpo da requisição grande demais.' })
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message })
  }
  // Violação de regra do banco (valor repetido, chave estrangeira...) que escapou das validações
  if (err.code === 'ERR_SQLITE_ERROR' && /constraint/i.test(err.message)) {
    return res.status(409).json({ error: 'Operação conflita com os dados existentes.' })
  }
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
}

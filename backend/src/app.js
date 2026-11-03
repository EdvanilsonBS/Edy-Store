/** Monta o app Express (separado do server.js para os testes poderem usá-lo). */
import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { initDatabase } from './config/init.js'
import routes from './routes/index.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'

export const createApp = () => {
  initDatabase() // aplica as migrations e carrega os produtos na primeira vez
  const app = express()
  app.disable('x-powered-by') // não anuncia que é Express
  if (env.nodeEnv === 'production') app.set('trust proxy', 1) // atrás do proxy da hospedagem, enxerga o IP real
  app.use(cors({ origin: env.corsOrigins }))
  app.use(express.json({ limit: '100kb' }))
  app.use('/api', routes)
  app.use(notFound)
  app.use(errorHandler)
  return app
}

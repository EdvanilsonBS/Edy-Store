import { orderService } from '../services/orderService.js'
import { AppError } from '../middlewares/errorHandler.js'

export const orderController = {
  // GET /orders            -> pedidos do usuário logado
  // GET /orders?all=true   -> todos os pedidos (só admin)
  list: (req, res) => {
    if (req.query.all === 'true') {
      if (req.user.role !== 'admin') throw new AppError(403, 'Apenas administradores podem fazer isso.')
      return res.json(orderService.listAll())
    }
    res.json(orderService.listByUser(req.user))
  },
  get: (req, res) => res.json(orderService.getById(req.user, req.params.id)),
  create: (req, res) => res.status(201).json(orderService.create(req.user, req.body?.items)),
  updateStatus: (req, res) => res.json(orderService.updateStatus(req.params.id, req.body?.status)),
  remove: (req, res) => {
    orderService.remove(req.user, req.params.id)
    res.status(204).end()
  },
}

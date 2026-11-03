import { Router } from 'express'
import { orderController } from '../controllers/orderController.js'
import { requireAuth, requireAdmin } from '../middlewares/auth.js'

const router = Router()
router.use(requireAuth) // todas as rotas de pedidos exigem login
router.get('/', orderController.list)
router.post('/', orderController.create) // { items: [{ productId, size, color, quantity }] }
router.get('/:id', orderController.get) // dono do pedido ou admin
router.patch('/:id/status', requireAdmin, orderController.updateStatus) // { status }
router.delete('/:id', orderController.remove) // cliente cancela se "processing"; admin exclui qualquer um
export default router

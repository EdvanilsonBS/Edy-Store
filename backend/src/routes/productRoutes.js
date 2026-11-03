import { Router } from 'express'
import { productController } from '../controllers/productController.js'
import { requireAuth, requireAdmin } from '../middlewares/auth.js'

const router = Router()
// As rotas fixas vêm ANTES de /:id, senão "filters" seria lido como um id.
router.get('/filters', productController.filters)
router.get('/categories', productController.categories)
router.get('/', productController.list) // ?search= &brand= &category= &gender= &state= &sort=price_asc|price_desc|name
router.get('/:id', productController.get)
// Criar, editar e excluir: só administrador
router.post('/', requireAuth, requireAdmin, productController.create)
router.put('/:id', requireAuth, requireAdmin, productController.replace) // troca o produto inteiro
router.patch('/:id', requireAuth, requireAdmin, productController.patch) // muda só os campos enviados
router.delete('/:id', requireAuth, requireAdmin, productController.remove)
export default router

import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { userController } from '../controllers/userController.js'
import { requireAuth, requireAdmin } from '../middlewares/auth.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'

const router = Router()
router.use(requireAuth)
// A própria conta (as rotas /me vêm ANTES de /:id)
router.get('/me', authController.me)
router.patch('/me', asyncHandler(authController.updateMe)) // { name?, password? }
router.delete('/me', authController.removeMe)
// Só administrador
router.get('/', requireAdmin, userController.list)
router.delete('/:id', requireAdmin, userController.remove)
export default router

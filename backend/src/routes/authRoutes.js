import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { requireAuth } from '../middlewares/auth.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { rateLimit } from '../middlewares/rateLimit.js'
import { env } from '../config/env.js'

const router = Router()
const limit = rateLimit({ max: env.authRateLimit }) // freia tentativas de adivinhar senha
router.post('/signup', limit, asyncHandler(authController.signup)) // { name, email, password }
router.post('/login', limit, asyncHandler(authController.login)) // { email, password }
router.get('/me', requireAuth, authController.me)
export default router

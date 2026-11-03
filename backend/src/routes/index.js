import { Router } from 'express'
import authRoutes from './authRoutes.js'
import userRoutes from './userRoutes.js'
import productRoutes from './productRoutes.js'
import orderRoutes from './orderRoutes.js'
import docsRoutes from './docsRoutes.js'

const router = Router()
router.get('/health', (req, res) => res.json({ status: 'ok' }))
router.use('/docs', docsRoutes) // documentação Swagger
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/orders', orderRoutes)
export default router

/**
 * SERVICE: pedidos.
 * IMPORTANTE: o preço NUNCA vem do front. O servidor busca o produto e calcula tudo,
 * senão qualquer pessoa poderia comprar um tênis por R$ 1 alterando a requisição.
 *
 * Quem pode o quê:
 *   cliente  cria pedidos, vê os seus e cancela (exclui) os seus que ainda estão "em processamento"
 *   admin    vê todos, muda o status e exclui qualquer um
 */
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { AppError } from '../middlewares/errorHandler.js'

const MAX_QUANTITY = 10 // mesmo limite da sacola no front
export const ORDER_STATUSES = ['processing', 'shipping', 'delivered']

const round = (value) => Math.round(value * 100) / 100

// Pedido de outra pessoa responde 404 (como se não existisse), para não revelar que ele existe.
const findAllowed = (user, id) => {
  const order = Order.findById(id)
  if (!order || (order.userId !== user.id && user.role !== 'admin')) {
    throw new AppError(404, 'Pedido não encontrado.')
  }
  return order
}

export const orderService = {
  create(user, rawItems) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new AppError(400, 'O pedido precisa ter pelo menos um item.')
    }

    const items = rawItems.map((raw) => {
      const product = Product.findById(raw?.productId)
      if (!product) throw new AppError(400, `Produto ${raw?.productId} não existe.`)

      const quantity = Number(raw.quantity)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        throw new AppError(400, `Quantidade deve ser de 1 a ${MAX_QUANTITY}.`)
      }
      if (!product.sizes.includes(String(raw.size))) {
        throw new AppError(400, `Tamanho inválido para ${product.name}.`)
      }
      // A cor é opcional, mas se vier precisa ser uma das cores do produto
      const color = raw.color == null ? null : String(raw.color).toUpperCase()
      if (color !== null && !product.colors.includes(color)) {
        throw new AppError(400, `Cor inválida para ${product.name}.`)
      }

      const unitPrice = product.priceDiscount ?? product.price
      return {
        productId: product.id,
        name: product.name,
        image: product.image, // a página Meus Pedidos mostra a foto
        size: String(raw.size),
        color,
        quantity,
        unitPrice,
        subtotal: round(unitPrice * quantity),
      }
    })

    const today = new Date()
    return Order.create({
      id: Order.nextId(today.getFullYear()),
      userId: user.id,
      date: today.toISOString().slice(0, 10),
      status: 'processing', // processing | shipping | delivered (igual ao front)
      items,
      total: round(items.reduce((sum, item) => sum + item.subtotal, 0)),
    })
  },

  // Pedidos do usuário, os mais novos primeiro
  listByUser: (user) => Order.findByUser(user.id).slice().reverse(),

  // Só admin: todos os pedidos da loja, os mais novos primeiro
  listAll: () => Order.findAll().slice().reverse(),

  getById: (user, id) => findAllowed(user, id),

  // Só admin: muda o andamento do pedido
  updateStatus(id, status) {
    if (!ORDER_STATUSES.includes(status)) {
      throw new AppError(400, `Status deve ser um destes: ${ORDER_STATUSES.join(', ')}.`)
    }
    if (!Order.findById(id)) throw new AppError(404, 'Pedido não encontrado.')
    return Order.updateStatus(id, status)
  },

  // Cliente só cancela pedido "em processamento"; admin pode excluir qualquer um.
  remove(user, id) {
    const order = findAllowed(user, id)
    if (user.role !== 'admin' && order.status !== 'processing') {
      throw new AppError(409, 'Só é possível cancelar pedidos que ainda estão em processamento.')
    }
    Order.remove(order.id)
  },
}

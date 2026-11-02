/**
 * PEDIDOS (página "Meus Pedidos")
 *
 * Existem dois tipos de pedido:
 *   1) Pedidos de EXEMPLO (lista `exampleOrders` abaixo) - aparecem para todo mundo.
 *   2) Pedidos REAIS do usuário - criados quando ele clica em "Finalizar compra" na sacola.
 *      Ficam salvos no navegador, separados por e-mail (chave 'drip-store:orders:<email>').
 *
 * COMO EDITAR OS PEDIDOS DE EXEMPLO:
 *   - Cada pedido tem id, date (AAAA-MM-DD), status e items.
 *   - `status` precisa ser uma das chaves de `orderStatus`: processing | shipping | delivered.
 *   - Cada item aponta para um produto pelo `productId` (o id de src/data/products.js).
 *   - O total do pedido é calculado automaticamente (preço com desconto x quantidade).
 */
import { getEffectivePrice, getProductById } from './products'
import { readStorage, writeStorage } from '../utils/storage'

// Pedidos de exemplo (mockados). Cada item aponta para um produto da loja.
const exampleOrders = [
  {
    id: '2026-0003',
    date: '2026-10-22',
    status: 'processing',
    items: [{ productId: 9, size: '42', quantity: 1 }],
  },
  {
    id: '2026-0002',
    date: '2026-10-05',
    status: 'shipping',
    items: [
      { productId: 4, size: '41', quantity: 1 },
      { productId: 11, size: '39', quantity: 2 },
    ],
  },
  {
    id: '2026-0001',
    date: '2026-09-12',
    status: 'delivered',
    items: [{ productId: 1, size: '40', quantity: 1 }],
  },
]

// Texto e cor de cada status. `tone` escolhe a cor do selo (warning, primary ou success,
// veja .order__status--* em pages/OrdersPage.css).
export const orderStatus = {
  processing: { label: 'Em processamento', tone: 'warning' },
  shipping: { label: 'A caminho', tone: 'primary' },
  delivered: { label: 'Entregue', tone: 'success' },
}

// Chave onde ficam salvos os pedidos de cada usuário
const userOrdersKey = (email) => `drip-store:orders:${email}`

// Data de hoje no formato AAAA-MM-DD (usando o fuso do navegador)
const todayIso = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Junta cada item com os dados do produto e calcula subtotal e total.
const hydrate = (order) => {
  const items = order.items
    .map((item) => ({ ...item, product: getProductById(item.productId) }))
    .filter((item) => item.product) // ignora produtos que não existem mais
    .map((item) => ({ ...item, subtotal: getEffectivePrice(item.product) * item.quantity }))
  return { ...order, items, total: items.reduce((sum, item) => sum + item.subtotal, 0) }
}

/**
 * Cria um pedido novo a partir dos itens da sacola e salva para o usuário.
 * O número continua a sequência dos pedidos de exemplo (2026-0004, 2026-0005...).
 * Todo pedido novo começa como "Em processamento" (processing).
 */
export const saveUserOrder = (email, cartItems) => {
  const existing = readStorage(userOrdersKey(email), [])
  const number = exampleOrders.length + existing.length + 1

  const order = {
    id: `${new Date().getFullYear()}-${String(number).padStart(4, '0')}`,
    date: todayIso(),
    status: 'processing',
    items: cartItems.map(({ productId, size, color, quantity }) => ({
      productId,
      size,
      color,
      quantity,
    })),
  }

  writeStorage(userOrdersKey(email), [...existing, order])
  return order
}

// Todos os pedidos que a página "Meus Pedidos" mostra: os novos primeiro, depois os de exemplo.
export const getOrders = (email) =>
  [...readStorage(userOrdersKey(email), []).reverse(), ...exampleOrders].map(hydrate)

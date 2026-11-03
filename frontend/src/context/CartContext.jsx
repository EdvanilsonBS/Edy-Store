/**
 * SACOLA DE COMPRAS (carrinho)
 *
 * Como funciona:
 *   - Os itens ficam no estado do React e também no localStorage ('drip-store:cart'),
 *     então a sacola continua cheia depois de recarregar a página.
 *   - Dois itens são "iguais" quando têm o mesmo produto, tamanho e cor: nesse caso
 *     a quantidade aumenta em vez de criar uma linha nova.
 *
 * Como usar em qualquer componente:
 *   const { items, count, total, addItem, setQuantity, removeItem, checkout } = useCart()
 *     items     lista de itens, cada um com { key, productId, size, color, quantity, product, subtotal }
 *     count     quantidade total de peças (aparece na bolinha do ícone do carrinho)
 *     total     valor total da sacola
 *     addItem({ productId, size, color })   adiciona 1 unidade
 *     setQuantity(key, novaQuantidade)      muda a quantidade (de 1 até MAX_QUANTITY)
 *     removeItem(key)                       tira o item da sacola
 *     checkout(email)                       transforma a sacola em um pedido e esvazia a sacola
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getEffectivePrice, getProductById } from '../data/products'
import { saveUserOrder } from '../data/orders'
import { readStorage, writeStorage } from '../utils/storage'

const CART_KEY = 'drip-store:cart'

// Limite de unidades de um mesmo item. Mude aqui se quiser permitir mais.
export const MAX_QUANTITY = 10

const CartContext = createContext(null)

// Envolve o site (veja main.jsx) para que `useCart()` funcione em qualquer lugar.
export const CartProvider = ({ children }) => {
  // Lê a sacola salva, descartando itens de produtos que não existem mais
  const [items, setItems] = useState(() =>
    readStorage(CART_KEY, []).filter((item) => getProductById(item.productId))
  )

  // Salva a sacola no navegador sempre que ela muda
  useEffect(() => {
    writeStorage(CART_KEY, items)
  }, [items])

  const addItem = useCallback(({ productId, size, color }) => {
    const key = `${productId}|${size}|${color}`
    setItems((current) =>
      current.some((item) => item.key === key)
        ? current.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
              : item
          )
        : [...current, { key, productId, size, color, quantity: 1 }]
    )
  }, [])

  const setQuantity = useCallback((key, quantity) => {
    const safe = Math.max(1, Math.min(MAX_QUANTITY, quantity))
    setItems((current) => current.map((item) => (item.key === key ? { ...item, quantity: safe } : item)))
  }, [])

  const removeItem = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key))
  }, [])

  // Finalizar compra: cria o pedido do usuário e esvazia a sacola. Devolve o pedido criado.
  const checkout = useCallback(
    (email) => {
      const order = saveUserOrder(email, items)
      setItems([])
      return order
    },
    [items]
  )

  // Itens com os dados completos do produto e o subtotal de cada linha
  const detailedItems = useMemo(
    () =>
      items.map((item) => {
        const product = getProductById(item.productId)
        return { ...item, product, subtotal: getEffectivePrice(product) * item.quantity }
      }),
    [items]
  )

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const total = useMemo(() => detailedItems.reduce((sum, item) => sum + item.subtotal, 0), [detailedItems])

  const value = useMemo(
    () => ({ items: detailedItems, count, total, addItem, setQuantity, removeItem, checkout }),
    [detailedItems, count, total, addItem, setQuantity, removeItem, checkout]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)

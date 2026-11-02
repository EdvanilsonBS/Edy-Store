/**
 * PÁGINA "MEUS PEDIDOS" (rota "/orders") - também é para onde vai o ícone do carrinho.
 *   - Sem login: mostra um convite para entrar (e volta para cá depois, via ?redirect=/orders).
 *   - Com login: lista os pedidos do usuário (novos primeiro) e os pedidos de exemplo.
 *   - Depois de "Finalizar compra", chega aqui com ?success=1 e mostra a mensagem de sucesso.
 *   - Se ainda houver itens na sacola, aparece um aviso com o link para ela.
 * Dados: src/data/orders.js
 */
import { Link, useSearchParams } from 'react-router-dom'
import Layout from './Layout'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getOrders, orderStatus } from '../data/orders'
import { formatPrice } from '../utils/format'
import './OrdersPage.css'

// "2026-10-22" -> "22 de outubro de 2026"
const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

// Aviso "Você tem N itens na sacola" (só aparece se a sacola não estiver vazia)
const BagNotice = ({ count }) =>
  count > 0 ? (
    <p className="orders__bag">
      Você tem {count} {count === 1 ? 'item' : 'itens'} na sacola. <Link to="/cart">Ver sacola</Link>
    </p>
  ) : null

const OrdersPage = () => {
  const { user } = useAuth()
  const { count } = useCart()
  const [searchParams] = useSearchParams()
  const justBought = searchParams.get('success') === '1'

  if (!user) {
    return (
      <Layout>
        <div className="container orders orders--empty">
          <h1>Meus Pedidos</h1>
          <p>Entre na sua conta para acompanhar os seus pedidos.</p>
          <Link to="/login?redirect=/orders" className="orders__button">
            Entrar
          </Link>
          <p className="orders__hint">
            Ainda não tem conta? <Link to="/signup?redirect=/orders">Cadastre-se</Link>
          </p>
          <BagNotice count={count} />
        </div>
      </Layout>
    )
  }

  const orders = getOrders(user.email)

  return (
    <Layout>
      <div className="container orders">
        <h1 className="orders__title">Meus Pedidos</h1>

        {justBought && (
          <p className="orders__success" role="status">
            Compra realizada com sucesso! Seu pedido já aparece abaixo.
          </p>
        )}

        <p className="orders__note">
          Olá, {user.name.split(' ')[0]}! Os pedidos mais antigos (#2026-0001 a #2026-0003) são
          apenas exemplos, já que a loja não possui backend.
        </p>
        <BagNotice count={count} />

        <ul className="orders__list">
          {orders.map((order) => {
            const status = orderStatus[order.status]
            return (
              <li key={order.id} className="order">
                <header className="order__header">
                  <div>
                    <h2>Pedido #{order.id}</h2>
                    <p>{formatDate(order.date)}</p>
                  </div>
                  <span className={`order__status order__status--${status.tone}`}>
                    {status.label}
                  </span>
                </header>

                <ul className="order__items">
                  {order.items.map((item, index) => (
                    <li key={`${item.productId}-${item.size}-${item.color ?? ''}-${index}`}>
                      <img src={item.product.image} alt="" width={64} height={70} />
                      <div className="order__item-info">
                        <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                        <span>
                          Tamanho {item.size}
                          {item.color && (
                            <span
                              className="order__color"
                              style={{ backgroundColor: item.color }}
                              role="img"
                              aria-label={`Cor ${item.color}`}
                            />
                          )}
                          · Qtd. {item.quantity}
                        </span>
                      </div>
                      <strong>{formatPrice(item.subtotal)}</strong>
                    </li>
                  ))}
                </ul>

                <footer className="order__total">
                  <span>Total</span>
                  <strong>{formatPrice(order.total)}</strong>
                </footer>
              </li>
            )
          })}
        </ul>
      </div>
    </Layout>
  )
}

export default OrdersPage

/**
 * PÁGINA DA SACOLA DE COMPRAS (rota "/cart")
 * É para onde o botão COMPRAR leva. Mostra os itens e pergunta:
 *   "Deseja continuar comprando?"
 *     - "Sim, continuar comprando" -> volta para a lista de produtos (/products)
 *     - "Não, finalizar compra"    -> cria o pedido e abre "Meus Pedidos"
 *       (se a pessoa não estiver logada, vai primeiro para o login e depois volta para cá)
 *
 * Dados da sacola: src/context/CartContext.jsx (useCart).
 */
import { Link, useNavigate } from 'react-router-dom'
import Layout from './Layout'
import { useAuth } from '../context/AuthContext'
import { MAX_QUANTITY, useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import './CartPage.css'

const CartPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, count, total, setQuantity, removeItem, checkout } = useCart()

  // "Não, finalizar compra"
  const handleFinish = () => {
    if (!user) {
      navigate('/login?redirect=/cart')
      return
    }
    checkout(user.email)
    navigate('/orders?success=1')
  }

  // Sacola vazia
  if (items.length === 0) {
    return (
      <Layout>
        <div className="container cart cart--empty">
          <h1>Sua sacola está vazia</h1>
          <p>Adicione produtos para vê-los aqui.</p>
          <Link to="/products" className="cart__button cart__button--solid">
            Ver produtos
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container cart">
        <h1 className="cart__title">Sacola de compras</h1>
        <p className="cart__count">
          {count} {count === 1 ? 'item' : 'itens'}
        </p>

        <ul className="cart__list">
          {items.map((item) => (
            <li key={item.key} className="cart-item">
              <img src={item.product.image} alt="" width={96} height={105} />

              <div className="cart-item__info">
                <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                <span className="cart-item__meta">
                  Tamanho {item.size}
                  <span
                    className="cart-item__color"
                    style={{ backgroundColor: item.color }}
                    role="img"
                    aria-label={`Cor ${item.color}`}
                  />
                </span>
                <button type="button" className="cart-item__remove" onClick={() => removeItem(item.key)}>
                  Remover
                </button>
              </div>

              <div className="cart-item__quantity" role="group" aria-label="Quantidade">
                <button
                  type="button"
                  onClick={() => setQuantity(item.key, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  aria-label="Diminuir quantidade"
                >
                  −
                </button>
                <span aria-live="polite">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(item.key, item.quantity + 1)}
                  disabled={item.quantity >= MAX_QUANTITY}
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>

              <strong className="cart-item__subtotal">{formatPrice(item.subtotal)}</strong>
            </li>
          ))}
        </ul>

        <div className="cart__total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>

        {/* A pergunta do fluxo de compra */}
        <section className="cart__question" aria-labelledby="cart-question">
          <h2 id="cart-question">Deseja continuar comprando?</h2>
          <div className="cart__actions">
            <Link to="/products" className="cart__button cart__button--outline">
              Sim, continuar comprando
            </Link>
            <button type="button" className="cart__button cart__button--solid" onClick={handleFinish}>
              Não, finalizar compra
            </button>
          </div>
          {!user && (
            <p className="cart__hint">Você precisará entrar na sua conta para finalizar a compra.</p>
          )}
        </section>
      </div>
    </Layout>
  )
}

export default CartPage

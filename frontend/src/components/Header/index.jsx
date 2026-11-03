/**
 * <Header /> - cabeçalho do site: logo, busca, Cadastre-se/Entrar (ou usuário logado), carrinho e menu
 *
 * COMO EDITAR O MENU: altere a lista `navLinks` abaixo (text = nome, to = endereço).
 * A BUSCA: ao enviar (Enter ou clique na lupa) vai para /products?filter=termo.
 * O CARRINHO: o ícone leva para "Meus Pedidos" (/orders). A bolinha vermelha mostra quantos
 *   itens há na sacola e some quando ela está vazia.
 */
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../Logo'
import miniCart from '../../assets/mini-cart.svg'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './styles.css'

// Itens do menu principal. `end: true` na Home evita que ela fique "ativa" em todas as páginas.
const navLinks = [
  { text: 'Home', to: '/', end: true },
  { text: 'Produtos', to: '/products' },
  { text: 'Categorias', to: '/categories' },
  { text: 'Meus Pedidos', to: '/orders' },
]

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { count } = useCart() // quantidade de itens na sacola (aparece na bolinha do ícone)
  // Texto digitado no campo de busca
  const [term, setTerm] = useState('')

  // mantém o campo sincronizado com o filtro da URL (ex.: /products?filter=nike)
  useEffect(() => {
    const filter = new URLSearchParams(location.search).get('filter')
    setTerm(location.pathname === '/products' ? filter ?? '' : '')
  }, [location.pathname, location.search])

  // Envia a busca. Campo vazio leva para a lista completa de produtos.
  const handleSubmit = (event) => {
    event.preventDefault()
    const value = term.trim()
    navigate(value ? `/products?filter=${encodeURIComponent(value)}` : '/products')
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <div className="header__top">
          <Link to="/" className="header__logo" aria-label="Digital Store - Home">
            <Logo />
          </Link>

          <form className="header__search" role="search" onSubmit={handleSubmit}>
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Pesquisar produto..."
              aria-label="Pesquisar produto"
            />
            <button type="submit" aria-label="Buscar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          <div className="header__actions">
            {/* Logado: mostra o nome e o botão Sair. Deslogado: mostra Cadastre-se e Entrar. */}
            {user ? (
              <>
                <span className="header__greeting">Olá, {user.name.split(' ')[0]}</span>
                <button type="button" className="header__logout" onClick={logout}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="header__signup">
                  Cadastre-se
                </Link>
                <Link to="/login" className="header__login">
                  Entrar
                </Link>
              </>
            )}
            {/* Ícone do carrinho: leva para "Meus Pedidos". A bolinha mostra quantos itens
                estão na sacola (some quando a sacola está vazia). */}
            <Link
              to="/orders"
              className="header__cart"
              aria-label={count > 0 ? `Meus pedidos (${count} na sacola)` : 'Meus pedidos'}
            >
              <img src={miniCart} alt="" width={24} height={24} />
              {count > 0 && <span className="header__cart-badge">{count}</span>}
            </Link>
          </div>
        </div>

        <nav className="header__nav" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'header__link header__link--active' : 'header__link'
              }
            >
              {link.text}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header

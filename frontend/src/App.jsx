/**
 * ROTAS DO SITE
 * Cada <Route> liga um endereço (path) a uma página (element).
 *
 * COMO ADICIONAR UMA PÁGINA NOVA:
 *   1) crie o arquivo em src/pages (ex.: AboutPage.jsx) usando o <Layout>
 *   2) importe aqui em cima
 *   3) adicione:  <Route path="/about" element={<AboutPage />} />
 *      (coloque antes da rota path="*", que é a "página não encontrada")
 */
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductListingPage from './pages/ProductListingPage'
import ProductViewPage from './pages/ProductViewPage'
import CategoriesPage from './pages/CategoriesPage'
import OrdersPage from './pages/OrdersPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PlaceholderPage from './pages/PlaceholderPage'

// Volta ao topo da tela sempre que o endereço (pathname) muda.
// Sem isso, ao clicar em um produto a nova página abriria no meio da rolagem.
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// A documentação cita /produtos e /products: aceitamos as duas.
// Quem acessar /produtos é redirecionado para /products, mantendo a busca (?filter=...).
const ProductsRedirect = () => {
  const { search } = useLocation()
  return <Navigate to={`/products${search}`} replace />
}

const App = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductListingPage />} />
      <Route path="/produtos" element={<ProductsRedirect />} />
      <Route path="/product/:id" element={<ProductViewPage />} />
      {/* Páginas extras: categorias, pedidos, login e cadastro */}
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      {/* Sacola de compras: para onde o botão COMPRAR leva */}
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* path="*" pega qualquer endereço que não existe (ex.: links do rodapé ainda sem página) */}
      <Route path="*" element={<PlaceholderPage />} />
    </Routes>
  </>
)

export default App

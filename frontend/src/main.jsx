/**
 * PONTO DE ENTRADA DO REACT
 * Aqui o React é "ligado" na <div id="root"> do index.html.
 * Ordem dos envoltórios (de fora para dentro):
 *   BrowserRouter -> habilita as rotas (/products, /product/1...)
 *   AuthProvider  -> deixa o usuário logado disponível em todo o site (useAuth)
 *   CartProvider  -> deixa a sacola de compras disponível em todo o site (useCart)
 *   App           -> contém as rotas (veja App.jsx)
 * ATENÇÃO: o './index.css' precisa ser importado ANTES do App, senão os estilos
 * globais sobrescrevem os estilos dos componentes.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

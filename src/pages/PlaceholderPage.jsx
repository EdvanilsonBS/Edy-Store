/**
 * PÁGINA PROVISÓRIA - usada em rotas ainda sem conteúdo (links do rodapé) e como "página não encontrada".
 * Props: title (título) e message (texto). Para criar uma página de verdade, veja as instruções em App.jsx.
 */
import { Link } from 'react-router-dom'
import Layout from './Layout'

// Páginas fora do escopo do projeto (login, cadastro, categorias, pedidos...)
const PlaceholderPage = ({ title = 'Página não encontrada', message }) => (
  <Layout>
    <div className="container" style={{ padding: '96px 24px', textAlign: 'center' }}>
      <h1 style={{ marginTop: 0, color: 'var(--dark-gray)' }}>{title}</h1>
      <p>{message ?? 'Esta página ainda não está disponível.'}</p>
      <Link to="/" style={{ color: 'var(--primary)' }}>
        Voltar para a Home
      </Link>
    </div>
  </Layout>
)

export default PlaceholderPage

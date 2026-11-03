/**
 * <Layout /> - estrutura comum a todas as páginas: Header no topo, conteúdo no meio, Footer embaixo.
 * Toda página deve ser envolvida por ele:  <Layout> ...conteúdo da página... </Layout>
 * (`children` é tudo que for colocado dentro das tags <Layout>)
 */
import Header from '../components/Header'
import Footer from '../components/Footer'

// Layout compartilhado: Header + conteúdo da página (children) + Footer
const Layout = ({ children }) => (
  <div className="layout">
    <Header />
    <main className="layout__main">{children}</main>
    <Footer />
  </div>
)

export default Layout

/**
 * <Section /> - bloco de página com título (e link opcional) e conteúdo dentro
 * Props:
 *   title       texto do título
 *   titleAlign  'left' (padrão) ou 'center'
 *   link        (opcional) { text: 'Ver todos', href: '/products' } - aparece à direita do título
 *   children    qualquer conteúdo (cards, imagens...) colocado entre <Section> e </Section>
 * Exemplo:
 *   <Section title="Produtos em alta" link={{ text: 'Ver todos', href: '/products' }}>...</Section>
 */
import { Link } from 'react-router-dom'
import './styles.css'

// Link começando com http(s):// é externo (usa <a>); os outros são rotas internas (usa <Link>).
const isExternal = (href) => /^https?:\/\//.test(href)

const Section = ({ title, titleAlign = 'left', link, children }) => (
  <section className="section">
    <header className={`section__header section__header--${titleAlign}`}>
      <h2 className="section__title">{title}</h2>
      {link &&
        (isExternal(link.href) ? (
          <a className="section__link" href={link.href}>
            {link.text}
          </a>
        ) : (
          <Link className="section__link" to={link.href}>
            {link.text}
          </Link>
        ))}
    </header>
    {children}
  </section>
)

export default Section

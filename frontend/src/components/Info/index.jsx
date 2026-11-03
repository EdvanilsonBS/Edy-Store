/**
 * <Info /> - uma coluna de informações do rodapé (título + lista)
 * Props:
 *   title         título da coluna
 *   informations  [{ text: 'Blog', link: '/blog' }, ...]  - sem `link`, vira texto simples
 */
import { Link } from 'react-router-dom'
import './styles.css'

// informations: [{ text: "Sobre Drip Store", link: "/about" }, ...]
// `link` é opcional: itens sem link (ex.: endereço) são renderizados como texto.
const Info = ({ title, informations = [] }) => (
  <div className="info">
    <h3 className="info__title">{title}</h3>
    <ul className="info__list">
      {informations.map((item) => (
        <li key={item.text}>
          {item.link ? <Link to={item.link}>{item.text}</Link> : item.text}
        </li>
      ))}
    </ul>
  </div>
)

export default Info

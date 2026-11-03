/**
 * PÁGINA DE CATEGORIAS (rota "/categories")
 * As categorias são montadas sozinhas a partir dos produtos (campo `category`).
 * Clicar em uma leva para /products?filter=<categoria>, já filtrando a lista.
 * A imagem de cada card é a do primeiro produto daquela categoria.
 */
import { Link } from 'react-router-dom'
import Layout from './Layout'
import Section from '../components/Section'
import { products } from '../data/products'
import './CategoriesPage.css'

// categorias derivadas dos produtos: nome, quantidade e uma imagem de capa
const categories = [...new Set(products.map((product) => product.category))].sort().map((name) => {
  const items = products.filter((product) => product.category === name)
  return { name, count: items.length, image: items[0].image }
})

const CategoriesPage = () => (
  <Layout>
    <div className="container categories">
      <Section title="Categorias" titleAlign="left">
        <ul className="categories__grid">
          {categories.map((category) => (
            <li key={category.name}>
              <Link
                to={`/products?filter=${encodeURIComponent(category.name)}`}
                className="category-card"
              >
                <img src={category.image} alt="" loading="lazy" />
                <span className="category-card__name">{category.name}</span>
                <span className="category-card__count">
                  {category.count} produto{category.count === 1 ? '' : 's'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  </Layout>
)

export default CategoriesPage

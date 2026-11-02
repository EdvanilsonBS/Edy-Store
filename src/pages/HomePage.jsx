/**
 * PÁGINA INICIAL (rota "/")
 * Blocos: carrossel de imagens (1440x681) -> Coleções em destaque -> Produtos em alta.
 *   - Para mudar os slides e as coleções: src/data/products.js (homeSlides e collections)
 *   - Para mostrar mais/menos produtos em alta: troque o número em products.slice(0, 8)
 * Estilo: HomePage.css
 */
import Layout from './Layout'
import Gallery from '../components/Gallery'
import Section from '../components/Section'
import ProductListing from '../components/ProductListing'
import { collections, homeSlides, products } from '../data/products'
import './HomePage.css'

const HomePage = () => (
  <Layout>
    <div className="home__gallery">
      <Gallery images={homeSlides} width="1440" height="681" autoPlay={4000} />
    </div>

    <div className="container home__content">
      <Section title="Coleções em destaque" titleAlign="center">
        <div className="home__collections">
          {collections.map((collection) => (
            <img key={collection.src} src={collection.src} alt={collection.alt} />
          ))}
        </div>
      </Section>

      <Section title="Produtos em alta" titleAlign="left">
        <ProductListing products={products.slice(0, 8)} />
      </Section>
    </div>
  </Layout>
)

export default HomePage

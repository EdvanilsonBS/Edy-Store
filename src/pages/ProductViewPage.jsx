/**
 * PÁGINA DO PRODUTO (rota "/product/:id")
 * Mostra: galeria com miniaturas + BuyBox (nome, preço, tamanho, cor, COMPRAR) + produtos recomendados.
 *   - O :id da URL vem de useParams(); o produto é buscado em src/data/products.js.
 *   - Os tamanhos e cores vêm de cada produto (campos `sizes` e `colors`).
 *   - Recomendados: até 4 produtos, priorizando os da mesma categoria.
 *
 * FLUXO DE COMPRA:
 *   1) a pessoa escolhe tamanho e cor
 *   2) clica em COMPRAR -> o produto vai para a sacola (useCart) e abre a página /cart
 *   Se faltar tamanho ou cor, aparece um aviso e nada é adicionado.
 */
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from './Layout'
import Gallery from '../components/Gallery'
import BuyBox from '../components/BuyBox'
import ProductOptions from '../components/ProductOptions'
import Section from '../components/Section'
import ProductListing from '../components/ProductListing'
import { useCart } from '../context/CartContext'
import { getProductById, products } from '../data/products'
import './ProductViewPage.css'

// Conteúdo da página. É um componente separado para receber `key={product.id}` lá embaixo:
// assim, ao abrir outro produto (ex.: pelos recomendados), o tamanho e a cor escolhidos
// são zerados automaticamente.
const ProductDetails = ({ product }) => {
  const navigate = useNavigate()
  const { addItem } = useCart()

  // Opção escolhida em cada grupo (null = ainda não escolheu) e mensagem de aviso
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)
  const [error, setError] = useState('')

  // Recomendados: mesma categoria primeiro, depois os demais. Troque o 4 para mudar a quantidade.
  const related = products
    .filter((item) => item.id !== product.id)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4)

  // Clique em COMPRAR: valida, coloca na sacola e leva para a página da sacola
  const handleBuy = () => {
    if (!size || !color) {
      setError('Escolha o tamanho e a cor antes de comprar.')
      return
    }
    addItem({ productId: product.id, size, color })
    navigate('/cart')
  }

  // Escolher uma opção também apaga o aviso de erro
  const choose = (setter) => (option) => {
    setter(option)
    setError('')
  }

  return (
    <div className="container product-view">
      <div className="product-view__main">
        <Gallery
          className="product-view__gallery"
          images={product.images}
          width="700px"
          height="570px"
          radius="4px"
          showThumbs
        />

        <BuyBox
          name={product.name}
          reference={product.reference}
          stars={product.stars}
          rating={product.rating}
          price={product.price}
          priceDiscount={product.priceDiscount}
          description={product.description}
          onBuy={handleBuy}
          error={error}
        >
          <div>
            <p className="product-view__label">Tamanho</p>
            <ProductOptions
              options={product.sizes}
              shape="square"
              radius="4px"
              type="text"
              onChange={choose(setSize)}
            />
          </div>
          <div>
            <p className="product-view__label">Cor</p>
            <ProductOptions
              options={product.colors}
              shape="circle"
              type="color"
              onChange={choose(setColor)}
            />
          </div>
        </BuyBox>
      </div>

      <Section
        title="Produtos recomendados"
        titleAlign="left"
        link={{ text: 'Ver todos', href: '/products' }}
      >
        <ProductListing products={related} />
      </Section>
    </div>
  )
}

const ProductViewPage = () => {
  const { id } = useParams()
  const product = getProductById(id)

  // Id inexistente (ex.: /product/999): mostra uma mensagem em vez de quebrar a página.
  if (!product) {
    return (
      <Layout>
        <div className="container product-view__missing">
          <h1>Produto não encontrado</h1>
          <p>O produto que você procura não existe ou foi removido.</p>
          <Link to="/products">Ver todos os produtos</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <ProductDetails key={product.id} product={product} />
    </Layout>
  )
}

export default ProductViewPage

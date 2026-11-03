/**
 * <ProductListing /> - grade que mostra vários <ProductCard />
 * Props:
 *   products      lista de produtos (cada um com id, image, name, price, priceDiscount)
 *   columns       4 (padrão) ou 3 - número de colunas no desktop
 *                 (no tablet/celular a grade reduz sozinha, veja styles.css)
 *   emptyMessage  texto mostrado quando a lista está vazia
 */
import ProductCard from '../ProductCard'
import './styles.css'

const ProductListing = ({ products = [], columns = 4, emptyMessage = 'Nenhum produto encontrado.' }) => {
  if (products.length === 0) {
    return <p className="product-listing__empty">{emptyMessage}</p>
  }

  return (
    <div className={`product-listing product-listing--cols-${columns}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id ?? `${product.name}-${index}`}
          id={product.id}
          image={product.image}
          name={product.name}
          price={product.price}
          priceDiscount={product.priceDiscount}
        />
      ))}
    </div>
  )
}

export default ProductListing

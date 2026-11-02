/**
 * <ProductCard /> - cartão de um produto (imagem 292x321, nome e preço)
 * Props:
 *   id             (opcional) se informado, o card vira link para /product/:id
 *   image          caminho da imagem (ex.: '/product-thumb-1.jpeg')
 *   name           nome do produto
 *   price          preço normal
 *   priceDiscount  (opcional) preço com desconto; quando existe, `price` aparece riscado
 * Estilo: ProductCard/styles.css
 */
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/format'
import './styles.css'

const ProductCard = ({ id, image, name, price, priceDiscount }) => {
  const hasDiscount = priceDiscount !== undefined && priceDiscount !== null

  const content = (
    <>
      <div className="product-card__image">
        <img src={image} alt={name} width={292} height={321} loading="lazy" />
      </div>
      <h3 className="product-card__name">{name}</h3>
      <p className="product-card__prices">
        <span
          className={
            hasDiscount ? 'product-card__price product-card__price--old' : 'product-card__price'
          }
        >
          {formatPrice(price)}
        </span>
        {hasDiscount && (
          <span className="product-card__price">{formatPrice(priceDiscount)}</span>
        )}
      </p>
    </>
  )

  return id !== undefined ? (
    <Link to={`/product/${id}`} className="product-card">
      {content}
    </Link>
  ) : (
    <div className="product-card">{content}</div>
  )
}

export default ProductCard

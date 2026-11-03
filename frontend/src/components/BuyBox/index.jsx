/**
 * <BuyBox /> - caixa de compra da página do produto
 * Props:
 *   name, reference     nome e código de referência
 *   stars, rating       nota (ex.: 4.5) e quantidade de avaliações
 *   price, priceDiscount  preço normal e (opcional) com desconto
 *   description         texto da descrição
 *   children            conteúdo extra, como os <ProductOptions /> de tamanho e cor
 *   onBuy               função chamada ao clicar em COMPRAR (veja ProductViewPage)
 *   error               (opcional) mensagem de aviso mostrada acima do botão (ex.: "Escolha o tamanho")
 */
import starIcon from '../../assets/star-icon.svg'
import { formatPrice } from '../../utils/format'
import './styles.css'

const BuyBox = ({
  name,
  reference,
  stars,
  rating,
  price,
  priceDiscount,
  description,
  children,
  onBuy,
  error,
}) => {
  const hasDiscount = priceDiscount !== undefined && priceDiscount !== null

  return (
    <div className="buy-box">
      <h1 className="buy-box__name">{name}</h1>
      {reference && <p className="buy-box__reference">Ref: {reference}</p>}

      {(stars !== undefined || rating !== undefined) && (
        <div className="buy-box__rating">
          {stars !== undefined && (
            <span className="buy-box__stars">
              {stars}
              <img src={starIcon} alt="estrelas" width={16} height={16} />
            </span>
          )}
          {rating !== undefined && (
            <span className="buy-box__rating-total">({rating} avaliações)</span>
          )}
        </div>
      )}

      <div className="buy-box__prices">
        {hasDiscount ? (
          <>
            <span className="buy-box__price">{formatPrice(priceDiscount)}</span>
            <span className="buy-box__price buy-box__price--old">{formatPrice(price)}</span>
          </>
        ) : (
          <span className="buy-box__price">{formatPrice(price)}</span>
        )}
      </div>

      {description && (
        <div className="buy-box__description">
          <h2>Descrição do produto</h2>
          <p>{description}</p>
        </div>
      )}

      {children}

      {/* Aviso de erro (só aparece quando a página do produto envia uma mensagem) */}
      {error && (
        <p className="buy-box__error" role="alert">
          {error}
        </p>
      )}

      {/* Botão de compra: quem decide o que acontece ao clicar é a página (prop onBuy) */}
      <button type="button" className="buy-box__cta" onClick={onBuy}>
        COMPRAR
      </button>
    </div>
  )
}

export default BuyBox

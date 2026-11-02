/**
 * <ProductOptions /> - botões de opção do produto (tamanhos, cores...)
 * Props:
 *   options   lista: ['39', '40', '41']  ou  ['#000', '#f00'] (cores)
 *   shape     'square' (caixa) ou 'circle' (bolinha 31x31)
 *   type      'text' (mostra o texto da opção) ou 'color' (pinta com a cor da opção)
 *   radius    arredondamento da caixa (só vale para shape="square")
 *   onChange  (opcional) recebe a opção escolhida
 * Exemplos (veja ProductViewPage):
 *   <ProductOptions options={tamanhos} shape="square" radius="4px" type="text" />
 *   <ProductOptions options={cores} shape="circle" type="color" />
 */
import { useState } from 'react'
import './styles.css'

const ProductOptions = ({
  options = [],
  radius = '4px',
  shape = 'square',
  type = 'text',
  onChange,
}) => {
  // Opção escolhida no momento (null = nenhuma). Para vir com uma já marcada, troque null.
  const [selected, setSelected] = useState(null)

  const handleSelect = (option) => {
    setSelected(option)
    onChange?.(option)
  }

  return (
    <div className="product-options" role="group">
      {options.map((option) => {
        const isColor = type === 'color'
        const classes = [
          'product-options__item',
          `product-options__item--${shape}`,
          isColor ? 'product-options__item--color' : '',
          selected === option ? 'product-options__item--selected' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            type="button"
            key={option}
            className={classes}
            style={{
              ...(shape === 'square' ? { borderRadius: radius } : {}),
              ...(isColor ? { backgroundColor: option } : {}),
            }}
            aria-pressed={selected === option}
            aria-label={isColor ? `Cor ${option}` : `Tamanho ${option}`}
            onClick={() => handleSelect(option)}
          >
            {isColor ? null : option}
          </button>
        )
      })}
    </div>
  )
}

export default ProductOptions

/**
 * <Gallery /> - carrossel de imagens com setas e miniaturas (opcional)
 * Props:
 *   images      lista [{ src: '/foto1.jpeg' }, { src: '/foto2.jpeg' }]  (alt opcional)
 *   width       largura máxima em px (ex.: 700 ou "700px"). Em telas menores ele encolhe.
 *   height      altura em px. Junto com width, mantém a PROPORÇÃO ao encolher.
 *   radius      arredondamento das bordas (ex.: "4px")
 *   showThumbs  (sem valor) mostra as miniaturas 117x95 embaixo
 *   autoPlay    tempo em milissegundos para trocar de slide sozinho (ex.: 4000 = 4 s).
 *               Vai até o último slide e volta um por um até o primeiro (vai e volta).
 *               Sem essa prop (ou 0), o carrossel só muda pelos cliques.
 *   className   classe CSS extra para posicionar a galeria na página
 * Comportamento: a seta esquerda fica desativada na 1ª imagem e a direita na última.
 * O slide anda com `transform: translateX(...)`; a velocidade está em styles.css (.gallery__track).
 */
import { useEffect, useRef, useState } from 'react'
import arrowLeft from '../../assets/arrow-left.svg'
import arrowRight from '../../assets/arrow-right.svg'
import './styles.css'

// Aceita 700, "700" ou "700px" e devolve sempre um valor CSS em px (usada em width e height).
const toPx = (value) => {
  if (value === undefined || value === null || value === '') return undefined
  return /^\d+(\.\d+)?$/.test(String(value)) ? `${value}px` : String(value)
}

const toNumber = (value) => {
  const n = parseFloat(value)
  return Number.isNaN(n) ? undefined : n
}

const Gallery = ({
  className = '',
  width,
  height,
  radius,
  showThumbs = false,
  images = [],
  autoPlay = 0,
}) => {
  // `current` = posição da imagem que está aparecendo (0 = primeira)
  const [current, setCurrent] = useState(0)
  // `paused` = true enquanto o mouse (ou o teclado) está na galeria: a troca automática espera
  const [paused, setPaused] = useState(false)
  const last = images.length - 1

  // Sentido da troca automática: 1 = indo para frente, -1 = voltando
  const direction = useRef(1)

  // Troca de slide sozinha, em "vai e volta": segue até o último, depois volta um por um
  // até o primeiro, e assim por diante (sem rebobinar tudo de uma vez).
  // O cronômetro reinicia sempre que `current` muda, então clicar nas setas também zera a contagem.
  useEffect(() => {
    if (!autoPlay || paused || images.length < 2) return
    const timer = setTimeout(() => {
      // nas pontas, inverte o sentido
      if (current >= images.length - 1) direction.current = -1
      if (current <= 0) direction.current = 1
      setCurrent(current + direction.current)
    }, autoPlay)
    return () => clearTimeout(timer)
  }, [autoPlay, paused, current, images.length])

  const w = toNumber(width)
  const h = toNumber(height)

  // Estilo da "janela" que mostra uma imagem de cada vez
  const viewportStyle = {
    borderRadius: radius,
    // mantém a proporção quando a tela é menor que a largura definida
    ...(w && h ? { aspectRatio: `${w} / ${h}` } : { height: toPx(height) }),
  }

  if (images.length === 0) return null

  return (
    <div
      className={`gallery ${className}`.trim()}
      style={{ maxWidth: toPx(width) }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="gallery__viewport" style={viewportStyle}>
        {/* Faixa com TODAS as imagens lado a lado; deslocamos ela para mostrar a atual */}
        <div className="gallery__track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {images.map((image, index) => (
            <div className="gallery__slide" key={image.src} aria-hidden={index !== current}>
              <img src={image.src} alt={image.alt ?? `Imagem ${index + 1} de ${images.length}`} />
            </div>
          ))}
        </div>

        {/* Setas: Math.max/Math.min impedem passar da primeira/última imagem */}
        <button
          type="button"
          className="gallery__arrow gallery__arrow--left"
          onClick={() => setCurrent((i) => Math.max(0, i - 1))}
          disabled={current === 0}
          aria-label="Imagem anterior"
        >
          <img src={arrowLeft} alt="" />
        </button>
        <button
          type="button"
          className="gallery__arrow gallery__arrow--right"
          onClick={() => setCurrent((i) => Math.min(last, i + 1))}
          disabled={current === last}
          aria-label="Próxima imagem"
        >
          <img src={arrowRight} alt="" />
        </button>
      </div>

      {/* Miniaturas: só aparecem se a prop showThumbs foi passada */}
      {showThumbs && (
        <div className="gallery__thumbs">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.src}
              className={`gallery__thumb${index === current ? ' gallery__thumb--active' : ''}`}
              style={{ borderRadius: radius }}
              onClick={() => setCurrent(index)}
              aria-label={`Ver imagem ${index + 1}`}
              aria-current={index === current}
            >
              <img src={image.src} alt="" style={{ borderRadius: radius }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Gallery
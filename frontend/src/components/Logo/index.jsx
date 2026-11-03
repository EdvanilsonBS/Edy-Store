/**
 * <Logo /> - imagem da marca (253 x 44 px, conforme a documentação)
 * Props:
 *   variant  'header' (colorida, padrão) ou 'footer' (branca, para fundo escuro)
 * Para trocar a logo, substitua os arquivos em src/assets/logo-header.svg e logo-footer.svg.
 */
import logoHeader from '../../assets/logo-header.svg'
import logoFooter from '../../assets/logo-footer.svg'

// variant: "header" (colorida) | "footer" (branca)
const Logo = ({ variant = 'header' }) => (
  <img
    src={variant === 'footer' ? logoFooter : logoHeader}
    alt="Digital Store"
    width={253}
    height={44}
  />
)

export default Logo

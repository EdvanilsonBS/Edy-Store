/**
 * <Footer /> - rodapé: logo, descrição, redes sociais e 3 colunas de links
 *
 * COMO EDITAR:
 *   - `socials`        links das redes sociais (troque os href pelos perfis reais)
 *   - `institutional`  coluna "Informações"
 *   - `categories`     coluna "Categorias"
 *   - `contact`        coluna "Contato" (itens sem `link` viram texto)
 *   - O texto "Lorem ipsum" abaixo da logo é a descrição da empresa: troque pelo seu texto.
 *   - O ano do © é automático (new Date().getFullYear()).
 */
import Logo from '../Logo'
import Info from '../Info'
import facebook from '../../assets/facebook.svg'
import instagram from '../../assets/instagram.svg'
import twitter from '../../assets/twitter.svg'
import linkedin from '../../assets/linkedin.svg'
import github from '../../assets/github.svg'
import './styles.css'

const socials = [
  { name: 'Facebook', href: 'https://www.facebook.com', icon: facebook },
  { name: 'Instagram', href: 'https://www.instagram.com', icon: instagram },
  { name: 'Twitter', href: 'https://twitter.com', icon: twitter },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/edivanilson-bezerra/', icon: linkedin },
  { name: 'GitHub', href: 'https://github.com/EdvanilsonBS', icon: github },
]

const institutional = [
  { text: 'Sobre Drip Store', link: '/about' },
  { text: 'Segurança', link: '/security' },
  { text: 'Wishlist', link: '/wishlist' },
  { text: 'Blog', link: '/blog' },
  { text: 'Trabalhe conosco', link: '/jobs' },
  { text: 'Meus Pedidos', link: '/orders' },
]

const categories = [
  { text: 'Casual', link: '/products?filter=casual' },
  { text: 'Corrida', link: '/products?filter=corrida' },
  { text: 'Esporte e lazer', link: '/products?filter=esporte' },
  { text: 'Utilitário', link: '/products?filter=utilitario' },
  { text: 'Todos os tênis', link: '/products' },
]

const contact = [
  { text: 'Av. A, s/n - 3 andar - Jose Walter, Fortaleza - CE,' },
  { text: '(85) 99812-8900' },
]

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer__content">
        <div className="footer__brand">
          <Logo variant="footer" />
          <p>
            Projeto para finalizar o projeto do Desenvolvimento Web Fullstack - 4.0
Categoria do curso GERAÇÃO TECH  de 2026. 
          </p>
          <div className="footer__socials">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
              >
                <img src={social.icon} alt="" />
              </a>
            ))}
          </div>
        </div>

        <Info title="Informações" informations={institutional} />
        <Info title="Categorias" informations={categories} />
        <Info title="Contato" informations={contact} />
      </div>

      <hr />
      <p className="footer__copy">© {new Date().getFullYear()} Edy Store</p>
    </div>
  </footer>
)

export default Footer

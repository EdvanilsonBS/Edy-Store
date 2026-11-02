# Digital Store (Drip Store)

Projeto final de Front-end da Digital College: uma loja virtual feita em **React**, seguindo a documentação e o layout do projeto base [`digitalcollegebr/projeto-digital-store`](https://github.com/digitalcollegebr/projeto-digital-store).

> **Integrantes:** _(preencha aqui o nome de todos — até 3 pessoas)_
>
> **Deploy:** _(cole aqui o link da Vercel/Netlify, se publicar)_

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org/) 18 ou superior.

```bash
npm install     # instala as dependências
npm run dev     # servidor de desenvolvimento em http://localhost:5173
npm run build   # gera a versão de produção na pasta dist/
npm run preview # serve a versão de produção localmente
```

## Tecnologias

- React 18 + Vite
- React Router DOM (rotas e query string)
- CSS puro (um arquivo por componente, com variáveis de cor em `src/index.css`)

## Páginas

| Rota | Página | O que tem |
|---|---|---|
| `/` | `HomePage` | Galeria de imagens (1440×681), coleções em destaque e 8 produtos em alta |
| `/products` (e `/produtos`) | `ProductListingPage` | Ordenação, filtros (marca, categoria, gênero, estado), busca e total de produtos |
| `/product/:id` | `ProductViewPage` | Galeria com miniaturas, BuyBox (preço, avaliação, tamanho, cor, COMPRAR) e produtos recomendados |

Páginas extras (além do mínimo exigido):

| Rota | Página | O que tem |
|---|---|---|
| `/categories` | `CategoriesPage` | Cards das categorias; clicar leva à listagem já filtrada |
| `/cart` | `CartPage` | Sacola de compras: itens, quantidade, total e a pergunta "Deseja continuar comprando?" |
| `/orders` | `OrdersPage` | Pedidos do usuário (novos primeiro) e pedidos de exemplo, com status, itens e total (exige login) |
| `/login` | `LoginPage` | Formulário com validação e mensagens de erro |
| `/signup` | `SignupPage` | Cadastro com nome, e-mail, senha e confirmação |

Os links do rodapé (Sobre, Blog, Segurança etc.) abrem uma página provisória.

### Fluxo de compra

1. Na página do produto, escolha **tamanho** e **cor** e clique em **COMPRAR** (sem as duas escolhas, aparece um aviso).
2. O produto vai para a **sacola** (`/cart`), que pergunta **"Deseja continuar comprando?"**:
   - **Sim, continuar comprando** volta para a lista de produtos;
   - **Não, finalizar compra** cria o pedido e abre **Meus Pedidos** (se você não estiver logado, passa antes pelo login e volta para a sacola).
3. O **ícone do carrinho** no cabeçalho leva para **Meus Pedidos**; a bolinha vermelha mostra quantos itens estão na sacola.

A sacola e os pedidos ficam salvos no navegador (`localStorage`), por usuário no caso dos pedidos. Não há pagamento real.

### Login e cadastro são simulados

Não existe backend. As contas ficam no `localStorage` do navegador (a senha é guardada como hash SHA-256) e a sessão persiste ao recarregar a página. Serve para demonstrar o fluxo, **não** para uso real. Depois de entrar, o cabeçalho mostra "Olá, Nome" e o botão Sair.

## Funcionalidades

- **Busca no cabeçalho:** clique na lupa ou aperte `Enter` para ir a `/products?filter=termo` (ignora acentos e maiúsculas; procura em nome, marca, categoria e gênero).
- **Ordenar por:** Menor preço / Maior preço (usa o preço com desconto quando existe).
- **Filtrar por:** marcas, categorias e gêneros combinam com "OU" dentro do grupo e "E" entre grupos; Estado é uma escolha única.
- **Galeria:** setas com slide, seta desativada na primeira/última imagem, miniaturas com borda de 2px na cor primária na selecionada.
- **Opções do produto:** tamanhos (quadrado) e cores (círculo) com borda de 2px na cor primária ao selecionar.
- **Layout responsivo** para celular e tablet.

## Estrutura de pastas

```
src/
├── components/   # Header, Footer, Logo, Section, ProductCard, ProductListing,
│                 # Gallery, FilterGroup, ProductOptions, BuyBox, Info, FormField
├── pages/        # Layout, HomePage, ProductListingPage, ProductViewPage,
│                 # CategoriesPage, CartPage, OrdersPage, LoginPage, SignupPage, PlaceholderPage
├── context/      # AuthContext (login/cadastro simulados) e CartContext (sacola)
├── data/         # products.js e orders.js (dados mockados)
├── utils/        # format.js, filterProducts.js, validation.js e storage.js
├── assets/       # logos e ícones SVG
├── App.jsx       # rotas
└── main.jsx
public/           # imagens dos produtos, coleções e slides
```

## Onde editar o quê

Todos os arquivos têm um comentário no topo explicando o que fazem e como editar.

| Quero... | Edite |
|---|---|
| Adicionar ou alterar produtos, slides e coleções | `src/data/products.js` |
| Alterar os pedidos de exemplo | `src/data/orders.js` |
| Mudar o limite de unidades por item ou o comportamento da sacola | `src/context/CartContext.jsx` |
| Mudar o que acontece ao clicar em COMPRAR | `handleBuy` em `src/pages/ProductViewPage.jsx` |
| Mudar para onde vai o ícone do carrinho | componente `Link` do carrinho em `src/components/Header/index.jsx` |
| Trocar as cores do site | variáveis no início de `src/index.css` |
| Alterar o menu do cabeçalho | lista `navLinks` em `src/components/Header/index.jsx` |
| Alterar links, textos e redes sociais do rodapé | `src/components/Footer/index.jsx` |
| Criar uma página nova | arquivo em `src/pages` + rota em `src/App.jsx` |
| Mudar regras de busca, filtro e ordenação | `src/utils/filterProducts.js` |
| Mudar regras e mensagens dos formulários | `validate` em `SignupPage.jsx` e `LoginPage.jsx` |
| Trocar logo e ícones | arquivos em `src/assets` |
| Trocar imagens dos produtos | arquivos em `public` (e os caminhos em `products.js`) |

## Observações

- Os dados são mockados em `src/data/products.js`; não há API.
- Os nomes dos arquivos `produc-image-*` do repositório base foram corrigidos para `product-image-*`.

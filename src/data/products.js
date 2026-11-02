/**
 * PRODUTOS DA LOJA (dados "mockados", ou seja, de mentira - não há API)
 *
 * COMO ADICIONAR UM PRODUTO:
 *   copie uma linha da lista `base` abaixo e mude os valores. Campos:
 *     name          nome exibido no card e na página do produto
 *     brand         marca (aparece no filtro "Marca")
 *     category      categoria (aparece no filtro "Categoria" e na página Categorias)
 *     gender        'Masculino' | 'Feminino' | 'Unisex' (filtro "Gênero")
 *     state         'Novo' | 'Usado' (filtro "Estado")
 *     price         preço normal
 *     priceDiscount (opcional) preço com desconto. Se existir, o preço normal aparece riscado.
 *   O id, a referência, as imagens, estrelas e avaliações são gerados automaticamente abaixo.
 *
 * COMO USAR SUAS PRÓPRIAS IMAGENS:
 *   coloque os arquivos na pasta /public e troque os caminhos
 *   ('/product-thumb-N.jpeg' = miniatura do card, '/product-image-N.jpeg' = fotos grandes).
 */
const base = [
  { name: 'K-Swiss V8 - Masculino', brand: 'K-Swiss', category: 'Casual', gender: 'Masculino', state: 'Novo', price: 200, priceDiscount: 100 },
  { name: 'Nike Air Max Axis', brand: 'Nike', category: 'Corrida', gender: 'Masculino', state: 'Novo', price: 399.9, priceDiscount: 299.9 },
  { name: 'Adidas Ultraboost Light', brand: 'Adidas', category: 'Corrida', gender: 'Feminino', state: 'Novo', price: 649.9 },
  { name: 'Puma Suede Classic', brand: 'Puma', category: 'Casual', gender: 'Unisex', state: 'Novo', price: 349.9, priceDiscount: 279.9 },
  { name: 'Nike Court Vision Low', brand: 'Nike', category: 'Esporte e lazer', gender: 'Feminino', state: 'Novo', price: 449.9 },
  { name: 'Adidas Campus 00s', brand: 'Adidas', category: 'Casual', gender: 'Unisex', state: 'Usado', price: 299.9, priceDiscount: 199.9 },
  { name: 'K-Swiss Classic 88', brand: 'K-Swiss', category: 'Esporte e lazer', gender: 'Masculino', state: 'Usado', price: 259.9 },
  { name: 'Puma RS-X Efekt', brand: 'Puma', category: 'Utilitário', gender: 'Masculino', state: 'Novo', price: 549.9, priceDiscount: 449.9 },
  { name: 'Nike Pegasus 41', brand: 'Nike', category: 'Corrida', gender: 'Unisex', state: 'Novo', price: 799.9 },
  { name: 'Adidas Samba OG', brand: 'Adidas', category: 'Utilitário', gender: 'Feminino', state: 'Novo', price: 599.9, priceDiscount: 479.9 },
  { name: 'Puma Smash v2', brand: 'Puma', category: 'Esporte e lazer', gender: 'Feminino', state: 'Usado', price: 189.9 },
  { name: 'K-Swiss Gstaad Neo', brand: 'K-Swiss', category: 'Utilitário', gender: 'Unisex', state: 'Novo', price: 329.9, priceDiscount: 259.9 },
]

// Texto de descrição usado em todos os produtos. Troque por textos reais, se quiser.
const description =
  'Tênis confortável e resistente, ideal para o dia a dia. Cabedal em material respirável, solado com ótima aderência e amortecimento que acompanha cada passo. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'

// Quantidade de imagens disponíveis em /public (product-thumb-1..5 e product-image-1..5).
// Se adicionar mais imagens, aumente este número.
const IMAGE_COUNT = 5

// Monta a lista final: pega cada item de `base` e acrescenta os campos automáticos.
export const products = base.map((item, index) => {
  const n = (index % IMAGE_COUNT) + 1
  // a galeria do produto começa pela imagem correspondente à miniatura
  const images = Array.from({ length: IMAGE_COUNT }, (_, i) => ({
    src: `/product-image-${((n - 1 + i) % IMAGE_COUNT) + 1}.jpeg`,
  }))

  return {
    id: index + 1,
    ...item,
    image: `/product-thumb-${n}.jpeg`,
    images,
    reference: String(38416700 + index * 11), // código de referência (só exemplo)
    stars: Number((4 + ((index * 3) % 10) / 10).toFixed(1)),
    rating: 40 + index * 13,
    description,
    sizes: ['39', '40', '41', '42', '43'], // tamanhos exibidos na página do produto
    colors: ['#6FEEFF', '#FF6969', '#5E5E5E', '#6D70B7'], // cores (código hexadecimal)
  }
})

// Busca um produto pelo id (usado na rota /product/:id).
export const getProductById = (id) =>
  products.find((product) => product.id === Number(id))

// Preço que o cliente realmente paga: o com desconto, se existir.
export const getEffectivePrice = (product) => product.priceDiscount ?? product.price

// Imagens do carrossel da Home (1440x681). Para trocar, substitua os arquivos em /public
// ou altere a lista; o número 8 é a quantidade de slides.
export const homeSlides = Array.from({ length: 8 }, (_, i) => ({
  src: `/home-slide-${i + 1}.jpeg`,
}))

// As 3 imagens de "Coleções em destaque" da Home (arquivos em /public).
export const collections = [
  { src: '/collection-1.png', alt: 'Coleção Novo drop Supreme' },
  { src: '/collection-2.png', alt: 'Coleção Adidas' },
  { src: '/collection-3.png', alt: 'Coleção Novo Beats Bass' },
]

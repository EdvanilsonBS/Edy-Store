/**
 * ESPECIFICAÇÃO OpenAPI 3 da API. É o que o Swagger UI (/api/docs) mostra.
 * Ao criar ou mudar um endpoint, atualize `paths` aqui.
 */

// Atalhos para não repetir as respostas de erro em todo endpoint
const err = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
})
const json = (schema) => ({ 'application/json': { schema } })
const ref = (name) => ({ $ref: `#/components/schemas/${name}` })
const idParam = (name, description, type = 'integer') => ({
  name, in: 'path', required: true, description, schema: { type },
})
const auth = [{ bearerAuth: [] }]
const e400 = { 400: err('Dados inválidos') }
const e401 = { 401: err('Não autenticado (token ausente, inválido ou expirado)') }
const e403 = { 403: err('Sem permissão (precisa ser administrador)') }
const e404 = { 404: err('Não encontrado') }

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Edi-store API',
    version: '2.0.0',
    description:
      'API da loja de tênis Edi-store (Node + Express + SQLite).\n\n' +
      '**Como testar rotas protegidas:** faça `POST /auth/signup` ou `POST /auth/login`, copie o `token` da resposta, ' +
      'clique em **Authorize** e cole o token.\n\n' +
      '**Administrador:** é quem se cadastra com o e-mail definido em `ADMIN_EMAIL` no `.env`. ' +
      'Só ele cria, edita e exclui produtos, vê todos os pedidos e muda o status deles.',
  },
  servers: [{ url: '/api', description: 'Este servidor' }],
  tags: [
    { name: 'Auth', description: 'Cadastro e login' },
    { name: 'Usuários', description: 'Conta do usuário e gerenciamento (admin)' },
    { name: 'Produtos', description: 'Catálogo da loja' },
    { name: 'Pedidos', description: 'Compras dos clientes' },
  ],
  paths: {
    '/health': {
      get: { tags: ['Auth'], summary: 'Teste rápido: a API está no ar?', responses: { 200: { description: 'OK', content: json({ type: 'object', properties: { status: { type: 'string', example: 'ok' } } }) } } },
    },

    /* ---------- Auth ---------- */
    '/auth/signup': {
      post: {
        tags: ['Auth'], summary: 'Cria uma conta e já devolve o token',
        requestBody: { required: true, content: json(ref('SignupInput')) },
        responses: { 201: { description: 'Conta criada', content: json(ref('Session')) }, ...e400, 409: err('E-mail já cadastrado'), 429: err('Muitas tentativas') },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Entra com e-mail e senha',
        requestBody: { required: true, content: json(ref('LoginInput')) },
        responses: { 200: { description: 'Login feito', content: json(ref('Session')) }, 401: err('E-mail ou senha incorretos'), 429: err('Muitas tentativas') },
      },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Usuário logado', security: auth, responses: { 200: { description: 'Usuário', content: json({ type: 'object', properties: { user: ref('User') } }) }, ...e401 } },
    },

    /* ---------- Usuários ---------- */
    '/users/me': {
      get: { tags: ['Usuários'], summary: 'Lê a própria conta', security: auth, responses: { 200: { description: 'Usuário', content: json({ type: 'object', properties: { user: ref('User') } }) }, ...e401 } },
      patch: {
        tags: ['Usuários'], summary: 'Edita o próprio nome e/ou senha', security: auth,
        requestBody: { required: true, content: json(ref('UserUpdateInput')) },
        responses: { 200: { description: 'Conta atualizada', content: json({ type: 'object', properties: { user: ref('User') } }) }, ...e400, ...e401 },
      },
      delete: { tags: ['Usuários'], summary: 'Exclui a própria conta (e os pedidos dela)', security: auth, responses: { 204: { description: 'Excluída' }, ...e401 } },
    },
    '/users': {
      get: { tags: ['Usuários'], summary: 'Lista todos os usuários (admin)', security: auth, responses: { 200: { description: 'Lista', content: json({ type: 'array', items: ref('User') }) }, ...e401, ...e403 } },
    },
    '/users/{id}': {
      delete: {
        tags: ['Usuários'], summary: 'Exclui um usuário (admin)', security: auth,
        parameters: [idParam('id', 'Id (UUID) do usuário', 'string')],
        responses: { 204: { description: 'Excluído' }, ...e400, ...e401, ...e403, ...e404 },
      },
    },

    /* ---------- Produtos ---------- */
    '/products': {
      get: {
        tags: ['Produtos'], summary: 'Lista produtos com filtros',
        description: 'A busca ignora maiúsculas e acentos. Filtros aceitam vários valores separados por vírgula (`brand=Nike,Puma`).',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Procura em nome, marca, categoria e gênero' },
          { name: 'brand', in: 'query', schema: { type: 'string' }, example: 'Nike' },
          { name: 'category', in: 'query', schema: { type: 'string' }, example: 'Corrida' },
          { name: 'gender', in: 'query', schema: { type: 'string' }, example: 'Masculino' },
          { name: 'state', in: 'query', schema: { type: 'string' }, example: 'Novo' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['price_asc', 'price_desc', 'name'] } },
        ],
        responses: { 200: { description: 'Lista de produtos', content: json({ type: 'array', items: ref('Product') }) } },
      },
      post: {
        tags: ['Produtos'], summary: 'Cria um produto (admin)', security: auth,
        requestBody: { required: true, content: json(ref('ProductInput')) },
        responses: { 201: { description: 'Criado', content: json(ref('Product')) }, ...e400, ...e401, ...e403 },
      },
    },
    '/products/filters': {
      get: { tags: ['Produtos'], summary: 'Opções para a barra de filtros', responses: { 200: { description: 'Marcas, categorias, gêneros e estados', content: json({ type: 'object', properties: { brands: { type: 'array', items: { type: 'string' } }, categories: { type: 'array', items: { type: 'string' } }, genders: { type: 'array', items: { type: 'string' } }, states: { type: 'array', items: { type: 'string' } } } }) } } },
    },
    '/products/categories': {
      get: { tags: ['Produtos'], summary: 'Categorias com a quantidade de produtos', responses: { 200: { description: 'Lista', content: json({ type: 'array', items: { type: 'object', properties: { name: { type: 'string', example: 'Casual' }, count: { type: 'integer', example: 3 } } } }) } } },
    },
    '/products/{id}': {
      get: { tags: ['Produtos'], summary: 'Um produto', parameters: [idParam('id', 'Id do produto')], responses: { 200: { description: 'Produto', content: json(ref('Product')) }, ...e404 } },
      put: {
        tags: ['Produtos'], summary: 'Substitui o produto inteiro (admin)', security: auth,
        description: 'Exige os mesmos campos obrigatórios do POST. O que não for enviado volta ao padrão.',
        parameters: [idParam('id', 'Id do produto')],
        requestBody: { required: true, content: json(ref('ProductInput')) },
        responses: { 200: { description: 'Atualizado', content: json(ref('Product')) }, ...e400, ...e401, ...e403, ...e404 },
      },
      patch: {
        tags: ['Produtos'], summary: 'Muda só os campos enviados (admin)', security: auth,
        description: 'Envie `"priceDiscount": null` para remover o desconto.',
        parameters: [idParam('id', 'Id do produto')],
        requestBody: { required: true, content: json({ allOf: [{ $ref: '#/components/schemas/ProductInput' }], required: [], example: { price: 349.9, priceDiscount: 299.9 } }) },
        responses: { 200: { description: 'Atualizado', content: json(ref('Product')) }, ...e400, ...e401, ...e403, ...e404 },
      },
      delete: {
        tags: ['Produtos'], summary: 'Exclui o produto (admin)', security: auth,
        description: 'Os pedidos antigos continuam existindo (nome, foto e preço ficam guardados neles).',
        parameters: [idParam('id', 'Id do produto')],
        responses: { 204: { description: 'Excluído' }, ...e401, ...e403, ...e404 },
      },
    },

    /* ---------- Pedidos ---------- */
    '/orders': {
      get: {
        tags: ['Pedidos'], summary: 'Pedidos do usuário logado (novos primeiro)', security: auth,
        parameters: [{ name: 'all', in: 'query', schema: { type: 'boolean' }, description: 'Com `true`, lista os pedidos de todos (só admin)' }],
        responses: { 200: { description: 'Lista', content: json({ type: 'array', items: ref('Order') }) }, ...e401, ...e403 },
      },
      post: {
        tags: ['Pedidos'], summary: 'Cria um pedido', security: auth,
        description: 'O preço é calculado no servidor; qualquer preço enviado é ignorado.',
        requestBody: { required: true, content: json(ref('OrderInput')) },
        responses: { 201: { description: 'Pedido criado (status `processing`)', content: json(ref('Order')) }, ...e400, ...e401 },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Pedidos'], summary: 'Um pedido (do próprio usuário, ou qualquer um se for admin)', security: auth,
        parameters: [idParam('id', 'Número do pedido, ex.: 2026-0001', 'string')],
        responses: { 200: { description: 'Pedido', content: json(ref('Order')) }, ...e401, ...e404 },
      },
      delete: {
        tags: ['Pedidos'], summary: 'Cancela/exclui o pedido', security: auth,
        description: 'O cliente só consegue se o pedido estiver `processing`. O admin exclui qualquer um.',
        parameters: [idParam('id', 'Número do pedido', 'string')],
        responses: { 204: { description: 'Excluído' }, ...e401, ...e404, 409: err('Pedido já saiu de "em processamento"') },
      },
    },
    '/orders/{id}/status': {
      patch: {
        tags: ['Pedidos'], summary: 'Muda o status do pedido (admin)', security: auth,
        parameters: [idParam('id', 'Número do pedido', 'string')],
        requestBody: { required: true, content: json({ type: 'object', required: ['status'], properties: { status: ref('OrderStatus') } }) },
        responses: { 200: { description: 'Pedido atualizado', content: json(ref('Order')) }, ...e400, ...e401, ...e403, ...e404 },
      },
    },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: { type: 'object', properties: { error: { type: 'string', example: 'Mensagem explicando o problema.' } } },
      SignupInput: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string', example: 'Edi Santos' }, email: { type: 'string', format: 'email', example: 'edi@email.com' }, password: { type: 'string', minLength: 6, example: '123456' } } },
      LoginInput: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email', example: 'edi@email.com' }, password: { type: 'string', example: '123456' } } },
      UserUpdateInput: { type: 'object', properties: { name: { type: 'string' }, password: { type: 'string', minLength: 6 } } },
      User: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'string' }, email: { type: 'string', format: 'email' }, role: { type: 'string', enum: ['user', 'admin'] }, createdAt: { type: 'string', format: 'date-time' } } },
      Session: { type: 'object', properties: { user: ref('User'), token: { type: 'string', description: 'Envie em Authorization: Bearer <token>' } } },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 }, name: { type: 'string', example: 'K-Swiss V8 - Masculino' }, brand: { type: 'string', example: 'K-Swiss' },
          category: { type: 'string', example: 'Casual' }, gender: { type: 'string', enum: ['Masculino', 'Feminino', 'Unisex'] }, state: { type: 'string', enum: ['Novo', 'Usado'] },
          price: { type: 'number', example: 200 }, priceDiscount: { type: 'number', example: 100, description: 'Só aparece se houver desconto' },
          image: { type: 'string', example: '/product-thumb-1.jpeg' }, images: { type: 'array', items: { type: 'object', properties: { src: { type: 'string' } } } },
          reference: { type: 'string', example: '38416700' }, stars: { type: 'number', example: 4.5 }, rating: { type: 'integer', example: 40 }, description: { type: 'string' },
          sizes: { type: 'array', items: { type: 'string' }, example: ['39', '40', '41'] }, colors: { type: 'array', items: { type: 'string' }, example: ['#6FEEFF', '#FF6969'] },
        },
      },
      ProductInput: {
        type: 'object', required: ['name', 'brand', 'category', 'gender', 'state', 'price', 'image'],
        properties: {
          name: { type: 'string', example: 'Nike Air Zoom' }, brand: { type: 'string', example: 'Nike' }, category: { type: 'string', example: 'Corrida' },
          gender: { type: 'string', enum: ['Masculino', 'Feminino', 'Unisex'] }, state: { type: 'string', enum: ['Novo', 'Usado'] },
          price: { type: 'number', example: 499.9 }, priceDiscount: { type: 'number', nullable: true, example: 399.9, description: 'Menor que o preço' },
          image: { type: 'string', example: '/product-thumb-1.jpeg' }, images: { type: 'array', items: { type: 'object', properties: { src: { type: 'string' } } }, example: [{ src: '/product-image-1.jpeg' }] },
          reference: { type: 'string' }, stars: { type: 'number', minimum: 0, maximum: 5 }, rating: { type: 'integer', minimum: 0 }, description: { type: 'string' },
          sizes: { type: 'array', items: { type: 'string' }, example: ['39', '40', '41'] }, colors: { type: 'array', items: { type: 'string' }, example: ['#FF6969'] },
        },
      },
      OrderStatus: { type: 'string', enum: ['processing', 'shipping', 'delivered'], description: 'Em processamento / A caminho / Entregue' },
      OrderInput: {
        type: 'object', required: ['items'],
        properties: { items: { type: 'array', minItems: 1, items: { type: 'object', required: ['productId', 'size', 'quantity'], properties: { productId: { type: 'integer', example: 1 }, size: { type: 'string', example: '40' }, color: { type: 'string', example: '#6FEEFF', description: 'Opcional; se enviada, precisa ser uma cor do produto' }, quantity: { type: 'integer', minimum: 1, maximum: 10, example: 2 } } } } },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '2026-0001' }, userId: { type: 'string', format: 'uuid' }, date: { type: 'string', format: 'date', example: '2026-11-03' },
          status: ref('OrderStatus'), total: { type: 'number', example: 849.9 },
          items: { type: 'array', items: { type: 'object', properties: { productId: { type: 'integer', nullable: true }, name: { type: 'string' }, image: { type: 'string', nullable: true }, size: { type: 'string' }, color: { type: 'string', nullable: true }, quantity: { type: 'integer' }, unitPrice: { type: 'number' }, subtotal: { type: 'number' } } } },
        },
      },
    },
  },
}

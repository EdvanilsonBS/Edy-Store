/**
 * Testes do CRUD, da autorização (cliente x admin), das migrations e do Swagger.
 * Rodam com `npm test`, num banco temporário (não mexem no seu data/).
 */
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'edi-crud-'))
process.env.DB_FILE = path.join(dir, 'edi.db')
process.env.JWT_SECRET = 'segredo-de-teste'
process.env.ADMIN_EMAIL = 'admin@loja.com'
process.env.AUTH_RATE_LIMIT = '200'
const { createApp } = await import('../src/app.js')
const { db } = await import('../src/config/database.js')
const { openapi } = await import('../src/docs/openapi.js')

let server
let base
let admin
let client

const call = async (method, url, body, token) => {
  const res = await fetch(`${base}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  return { status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers }
}

before(async () => {
  await new Promise((resolve) => {
    server = createApp().listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}/api`
      resolve()
    })
  })
  admin = (await call('POST', '/auth/signup', { name: 'Admin', email: 'ADMIN@loja.com', password: '123456' })).body
  client = (await call('POST', '/auth/signup', { name: 'Cliente', email: 'cli@loja.com', password: '123456' })).body
})
after(() => server.close())

const newProduct = {
  name: 'Tênis de Teste', brand: 'Nike', category: 'Corrida', gender: 'Unisex', state: 'Novo',
  price: 500, priceDiscount: 400, image: '/product-thumb-1.jpeg',
  images: [{ src: '/product-image-1.jpeg' }, '/product-image-2.jpeg'], sizes: ['40', '41'], colors: ['#ff6969'],
}

test('migrations foram aplicadas e ficam registradas', () => {
  const names = db.prepare('SELECT name FROM schema_migrations ORDER BY name').all().map((r) => r.name)
  assert.deepEqual(names, ['001_create_tables.sql', '002_create_indexes.sql', '003_create_order_counters.sql'])
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1)
})

test('ADMIN_EMAIL vira administrador; os outros são clientes', () => {
  assert.equal(admin.user.role, 'admin')
  assert.equal(client.user.role, 'user')
})

test('cliente e visitante não podem criar, editar nem excluir produtos', async () => {
  assert.equal((await call('POST', '/products', newProduct)).status, 401)
  assert.equal((await call('POST', '/products', newProduct, client.token)).status, 403)
  assert.equal((await call('PUT', '/products/1', newProduct, client.token)).status, 403)
  assert.equal((await call('PATCH', '/products/1', { price: 1 }, client.token)).status, 403)
  assert.equal((await call('DELETE', '/products/1', undefined, client.token)).status, 403)
})

test('CRUD de produtos pelo admin', async () => {
  // Create
  const created = await call('POST', '/products', newProduct, admin.token)
  assert.equal(created.status, 201)
  const id = created.body.id
  assert.equal(id, 13)
  assert.deepEqual(created.body.images, [{ src: '/product-image-1.jpeg' }, { src: '/product-image-2.jpeg' }])
  assert.deepEqual(created.body.colors, ['#FF6969'])
  assert.ok(created.body.reference)

  // Read (aparece na lista e na busca)
  assert.equal((await call('GET', `/products/${id}`)).body.name, 'Tênis de Teste')
  assert.equal((await call('GET', '/products')).body.length, 13)
  assert.equal((await call('GET', '/products?search=TESTE')).body.length, 1)

  // Update parcial (PATCH) mantém o resto e permite remover o desconto
  const patched = await call('PATCH', `/products/${id}`, { price: 450 }, admin.token)
  assert.equal(patched.status, 200)
  assert.equal(patched.body.price, 450)
  assert.equal(patched.body.priceDiscount, 400)
  assert.equal(patched.body.brand, 'Nike')
  const noDiscount = await call('PATCH', `/products/${id}`, { priceDiscount: null }, admin.token)
  assert.equal(noDiscount.body.priceDiscount, undefined)

  // Update completo (PUT) exige os campos obrigatórios
  assert.equal((await call('PUT', `/products/${id}`, { name: 'Só o nome' }, admin.token)).status, 400)
  const replaced = await call('PUT', `/products/${id}`, { ...newProduct, name: 'Tênis Trocado' }, admin.token)
  assert.equal(replaced.status, 200)
  assert.equal(replaced.body.name, 'Tênis Trocado')
  assert.equal((await call('GET', '/products?search=trocado')).body.length, 1)
  assert.equal((await call('GET', '/products?search=teste')).body.length, 0) // search_text foi atualizado

  // Delete
  assert.equal((await call('DELETE', `/products/${id}`, undefined, admin.token)).status, 204)
  assert.equal((await call('GET', `/products/${id}`)).status, 404)
  assert.equal((await call('DELETE', `/products/${id}`, undefined, admin.token)).status, 404)
})

test('validações de produto devolvem 400 com mensagem', async () => {
  const bad = async (changes) => (await call('POST', '/products', { ...newProduct, ...changes }, admin.token))
  assert.equal((await bad({ price: -5 })).status, 400)
  assert.equal((await bad({ price: 'abc' })).status, 400)
  assert.equal((await bad({ priceDiscount: 600 })).status, 400)
  assert.equal((await bad({ gender: 'X' })).status, 400)
  assert.equal((await bad({ colors: ['vermelho'] })).status, 400)
  assert.equal((await bad({ stars: 9 })).status, 400)
  const noName = await bad({ name: '' })
  assert.equal(noName.status, 400)
  assert.match(noName.body.error, /nome/)
  assert.equal((await call('PATCH', '/products/1', {}, admin.token)).status, 400)
})

test('busca segura e produto de id estranho', async () => {
  assert.equal((await call('GET', '/products?sort=__proto__')).status, 200)
  assert.equal((await call('GET', "/products?search=%25")).body.length, 0) // "%" é texto, não curinga
  assert.equal((await call('GET', '/products?brand=NaoExiste')).body.length, 0)
  assert.equal((await call('GET', '/products/abc')).status, 404)
  const filters = (await call('GET', '/products/filters')).body
  assert.deepEqual(filters.brands, ['Adidas', 'K-Swiss', 'Nike', 'Puma'])
  const cats = (await call('GET', '/products/categories')).body
  assert.equal(cats.reduce((sum, c) => sum + c.count, 0), 12)
})

test('pedidos: cor validada, foto no item, ids sem repetir e CRUD', async () => {
  const order = (items, token = client.token) => call('POST', '/orders', { items }, token)
  assert.equal((await order([{ productId: 1, size: '40', color: 'red;x', quantity: 1 }])).status, 400)
  assert.equal((await order([{ productId: true, size: '40', quantity: 1 }])).status, 400)

  const first = await order([{ productId: 1, size: '40', color: '#6feeff', quantity: 2 }])
  assert.equal(first.status, 201)
  assert.equal(first.body.items[0].image, '/product-thumb-1.jpeg')
  assert.equal(first.body.items[0].color, '#6FEEFF')
  const second = await order([{ productId: 3, size: '39', quantity: 1 }])
  const year = new Date().getFullYear()
  assert.equal(first.body.id, `${year}-0001`)
  assert.equal(second.body.id, `${year}-0002`)

  // Read: o dono vê; outro cliente não (404); o admin vê qualquer um
  assert.equal((await call('GET', `/orders/${first.body.id}`, undefined, client.token)).status, 200)
  assert.equal((await call('GET', `/orders/${first.body.id}`, undefined, admin.token)).status, 200)
  const other = (await call('POST', '/auth/signup', { name: 'Outro', email: 'outro@loja.com', password: '123456' })).body
  assert.equal((await call('GET', `/orders/${first.body.id}`, undefined, other.token)).status, 404)
  assert.equal((await call('GET', '/orders?all=true', undefined, client.token)).status, 403)
  assert.equal((await call('GET', '/orders?all=true', undefined, admin.token)).body.length, 2)
  assert.equal((await call('GET', '/orders', undefined, client.token)).body[0].id, second.body.id) // novos primeiro

  // Update de status: só admin, e só valores válidos
  assert.equal((await call('PATCH', `/orders/${first.body.id}/status`, { status: 'shipping' }, client.token)).status, 403)
  assert.equal((await call('PATCH', `/orders/${first.body.id}/status`, { status: 'voando' }, admin.token)).status, 400)
  const shipped = await call('PATCH', `/orders/${first.body.id}/status`, { status: 'shipping' }, admin.token)
  assert.equal(shipped.body.status, 'shipping')

  // Delete: cliente só cancela "processing"; o id seguinte nunca repete
  assert.equal((await call('DELETE', `/orders/${first.body.id}`, undefined, client.token)).status, 409)
  assert.equal((await call('DELETE', `/orders/${second.body.id}`, undefined, other.token)).status, 404)
  assert.equal((await call('DELETE', `/orders/${second.body.id}`, undefined, client.token)).status, 204)
  const third = await order([{ productId: 2, size: '41', quantity: 1 }])
  assert.equal(third.body.id, `${year}-0003`)
  assert.equal((await call('DELETE', `/orders/${first.body.id}`, undefined, admin.token)).status, 204)
})

test('pedido continua existindo se o produto for excluído', async () => {
  const p = (await call('POST', '/products', newProduct, admin.token)).body
  const o = (await call('POST', '/orders', { items: [{ productId: p.id, size: '40', quantity: 1 }] }, client.token)).body
  await call('DELETE', `/products/${p.id}`, undefined, admin.token)
  const kept = (await call('GET', `/orders/${o.id}`, undefined, client.token)).body
  assert.equal(kept.items[0].productId, null)
  assert.equal(kept.items[0].name, 'Tênis de Teste')
  assert.equal(kept.total, 400)
})

test('usuário: editar perfil, trocar senha, excluir conta; admin lista e exclui', async () => {
  const user = (await call('POST', '/auth/signup', { name: 'Temp', email: 'temp@loja.com', password: '123456' })).body
  assert.equal((await call('PATCH', '/users/me', {}, user.token)).status, 400)
  assert.equal((await call('PATCH', '/users/me', { password: '123' }, user.token)).status, 400)
  const updated = await call('PATCH', '/users/me', { name: 'Novo Nome', password: 'abcdef' }, user.token)
  assert.equal(updated.body.user.name, 'Novo Nome')
  assert.equal(updated.body.user.passwordHash, undefined)
  assert.equal((await call('POST', '/auth/login', { email: 'temp@loja.com', password: '123456' })).status, 401)
  assert.equal((await call('POST', '/auth/login', { email: 'temp@loja.com', password: 'abcdef' })).status, 200)

  assert.equal((await call('GET', '/users', undefined, user.token)).status, 403)
  const list = await call('GET', '/users', undefined, admin.token)
  assert.ok(list.body.length >= 4)
  assert.ok(list.body.every((u) => u.passwordHash === undefined))
  assert.equal((await call('DELETE', `/users/${admin.user.id}`, undefined, admin.token)).status, 400)
  assert.equal((await call('DELETE', `/users/${user.user.id}`, undefined, admin.token)).status, 204)
  assert.equal((await call('GET', '/auth/me', undefined, user.token)).status, 401) // conta não existe mais

  const mine = (await call('POST', '/auth/signup', { name: 'Eu', email: 'eu@loja.com', password: '123456' })).body
  assert.equal((await call('DELETE', '/users/me', undefined, mine.token)).status, 204)
  assert.equal((await call('POST', '/auth/login', { email: 'eu@loja.com', password: '123456' })).status, 401)
})

test('corpo grande demais devolve 413 e a API não anuncia Express', async () => {
  const big = await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'a@b.com', password: 'x'.repeat(200_000) }),
  })
  assert.equal(big.status, 413)
  assert.equal(big.headers.get('x-powered-by'), null)
})

test('Swagger: página e especificação respondem e todas as referências existem', async () => {
  const page = await fetch(`${base}/docs`)
  assert.equal(page.status, 200)
  assert.match(await page.text(), /swagger-ui/)
  const spec = (await call('GET', '/docs/openapi.json')).body
  assert.equal(spec.openapi, '3.0.3')
  const text = JSON.stringify(spec)
  for (const [, name] of text.matchAll(/#\/components\/schemas\/(\w+)/g)) {
    assert.ok(spec.components.schemas[name], `schema ${name} não existe`)
  }
  // todo endpoint do router está documentado
  const documented = Object.keys(openapi.paths)
  for (const p of ['/auth/signup', '/auth/login', '/auth/me', '/users/me', '/users', '/users/{id}', '/products',
    '/products/{id}', '/products/filters', '/products/categories', '/orders', '/orders/{id}', '/orders/{id}/status']) {
    assert.ok(documented.includes(p), `${p} sem documentação`)
  }
})

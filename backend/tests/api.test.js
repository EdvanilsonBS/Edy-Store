/**
 * Testes da API (rodam com `npm test`). Usam o test runner do próprio Node, sem dependências extras.
 * O banco de teste é um arquivo temporário, então não mexe no seu data/db.json.
 */
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

process.env.DB_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'edi-')), 'db.json')
process.env.JWT_SECRET = 'segredo-de-teste'
const { createApp } = await import('../src/app.js')

let server
let base
let token

const call = async (method, url, body, auth = token) => {
  const res = await fetch(`${base}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, body: await res.json() }
}

before(
  () =>
    new Promise((resolve) => {
      server = createApp().listen(0, () => {
        base = `http://127.0.0.1:${server.address().port}/api`
        resolve()
      })
    })
)
after(() => server.close())

test('health', async () => {
  assert.equal((await call('GET', '/health')).body.status, 'ok')
})

test('lista os 12 produtos e filtra ignorando acentos', async () => {
  assert.equal((await call('GET', '/products')).body.length, 12)
  assert.equal((await call('GET', '/products?search=utilitario')).body.length, 3)
  assert.equal((await call('GET', '/products?brand=Nike&category=Corrida')).body.length, 2)
})

test('ordena por preço e busca produto por id', async () => {
  const sorted = (await call('GET', '/products?sort=price_asc')).body
  assert.equal(sorted[0].name, 'K-Swiss V8 - Masculino') // R$ 100 com desconto
  assert.equal((await call('GET', '/products/3')).body.name, 'Adidas Ultraboost Light')
  assert.equal((await call('GET', '/products/999')).status, 404)
})

test('cadastro, e-mail repetido, login e /me', async () => {
  const signup = await call('POST', '/auth/signup', { name: 'Edi', email: 'EDI@teste.com', password: '123456' })
  assert.equal(signup.status, 201)
  assert.equal(signup.body.user.passwordHash, undefined)

  assert.equal((await call('POST', '/auth/signup', { name: 'Edi', email: 'edi@teste.com', password: '123456' })).status, 409)
  assert.equal((await call('POST', '/auth/login', { email: 'edi@teste.com', password: 'errada' })).status, 401)

  const login = await call('POST', '/auth/login', { email: 'edi@teste.com', password: '123456' })
  assert.equal(login.status, 200)
  token = login.body.token

  assert.equal((await call('GET', '/auth/me')).body.user.email, 'edi@teste.com')
})

test('pedidos exigem login e o preço é calculado no servidor', async () => {
  assert.equal((await call('GET', '/orders', undefined, null)).status, 401)

  const order = await call('POST', '/orders', {
    items: [
      { productId: 1, size: '40', color: '#6FEEFF', quantity: 2, unitPrice: 1 }, // unitPrice enviado é ignorado
      { productId: 3, size: '39', quantity: 1 },
    ],
  })
  assert.equal(order.status, 201)
  assert.equal(order.body.total, 849.9) // 2 x 100 + 649,90
  assert.equal(order.body.status, 'processing')

  assert.equal((await call('GET', '/orders')).body.length, 1)
  assert.equal((await call('POST', '/orders', { items: [{ productId: 1, size: '99', quantity: 1 }] })).status, 400)
  assert.equal((await call('POST', '/orders', { items: [] })).status, 400)
})

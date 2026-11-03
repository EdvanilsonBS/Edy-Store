/**
 * DOCUMENTAÇÃO DA API (Swagger)
 *   GET /api/docs               página interativa (Swagger UI): dá para testar os endpoints nela
 *   GET /api/docs/openapi.json  a especificação OpenAPI 3 (src/docs/openapi.js)
 * A página carrega o Swagger UI de um CDN, então não há nada extra para instalar.
 * Para testar rotas com login: faça POST /auth/login, copie o token e clique em "Authorize".
 */
import { Router } from 'express'
import { openapi } from '../docs/openapi.js'

const router = Router()

router.get('/openapi.json', (req, res) => res.json(openapi))

router.get('/', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Edi-store API - Documentação</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({ url: 'openapi.json', dom_id: '#swagger-ui', persistAuthorization: true })
    </script>
  </body>
</html>`)
})

export default router

// Configuração do Vite (o programa que roda e empacota o projeto).
// Normalmente você não precisa mexer aqui. O plugin do React permite usar JSX e atualiza
// a página automaticamente quando você salva um arquivo.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, chamadas para /api/... vão para o back-end (backend/, porta 3333).
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
})

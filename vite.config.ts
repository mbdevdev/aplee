import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Относительные пути: сайт работает на любом адресе GitHub Pages
  // (username.github.io/имя-репозитория/) без правки конфига.
  base: '/aplee/',
  plugins: [react()],
})

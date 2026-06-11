import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // Serve under the repo subpath on GitHub Pages; root everywhere else
  base: process.env.GITHUB_ACTIONS ? '/careerpaths-threejs/' : '/',
  plugins: [vue()],
})

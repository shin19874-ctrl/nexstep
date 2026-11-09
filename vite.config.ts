import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' lets the site work on GitHub Pages sub-paths as well as Vercel/Netlify.
export default defineConfig({ base: './', plugins: [react()] })

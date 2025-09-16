import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'
import { globSync } from 'glob'
import path from 'path'


function generateInputs() {
  const files = [
    ...globSync('resources/js/*.js'),
    ...globSync('resources/css/*.css'),
  ]
  const entries = {}
  for (const file of files) {
    const name = path.relative('resources', file) // vd: js/app.js
    entries[name] = path.resolve(__dirname, file)
  }
  return entries
}

export default defineConfig({
  plugins: [
    adonisjs({
      /**
       * Entrypoints of your application. Each entrypoint will
       * result in a separate bundle.
       */
      entrypoints: ['resources/css/app.css', 'resources/js/app.js'],

      /**
       * Paths to watch and reload the browser on file change
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ],
  build: {
    rollupOptions: {
      input: generateInputs(),
    },
  },
})

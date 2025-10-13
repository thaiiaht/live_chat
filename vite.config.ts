import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    adonisjs({
      /**
       * Entrypoints of your application. Each entrypoint will
       * result in a separate bundle.
       */
      entrypoints: [
        'resources/css/app.css',
        'resources/css/donate.css',
        'resources/css/header.css',
        'resources/css/home.css',
        'resources/css/user.css',
        'resources/css/emoji.css',
        'resources/js/app.js',
        'resources/js/auth.js',
        'resources/js/donate.js',
        'resources/js/user.js',
        'resources/js/emoji.js',
      ],

      /**
       * Paths to watch and reload the browser on file change
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ],

})

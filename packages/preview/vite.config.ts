import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(dirname, './src'),
      '@norehq/dapple/field': resolve(dirname, '../../packages/dapple/src/field.ts'),
      '@norehq/dapple/react': resolve(
        dirname,
        '../../packages/dapple/src/react.tsx',
      ),
      '@norehq/dapple/react-field': resolve(
        dirname,
        '../../packages/dapple/src/react-field.tsx',
      ),
      '@norehq/dapple': resolve(dirname, '../../packages/dapple/src/index.ts'),
      components: resolve(dirname, './src/components'),
      hooks: resolve(dirname, './src/hooks'),
      lib: resolve(dirname, './src/lib'),
      ui: resolve(dirname, './src/components/ui'),
      utils: resolve(dirname, './src/lib/utils'),
    },
  },
})

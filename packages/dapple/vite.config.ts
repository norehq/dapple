import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: {
        field: 'src/field.ts',
        index: 'src/index.ts',
        react: 'src/react.tsx',
        'react-field': 'src/react-field.tsx',
      },
      fileName: (format, entryName) =>
        format === 'cjs' ? `${entryName}.cjs` : `${entryName}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    },
    sourcemap: true,
  },
  plugins: [react(), dts({ rollupTypes: true })],
})

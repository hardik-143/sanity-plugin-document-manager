import {defineConfig} from 'tsup'

const EXTERNALS = [
  'sanity',
  'react',
  'react-dom',
  '@sanity/ui',
  '@sanity/icons',
  '@sanity/incompatible-plugin',
  'styled-components',
]

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: EXTERNALS,
})

import { resolve } from 'path'

export default {
  root: resolve(__dirname, 'src'),
  build: {
    outDir: '../dist'
  },
  base: "/metronome/",
  server: {
    port: 8080
  }
}
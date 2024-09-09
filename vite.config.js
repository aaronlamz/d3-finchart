import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true,
    port: 3000,
    strictPort: true,
    proxy: {},
  },
  build: {
    lib: {
      entry: './src/index.js', // SDK 主入口文件
      name: 'FinChart', // 全局名称
      fileName: (format) => `finchart.${format}.js`, // 输出文件名
    },
    rollupOptions: {
      external: ['d3'], // 外部化 d3 依赖，不打包进 SDK
      output: {
        globals: {
          d3: 'd3', // 全局变量名
        },
      },
    },
  },
})

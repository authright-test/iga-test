import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint';
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    base: process.env.VITE_BASE_URL || '/', // 从 .env 读取基础路径，默认 /
    plugins: [react()],
    server: {
      port: process.env.VITE_PORT || 3001, // 从 .env 读取端口，默认 3001
      open: false, // disable自动打开浏览器，因为需要通过域名访问，通过localhost现在无法访问
      strictPort: true, // 强制使用指定端口
      host: '0.0.0.0', // 允许外部访问（如局域网调试）
      allowedHosts: ['0.0.0.0', 'iga-mvp.local'], // 允许外部访问（如局域网调试）
    },
    build: {
      outDir: 'dist', // 构建输出目录
      sourcemap: true, // 生成 source map，便于调试
      minify: 'esbuild', // 使用 esbuild 压缩代码
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        '@': '/src', // 设置 @ 别名指向 src 目录
      },
    },
    esbuild: {
      // 支持 JSX 在 .js 文件中
      loader: 'jsx',
      include: /src\/.*\.js$/,
      exclude: [],
    },
    optimizeDeps: {
      include: ['react', 'react-dom'], // 预构建依赖
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCase', // CSS Modules 使用驼峰命名
      },
      preprocessorOptions: {
        scss: {},
      },
    },
  }
})

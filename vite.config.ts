
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 使用相对路径，确保在 GitHub Pages 的子目录下资源引用正确
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 默认使用 esbuild 压缩，无需安装 terser
    minify: 'esbuild',
  },
});

import { defineConfig, loadEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import path from 'path'
import compression from 'vite-plugin-compression'
import eslintPlugin from 'vite-plugin-eslint'
import VueJsx from '@vitejs/plugin-vue-jsx'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VUE_APP_')
  return {

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'vuex'],
            'lodash': ['lodash-es'],
            'ant-icon': ['@ant-design/icons-vue'],
            'antd-vendor': ['ant-design-vue'],
          },
        }
      }
    },
    envPrefix: 'VUE_APP_',
    define: {
      'process.env': env
    },
    plugins: [
      compression({
        verbose: true,
        disable: false,
        threshold: 10 * 1024, // 压缩阈值，小于这个值的文件将不会被压缩（单位为字节）这里就是大于 10kb 菜压缩
        algorithm: 'gzip', // 压缩算法
        ext: '.gz', // 压缩文件后缀名
      }),
      Vue(),
      VueJsx(),
      env.VUE_APP_ENV === 'development' && eslintPlugin({
        include: ['src/**/*.js', 'src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx'],    // 指定需要检查的文件
        exclude: ['node_modules/**', 'dist/**', '*.spec.ts'],    // 指定不需要检查的文件
        fix: false,    // 是否自动修复
        cache: true,
      })
    ],
    // 别名配置
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }

    },
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true
        }
      },

    },
    server: {
      port: 8080,
      proxy: {
        '^/api': {
          target: env.VUE_APP_BASE_URL_PROXY,
          changeOrigin: true, //开启代理
        },
      },
    },

  }
})

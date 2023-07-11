const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const isStaging = !!process.env.VUE_APP_STAGINE
const NODE_ENV = process.env.NODE_ENV
const isProduction = NODE_ENV === 'production'
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { IgnorePlugin } = require('webpack')
const mode = process.VUE_CLI_SERVICE.mode

module.exports = defineConfig({
  parallel: true,
  publicPath: isProduction && !isStaging ? '/' : '/',
  transpileDependencies: true,
  productionSourceMap: false,
  chainWebpack: (config) => {
    const jsRule = config.module.rule('js')
    // // 清理自带的 babel-loader
    jsRule.uses.clear()
    // 添加 esbuild-loader
    jsRule
      .use('esbuild-loader')
      .loader('esbuild-loader')
      .options({
        loader: 'ts', // 如果使用了 ts, 或者 vue 的 class 装饰器，则需要加上这个 option 配置， 否则会报错： ERROR: Unexpected "@"
        target: 'esnext',
        ...(isProduction && {
          minify: true,
          minifyWhitespace: true,
          minifyIdentifiers: true,
          minifySyntax: true,
          treeShaking: true,
        }),
        tsconfigRaw: require('./tsconfig.json'),
      })

    if (isProduction) {
      config.plugin('html').tap((args) => {
        return [
          {
            ...args[0],
            ignoreOrder: true,
          },
        ]
      })
    }
    // 用cdn方式引入
    config.plugins.delete('prefetch')
    config.plugins.delete('preload')
    config.externals({
      vue: 'Vue',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
      axios: 'axios',
      // vuedraggable: 'vuedraggable',
      cropperjs: 'Cropper',
      html2canvas: 'html2canvas',
      // 'ant-design-vue': 'antd',
    })
    config.plugin('html').tap((args) => {
      args[0].title = '分享乐'
      args[0].desc = '一键生成 H5 海报进行分享'
      return args
    })
  },
  configureWebpack: (config) => {
    config.entry = './src/main.ts'
    config.performance = {
      hints: false,
      //入口起点的最大体积
      maxEntrypointSize: 300 * 1024 * 1024,
      //生成文件的最大体积
      maxAssetSize: 300 * 1024 * 1024,
      //只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js')
      },
    }
    config.cache = {
      // 将缓存类型设置为文件系统
      type: 'filesystem',
      buildDependencies: {
        /* 将你的 config 添加为 buildDependency，以便在改变 config 时获得缓存无效*/
        config: [__filename],
        /* 如果有其他的东西被构建依赖，你可以在这里添加它们*/
        /* 注意，webpack.config，加载器和所有从你的配置中引用的模块都会被自动添加*/
      },
      // cacheDirectory: path.resolve(__dirname, './node_modules/.cache_temp'),
      // name: 'share-craft',
      cacheLocation: path.resolve(
        __dirname,
        './node_modules/.cache_temp',
        'share-craft'
      ),
      // 指定缓存的版本
      version: '1.0',
    }
    config.plugins.push(
      new IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /dayjs$/,
      })
    )
    config.optimization.splitChunks = {
      maxInitialRequests: Infinity,
      chunks: 'all',
      minSize: 50 * 1024,
      name: 'common',
      cacheGroups: {
        antVendor: {
          name: 'chunk-antd',
          test: /[\\/]ant-design-vue/,
          minSize: 30 * 1024,
          priority: -10,
        },
        antIconVendor: {
          name: 'chunk-ant-icon',
          test: /[\\/]@ant-design/,
          minSize: 30 * 1024,
          priority: -5,
        },
        lodash: {
          name: 'chunk-lodash',
          test: /[\\/]lodash-es/,
          minSize: 30 * 1024,
          priority: -5,
        },
        vuedraggable: {
          name: 'chunk-vuedraggable',
          test: /[\\/]vuedraggable/,
          minSize: 30 * 1024,
          priority: -5,
        },
      },
    }

    if (isProduction) {
      // 长效缓存
      config.optimization.moduleIds = 'named'
      config.optimization.chunkIds = 'named'
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: /\.js$|\.html$|\.json$|\.css/,
          threshold: 1024 * 10,
        })
      )
    }

    if (mode === 'analyze') {
      config.plugins = config.plugins.concat([
        new BundleAnalyzerPlugin({
          // 生成静态文件
          analyzerMode: 'static',
        }),
        new SpeedMeasurePlugin(),
      ])
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_BASE_URL_PROXY,
      },
    },
  },
})

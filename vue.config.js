const { ESBuildMinifyPlugin } = require('esbuild-loader')
const { defineConfig } = require('@vue/cli-service')
const isStaging = !!process.env.VUE_APP_STAGINE
const NODE_ENV = process.env.NODE_ENV
const isProduction = NODE_ENV === 'production'
const webpack = require('webpack')
const CompressionWebpackPlugin = require('compression-webpack-plugin')

module.exports = defineConfig({
  publicPath:
    isProduction && !isStaging
      ? 'https://sharecraft-backend.oss-cn-shanghai.aliyuncs.com/'
      : '/',
  transpileDependencies: true,
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
        target: 'es2015',
        tsconfigRaw: require('./tsconfig.json'),
      })

    if (NODE_ENV === 'production') {
      config.plugin('html').tap((args) => {
        return [
          {
            ...args[0],
            ignoreOrder: true,
          },
        ]
      })
    }
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
      // 指定缓存的版本
      version: '1.0',
    }

    config.optimization.splitChunks = {
      minSize: 20 * 1024,
      cacheGroups: {
        defaultVendors: {
          chunks: 'initial',
          test: /[\\/]node_modules[\\/]/,
          name: 'chunk-vendors',
          minChunks: 2,
          maxSize: 50 * 1024,
          priority: -10,
        },
        common: {
          chunks: 'initial',
          name: 'common',
          minChunks: 1,
          maxSize: 50 * 1024,
          priority: 10,
        },
      },
    }

    if (NODE_ENV === 'production') {
      // config.plugins = config.plugins.concat([compressionPlugin])

      // 长效缓存
      config.optimization.moduleIds = 'named'
      config.optimization.chunkIds = 'named'
      config.optimization.minimizer = [
        new ESBuildMinifyPlugin({
          minify: true,
          minifyWhitespace: true,
          minifyIdentifiers: true,
          minifySyntax: true,
          css: true,
          target: 'es2015',
          exclude: /[\\/]node_modules[\\/]/,
          treeShaking: true,
        }),
      ]
    }
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    )
    config.optimization.splitChunks = {
      maxInitialRequests: Infinity,
      minSize: 300 * 1024,
      chunks: 'all',
      cacheGroups: {
        antVendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name.
            // node_modules/packageName/sub/path
            // or node_modules/packageName
            const packageName = module.context.match(
              /[\\/]node_modules[\\/]\.pnpm[\\/](.*?)([\\/]|$)/
            )[1]
            return `pnpm.${packageName.replace('@', '')}`
          },
        },
      },
    }

    if (isProduction) {
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: /\.js$|\.html$|\.json$|\.css/,
          threshold: 1024 * 10,
        })
      )
    }
  },
})

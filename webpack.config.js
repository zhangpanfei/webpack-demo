const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const vueLoaderPlugin = require("vue-loader/lib/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.argv.indexOf("--mode=production") === -1; // 判断是否开发模式
const os = require("os");
const happyPack = require("happypack");
const happyThreadPool = happyPack.ThreadPool({ size: os.cpus().length }); // 根据系统cpu数初始化线程池大小
const parallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const bundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const firstPlugin = require('./plugins/webpack-firstPlugin.js')
module.exports = {
  entry: {
    main: path.resolve(__dirname, "src/main.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].[hash:8].js",
    chunkFilename: "js/[name].[hash:8].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{loader:'cache-loader'},{loader: path.resolve(__dirname,'loaders','drop-console.js')},{ loader: "happypack/loader?id=happyBabel" }],
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: "vue-loader",
            options: {
              compilerOptions: {
                preserveWhitespace: false,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: devMode ? "vue-style-loader" : MiniCssExtractPlugin.loader,
            options: {
              publicPath: "dist/css/",
              hmr: devMode,
            },
          },
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")],
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: devMode ? "vue-style-loader" : MiniCssExtractPlugin.loader,
            options: {
              publicPath: "dist/css/",
              hmr: devMode,
            },
          },
          "css-loader",
          "less-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")],
            },
          },
        ],
      },
      {
        test: /\.(jep?g|png|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10240,
            fallback: {
              loader: "file-loader",
              options: {
                name: "img/[name].[hash:8].[ext]",
              },
            },
          },
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10240,
            fallback: {
              loader: "file-loader",
              options: {
                name: "media/[name].[hash:8].[ext]",
              },
            },
          },
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: {
          loader: "url-loader",
          options: {
            limit: 10240,
            fallback: {
              loader: "file-loader",
              options: {
                name: "media/[name].[hash:8].[ext]",
              },
            },
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.runtime.esm.js",
      "@": path.resolve(__dirname, "src"),
    },
    extensions: ["*", ".js", ".json", ".vue"],
  },
  optimization: {
    minimizer: [
      new parallelUglifyPlugin({
        cacheDir: ".cache/",
        uglifyJS: {
          output: {
            comments: false,
            beautify: false,
          },
          compress: {
            drop_console: true,
            collapse_vars: true,
            reduce_vars: true,
          },
        },
      }),
    ],
  },
  externals: {
    jquery: 'jQuery'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
    }),
    new vueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css",
    }),
    new happyPack({
      id: "happyBabel", // 与loader对应的id标识
      // 用法和loader一样 这里是loaders
      loaders: [
        {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            cacheDirectory: true,
          },
        },
      ],
      threadPool: happyThreadPool, // 共享线程池
    }),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./vendor-manifest.json')
    }),
    new CopyWebpackPlugin([ // 拷贝生成的文件到dist目录 这样每次不必手动去cv
      {from: 'static', to:'static'}
    ]),
    new bundleAnalyzer({
      analyzerHost: '127.0.0.1',
      analyzerPort: '9956'
    }),
    new firstPlugin()
  ],
};

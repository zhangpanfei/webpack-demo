本文编写基于

- webpack 4.43.0 版本
- node: 10.16.3 版本

### 1.入门

#### 1.1 初始化项目

- 新建一个目录，初始化 npm

```
npm init
```

- webpack 是运行在 node 环境中的,我们需要安装以下两个 npm 包

```
npm i -D webpack webpack-cli
```

npm i -D 为 npm install --save-dev 的缩写
npm i -S 为 npm install --save 的缩写

- 新建一个文件夹 src ,然后新建一个文件 main.js,写一点代码测试一下

```
console.log('zpfei.ink')
```

- 配置 package.json 命令

```json
"scripts": {
    "build": "webpack src/main.js"
},
```

- 运行

```
npm run build
```

如果生成了一个 dist 文件夹，并且内部含有 main.js 说明已经打包成功了

#### 1.2 开始自己的配置

- 项目根目录新建一个 webpack.config.js

```js
// webpack.config.js

const path = require("path");
module.exports = {
  mode: "development", // 模式：开发模式
  entry: path.resolve(__dirname, "src/main.js"), // 入口文件
  output: {
    filename: "output.js", // 打包后的文件名称
    path: path.resolve(__dirname, "dist"), // 打包后的目录
  },
};
```

- 更改打包命令

```json
"scripts": {
    "build": "webpack --config webpack.config.js"
},
```

- 执行 npm run build
  生成 dist/output.js 文件说明成功，这个文件就是在浏览器能使用的 js 文件

### 1.3 配置 html 模板

js 文件打包好了,但是我们不可能每次在 html 文件中手动引入打包好的 js

> 这里可能有的朋友会认为我们打包 js 文件名称不是一直是固定的嘛(output.js)？这样每次就不用改动引入文件名称了呀？
> 实际上我们日常开发中往往会这样配置:

```js
module.exports = {
  // 省略其他配置
  output: {
    filename: "[name].[hash:8].js", // 打包后的文件名称
    path: path.resolve(__dirname, "dist"), // 打包后的目录
  },
};
```

这时候生成如下文件

```
dist/main.c7dad6c9.js
```

为了防止缓存，你会发现打包好的 js 文件的名称每次都不一样。webpack 打包出来的 js 文件我们需要引入到 html 中，
但是每次我们都手动修改 js 文件名显得很麻烦，因此我们需要一个插件来帮我们完成这件事情

```bash
npm i -D html-webpack-plugin
```

新建一项目根目录文件夹 public,里面新建一个 index.html 具体配置文件如下

```js
// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development", //模式： 开发模式
  entry: path.resolve(__dirname, "src/main.js"), // 入口文件
  output: {
    filename: "[name].[hash:8].js", // 打包后的文件名称
    path: path.resolve(__dirname, "dist"), // 打包后的目录
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
    }),
  ],
};
```

build 生成文件

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script src="main.4da99828.js"></script>
  </body>
</html>
```

可以发现打包生成的 js 文件已经被自动引入 html 文件中

#### 1.3.1 多入口文件如何开发

> 生成多个入口文件 用多个 html-webpack-plugin 插件来解决这个问题

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development", // 模式 开发模式
  entry: {
    main: path.resolve(__dirname, "src/main.js"),
    app: path.resolve(__dirname, "src/app.js"),
  },
  output: {
    filename: "[name].[hash:8].js", // 打包后的文件名称
    path: path.resolve(__dirname, "dist"), // 打包后的目录
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
      filename: "index.html",
      chunks: ["main"], // 入口1 与入口文件对应的模块名
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/app.html"),
      filename: "app.html",
      chunks: ["app"], // 入口2 与入口文件对应的模块名
    }),
  ],
};
```

此时会生成以下目录
[dir](https://cdn.jsdelivr.net/gh/zhangpanfei/static@demo/img/webpack_1.png)

### 1.3.2 clean-webpack-plugin

> 每次执行 npm run build 会发现 dist 文件夹里会残留上次打包的文件，这里用一个 plugin 来帮我们在打包输出前清空文件夹 clean-webpack-plugin

```
npm i -D clean-webpack-plugin
```

```js
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
  // ...省略其他配置
  plugins: [new CleanWebpackPlugin()],
};
```

#### 1.4 引用 CSS

入口文件是 js，所以在入口 js 中引入 css 文件
[img](https://cdn.jsdelivr.net/gh/zhangpanfei/static@demo/img/webpack_2.png)

同时需要一些 loader 来解析 css 文件

```
npm i -D style-loader css-loader
```

- 配置

```js
// webpack.config.js
module.exports = {
  // ...省略其他配置
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"], // 从右向左解析原则
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"], // 从右向左解析原则
      },
    ],
  },
};
```

#### 1.4.1 为 css 添加浏览器前缀

```
npm i -D postcss-loader autoprefixer
```

- 配置

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "postcss-loader", "less-loader"], // 从右向左解析原则
      },
    ],
  },
};
```

接下来，还需要引入 autoprefixer 使其生效,这里有两种方式

- 1.在项目根目录下创建一个 postcss.config.js 文件，配置如下：

```js
module.exports = {
  plugins: [require("autoprefixer")], // 引用该插件即可了
};
```

- 2.直接在 webpack.config.js 里配置

```js
// webpack.config.js
module.exports = {
  //...省略其他配置
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")],
            },
          },
          "less-loader",
        ], // 从右向左解析原则
      },
    ],
  },
};
```

这时候发现 css 通过 style 标签的方式添加到了 html 文件中，
但是如果样式文件很多，全部添加到 html 中，难免显得混乱。
这时候想把 css 拆分出来用外链的形式引入 css 文件怎么做呢？
这时候就需要借助插件来帮助

#### 1.4.2 拆分 css

```
npm i -D mini-css-extract-plugin
```

> webpack 4.0 以前，我们通过 extract-text-webpack-plugin 插件，把 css 样式从 js 文件中提取到单独的 css 文件中。webpack4.0 以后，官方推荐使用 mini-css-extract-plugin 插件来打包 css 文件

- 配置文件如下

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
  //...省略其他配置
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[hash].css",
      chunkFilename: "[id].css",
    }),
  ],
};
```

#### 1.4.3 拆分多个 css

> 上面我们所用到的 mini-css-extract-plugin 会将所有的 css 样式合并为一个 css 文件。如果你想拆分为一一对应的多个 css 文件,我们需要使用到 extract-text-webpack-plugin，而目前 mini-css-extract-plugin 还不支持此功能。我们需要安装@next 版本的 extract-text-webpack-plugin

```
npm i -D extract-text-webpack-plugin@next
```

配置

```js
// webpack.config.js

const path = require("path");
const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
const indexLess = new ExtractTextWebpackPlugin("less.css");
const indexCss = new ExtractTextWebpackPlugin("index.css");
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: indexCss.extract({
          use: ["css-loader"],
        }),
      },
      {
        test: /\.less$/,
        use: indexLess.extract({
          use: ["css-loader", "less-loader"],
        }),
      },
    ],
  },
  plugins: [indexLess, indexCss],
};
```

会分别把 less 文件编译成 less.css, css 文件编译成 index.css

#### 1.5 打包 图片、字体、媒体、等文件

> url-loader 就是将文件在进行一些处理后（主要是处理文件名和路径、解析文件 url），并将文件移动到输出的目录中, url-loader 一般与 file-loader 搭配使用，功能与 file-loader 类似，如果文件小于限制的大小。则会返回 base64 编码，否则使用 file-loader 将文件移动到输出的目录中

```js
// webpack.config.js
module.exports = {
  // 省略其它配置 ...
  module: {
    rules: [
      // ...
      {
        test: /\.(jpe?g|png|gif)$/i, //图片文件
        use: [
          {
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
        ],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, //媒体文件
        use: [
          {
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
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, // 字体
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10240,
              fallback: {
                loader: "file-loader",
                options: {
                  name: "fonts/[name].[hash:8].[ext]",
                },
              },
            },
          },
        ],
      },
    ],
  },
};
```

#### 1.6 用 babel 转义 js 文件

为了使我们的 js 代码兼容更多的环境我们需要安装依赖

```
npm i -D babel-loader @babel/preset-env @babel/core
```

- 注意 babel-loader 与 babel-core 的版本对应关系

1. babel-loader 8.x 对应 babel-core 7.x
2. babel-loader 7.x 对应 babel-core 6.x

配置

```js
// webpack.config.js
module.exports = {
  // 省略其它配置 ...
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
};
```

上面的 babel-loader 只会将 ES6/7/8 语法转换为 ES5 语法，但是对新 api 并不会转换 例如(promise、Generator、Set、Maps、Proxy 等)此时我们需要借助 babel-polyfill 来帮助我们转换

```
npm i @babel/polyfill
```

配置

```js
// webpack.config.js
const path = require("path");
module.exports = {
  entry: ["@babel/polyfill", path.resolve(__dirname, "../src/index.js")], // 入口文件
};
```

---

---

---

> 以上是对 webpack 的功能有了一个初步的了解，但是要想熟练应用于开发中，我们需要一个系统的实战。让我们一起摆脱脚手架尝试自己搭建一个 vue 开发环境

### 2 搭建 vue 开发环境

上面的小例子已经帮助而我们实现了打包 css、图片、js、html 等文件。 但是我们还需要以下几种配置

#### 2.1 解析.vue 文件

```
npm i -D vue-loader vue-template-compiler vue-style-loader
npm i -S vue
```

vue-loader 用于解析.vue 文件,vue-template-compiler 用于编译模板

配置如下

```js
const vueLoaderPlugin = require("vue-loader/lib/plugin");
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ["vue-loader"],
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
  plugins: [new vueLoaderPlugin()],
};
```

#### 2.2 配置 webpack-dev-server 进行热更新

```
npm i -D webpack-dev-server
```

配置

```js
const Webpack = require("webpack");
module.exports = {
  // ...省略其他配置
  devServer: {
    port: 3000,
    hot: true,
    contentBase: "dist",
  },
  plugins: [new Webpack.HotModuleReplacementPlugin()],
};
```

完整配置

```js
// webpack.config.js
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
const vueLoaderPlugin = require("vue-loader/lib/plugin");
const Webpack = require("webpack");
module.exports = {
  mode: "development", // 开发模式
  entry: {
    main: path.resolve(__dirname, "src/main.js"),
  },
  output: {
    filename: "[name].[hash:8].js", // 打包后的文件名称
    path: path.resolve(__dirname, "dist"), // 打包后的目录
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ["vue-loader"],
      },
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env"]],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          "vue-style-loader",
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
          "vue-style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")],
            },
          },
          "less-loader",
        ],
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
  devServer: {
    port: 3005,
    hot: true,
    contentBase: "dist",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
      filename: "index.html",
    }),
    new vueLoaderPlugin(),
    new Webpack.HotModuleReplacementPlugin(),
  ],
};
```

#### 2.3 配置打包命令

```json
"scripts": {
    "build": "webpack --config webpack.config.js",
    "dev": "webpack-dev-server --config webpack.config.js --open"
  },
```

##### 测试一下

- 1.新建 src/main.js

```js
import Vue from "vue";
import App from "./App.vue";

new Vue({
  render: (h) => h(App),
}).$mount("#root");
```

- 2.新建 src/app.vue

```js
<template>
  <div class="title">{{ title }}</div>
</template>

<script>
export default {
  data() {
    return {
      title: "Hello Word",
    };
  },
};
</script>

<style scoped>
.title {
  color: red;
}
</style>
```

- 3.新建 public/index.html 模板

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

执行npm run dev这时候如果浏览器出现Vue开发环境运行成功，那么恭喜你，已经成功迈出了第一步

#### 2.4 区分开发环境与生产环境

实际应用到项目中，我们需要区分开发环境与生产环境，我们在原来webpack.config.js的基础上再新增两个文件

* webpack.dev.js 开发环境配置文件
```
开发环境主要实现的是热更新,不要压缩代码，完整的sourceMap
```
* webpack.prod.js 生产环境配置文件

生产环境主要实现的是压缩代码、提取css文件、合理的sourceMap、分割代码
需要安装以下模块:

```
npm i -D  webpack-merge copy-webpack-plugin optimize-css-assets-webpack-plugin uglifyjs-webpack-plugin
```
* webpack-merge 合并配置
* copy-webpack-plugin 拷贝静态资源
* optimize-css-assets-webpack-plugin 压缩css
* uglifyjs-webpack-plugin 压缩js
> webpack mode设置production的时候会自动压缩js代码。原则上不需要引入uglifyjs-webpack-plugin进行重复工作。但是optimize-css-assets-webpack-plugin压缩css的同时会破坏原有的js压缩，所以这里我们引入uglifyjs进行压缩

#### 2.4.1 webpack.config.js

```js
const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const vueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const devMode = process.argv.indexOf('--mode=production') === -1; // 判断是否开发模式
module.exports = {
  entry:{
    main:path.resolve(__dirname,'src/main.js')
  },
  output:{
    path:path.resolve(__dirname,'dist'),
    filename:'js/[name].[hash:8].js',
    chunkFilename:'js/[name].[hash:8].js'
  },
  module:{
    rules:[
      {
        test:/\.js$/,
        use:{
          loader:'babel-loader',
          options:{
            presets:['@babel/preset-env']
          }
        },
        exclude:/node_modules/
      },
      {
        test:/\.vue$/,
        use:[{
          loader:'vue-loader',
          options:{
            compilerOptions:{
              preserveWhitespace:false
            }
          }
        }]
      },
      {
        test:/\.css$/,
        use:[{
          loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          options:{
            publicPath:"dist/css/",
            hmr:devMode
          }
        },'css-loader',{
          loader:'postcss-loader',
          options:{
            plugins:[require('autoprefixer')]
          }
        }]
      },
      {
        test:/\.less$/,
        use:[{
          loader:devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          options:{
            publicPath:"dist/css/",
            hmr:devMode
          }
        },'css-loader','less-loader',{
          loader:'postcss-loader',
          options:{
            plugins:[require('autoprefixer')]
          }
        }]
      },
      {
        test:/\.(jep?g|png|gif)$/,
        use:{
          loader:'url-loader',
          options:{
            limit:10240,
            fallback:{
              loader:'file-loader',
              options:{
                name:'img/[name].[hash:8].[ext]'
              }
            }
          }
        }
      },
      {
        test:/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use:{
          loader:'url-loader',
          options:{
            limit:10240,
            fallback:{
              loader:'file-loader',
              options:{
                name:'media/[name].[hash:8].[ext]'
              }
            }
          }
        }
      },
      {
        test:/\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use:{
          loader:'url-loader',
          options:{
            limit:10240,
            fallback:{
              loader:'file-loader',
              options:{
                name:'media/[name].[hash:8].[ext]'
              }
            }
          }
        }
      }
    ]
  },
  resolve:{
    alias:{
      'vue$':'vue/dist/vue.runtime.esm.js',
      '@':path.resolve(__dirname,'src')
    },
    extensions:['*','.js','.json','.vue']
  },
  plugins:[
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template:path.resolve(__dirname,'public/index.html')
    }),
    new vueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
    })
  ]
}
```

#### 2.4.2 webpack.dev.js

```js
const Webpack = require('webpack')
const webpackConfig = require('./webpack.config.js') // 引入主配置
const WebpackMerge = require('webpack-merge') // 合并插件
module.exports = WebpackMerge(webpackConfig,{ // 合并
  mode:'development',
  devtool:'cheap-module-eval-source-map',
  devServer:{
    port:3000,
    hot:true,
    contentBase:'dist'
  },
  plugins:[
    new Webpack.HotModuleReplacementPlugin()
  ]
})
```

#### 2.4.3 webpack.prod.js

```js
const path = require('path')
const webpackConfig = require('./webpack.config.js')
const WebpackMerge = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
module.exports = WebpackMerge(webpackConfig,{
  mode:'production',
  devtool:'cheap-module-source-map',
  plugins:[
    new CopyWebpackPlugin([{
      from:path.resolve(__dirname,'public'),
      to:path.resolve(__dirname,'dist')
    }]),
  ],
  optimization:{
    minimizer:[
      new UglifyJsPlugin({//压缩js
        cache:true,
        parallel:true,
        sourceMap:true
    }),
    new OptimizeCssAssetsPlugin({})
    ],
    splitChunks:{
      chunks:'all',
      cacheGroups:{
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial" // 只打包初始时依赖的第三方
        }
      }
    }
  }
})
```

#### 2.5 优化webpack配置

优化配置对我们来说非常有实际意义，这实际关系到你打包出来文件的大小，打包的速度等。 具体优化可以分为以下几点：

#### 2.5.1 优化打包速度
构建速度指的是我们每次修改代码后热更新的速度以及发布前打包文件的速度。

##### 2.5.1.1 合理的配置mode参数与devtool参数

mode可设置development production两个参数，
如果没有设置，webpack4 会将 mode 的默认值设置为 production，
production模式下会进行treeshaking(去除无用代码)和uglifyjs(代码压缩混淆)

##### 2.5.1.2 缩小文件的搜索范围(配置include exclude alias noParse extensions)

* **alias**: 当我们代码中出现 import 'vue'时， webpack会采用向上递归搜索的方式去node_modules 目录下找。为了减少搜索范围我们可以直接告诉webpack去哪个路径下查找。也就是别名(alias)的配置。
* **include exclude** 同样配置include exclude也可以减少webpack loader的搜索转换时间。
* **noParse** 当我们代码中使用到import jq from 'jquery'时，webpack会去解析jq这个库是否有依赖其他的包。但是我们对类似jquery这类依赖库，一般会认为不会引用其他的包(特殊除外,自行判断)。增加noParse属性,告诉webpack不必解析，以此增加打包速度。
* **extensions** webpack会根据extensions定义的后缀查找文件(频率较高的文件类型优先写在前面)

##### 2.5.1.3 使用HappyPack开启多进程Loader转换
> 在webpack构建过程中，实际上耗费时间大多数用在loader解析转换以及代码的压缩中。日常开发中我们需要使用Loader对js，css，图片，字体等文件做转换操作，并且转换的文件数据量也是非常大。由于js单线程的特性使得这些转换操作不能并发处理文件，而是需要一个个文件进行处理。HappyPack的基本原理是将这部分任务分解到多个子进程中去并行处理，子进程处理完成后把结果发送到主进程中，从而减少总的构建时间

```
npm i -D happypack
```

配置

```js
const os = require("os");
const happyPack = require("happypack");
const happyThreadPool = happyPack.ThreadPool({ size: os.cpus().length }); // 根据系统cpu数初始化线程池大小
module.exports = {
  // 省略其他代码...
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{ loader: "happypack/loader?id=happyBabel" }], // 这里的id是happypack插件里设置的id
        exclude: /node_modules/,
      }, 
  },
  plugins: [
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
  ],
};
```

##### 2.5.1.4 使用webpack-parallel-uglify-plugin 增强代码压缩

> 上面对于loader转换已经做优化，那么下面还有另一个难点就是优化代码的压缩时间。

```
npm i -D webpack-parallel-uglify-plugin
```

配置
```js
const parallelUglifyPlugin = require("webpack-parallel-uglify-plugin");

module.exports = {
  // 省略其他代码...
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
};
```

##### 2.5.1.5 抽离第三方模块

> 对于开发项目中不经常会变更的静态依赖文件。类似于我们的elementUi、vue全家桶等等。因为很少会变更，所以我们不希望这些依赖要被集成到每一次的构建逻辑中去。 这样做的好处是每次更改我本地代码的文件的时候，webpack只需要打包我项目本身的文件代码，而不会再去编译第三方库。以后只要我们不升级第三方包的时候，那么webpack就不会对这些库去打包，这样可以快速的提高打包的速度。

这里我们使用webpack内置的DllPlugin DllReferencePlugin进行抽离在与webpack配置文件同级目录下新建webpack.dll.config.js 代码如下

```js
// webpack.dll.config.js
const path = require("path");
const webpack = require("webpack");
module.exports = {
  // 你想要打包的模块的数组
  entry: {
    vendor: ['vue','element-ui'] 
  },
  output: {
    path: path.resolve(__dirname, 'static/js'), // 打包后文件输出的位置
    filename: '[name].dll.js',
    library: '[name]_library' 
     // 这里需要和webpack.DllPlugin中的`name: '[name]_library',`保持一致。
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, '[name]-manifest.json'),
      name: '[name]_library', 
      context: __dirname
    })
  ]
};
```

在package.json中配置如下命令

```
"dll": "webpack --config webpack.dll.config.js"
```

接下来在我们的webpack.config.js中增加以下代码

```js
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./vendor-manifest.json')
    }),
    new CopyWebpackPlugin([ // 拷贝生成的文件到dist目录 这样每次不必手动去cv
      {from: 'static', to:'static'}
    ]),
  ]
};
```

执行
```
npm run dll
```

会发现生成了我们需要的集合第三方代码的static/js/vendor.dll.js 我们需要在html文件中手动引入这个js文件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="static/js/vendor.dll.js"></script> <!-- 引入dll -->
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

这样如果我们没有更新第三方依赖包，就不必npm run dll。
直接执行npm run dev , npm run build的时候会发现我们的打包速度明显有所提升。
因为我们已经通过dllPlugin将第三方依赖包抽离出来了。

##### 2.5.1.6 配置缓存

> 我们每次执行构建都会把所有的文件都重复编译一遍，这样的重复工作是否可以被缓存下来呢，答案是可以的，目前大部分 loader 都提供了cache 配置项。比如在 babel-loader 中，可以通过设置cacheDirectory 来开启缓存，babel-loader?cacheDirectory=true 就会将每次的编译结果写进硬盘文件（默认是在项目根目录下的node_modules/.cache/babel-loader目录内，当然你也可以自定义）

但如果 loader 不支持缓存呢？我们也有方法,我们可以通过cache-loader ，它所做的事情很简单，就是 babel-loader 开启 cache 后做的事情，将 loader 的编译结果写入硬盘缓存。再次构建会先比较一下，如果文件较之前的没有发生变化则会直接使用缓存。使用方法如官方 demo 所示，在一些性能开销较大的 loader 之前添加此 loader即可

```
npm i -D cache-loader
```

配置

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ext$/,
        use: ['cache-loader',...loaders},
        include: path.resolve(__dirname, 'src')
      }
    ]
  }
}
```

#### 2.5.2 优化打包文件体积

> 打包的速度我们是进行了优化，但是打包后的文件体积却是十分大，造成了页面加载缓慢，浪费流量等，接下来让我们从文件体积上继续优化

##### 2.5.2.1 引入webpack-bundle-analyzer分析打包后的文件

webpack-bundle-analyzer将打包后的内容树展示为方便交互的直观树状图，让我们知道我们所构建包中真正引入的内容

```
npm i -D webpack-bundle-analyzer
```

配置

```js
const bundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  plugins: [
    new bundleAnalyzer({
      analyzerHost: '127.0.0.1',
      analyzerPort: '9956'
    })
  ],
};
```

接下来在package.json里配置启动命令

```
"analyz": "NODE_ENV=production npm_config_report=true npm run build"
```

windows请安装npm i -D cross-env

```
"analyz": "cross-env NODE_ENV=production npm_config_report=true npm run build"
```

运行npm run analyz浏览器会自动打开文件依赖图的网页

##### 2.5.2.3 externals

> 按照官方文档的解释，如果我们想引用一个库，但是又不想让webpack打包，并且又不影响我们在程序中以CMD、AMD或者window/global全局等方式进行使用，那就可以通过配置Externals。这个功能主要是用在创建一个库的时候用的，但是也可以在我们项目开发中充分使用 Externals的方式，我们将这些不需要打包的静态资源从构建逻辑中剔除出去，而使用 CDN 的方式，去引用它们。

有时我们希望我们通过script引入的库，如用CDN的方式引入的jquery，我们在使用时，依旧用require的方式来使用，但是却不希望webpack将它又编译进文件中。这里官网案例已经足够清晰明了，大家有兴趣可以[点击了解](https://webpack.docschina.org/configuration/externals/)

webpack 官网案例如下
```html
<script
  src="https://code.jquery.com/jquery-3.1.0.js"
  integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk="
  crossorigin="anonymous">
</script>
```
```js
module.exports = {
  //...
  externals: {
    jquery: 'jQuery'
  }
};
```
```js
import $ from 'jquery';
$('.my-element').animate(/* ... */);
```

##### 2.5.2.3 Tree-shaking

> 这里单独提一下tree-shaking,是因为这里有个坑。tree-shaking的主要作用是用来清除代码中无用的部分。目前在webpack4 我们设置mode为production的时候已经自动开启了tree-shaking。但是要想使其生效，生成的代码必须是ES6模块。不能使用其它类型的模块如CommonJS之流。如果使用Babel的话，这里有一个小问题，因为Babel的预处理（preset）默认会将任何模块类型都转译成CommonJS类型，这样会导致tree-shaking失效。修正这个问题也很简单，在.babelrc文件或在webpack.config.js文件中设置modules： false就好了

```json
// .babelrc
{
  "presets": [
    ["@babel/preset-env",
      {
        "modules": false
      }
    ]
  ]
}
```

Or

```js
// webpack.config.js

module: {
    rules: [
        {
            test: /\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', { modules: false }]
                }
            }，
            exclude: /(node_modules)/
        }
    ]
}
```

### 3 手写webpack

> 经历过上面两个部分，我们已经可以熟练的运用相关的loader和plugin对我们的代码进行转换、解析。接下来我们自己手动实现loader与plugin，使其在平时的开发中获得更多的乐趣。

#### 3.1 手写webpack loader

> loader从本质上来说其实就是一个node模块。相当于一台榨汁机(loader)将相关类型的文件代码(code)给它。根据我们设置的规则，经过它的一系列加工后还给我们加工好的果汁(code)。

* loader编写原则

1. 单一原则: 每个 Loader 只做一件事；
2. 链式调用: Webpack 会按顺序链式调用每个 Loader；
3. 统一原则: 遵循 Webpack 制定的设计规则和结构，输入与输出均为字符串，各个 Loader 完全独立，即插即用；

在日常开发环境中，为了方便调试我们往往会加入许多console打印。但是我们不希望在生产环境中存在打印的值。那么这里我们自己实现一个loader去除代码中的console

> 知识点普及之AST。AST通俗的来说，假设我们有一个文件a.js,我们对a.js里面的1000行进行一些操作处理,比如为所有的await 增加try catch,以及其他操作，但是a.js里面的代码本质上来说就是一堆字符串。那我们怎么办呢，那就是转换为带标记信息的对象(抽象语法树)我们方便进行增删改查。这个带标记的对象(抽象语法树)就是AST。

```
npm i -D @babel/parser @babel/traverse @babel/generator @babel/types
```

* @babel/parser 将源代码解析成 AST
* @babel/traverse 对AST节点进行递归遍历，生成一个便于操作、转换的path对象
* @babel/generator 将AST解码生成js代码
* @babel/types通过该模块对具体的AST节点进行进行增、删、改、查

新建drop-console.js

```js
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const t = require('@babel/types')
module.exports=function(source){
  const ast = parser.parse(source,{ sourceType: 'module'})
  traverse(ast,{
    CallExpression(path){ 
      if(t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.object, {name: "console"})){
        path.remove()
      }
    }
  })
  const output = generator(ast, {}, source);
  return output.code
}
```
使用

```js
const path = require('path')
module.exports = {
  mode:'development',
  entry:path.resolve(__dirname,'index.js'),
  output:{
    filename:'[name].[contenthash].js',
    path:path.resolve(__dirname,'dist')
  },
  module:{
    rules:[{
      test:/\.js$/,
      use:path.resolve(__dirname,'drop-console.js')
      }
    ]
  }
}
```

> 实际上在webpack4中已经集成了去除console功能，在minimizer中可配置 去除console,以上是个小栗子

#### 3.2 手写webpack plugin

> 在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过Webpack提供的API改变输出结果。通俗来说：一盘美味的 盐豆炒鸡蛋 需要经历烧油 炒制 调味到最后的装盘等过程，而plugin相当于可以监控每个环节并进行操作，比如可以写一个少放胡椒粉plugin,监控webpack暴露出的生命周期事件(调味)，在调味的时候执行少放胡椒粉操作。那么它与loader的区别是什么呢？上面我们也提到了loader的单一原则,loader只能一件事，比如说less-loader,只能解析less文件，plugin则是针对整个流程执行广泛的任务。

一个基本的plugin插件结构如下

```js
class firstPlugin {
  constructor (options) {
    console.log('firstPlugin options', options)
  }
  apply (compiler) {
    compiler.plugin('done', compilation => {
      console.log('firstPlugin')
    ))
  }
}

module.exports = firstPlugin
```

* compiler 对象包含了Webpack 环境所有的的配置信息。这个对象在启动 webpack 时被一次性建立，并配置好所有可操作的设置，包括 options，loader 和 plugin。当在 webpack 环境中应用一个插件时，插件将收到此 compiler 对象的引用。可以使用它来访问 webpack 的主环境。
* compilation对象包含了当前的模块资源、编译生成资源、变化的文件等。当运行webpack 开发环境中间件时，每当检测到一个文件变化，就会创建一个新的 compilation，从而生成一组新的编译资源。compilation 对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用。

compiler和 compilation的区别

* compiler代表了整个webpack从启动到关闭的生命周期，而compilation 只是代表了一次新的编译过程
* compiler和compilation暴露出许多钩子，我们可以根据实际需求的场景进行自定义处理

[compiler钩子文档](https://www.webpackjs.com/api/compiler-hooks/)
[compilation钩子文档](https://www.webpackjs.com/api/compilation-hooks/)

下面我们手动开发一个简单的需求,在生成打包文件之前自动生成一个关于打包出文件的大小信息

新建一个webpack-firstPlugin.js

```js
class firstPlugin{
  constructor(options){
    this.options = options
  }
  apply(compiler){
    compiler.plugin('emit',(compilation,callback)=>{
      let str = ''
      for (let filename in compilation.assets){
        str += `文件:${filename}  大小${compilation.assets[filename]['size']()}\n`
      }
      // 通过compilation.assets可以获取打包后静态资源信息，同样也可以写入资源
      compilation.assets['fileSize.md'] = {
        source:function(){
          return str
        },
        size:function(){
          return str.length
        }
      }
      callback()
    })
  }
}
module.exports = firstPlugin
```

使用

```js
const path = require('path')
const firstPlugin = require('./webpack-firstPlugin.js')
module.exports = {
    // 省略其他代码
    plugins:[
        new firstPlugin()
    ]
}
```

执行 npm run build即可看到在dist文件夹中生成了一个包含打包文件信息的fileSize.md

上面两个loader与plugin案例只是一个引导，实际开发需求中的loader与plugin要考虑的方面很多，建议大家自己多动手尝试一下。

附上官网 [如何编写一个plugin](https://www.webpackjs.com/contribute/writing-a-plugin/)



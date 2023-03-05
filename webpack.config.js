const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const { VueLoaderPlugin } = require("vue-loader");
// HTMLファイルのビルド設定
const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, 'public/index.html'),
  filename: './index.html'
});
const esLintWebpackPlugin = new ESLintWebpackPlugin({
  exclude: ['node_modules', 'examples'],
  extensions: ['.js', '.vue']
});
const vueLoaderPlugin = new VueLoaderPlugin();

module.exports = {
  // 依存関係解決の起点となる資産を指定します。
  entry: path.join(__dirname, 'examples/src/index.js'),
  // 「.vue」ファイルを対象資産に指定します。
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [htmlWebpackPlugin, esLintWebpackPlugin, vueLoaderPlugin],
  resolve: {
    extensions: ['.js', '.vue']
  },
  // 開発用Webサーバのポートを指定します。
  devServer: {
    port: 3002,
    historyApiFallback: {
      index: '/bs-enhanced-datatable/'
    }
  },
  output: {
    path: path.join(__dirname, "examples/dist"),
    filename: "bundle.js",
    publicPath: '/bs-enhanced-datatable/'
  },
  performance: { hints: false },
  devtool: "eval-source-map",
}

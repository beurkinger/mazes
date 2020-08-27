const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  output: {
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader' }],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          '@teamsupercell/typings-for-css-modules-loader',
          {
            loader: 'css-loader',
            options: { modules: true },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg|png|jpg|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new Webpack.WatchIgnorePlugin([/css\.d\.ts$/]),
    new HtmlWebpackPlugin({
      template: __dirname + '/src/index.html',
      title: 'Preact Starter Kit',
    }),
    new MiniCssExtractPlugin(),
  ],
  devServer: {
    contentBase: __dirname + '/public',
    historyApiFallback: true,
    publicPath: '/',
  },
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { ProvidePlugin, DefinePlugin, IgnorePlugin } = require('webpack');

module.exports = (env) => {
  return {
    mode: env.NODE_ENV,
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: ['babel-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.(png|jpg|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader'
        },
        {
          test: /\.(scss|css)$/,
          use: [{
            loader: 'style-loader', // creates style nodes from JS strings
          }, {
            loader: 'css-loader', // translates CSS into CommonJS
          }, {
            loader: 'sass-loader', // compiles Sass to CSS
          }],
        },
      ],
    },
    devServer: {
      contentBase: path.resolve(__dirname, 'public'),
      disableHostCheck: true,
      historyApiFallback: {
        index: 'index.html',
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new MiniCssExtractPlugin({filename: 'bundle.css'}),
      new CopyWebpackPlugin(['src/assets']),
      new ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        Popper: ['popper.js', 'default'],
      }),
      new DefinePlugin({
        'process.env.API_URL': JSON.stringify(env.API_URL),
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV) || 'development',
        'process.env.RECAPTCHA_SITE_KEY': JSON.stringify(env.RECAPTCHA_SITE_KEY),
        'process.env.GA_ACCOUNT_ID': JSON.stringify(env.GA_ACCOUNT_ID),
      }),
      new IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    resolve: {
      extensions: ['.js', '.jsx'],
    },
  };
};

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    content: './src/content.ts',
    'ebay-content': './src/ebay-content.ts',
    background: './src/background.ts',
    popup: './src/popup.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'popup.html', to: 'popup.html' },
        { from: 'icons', to: 'icons' }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};

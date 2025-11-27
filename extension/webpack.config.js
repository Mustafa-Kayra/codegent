/**
 * AI Agent VS Code Extension
 * Webpack Yapılandırması
 */

//@ts-check
'use strict';

const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node', // VS Code extensions node ortamında çalışır
  mode: 'none', // 'production' veya 'development' olarak değiştirilebilir

  entry: './src/extension.ts', // Extension giriş noktası
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // vscode modülü harici olarak ele alınır
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log' // Webpack log seviyesi
  }
};

module.exports = config;

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development', // Change to 'production' for builds (e.g., when Vercel builds)
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Cleans dist folder on build
    publicPath: '', // <--- THIS IS THE ADDED LINE / EASY FIX ATTEMPT
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 8080,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] },
        },
      },
      {
        test: /\.(png|jpe?g|gif|ogg|mp3|wav)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]', // This ensures assets are outputted into an 'assets' subfolder in 'dist'
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Use your HTML file as a template
      filename: 'index.html',     // Output filename in dist
      inject: 'body',
    }),
    new CopyWebpackPlugin({ // This copies files that aren't directly imported/required by JS
      patterns: [
        {
          from: path.resolve(__dirname, 'assets'), // Copy from your local 'assets' folder
          to: path.resolve(__dirname, 'dist', 'assets'), // To 'dist/assets'
                                                          // (This is good, matches asset/resource generator.filename)
        },
        // If form.html is still in src/, you'd add the copy rule for it here:
        // { 
        //   from: path.resolve(__dirname, 'src', 'form.html'),
        //   to: path.resolve(__dirname, 'dist', 'form.html'),
        // },
      ],
    }),
    new webpack.DefinePlugin({
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true),
    }),
  ],
};
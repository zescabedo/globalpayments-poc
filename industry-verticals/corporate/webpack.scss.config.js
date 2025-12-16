require('dotenv').config({ path: './.env.local' });
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const glob = require('glob');

const buildMode = process.env.BUILD_MODE;

// Find the global.scss file and all site*.scss files in the styles directory
// Any new theme override needs to have its own entry point created in /styles/sites/<site-name>/site.<site-name>.scss
const globalFile = glob.sync('./src/styles/global-themes/global.scss');
const siteFiles = glob.sync('./src/styles/sites/**/site*.scss');

const entryPoints = {};

if (globalFile.length > 0) {
  entryPoints['global'] = './' + globalFile[0].replace(/\\/g, '/');
}
if (buildMode !== 'global') {
  siteFiles.forEach((item) => {
    const name = path.basename(item, '.scss');
    entryPoints[name] = './' + item.replace(/\\/g, '/');
  });
}

module.exports = {
  entry: entryPoints,
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'public', 'styles'),
    publicPath: 'auto',
  },
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@fonts': path.resolve(__dirname, 'src/styles/themes/fonts'),
    },
  },
  stats:{
    all: false,
    errors: true,
    errorDetails: true,
    moduleTrace: true,
  },
  infrastructureLogging: {
    level: 'error',
  },
  bail: true,
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              implementation: require('sass'),
              sassOptions: {
                includePaths: [path.join(__dirname, 'src')],
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/i,
        type: 'asset/resource',
        generator: {
          filename: 'icons/[name][ext]',
        },
      },
      {
        test: /\.(jpe?g|png)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    {
      apply: (compiler) => {
        compiler.hooks.compile.tap('StartScssBuildPlugin', () => {
          console.log('SCSS build started...');
        });
      },
    },
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: (chunkData) => {
        const name = chunkData.chunk.name;
        if (name !== 'global') {
          return `${name}.css`;
        }
        return 'global.css';
      },
    }),
  ],
};

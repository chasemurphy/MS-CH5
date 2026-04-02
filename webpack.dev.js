const glob = require('glob');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ConcatPlugin = require('webpack-concat-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const common = require('./webpack.common.js');

const appName = 'msch5';
const distPath = `dist/${appName}`;
const nodeModules = './node_modules/';
const srcRoot = './app/';

const crLib = glob.sync(`${nodeModules}@crestron/ch5-crcomlib/build_bundles/umd/cr-com-lib.js`);
const servicesJs = glob.sync(`${srcRoot}services/*.js`);
const componentsJs = glob.sync(`${srcRoot}components/**/*.js`);
const coreLibs = [...crLib];
const componentsList = [...servicesJs, ...componentsJs];

module.exports = merge(common, {
  mode: 'development',
  watch: true,
  plugins: [
    new ConcatPlugin({
      uglify: false,
      sourceMap: false,
      name: 'crcomlib',
      outputPath: 'assets/vendor/',
      fileName: 'cr-com-lib.js',
      filesToConcat: coreLibs,
      attributes: { async: true }
    }),
    new ConcatPlugin({
      uglify: false,
      sourceMap: false,
      name: 'components',
      outputPath: 'assets/vendor/',
      fileName: 'component.js',
      filesToConcat: componentsList,
      attributes: { async: true }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: false,
      template: './app/index.html'
    }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      files: ['./dist/**/*.html', './dist/**/*.js', './dist/**/*.css'],
      server: { baseDir: [distPath] }
    })
  ]
});

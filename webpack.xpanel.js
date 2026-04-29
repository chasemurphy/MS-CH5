const path = require('path');
const glob = require('glob');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ConcatPlugin = require('webpack-concat-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common.js');

const appName = 'msch5';
const distPath = `dist/${appName}`;
const basePath = path.resolve(__dirname);
const nodeModules = './node_modules/';
const srcRoot = './app/';

// webxpanel must load before crcomlib
const webXPanelLib = glob.sync(`${nodeModules}@crestron/ch5-webxpanel/dist/umd/index.js`);
const crLib = glob.sync(`${nodeModules}@crestron/ch5-crcomlib/build_bundles/umd/cr-com-lib.js`);
const servicesJs = glob.sync(`${srcRoot}services/*.js`);
const componentsJs = glob.sync(`${srcRoot}components/**/*.js`);

const coreLibs = [...webXPanelLib, `${srcRoot}webxpanel-init.js`, ...crLib];
const componentsList = [...servicesJs, ...componentsJs];

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyPlugin([{
      from: path.resolve(basePath, `${nodeModules}@crestron/ch5-webxpanel/dist/umd/*.worker.js`),
      to: path.resolve(basePath, distPath),
      flatten: true,
      force: true
    }]),
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
    })
  ]
});

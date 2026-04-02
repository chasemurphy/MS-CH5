/**
 * copy css unminified files into destination folder
 */
const glob = require('glob');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ConcatPlugin = require('webpack-concat-plugin');
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const common = require('./webpack.common.js');
// config details
const appName = `BlueSteel2`;
const distPath = `dist/${appName}`;
const nodeModules = `./node_modules/`;
const srcRoot = `./app/`;
const crLib = glob.sync(`${nodeModules}/@crestron/ch5-crcomlib/build_bundles/umd/cr-com-lib.js`);
const mainJs = glob.sync(`${srcRoot}/assets/vendor/*.js`);
const componentsjs = glob.sync(`${srcRoot}/components/**/*.js`);
const jsList = [...crLib];
const componentsList = [...mainJs, ...componentsjs];

module.exports = merge(common, {
    mode: 'development',
    watch: true,
    plugins: [
        new ConcatPlugin({
            uglify: false,
            sourceMap: false,
            name: 'result',
            outputPath: 'assets/vendor/',
            fileName: 'cr-com-lib.js',
            filesToConcat: jsList,
            attributes: {
                async: true
            }
        }),
        new ConcatPlugin({
            uglify: false,
            sourceMap: false,
            name: 'result',
            outputPath: 'assets/vendor/',
            fileName: 'component.js',
            filesToConcat: componentsList,
            attributes: {
                async: true
            }
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: false,
            template: './app/index.dev.html'
        }),
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3000,
            //files under watch
            files: ['./dist/**/**/*.html', './dist/**/**/**/*.js', './dist/**/**/**/*.css'],
            server: { baseDir: [distPath] }
        })
    ]
});
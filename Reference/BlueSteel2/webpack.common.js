
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');

//configs details
const appName = BlueSteel2;
const basePath = path.resolve(__dirname);
const distPath = `dist/${appName}`;
const nodeModules = `./node_modules/`;
const srcRoot = `./app/`;
const fontAwesomeCssBasePath = `${nodeModules}@fortawesome/fontawesome-free/css`;
let copyToDest = [];

let fromToList = {
    fav: {
        to: `${distPath}`,
        from: `${srcRoot}favicon.ico`
    },
    component: {
        to: `${distPath}/components`,
        from: `${srcRoot}components/**/*.html`,
        context: 'app/components'
    },
    fontIcon: {
        to: `${distPath}/assets/webfonts`,
        from: `${nodeModules}@fortawesome/fontawesome-free/webfonts/**/*`

    },
    fonts: {
        to: `${distPath}/assets/fonts`,
        from: `${srcRoot}assets/fonts/**/*`
    },
    json: {
        to: `${distPath}/assets/data`,
        from: `${srcRoot}assets/data/**/*.json`,
        context: 'app/assets/data'
    },
    images: {
        to: `${distPath}/assets/img`,
        from: `${srcRoot}assets/img/**/*`,
        context: 'app/assets/img'
    },
    layoutCss: {
        to: `${distPath}/assets/css`,
        from: `${srcRoot}assets/vendor/crestron-components-lib/themes/*.css`
    }
};

Object.keys(fromToList).forEach((key) => {
    let listObj = {};
    listObj.from = path.resolve(basePath, fromToList[key].from);
    listObj.to = path.resolve(basePath, fromToList[key].to);
    listObj.force = true;
    if (!!fromToList[key].context) {
        listObj.flatten = false;
        listObj.context = fromToList[key].context;
    } else {
        listObj.flatten = true;
    }
    copyToDest.push(listObj);
});

module.exports = {
    entry: {
        'main': path.resolve(basePath, `${srcRoot}/assets/scss/main.scss`),
        'external': [
            path.resolve(basePath, `${fontAwesomeCssBasePath}/fontawesome.css`),
            path.resolve(basePath, `${fontAwesomeCssBasePath}/regular.css`),
            path.resolve(basePath, `${fontAwesomeCssBasePath}/solid.css`),
            path.resolve(basePath, `${fontAwesomeCssBasePath}/brands.css`)
        ]
    },
    output: {
        libraryTarget: 'umd',
        filename: "[name].js",
        path: path.resolve(basePath, distPath)
    },
    resolve: {
        extensions: ['.scss', '.sass', '.css', '.js']
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader?url=false']
            },
            {
                test: /\.(png|jpg|svg|woff|woff2|eot|ttf)$/,
                loader: 'url-loader',
                options: {
                    limit: 30000,
                    name: 'images/[name].[ext]'
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',
                    'sass-loader?url=false'
                ]
            },
            {
                test: /\.(html)$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: false
                    }
                }],
            }
        ],
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "assets/css/[name].css"
        }),
        new CopyPlugin(copyToDest)
    ]
};
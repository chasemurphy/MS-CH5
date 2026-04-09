const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const appName = 'msch5';
const basePath = path.resolve(__dirname);
const distPath = `dist/${appName}`;
const nodeModules = './node_modules/';
const srcRoot = './app/';
const fontAwesomeCssBasePath = `${nodeModules}@fortawesome/fontawesome-free/css`;

let copyToDest = [];

let fromToList = {
  fontIcon: {
    to: `${distPath}/assets/webfonts`,
    from: `${nodeModules}@fortawesome/fontawesome-free/webfonts/**/*`
  },
  ch5Theme: {
    to: `${distPath}/assets/css`,
    from: `${nodeModules}@crestron/ch5-theme/output/themes/css/ch5-theme.css`
  },
  mpFont: {
    to: `${distPath}/assets/fonts`,
    from: `${nodeModules}@crestron/ch5-theme/output/themes/fonts/mp-font.*`
  },
  mpImages: {
    to: `${distPath}/assets/svgs/images`,
    from: `${nodeModules}@crestron/ch5-theme/output/themes/svgs/images/*`
  }
};

Object.keys(fromToList).forEach((key) => {
  let listObj = {};
  listObj.from = path.resolve(basePath, fromToList[key].from);
  listObj.to = path.resolve(basePath, fromToList[key].to);
  listObj.force = true;
  if (fromToList[key].context) {
    listObj.flatten = false;
    listObj.context = fromToList[key].context;
  } else {
    listObj.flatten = true;
  }
  copyToDest.push(listObj);
});

module.exports = {
  entry: {
    'main': path.resolve(basePath, `${srcRoot}assets/theme/custom.css`),
    'external': [
      path.resolve(basePath, `${fontAwesomeCssBasePath}/fontawesome.css`),
      path.resolve(basePath, `${fontAwesomeCssBasePath}/regular.css`),
      path.resolve(basePath, `${fontAwesomeCssBasePath}/solid.css`),
      path.resolve(basePath, `${fontAwesomeCssBasePath}/brands.css`),
      path.resolve(basePath, `${srcRoot}assets/theme/mp-font.css`)
    ]
  },
  output: {
    libraryTarget: 'umd',
    filename: '[name].js',
    path: path.resolve(basePath, distPath)
  },
  resolve: {
    extensions: ['.css', '.js']
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader?url=false'
        ]
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
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: { minimize: false }
        }]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].css'
    }),
    new CopyPlugin(copyToDest)
  ]
};

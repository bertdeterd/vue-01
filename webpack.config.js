module.exports = function(env) {
  const path = require("path");
  const HtmlWebpackPlugin = require("html-webpack-plugin");
  const webpack = require("webpack");
  var merge = require("webpack-merge");
  var ExtractTextPlugin = require("extract-text-webpack-plugin");
  var chalk = require("chalk");
  var serviceUri = "";
  const devSystem = "";

  const TARGET = env;
  TARGET === "dev"
    ? (serviceUri = "/proxy/sap/opu/odata/SAP/ZATI_MAIN_SRV/")
    : (serviceUri = "/sap/opu/odata/SAP/ZATI_MAIN_SRV/");

  const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: false
  });

  /**
 * Common config:
 * Generieke settings voor development en production
 */
  console.log(chalk.green.bgBlue.bold("Instellen algemene settings"));
  console.log("Service URI: " + serviceUri);

  const common = {
    entry: {
      main: "./src/main.js"
    },

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js"
    },

    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        vue$: "vue/dist/vue.esm.js",
        "@": path.resolve(__dirname, "src")
      }
    },

    resolveLoader: {
      alias: {
        text: "text-loader"
      }
    },

    module: {
      rules: [
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: "css-loader"
          }),
          exclude: /node_modules/
        },

        {
          test: /\.vue$/,
          loader: "vue-loader"
        },

        {
          test: /\.scss$/,
          use: extractSass.extract({
            use: [
              {
                loader: "css-loader"
              },
              {
                loader: "sass-loader"
              }
            ],
            // use style-loader in development
            fallback: "style-loader"
          })
        },

        {
          test: /\.js$/,
          use: { loader: "babel-loader", query: { compact: false } },
          exclude: /node_modules/
        },

        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: "url-loader",
          options: {
            limit: 10000,
            name: path.posix.join("src/static", "img/[name].[hash:7].[ext]")
          }
        }
      ]
    },

    plugins: [
      /*
      new webpack.ProvidePlugin({
        jQuery: "jquery",
        jquery: "jquery",
        $: "jquery",
        _: "underscore",
        Backbone: "backbone"
      }),
      */

      new ExtractTextPlugin("styles.css"),
      new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        minChunks: function(module) {
          //console.log(module.context);
          return (
            module.context && module.context.indexOf("node_modules") !== -1
          );
        }
      }),

      new webpack.DefinePlugin({
        SERVICE_URI: JSON.stringify(serviceUri)
      }),

      new HtmlWebpackPlugin({
        template: "src/index.html",
        title: "ATI Beheer"
      })
    ]
  };

  /**
   * Aanvullende settings voor development 
   * Met name voor development server, maps en HMR
  */
  if (env === "dev") {
    console.log("aanvullen dev settings");
    console.log("Development systeem: " + devSystem);
    var devconfig = merge(common, {
      devtool: "inline-source-map",
      devServer: {
        
        proxy: {
          "/proxy": {
            target: devSystem,
            changeOrigin: true,
            secure: false,
            pathRewrite: {
              "^/proxy": ""
            }
          }
        }
      },
      plugins: [new webpack.HotModuleReplacementPlugin()]
    });
    return devconfig;
  } else {
    /**
     * Aanvullende settings voor production 
     * Met name voor compressie
    */
    var prodconfig = merge(common, {
      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            pure_funcs: ["console.log", "console.group", "console.groupEnd"]
          }
        })
      ]
    });
    return prodconfig;
  }
};

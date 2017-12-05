const
    path = require( "path" ),
    webpack = require( "webpack" ),
    HtmlWebpackPlugin = require( "html-webpack-plugin" );


module.exports = {
    entry: "./bootstrap.js",
    devtool: "inline-source-map",
    output: {
        path: path.resolve( __dirname, "build" ),
        filename: "[name].js"
    },
    devServer: {
        disableHostCheck: true,
        host: "0.0.0.0",
        compress: true,
        port: 9000,
        hot: true
    },
    module: {
        rules: [ {
            test: /\.js$/,
            // loader: "babel-loader",
            exclude: /node_modules/,
            use: [ {
                loader: "babel-loader",
                options: {
                    presets: [ [ "es2015" ] ]
                }

            }, {
                loader: "babel-loader",
                options: {
                    presets: [ [ "es2016" ] ]
                }

            }, {
                loader: "babel-loader",
                options: {
                    presets: [ [ "es2017" ] ]
                }
            } ]
        } ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin( {
            template: path.resolve( __dirname, "./test/testing.html" )
        } )
    ]
};

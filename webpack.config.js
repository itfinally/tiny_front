const
    path = require( "path" ),
    webpack = require( "webpack" ),
    HtmlWebpackPlugin = require( "html-webpack-plugin" ),
    ExtractTextWebpackPlugin = require( "extract-text-webpack-plugin" );


module.exports = {
    entry: "./index.js",
    devtool: "inline-source-map",
    output: {
        path: path.resolve( __dirname, "dist" ),
        filename: "[name].js"
    },
    devServer: {
        public: "192.168.1.106",
        disableHostCheck: true,
        host: "0.0.0.0",
        compress: true,
        port: 9000,
        hot: true
    },
    module: {
        rules: [ {
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/

        }, {
            test: /\.js$/,
            loader: "babel-loader",
            exclude: /node_modules/
        }, {
            test: /\.vue$/, loader: "vue-loader",
            exclude: /node_modules/,

        }, {
            test: /\.css$/,
            loader: ExtractTextWebpackPlugin.extract( {
                fallback: "style-loader",
                use: [ "css-loader" ]
            } )

        }, {
            test: /\.(eot|woff|ttf|svg)$/, loader: "file-loader",
            options: {
                publicPath: "../",
                name: "font/[name].[ext]"
            }

        }, {
            test: /\.(png|jpg)$/, loader: "url-loader",
            options: {
                limit: 1,
                name: "image/[name].[ext]"
            }

        } ]
    },
    resolve: {
        extensions: [ ".ts", ".tsx", ".js" ],
        alias: {
            "vue": "vue/dist/vue.js",
            "@": path.resolve( __dirname, "src" ),
            "@core": path.resolve( __dirname, "src/core" ),
            "@admin": path.resolve( __dirname, "src/admin" ),
            "@retrofitjs": path.resolve( __dirname, "src/retrofitjs" )
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin( {
            template: path.resolve( __dirname, "./src/admin/index.html" )
        } ),
        new ExtractTextWebpackPlugin( {
            filename: "css/[name].[id].css",
            allChunks: true
        } )
    ]
};

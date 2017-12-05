const
    path = require( "path" ),
    webpack = require( "webpack" ),
    HtmlWebpackPlugin = require( "html-webpack-plugin" );


module.exports = {
    entry: "./bootstrap.ts",
    devtool: "inline-javascript-map",
    output: {
        path: path.resolve( __dirname, "build" ),
        filename: "compile.js"
    },
    devServer: {
        disableHostCheck: true,
        host: "0.0.0.0",
        compress: true,
        port: 9000,
        hot: true
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: "babel-loader",
            exclude: /node_modules/
        } ]
    },
    resolve: {
        extensions: [ ".ts", ".tsx", ".js" ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin( {
            template: path.resolve( __dirname, "./bootstrap.html" )
        } )
    ]
};

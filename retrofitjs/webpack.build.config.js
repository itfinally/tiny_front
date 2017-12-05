const
    path = require( "path" ),
    UglifyJsPlugin = require( "uglifyjs-webpack-plugin" );

module.exports = {
    entry: "./bootstrap.js",
    devtool: "javascript-map",
    output: {
        path: path.resolve( __dirname, "dist" ),
        filename: "retrofit.js",
        libraryTarget: "umd",
        library: "retrofit",
        umdNamedDefine: true
    },
    module: {
        rules: [ {
            test: /\.js?$/,
            loader: "babel-loader",
            exclude: /node_modules/

        } ]
    },
    resolve: {
        extensions: [ ".ts", ".tsx", ".js" ]
    },
    plugins: [
        // new UglifyJsPlugin({
        //     sourceMap: true,
        //     uglifyOptions: {
        //         ecma: 7
        //     }
        // })
    ]
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        game: './src/game/index.ts',
        levelEditor: './src/levelEditor/index.ts',
    },
    devtool: 'source-map',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].bundle.js',
        chunkFilename: '[id].bundle_[chunkhash].js',
        sourceMapFilename: '[file].map',
        clean: true,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            title: 'game',
            template: './src/game/index.html',
            chunks: ['game'],
        }),
        new HtmlWebpackPlugin({
            filename: 'levelEditor.html',
            title: 'levelEditor',
            template: './src/levelEditor/index.html',
            chunks: ['levelEditor'],
        }),
    ],
    devServer: {
        compress: true,
        port: 9000,
    },
};
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'Home.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
            "fs": require.resolve("browserify-fs"),
            "os": require.resolve("os-browserify/browser"),
            "path": require.resolve("path-browserify"),
            "tls": require.resolve("tls-browserify"),
            "util": require.resolve("util")
        }
    }
};
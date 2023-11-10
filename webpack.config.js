const path = require("path");

module.exports = {
  entry: {
    index: "./src/index.ts",
    client: "./src/client.ts",
    server: "./src/server.ts",
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      net: false,
      tls: false,
      request: false,
      child_process: false,
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      path: require.resolve("path-browserify"),
      zlib: require.resolve("browserify-zlib"),
      os: require.resolve("os-browserify/browser"),
      buffer: require.resolve("buffer"),
      url: require.resolve("url"),
      util: require.resolve("util"),
      assert: require.resolve("assert"),
      querystring: require.resolve("querystring-es3"),
    },
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    // See: https://webpack.js.org/configuration/output/#outputlibrary for more information
    // Also see: https://webpack.js.org/configuration/output/#outputlibrary
    library: ["global", "client", "server"],
  },
};

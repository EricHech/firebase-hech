const path = require("path");

const PACKAGE_NAME = "firebase-soil";

const config = {
  context: __dirname,
  entry: {
    app: "./src/index.ts",
    server: "./src/server.ts",
    client: "./src/client.ts",
  },
  output: {
    filename: "[name].bundle.js",
    clean: true,
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    library: "[name]",
    umdNamedDefine: true,
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
  },
};

module.exports = (env, argv) => {
  return config;
};

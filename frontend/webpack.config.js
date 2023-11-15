const path = require("path");
module.exports = {
  // entry: path.resolve(__dirname, "scripts", "index.js"),
  mode: "development",
  entry: {
    index: "./scripts/index.js",
    auth: "./scripts/authApp.js",
    userDashboard: "./scripts/userDashboardApp.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "."),
    },
    compress: true,
    port: 8050,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
};

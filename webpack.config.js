module.exports = {
  entry: {
    module1: "./src/js/main.js",
    module2: "./src/js/init.js",
  },
  output: { // ファイルの出力設定
    path: __dirname + "/build/js/", //  出力ファイルのディレクトリ名
    filename: '[name].bundle.js' // 出力ファイル名
  }
};

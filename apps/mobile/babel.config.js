module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo"]],
    env: {
      production: {
        plugins: ["react-native-paper/babel"],
      },
    },
    plugins: [
      "@babel/transform-react-jsx-source",
      "babel-plugin-transform-typescript-metadata",
      "nativewind/babel",
      [
        "module-resolver",
        {
          alias: {
            "react-native-sqlite-storage": "react-native-quick-sqlite",
          },
        },
      ],
    ],
  };
};

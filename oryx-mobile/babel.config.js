module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
    overrides: [
      {
        // Hermes can't parse `#` private fields in some deps — but never apply
        // loose:false transforms globally (breaks VirtualizedList / FlatList).
        test: (filename) => {
          if (!filename.includes("node_modules")) return false;
          return (
            filename.includes("/@react-native-google-signin/") ||
            filename.includes("/@react-native-firebase/")
          );
        },
        plugins: [
          ["@babel/plugin-transform-class-properties", { loose: true }],
          ["@babel/plugin-transform-private-methods", { loose: true }],
          [
            "@babel/plugin-transform-private-property-in-object",
            { loose: true },
          ],
        ],
      },
    ],
  };
};

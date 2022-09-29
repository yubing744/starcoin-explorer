// fix react-scripts 3.5+ do not support import alias(paths in tsconfig.json)
// https://stackoverflow.com/questions/57070052/create-react-app-typescript-3-5-path-alias

const CracoAlias = require("craco-alias");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: {
    configure: (config) => {
      return config;
    },
    plugins: [
      new NodePolyfillPlugin({
        excludeAliases: ['console', 'Buffer'],
      }),
    ]
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig",
        // baseUrl SHOULD be specified
        // plugin does not take it from tsconfig
        baseUrl: "./src",
        /* tsConfigPath should point to the file where "baseUrl" and "paths"
        are specified*/
        tsConfigPath: "./tsconfig.paths.json"
      }
    }
  ]
};
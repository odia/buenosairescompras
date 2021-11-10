const {override, addWebpackModuleRule} = require('customize-cra')

module.exports = override(
  addWebpackModuleRule(
    {
      test: /\.worker\.ts$/,
      use: { loader: 'worker-loader' }
    }
  )
)

module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    // Form field blocks legitimately need more than 4 authorable attributes each
    // (a hidden discriminator plus label/name/placeholder/required/etc). Grouping
    // them into fewer delivered cells would only obscure the structure, so allow
    // the higher counts explicitly for these models.
    // asset-grid is a POC block; its extra config fields (and their auth scheme)
    // are a known open item to be redesigned, so allow its count for now.
    // card's 5th cell is the CTA button target; grouping the link fields is the
    // proper fix but is deferred until the existing card model/content drift
    // (nodes still carry the old linkType, not the deployed linkTarget) is
    // reconciled, so allow its count for now.
    'xwalk/max-cells': ['error', {
      'form-text-field': 5,
      'form-email-field': 5,
      'form-checkbox-group': 5,
      'form-checkbox-field': 6,
      'asset-grid': 5,
      card: 5,
    }],
  },
};

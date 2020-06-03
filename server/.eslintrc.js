module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',

    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },

    'import/resolver': {
      typescript: {},
    },
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'import/prefer-default-export': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
}

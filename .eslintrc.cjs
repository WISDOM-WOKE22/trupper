module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  files: ['*.js', '*.jsx'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'no-console': 'off',
    'prettier/prettier': 'off',
    quotes: ['off', 'double'],
    semi: ['error', 'always'],
  },
};

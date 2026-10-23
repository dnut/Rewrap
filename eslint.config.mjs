import parser from '@typescript-eslint/parser'
import typescript from '@typescript-eslint/eslint-plugin'
import globals from 'globals'

export default [
  {ignores: ['vscode/bin/**']},
  {
    files: ['vscode/**/*.ts'],
    languageOptions: {
      parser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals['shared-node-browser'],
        ...globals.commonjs,
        ...globals.es2020,
      },
    },
    plugins: {'@typescript-eslint': typescript},
    rules: {
      'comma-dangle': ['error', {arrays: 'always-multiline', objects: 'always-multiline', functions: 'never'}],
      'eol-last': 'error',
      'object-curly-spacing': 'error',
      'no-debugger': 'error',
      'no-multiple-empty-lines': ['error', {max: 2, maxEOF: 0}],
      'no-trailing-spaces': ['error', {ignoreComments: true}],
      'no-undef': 'error',
      'no-unreachable': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'keyword-spacing': 'error',
      'space-before-function-paren': 'error',
    },
  },
]

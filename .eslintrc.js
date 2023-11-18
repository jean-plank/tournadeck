module.exports = {
  plugins: ['fp-ts', 'prettier', 'tailwindcss'],
  extends: ['next/core-web-vitals', 'plugin:fp-ts/all', 'plugin:tailwindcss/recommended'],
  rules: {
    'fp-ts/no-module-imports': ['warn', { allowTypes: true }],
    'prettier/prettier': 'error',
    'react/hook-use-state': 'warn',
    'react/jsx-boolean-value': ['warn', 'always'],
    'react/jsx-no-bind': [
      'warn',
      {
        ignoreDOMComponents: false,
        ignoreRefs: false,
        allowArrowFunctions: false,
        allowFunctions: false,
        allowBind: false,
      },
    ],
  },
}

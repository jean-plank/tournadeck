module.exports = {
  parserOptions: {
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
  plugins: ['fp-ts', 'tailwindcss'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:fp-ts/all',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    '@typescript-eslint/array-type': ['warn', { default: 'array', readonly: 'generic' }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', disallowTypeAnnotations: false },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/method-signature-style': 'warn',
    '@typescript-eslint/no-base-to-string': 'error',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-namespace': 'warn',
    '@typescript-eslint/no-restricted-imports': 'off',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/prefer-function-type': 'warn',
    '@typescript-eslint/strict-boolean-expressions': [
      'warn',
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
      },
    ],
    '@typescript-eslint/triple-slash-reference': 'off',
    'arrow-body-style': ['warn', 'as-needed'],
    eqeqeq: ['error', 'always'],
    'fp-ts/no-module-imports': ['warn', { allowTypes: true }],
    'no-shadow': 'warn',
    'no-unused-vars': 'off',
    'no-useless-rename': 'warn',
    'object-shorthand': 'warn',
    'react/button-has-type': 'warn',
    'react/display-name': 'off',
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
    'react/no-array-index-key': 'warn',
    'react/no-unescaped-entities': 'off',
    'react/prop-types': 'off',
    'react/self-closing-comp': ['warn', { component: true, html: true }],
    'tailwindcss/no-custom-classname': 'warn',
  },
}

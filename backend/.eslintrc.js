module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020, // es2020 is latest w 100% support in Node 14.x.
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'import-alias'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  env: {
    // https://eslint.org/docs/user-guide/configuring#specifying-environments
    amd: true, // adds require() and define() as global vars per amd spec
    browser: true, // adds browser globals (eg, window and document)
    es2020: true, // adds all es2020 (aka ecmaVersion=11) features
    jest: true, // adds Jest global vars
    node: true, // adds Node.js global vars and scoping
  },
  extends: [
    // order matters; later entries override earlier ones
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended', // fix up eslint rules to work w TS
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:prettier/recommended', // convert Prettier rules to ESLint, and apply prettier's defaults
  ],
  rules: {
    'import/no-cycle': [
      2,
      {
        ignoreExternal: true,
        maxDepth: 3,
      },
    ],
    // 2: error, 1: warn, 0: off
    'import/no-unresolved': [
      'error',
      {
        commonjs: true,
        caseSensitive: true,
      },
    ],
    'no-console': [
      1,
      {
        allow: ['log', 'warn', 'error'],
      },
    ],
    // Note "embedded" prettier here; linting and formatting driven by ESLint :)
    'prettier/prettier': [
      2,
      {
        arrowParens: 'always',
        editorconfig: true, // see .editorconfig
        endOfLine: 'auto', // see .editorconfig
        jsxBracketSameLine: true,
        jsxSingleQuote: true,
        printWidth: 100, // NB - this isn't like max-len, it's a soft target
        quoteProps: 'as-needed',
        semi: true,
        singleQuote: true,
        // tabWidth: 2,  // see .editorconfig
        // trailingComma: 'es5', // es5 is default in prettier
        usePrettierrc: false, // no .prettierrc needed
        // useTabs: false, // see .editorconfig
      },
    ],
    'react/display-name': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0, // NextJS lets us omit `import React` everywhere
    'react-hooks/rules-of-hooks': 2, // Checks official "rules of Hooks"
    'react-hooks/exhaustive-deps': 1, // Checks hooks' effects' dependencies
    '@typescript-eslint/ban-ts-comment': [
      2,
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
        minimumDescriptionLength: 10,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-unused-vars': [
      0,
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-empty-function': 0,
  },
};

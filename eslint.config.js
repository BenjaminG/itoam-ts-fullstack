import eslint from '@eslint/js'
import typescriptEslint from 'typescript-eslint'
import configPrettier from 'eslint-config-prettier'
import pluginUnusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'

const react = typescriptEslint.config(
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
    name: 'react',
    ...pluginReact.configs.flat.recommended,
  },
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
    ...pluginReact.configs.flat['jsx-runtime'],
  },
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: pluginReactHooks.configs.recommended.rules,
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
)

const javascript = typescriptEslint.config({
  files: ['**/*.{js,ts,tsx,mjs}'],
  languageOptions: {
    globals: {
      ...globals.nodeBuiltin,
    },
  },
  name: 'javascript',
  rules: eslint.configs.recommended.rules,
})

const unusedImports = typescriptEslint.config({
  plugins: {
    'unused-imports': pluginUnusedImports,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
  },
})

const typescriptRules = typescriptEslint.config({
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
      },
    ],
    '@typescript-eslint/no-confusing-void-expression': [
      'error',
      {
        ignoreArrowShorthand: true,
      },
    ],
    // https://typescript-eslint.io/rules/no-misused-promises/#checksvoidreturn
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    // Warn until we fix discuss about it
    '@typescript-eslint/no-unnecessary-type-parameters': 'warn',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowBoolean: true,
        allowNumber: true,
      },
    ],
  },
})

// https://typescript-eslint.io/users/configs#disable-type-checked
// Must be after typescript eslint config
const disabledTypecheck = typescriptEslint.config({
  files: ['**/*.{js,cjs,mjs}'],
  ...typescriptEslint.configs.disableTypeChecked,
})

const typescriptParser = {
  languageOptions: {
    parserOptions: {
      // https://typescript-eslint.io/blog/announcing-typescript-eslint-v8-beta#project-service
      // For faster linting
      projectService: {
        allowDefaultProject: ['*.js'],
      },
    },
  },
}

export default typescriptEslint.config(
  ...javascript,
  ...react,
  ...typescriptEslint.configs.strictTypeChecked,
  ...typescriptEslint.configs.stylisticTypeChecked,
  ...typescriptRules,
  ...unusedImports,
  typescriptParser,
  configPrettier,
  ...disabledTypecheck,
  {
    ignores: ['**/dist', '**/build'],
  }
)

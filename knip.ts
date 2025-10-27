import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    'apps/web': {
      ignoreDependencies: ['tailwindcss', '@radix-ui/react-separator'],
    },
    'packages/ui': {
      ignoreDependencies: ['tailwindcss', 'tw-animate-css'],
    },
  },
  ignore: ['packages/typescript-config/tsconfig.react.json', 'template/**'],
  ignoreFiles: ['apps/web/src/components/ui/separator.tsx'],
  ignoreIssues: {
    'apps/web/src/components/ui/**': ['exports'],
  },
} satisfies KnipConfig

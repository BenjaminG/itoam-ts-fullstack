import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    'apps/web': {
      ignoreDependencies: ['tailwindcss'],
    },
    'packages/ui': {
      ignoreDependencies: ['tailwindcss', 'tw-animate-css'],
    },
  },
  ignore: ['packages/typescript-config/tsconfig.react.json'],
} satisfies KnipConfig

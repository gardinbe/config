import { type UserConfig } from 'tsdown'

const config: UserConfig = {
  clean: true,
  dts: true,
  entry: {
    'cli/index': 'src/cli/index.ts',
    'oxfmt/config': 'src/oxfmt/config.ts',
    'oxlint/config': 'src/oxlint/config.ts',
    'stylelint/config': 'src/stylelint/config.ts',
  },
  format: 'esm',
  outDir: 'dist',
}

export default config

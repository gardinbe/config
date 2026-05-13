import { type OxfmtConfig } from 'oxfmt'

export const config: OxfmtConfig = {
  arrowParens: 'avoid',
  ignorePatterns: ['dist'],
  jsdoc: true,
  jsxSingleQuote: true,
  printWidth: 80,
  semi: false,
  singleAttributePerLine: true,
  singleQuote: true,
  sortImports: true,
}

export default config

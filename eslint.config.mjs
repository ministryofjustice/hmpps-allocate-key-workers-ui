import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets', 'hardcodeCheck.js'],
    extraPathsAllowingDevDependencies: ['.allowed-scripts.mjs'],
  }),
  {
    rules: {
      'dot-notation': 'off',
      'import/prefer-default-export': 0,
    },
  },
]

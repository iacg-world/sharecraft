module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
  },
  transformIgnorePatterns: ['/!node_modules\\/lodash-es/'],
}

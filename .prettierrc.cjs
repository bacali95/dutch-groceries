/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 100,
  singleQuote: true,
  importOrder: ['^~/generated/(.*)$', '^~/(.*)', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
};

// @ts-check
const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = tseslint.config(
  {
    ignores: ["lib/**/*", "**/__tests__/**/*"],
  },
  tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      quotes: ["error", "double"],
      "import/no-unresolved": 0,
      "@typescript-eslint/explicit-module-boundary-types": 0,
    },
  },
  prettierConfig,
);

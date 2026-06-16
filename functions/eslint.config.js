const tseslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");
const importPlugin = require("eslint-plugin-import");

module.exports = tseslint.config(
  { ignores: ["lib/**", "**/__tests__/**", "eslint.config.js", "jest.config.js"] },
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ["tsconfig.json"],
        sourceType: "module",
      },
    },
    rules: {
      quotes: ["error", "double"],
      "import/no-unresolved": 0,
      "@typescript-eslint/explicit-module-boundary-types": 0,
      // Slack event/client objects are intentionally loosely typed in places.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },
  eslintConfigPrettier
);

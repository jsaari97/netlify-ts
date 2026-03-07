import typescriptEslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: ["coverage/**", "lib/**"],
  },
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
    },
  },
];

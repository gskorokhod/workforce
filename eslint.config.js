import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...eslintPluginSvelte.configs["flat/base"],
  ...eslintPluginSvelte.configs["flat/recommended"],
  ...eslintPluginSvelte.configs["flat/prettier"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        project: "tsconfig.json",
        extraFileExtensions: [".svelte"],
        svelteFeatures: {
          experimentalGenerics: true,
        },
      },
    },
  },
  {
    ignores: ["build/", ".svelte-kit/", "dist/"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_|^\\$\\$",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_|^\\$\\$",
          destructuredArrayIgnorePattern: "^_|^\\$\\$",
          varsIgnorePattern: "^_|^\\$\\$",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-empty-function": [
        "error",
        {
          allow: ["arrowFunctions"],
        },
      ],
      "@typescript-eslint/no-non-null-assertion": ["warn"],
    },
  },
];

import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import sonarjs from "eslint-plugin-sonarjs";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  sonarjs.configs.recommended,
  {
    rules: {
      "sonarjs/no-duplicate-string": "warn"
    }
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    ignores: ["build/", ".svelte-kit/", "dist/", "src/lib/components/ui"]
  }
];

import { defineConfig } from "eslint/config";

export default defineConfig({
  root: true,
  overrides: [
    {
      files: ["**/*.{ts,cts,mts,tsx,js,mjs,cjs}"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
      ],
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: "./tsconfig.json"
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
      settings: {
      },
    },

    {
      files: ["**/*.{js,mjs,cjs}"],
      env: { browser: true, node: true },
      extends: ["eslint:recommended"]
    }
  ]
});

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import playwright from 'eslint-plugin-playwright'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['tests/**'],
    extends: [playwright.configs['flat/recommended']],
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;

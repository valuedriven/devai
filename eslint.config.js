import sonarjs from "eslint-plugin-sonarjs";

export default [
  sonarjs.configs.recommended,

  {
    files: ["apps/backend/*"],
    ignores: ["dist/**", "node_modules/**", "coverage/**"]
  },
  {
    files: ["apps/frontend/*"],
    ignores: [".next/**", "node_modules/**", "coverage/**", "playwright-report/**", "test-results/**"]
  }
];

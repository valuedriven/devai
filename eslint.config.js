import sonarjs from "eslint-plugin-sonarjs";

export default [
  sonarjs.configs.recommended,
  {
    ignores: ["**/.next/**", "**/dist/**", "**/build/**", "**/node_modules/**", "**/coverage/**", "**/ *.config.js"]
  },

  {
    files: ["apps/backend/src*"],
  },
  {
    files: ["apps/frontend/src*"],
    ignores: ["playwright-report/**", "test-results/**"]
  }
];

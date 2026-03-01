import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import pluginOxlint from "eslint-plugin-oxlint";
import skipFormatting from "eslint-config-prettier/flat";

export default defineConfig(
  {
    name: "app/files-to-lint",
    files: ["**/*.{js,cjs,mjs,jsx,ts,mts,tsx}"],
  },

  globalIgnores(["**/dist/**", "**/coverage/**"]),

  ...tseslint.configs.recommended,

  ...pluginOxlint.buildFromOxlintConfigFile(".oxlintrc.json"),

  skipFormatting
);

import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginOxlint from "eslint-plugin-oxlint";
import skipFormatting from "eslint-config-prettier/flat";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const frontConfigs = defineConfigWithVueTs(
  {
    name: "front/files-to-lint",
    files: ["front/**/*.{vue,ts,mts,tsx}"],
  },
  ...pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  {
    files: ["front/**/*.{vue,ts,mts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.app.json", "./tsconfig.node.json"],
        tsconfigRootDir: path.join(__dirname, "front"),
        extraFileExtensions: [".vue"],
      }
    }
  }
).map(cfg => {
  if (!cfg.files && !cfg.ignores) {
    return { ...cfg, files: ["front/**/*.{vue,ts,mts,tsx}"] };
  }
  return cfg;
});

export default [
  globalIgnores([
    "**/dist/**",
    "**/dist-ssr/**",
    "**/coverage/**",
    "front/src/generated/**",
    "back/src/generated/**",
    "front/auto-imports.d.ts",
    "front/components.d.ts",
    "back/prisma.config.ts",
    "back/prisma/**/*",
    ".turbo/**"
  ]),

  // BACKEND CONFIG
  ...tseslint.config(
    {
      files: ["back/**/*.{js,cjs,mjs,jsx,ts,mts,tsx}"],
      extends: [
        ...tseslint.configs.recommended
      ],
      languageOptions: {
        parserOptions: {
          project: ["./tsconfig.json"],
          tsconfigRootDir: path.join(__dirname, "back"),
        }
      }
    }
  ),

  // FRONTEND CONFIG
  ...frontConfigs,

  // SHARED OXLINT CONFIG
  ...pluginOxlint.buildFromOxlintConfigFile(".oxlintrc.json"),

  // PRETTIER IGNORE
  skipFormatting,
];

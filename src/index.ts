import type { ESLint } from "eslint";
import { readFileSync } from "node:fs";
import { preferAliasPaths } from "./rules/prefer-alias-paths.js";

type PackageJson = {
  name: string;
  version: string;
};

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as PackageJson;

const plugin = {
  meta: {
    name: packageJson.name,
    namespace: "alias-paths",
    version: packageJson.version,
  },
  rules: {
    "prefer-alias-paths": preferAliasPaths,
  },
} satisfies ESLint.Plugin;

export default plugin;

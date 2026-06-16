import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import plugin from "../src/index.js";

type PackageJson = {
  name: string;
  version: string;
};

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as PackageJson;

describe("plugin entrypoint", () => {
  it("uses package metadata for plugin meta", () => {
    expect(plugin.meta?.name).toBe(packageJson.name);
    expect(plugin.meta?.version).toBe(packageJson.version);
    expect(plugin.meta?.namespace).toBe("alias-paths");
  });

  it("exports prefer-alias-paths rule", () => {
    expect(plugin.rules?.["prefer-alias-paths"]).toBeDefined();
  });
});

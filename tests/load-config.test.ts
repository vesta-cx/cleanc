/** @format */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../src/load-config.js";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, ".test-temp");

beforeEach(() => {
  mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("loadConfig", () => {
  it("loads default config when no config file exists", async () => {
    const config = await loadConfig(tempDir);

    expect(config.clean).toEqual([".turbo", ".wrangler", ".svelte-kit", "dist"]);
    expect(config.installClean).toEqual([".turbo", ".wrangler", ".svelte-kit", "dist", "node_modules"]);
    expect(config.buildClean).toEqual([".turbo", ".wrangler", ".svelte-kit", "dist"]);
    expect(config.devClean).toEqual([".turbo", ".wrangler", ".svelte-kit", "dist"]);
  });

  it("loads config from .cleancrc.json", async () => {
    const configPath = path.join(tempDir, ".cleancrc.json");
    writeFileSync(
      configPath,
      JSON.stringify({
        clean: [".custom", "dist"],
        installClean: [".custom", "dist", "node_modules"],
      })
    );

    const config = await loadConfig(tempDir);

    expect(config.clean).toEqual([".custom", "dist"]);
    expect(config.installClean).toEqual([".custom", "dist", "node_modules"]);
    expect(config.buildClean).toEqual([".turbo", ".wrangler", ".svelte-kit", "dist"]); // defaults
    expect(config.devClean).toEqual([".turbo", ".wrangler", ".svelte-kit", "dist"]); // defaults
  });

  it("loads config from package.json cleanc key", async () => {
    const packageJsonPath = path.join(tempDir, "package.json");
    writeFileSync(
      packageJsonPath,
      JSON.stringify({
        name: "test",
        cleanc: {
          clean: [".build"],
        },
      })
    );

    const config = await loadConfig(tempDir);

    expect(config.clean).toEqual([".build"]);
    expect(config.installClean).toContain("node_modules"); // default
  });

  it("supports backward compatibility with vesta:clean", async () => {
    const packageJsonPath = path.join(tempDir, "package.json");
    writeFileSync(
      packageJsonPath,
      JSON.stringify({
        name: "test",
        "vesta:clean": {
          dirs: [".legacy"],
        },
      })
    );

    const config = await loadConfig(tempDir);

    expect(config.clean).toEqual([".legacy"]);
  });
});

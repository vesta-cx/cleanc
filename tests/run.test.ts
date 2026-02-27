/** @format */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runClean } from "../src/run.js";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, ".test-temp-run");

beforeEach(() => {
  mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("runClean", () => {
  it("deletes directories specified in config", async () => {
    const toClean = path.join(tempDir, ".turbo");
    mkdirSync(toClean, { recursive: true });
    writeFileSync(path.join(toClean, "test.txt"), "test");

    const config = {
      clean: [".turbo"],
      installClean: [".turbo", "node_modules"],
      buildClean: [".turbo"],
      devClean: [".turbo"],
    };

    await runClean(config, { command: "clean", cwd: tempDir });

    expect(existsSync(toClean)).toBe(false);
  });

  it("uses installClean dirs for install:clean command", async () => {
    const turbo = path.join(tempDir, ".turbo");
    const nm = path.join(tempDir, "node_modules");
    mkdirSync(turbo, { recursive: true });
    mkdirSync(nm, { recursive: true });

    const config = {
      clean: [".turbo"],
      installClean: [".turbo", "node_modules"],
      buildClean: [".turbo"],
      devClean: [".turbo"],
    };

    await runClean(config, { command: "install:clean", cwd: tempDir });

    expect(existsSync(turbo)).toBe(false);
    expect(existsSync(nm)).toBe(false);
  });

  it("allows CLI dirs override", async () => {
    const custom = path.join(tempDir, ".custom");
    const turbo = path.join(tempDir, ".turbo");
    mkdirSync(custom, { recursive: true });
    mkdirSync(turbo, { recursive: true });

    const config = {
      clean: [".turbo"],
      installClean: [".turbo"],
      buildClean: [".turbo"],
      devClean: [".turbo"],
    };

    await runClean(config, { command: "clean", cwd: tempDir, dirs: [".custom"] });

    expect(existsSync(custom)).toBe(false);
    expect(existsSync(turbo)).toBe(true); // Should not be deleted
  });

  it("prevents path traversal attacks", async () => {
    const config = {
      clean: [".turbo"],
      installClean: [".turbo"],
      buildClean: [".turbo"],
      devClean: [".turbo"],
    };

    await expect(async () => {
      await runClean(config, { command: "clean", cwd: tempDir, dirs: ["../../../etc/passwd"] });
    }).rejects.toThrow("Path traversal detected");
  });

  it("silently ignores missing directories", async () => {
    const config = {
      clean: [".turbo", ".nonexistent"],
      installClean: [".turbo"],
      buildClean: [".turbo"],
      devClean: [".turbo"],
    };

    // Should not throw even though .nonexistent doesn't exist
    await expect(async () => {
      await runClean(config, { command: "clean", cwd: tempDir });
    }).resolves.not.toThrow();
  });
});

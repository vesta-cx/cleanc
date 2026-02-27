/** @format */

import { cosmiconfig } from "cosmiconfig";
import path from "path";

export interface CleanConfig {
  clean?: string[];
  installClean?: string[];
  buildClean?: string[];
  devClean?: string[];
}

export interface NormalizedConfig {
  clean: string[];
  installClean: string[];
  buildClean: string[];
  devClean: string[];
}

const DEFAULT_DIRS = [".turbo", ".wrangler", ".svelte-kit", "dist"];

export async function loadConfig(cwd: string = process.cwd()): Promise<NormalizedConfig> {
  const explorer = cosmiconfig("cleanc", {
    searchPlaces: [
      ".cleancrc",
      ".cleancrc.json",
      ".cleancrc.yaml",
      ".cleancrc.yml",
      ".cleancrc.cjs",
      ".cleancrc.mjs",
      ".cleancrc.js",
      "cleanc.config.cjs",
      "cleanc.config.mjs",
      "cleanc.config.js",
      "package.json",
    ],
  });

  const result = await explorer.search(cwd);

  let config: CleanConfig = {};

  if (result?.config) {
    config = result.config;
  } else {
    // Check for backward compatibility with vesta:clean or cleanDirs in package.json
    try {
      const packageJsonPath = path.join(cwd, "package.json");
      const fs = await import("fs");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      if (packageJson["vesta:clean"]?.dirs) {
        config.clean = packageJson["vesta:clean"].dirs;
      } else if (packageJson.cleanDirs) {
        config.clean = packageJson.cleanDirs;
      }
    } catch {
      // Silently ignore if package.json doesn't exist or can't be parsed
    }
  }

  // Normalize config with defaults
  return {
    clean: config.clean ?? DEFAULT_DIRS,
    installClean: config.installClean ?? [...DEFAULT_DIRS, "node_modules"],
    buildClean: config.buildClean ?? DEFAULT_DIRS,
    devClean: config.devClean ?? DEFAULT_DIRS,
  };
}

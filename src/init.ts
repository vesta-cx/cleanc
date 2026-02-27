/** @format */

import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export interface InitOptions {
  cwd?: string;
  skipDeps?: boolean;
}

/**
 * Detect package manager from lockfile.
 */
function detectPackageManager(cwd: string): "pnpm" | "npm" | "yarn" {
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(cwd, "package-lock.json"))) return "npm";
  return "pnpm"; // Default
}

/**
 * Check if cleanc config exists.
 */
function hasCleanConfig(cwd: string): boolean {
  // Check for rc files
  const rcFiles = [".cleancrc", ".cleancrc.json", ".cleancrc.yaml", ".cleancrc.yml", ".cleancrc.cjs", ".cleancrc.mjs", ".cleancrc.js"];
  if (rcFiles.some((f) => existsSync(path.join(cwd, f)))) return true;

  // Check for cleanc.config.*
  const configFiles = ["cleanc.config.cjs", "cleanc.config.mjs", "cleanc.config.js"];
  if (configFiles.some((f) => existsSync(path.join(cwd, f)))) return true;

  // Check package.json for cleanc key
  try {
    const packageJsonPath = path.join(cwd, "package.json");
    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      if (pkg.cleanc) return true;
    }
  } catch {
    // Ignore
  }

  return false;
}

/**
 * Create default .cleancrc.json config.
 */
function createDefaultConfig(cwd: string): void {
  if (hasCleanConfig(cwd)) {
    return; // Don't overwrite existing config
  }

  const config = {
    clean: [".turbo", ".wrangler", ".svelte-kit", "dist"],
    installClean: [".turbo", ".wrangler", ".svelte-kit", "dist", "node_modules"],
    buildClean: [".turbo", ".wrangler", ".svelte-kit", "dist"],
    devClean: [".turbo", ".wrangler", ".svelte-kit", "dist"],
  };

  const configPath = path.join(cwd, ".cleancrc.json");
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Created: .cleancrc.json`);
}

/**
 * Add or update npm scripts in package.json.
 */
function addScripts(cwd: string): void {
  const packageJsonPath = path.join(cwd, "package.json");
  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  const scriptsToAdd = {
    clean: "cleanc clean",
    "install:clean": "cleanc install:clean && pnpm i",
    "build:clean": "cleanc build:clean && pnpm run build",
    "dev:clean": "cleanc dev:clean && pnpm run dev",
  };

  // Only add scripts if they're missing
  let modified = false;
  for (const [key, value] of Object.entries(scriptsToAdd)) {
    if (!pkg.scripts?.[key]) {
      if (!pkg.scripts) pkg.scripts = {};
      pkg.scripts[key] = value;
      modified = true;
    }
  }

  if (modified) {
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
    console.log(`Added scripts: ${Object.keys(scriptsToAdd).filter((k) => !pkg.scripts[k]).join(", ")}`);
  }
}

/**
 * Initialize cleanc in a project.
 */
export async function initCleanc(options: InitOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();

  console.log(`Initializing cleanc in ${cwd}`);

  // Create default config if none exists
  createDefaultConfig(cwd);

  // Add scripts to package.json
  try {
    addScripts(cwd);
  } catch (error) {
    console.error("Failed to add scripts:", error);
  }

  console.log("✓ cleanc initialized");
}

/** @format */

import path from "path";
import { rimraf } from "rimraf";

export interface RunOptions {
  command: "clean" | "install:clean" | "build:clean" | "dev:clean";
  cwd?: string;
  dirs?: string[];
}

/**
 * Resolve a directory path relative to cwd, ensuring it doesn't escape cwd.
 */
function resolveDir(dir: string, cwd: string): string {
  const resolved = path.resolve(cwd, dir);

  // Check if the resolved path is under cwd
  const relative = path.relative(cwd, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path traversal detected: ${dir} attempts to escape ${cwd}`);
  }

  return resolved;
}

/**
 * Delete directories based on command and optional override.
 */
export async function runClean(
  config: { clean: string[]; installClean: string[]; buildClean: string[]; devClean: string[] },
  options: RunOptions
): Promise<void> {
  const cwd = options.cwd ?? process.cwd();

  // Get the dirs to clean based on command
  let dirsToClean: string[];

  if (options.dirs) {
    // CLI override takes precedence
    dirsToClean = options.dirs;
  } else {
    // Use config-based dirs by command
    switch (options.command) {
      case "install:clean":
        dirsToClean = config.installClean;
        break;
      case "build:clean":
        dirsToClean = config.buildClean;
        break;
      case "dev:clean":
        dirsToClean = config.devClean;
        break;
      case "clean":
      default:
        dirsToClean = config.clean;
        break;
    }
  }

  // Resolve paths and delete
  for (const dir of dirsToClean) {
    try {
      const resolvedPath = resolveDir(dir, cwd);
      await rimraf(resolvedPath, { force: true });
      console.log(`Removed: ${dir}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Path traversal")) {
        throw error;
      }
      // Silently ignore if dir doesn't exist or can't be deleted
    }
  }
}

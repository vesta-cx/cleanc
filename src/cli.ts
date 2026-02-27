#!/usr/bin/env node

/** @format */

import { loadConfig } from "./load-config.js";
import { runClean } from "./run.js";
import { initCleanc } from "./init.js";

interface ParsedArgs {
  command: "clean" | "install:clean" | "build:clean" | "dev:clean" | "init";
  cwd?: string;
  dirs?: string[];
}

/**
 * Parse command-line arguments.
 */
function parseArgs(args: string[]): ParsedArgs {
  let command: ParsedArgs["command"] = "clean";
  let cwd: string | undefined;
  let dirs: string[] | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--cwd" && args[i + 1]) {
      cwd = args[++i];
    } else if (arg.startsWith("--cwd=")) {
      cwd = arg.slice(6);
    } else if (arg === "--dirs" && args[i + 1]) {
      dirs = args[++i].split(",").map((d) => d.trim());
    } else if (arg.startsWith("--dirs=")) {
      dirs = arg.slice(7).split(",").map((d) => d.trim());
    } else if (!arg.startsWith("--") && (arg === "init" || arg === "clean" || arg === "install:clean" || arg === "build:clean" || arg === "dev:clean")) {
      command = arg;
    }
  }

  return { command, cwd, dirs };
}

/**
 * Main CLI entry point.
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  try {
    if (parsed.command === "init") {
      await initCleanc({ cwd: parsed.cwd });
    } else {
      const config = await loadConfig(parsed.cwd);
      await runClean(config, {
        command: parsed.command,
        cwd: parsed.cwd,
        dirs: parsed.dirs,
      });
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

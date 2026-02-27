/** @format */

export type CleanMode = "delete" | "contentsOnly";
export type CleanStrategy = "sequential" | "parallel";
export type CleanReportMode = "none" | "summary" | "json";

export interface CleanEntryConfig {
  include: string[];
  exclude?: string[];
  tags?: string[];
  enabled?: boolean;
  mode?: CleanMode;
  dryRun?: boolean;
  confirm?: boolean;
  interactive?: boolean;
  verbose?: boolean;
  ignoreErrors?: boolean;
  protect?: string[];
  strategy?: CleanStrategy;
  force?: boolean;
  cwd?: string;
  report?: CleanReportMode;
}

export type CleanCommandsMap = Record<string, CleanEntryConfig>;

/**
 * Built-in command templates for popular tools/frameworks.
 * These are surfaced in init/docs and are not injected implicitly at runtime.
 */
export const BUILT_IN_COMMANDS: CleanCommandsMap = {
  install: {
    include: ["node_modules"],
    tags: ["deps"],
  },
  turbo: {
    include: [".turbo"],
    tags: ["cache", "build"],
  },
  wrangler: {
    include: [".wrangler"],
    tags: ["cache", "cloudflare"],
  },
  svelte: {
    include: [".svelte-kit"],
    tags: ["cache", "svelte"],
  },
  vite: {
    include: ["node_modules/.vite"],
    tags: ["cache", "vite"],
  },
  storybook: {
    include: [".storybook-cache", "storybook-static"],
    tags: ["cache", "storybook"],
  },
  next: {
    include: [".next"],
    tags: ["cache", "next"],
  },
};

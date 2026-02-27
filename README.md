# cleanc

Clean build outputs and cache directories with Prettier-style config discovery and per-command support.

A lightweight CLI tool that helps monorepo workspaces and projects manage cleanup of build artifacts, cache directories, and temporary files with minimal friction.

## Features

- **Prettier-style config discovery**: `.cleancrc`, `.cleancrc.json`, `cleanc.config.js`, or `package.json` key
- **Per-command cleanup**: different directories for `clean`, `install:clean`, `build:clean`, `dev:clean`
- **CLI overrides**: pass `--dirs=...` to override config for a single run
- **Path safety**: prevents path traversal attacks
- **Backward compatible**: supports existing `vesta:clean` or `cleanDirs` configs

## Installation

```bash
# In a monorepo workspace
pnpm i -D cleanc

# Or globally
npm install -g cleanc
```

## Quick Start

### Initialize a project

```bash
cleanc init
```

This creates a `.cleancrc.json` with sensible defaults and adds npm scripts to `package.json`.

### Basic usage

```bash
# Clean build outputs
cleanc clean

# or in package.json scripts
npm run clean
```

## Configuration

### File names

Cleanc searches for config files in this order:

1. `.cleancrc` or `.cleancrc.json` / `.cleancrc.yaml` / `.cleancrc.yml`
2. `.cleancrc.cjs` / `.cleancrc.mjs` / `.cleancrc.js`
3. `cleanc.config.cjs` / `cleanc.config.mjs` / `cleanc.config.js`
4. `package.json` → `cleanc` key

The first file found is used (no merging).

### Example `.cleancrc.json`

```json
{
  "clean": [".turbo", ".wrangler", ".svelte-kit", "dist"],
  "installClean": [".turbo", ".wrangler", ".svelte-kit", "dist", "node_modules"],
  "buildClean": [".turbo", ".wrangler", ".svelte-kit", "dist"],
  "devClean": [".turbo", ".wrangler", ".svelte-kit", "dist"]
}
```

### Example `package.json`

```json
{
  "name": "my-app",
  "cleanc": {
    "clean": [".turbo", "dist"],
    "installClean": [".turbo", "dist", "node_modules"]
  },
  "scripts": {
    "clean": "cleanc clean",
    "install:clean": "cleanc install:clean && pnpm i",
    "build:clean": "cleanc build:clean && pnpm run build",
    "dev:clean": "cleanc dev:clean && pnpm run dev"
  }
}
```

## CLI Reference

### Commands

```bash
cleanc [command] [options]
```

#### `clean` (default)

Delete directories specified in config's `clean` array.

```bash
cleanc clean
cleanc          # same as cleanc clean
```

#### `install:clean`

Delete directories in config's `installClean` array (typically including `node_modules`).

```bash
cleanc install:clean
```

#### `build:clean`

Delete directories in config's `buildClean` array.

```bash
cleanc build:clean
```

#### `dev:clean`

Delete directories in config's `devClean` array.

```bash
cleanc dev:clean
```

#### `init`

Initialize cleanc in the current project:

- Detects package manager (pnpm/npm/yarn)
- Creates `.cleancrc.json` with defaults (if no config exists)
- Adds `clean`, `install:clean`, `build:clean`, `dev:clean` scripts to `package.json` (if missing)

```bash
cleanc init
pnpm dlx cleanc init   # Before installing cleanc locally
```

### Options

#### `--dirs=dir1,dir2`

Override config directories for this run:

```bash
cleanc clean --dirs=.turbo,.cache
cleanc clean --dirs .turbo,.cache   # space-separated also works
```

#### `--cwd=path`

Use an alternative working directory:

```bash
cleanc clean --cwd=/path/to/project
cleanc init --cwd=packages/my-app
```

## npm Scripts Example

Add these to your `package.json`:

```json
{
  "scripts": {
    "clean": "cleanc clean",
    "build:clean": "cleanc build:clean && pnpm run build",
    "dev:clean": "cleanc dev:clean && pnpm run dev",
    "install:clean": "cleanc install:clean && pnpm i"
  }
}
```

Then run:

```bash
npm run clean
npm run install:clean
npm run dev:clean
```

## Defaults

If a config key is not specified, cleanc uses:

```
clean:         ['.turbo', '.wrangler', '.svelte-kit', 'dist']
installClean:  ['.turbo', '.wrangler', '.svelte-kit', 'dist', 'node_modules']
buildClean:    ['.turbo', '.wrangler', '.svelte-kit', 'dist']
devClean:      ['.turbo', '.wrangler', '.svelte-kit', 'dist']
```

## Backward Compatibility

If you have an existing `package.json` with:

```json
{
  "vesta:clean": { "dirs": [".custom"] },
  "cleanDirs": [".old"]
}
```

Cleanc will use these as a fallback for the `clean` list until you migrate to the `cleanc` key.

## Safety

- **Path traversal prevention**: Cleanc validates that all resolved directory paths remain under `cwd`. Paths like `../../../etc/passwd` are rejected.
- **Force removal**: Uses `rimraf` for cross-platform, safe recursive deletion.
- **Silently ignores missing dirs**: If a directory doesn't exist, deletion is skipped (no error).

## API (Programmatic)

```typescript
import { loadConfig, runClean } from 'cleanc';

// Load config from cwd
const config = await loadConfig(process.cwd());

// Run cleanup
await runClean(config, {
  command: 'clean',
  cwd: process.cwd(),
  dirs: ['.turbo', 'dist']  // optional override
});
```

## Contributing

This is part of the Vesta monorepo. For issues or contributions, see the main repo.

## License

MIT

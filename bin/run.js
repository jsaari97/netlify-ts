#!/usr/bin/env node

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliEntry = resolve(root, "lib/cli.js");

if (!existsSync(cliEntry)) {
  console.error("Build output not found. Run `npm run build` first.");
  process.exit(1);
}

const { run } = await import(pathToFileURL(cliEntry).href);
await run();

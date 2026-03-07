import { spawnSync } from "node:child_process";
import { mkdtempSync, copyFileSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(srcDir, "..");
const runScript = path.resolve(projectRoot, "bin/run.js");

const runNode = (args: string[], cwd: string) =>
  spawnSync(process.execPath, args, {
    cwd,
    encoding: "utf8",
  });

describe("ESM integration", () => {
  beforeAll(() => {
    const result = spawnSync("npm", ["run", "build"], {
      cwd: projectRoot,
      encoding: "utf8",
    });

    if (result.status !== 0) {
      throw new Error(`Build failed:\n${result.stderr || result.stdout}`);
    }
  });

  it("exposes the package through ESM exports", () => {
    const result = runNode(
      [
        "--input-type=module",
        "-e",
        "import createNetlifyTypes from 'netlify-ts'; console.log(typeof createNetlifyTypes);",
      ],
      projectRoot,
    );

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("function");
  });

  it("runs CLI through bin entry and writes output", () => {
    const workdir = mkdtempSync(path.join(projectRoot, ".tmp-netlify-ts-cli-"));
    const outputPath = `${path.basename(workdir)}/types.ts`;
    const outputFile = path.resolve(projectRoot, outputPath);

    const result = runNode(
      [runScript, path.resolve(projectRoot, "kitchen-sink.yml"), outputPath],
      projectRoot,
    );

    expect(result.status).toBe(0);
    expect(existsSync(outputFile)).toBe(true);
    expect(readFileSync(outputFile, "utf8")).toContain("export interface");

    rmSync(workdir, { recursive: true, force: true });
  });

  it("fails with a clear error when build output is missing", () => {
    const workdir = mkdtempSync(path.join(tmpdir(), "netlify-ts-bin-missing-"));
    const bindir = path.join(workdir, "bin");

    mkdirSync(bindir, { recursive: true });
    copyFileSync(runScript, path.join(bindir, "run.js"));

    const result = runNode([path.join(bindir, "run.js")], workdir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Build output not found.");

    rmSync(workdir, { recursive: true, force: true });
  });

  it("loads and executes lib/cli.js from the bin entrypoint", () => {
    const workdir = mkdtempSync(path.join(tmpdir(), "netlify-ts-bin-wire-"));
    const bindir = path.join(workdir, "bin");
    const libdir = path.join(workdir, "lib");

    mkdirSync(bindir, { recursive: true });
    mkdirSync(libdir, { recursive: true });

    copyFileSync(runScript, path.join(bindir, "run.js"));
    writeFileSync(path.join(libdir, "cli.js"), 'export const run = async () => { console.log("RUN_OK"); };');

    const result = runNode([path.join(bindir, "run.js")], workdir);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("RUN_OK");

    rmSync(workdir, { recursive: true, force: true });
  });
});

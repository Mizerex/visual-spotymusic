import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nextCli = resolve(projectRoot, "node_modules", "next", "dist", "bin", "next");
const build = spawnSync(process.execPath, [nextCli, "build"], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const distRoot = resolve(projectRoot, "dist");
rmSync(distRoot, { force: true, recursive: true });
mkdirSync(resolve(distRoot, "server"), { recursive: true });
mkdirSync(resolve(distRoot, ".openai"), { recursive: true });
mkdirSync(resolve(distRoot, "client"), { recursive: true });

cpSync(resolve(projectRoot, "out"), resolve(distRoot, "client"), { recursive: true });
cpSync(resolve(projectRoot, "worker", "index.js"), resolve(distRoot, "server", "index.js"));
cpSync(
  resolve(projectRoot, ".openai", "hosting.json"),
  resolve(distRoot, ".openai", "hosting.json"),
);

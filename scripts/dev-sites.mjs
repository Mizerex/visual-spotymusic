import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const received = process.argv.slice(2);
const forwarded = ["dev"];

for (let index = 0; index < received.length; index += 1) {
  const argument = received[index];
  if (argument === "--strictPort") continue;
  if (argument === "--host") {
    forwarded.push("--hostname", received[index + 1]);
    index += 1;
    continue;
  }
  if (argument.startsWith("--host=")) {
    forwarded.push(`--hostname=${argument.slice("--host=".length)}`);
    continue;
  }
  forwarded.push(argument);
}

const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [nextBin, ...forwarded], { stdio: "inherit" });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", code => {
  process.exitCode = code ?? 1;
});

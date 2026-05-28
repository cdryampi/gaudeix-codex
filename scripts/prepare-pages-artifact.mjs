import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, ".pages-dist");
const frontendDist = path.join(root, "frontend", "dist");
const backofficeDist = path.join(root, "backoffice", "dist");
const backofficeOutput = path.join(outputDir, "backoffice");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(frontendDist, outputDir, { recursive: true });
await rm(backofficeOutput, { recursive: true, force: true });
await cp(backofficeDist, backofficeOutput, { recursive: true });

await cp(path.join(outputDir, "index.html"), path.join(outputDir, "404.html"));
await cp(
  path.join(backofficeOutput, "index.html"),
  path.join(backofficeOutput, "404.html"),
);

await writeFile(path.join(outputDir, ".nojekyll"), "");

console.log(`Prepared GitHub Pages artifact at ${outputDir}`);

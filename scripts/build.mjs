import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const dist = join(projectRoot, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(join(projectRoot, "index.html"), join(dist, "index.html"));
await cp(join(projectRoot, "src"), join(dist, "src"), { recursive: true });
await cp(join(projectRoot, "content"), join(dist, "content"), { recursive: true });
await cp(join(projectRoot, "public"), dist, { recursive: true });

for (const route of ["about", "services", "portfolio", "contact"]) {
  await mkdir(join(dist, route), { recursive: true });
  await cp(join(projectRoot, "index.html"), join(dist, route, "index.html"));
}

console.log("Built static site to dist/");

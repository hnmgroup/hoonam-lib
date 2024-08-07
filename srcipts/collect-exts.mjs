import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.resolve(rootDir, "src");
const distDir = path.resolve(rootDir, "dist");
const typesDir = distDir;

const files = globSync("**/*.d.ts", {cwd: srcDir});
let contents = files.reduce(
  (result, fileName) => result + fs.readFileSync(path.resolve(srcDir, fileName), "utf8") + "\n",
  "",
);

// fix import paths
contents = contents.replace(/(['"]).+__target=(.+)(['"])/g, (_, o, target, c) => o + target + c);

!fs.existsSync(typesDir) && fs.mkdirSync(typesDir, { recursive: true });
fs.writeFileSync(path.resolve(typesDir, "extensions.d.ts"), contents, "utf8");

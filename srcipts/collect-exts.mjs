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
let imports = "";
let contents = "";
files.forEach(fileName => {
  const contentLines = fs.readFileSync(path.resolve(srcDir, fileName), "utf8").split(/(\n\r?|\r\n?)/g);
  contentLines.forEach(line => {
    if (line.trim().length === 0) return;
    if (/^export\s*\{\s*}/.test(line.trim())) return;
    if (/^import\s+/.test(line.trim())) {
      // TODO: correct import paths
      imports += line + "\n";
    } else {
      contents += line + "\n";
    }
  });
  contents += "\n";
});
contents += "export {}\n";
contents = imports + "\n" + contents;

!fs.existsSync(typesDir) && fs.mkdirSync(typesDir, { recursive: true });
fs.writeFileSync(path.resolve(typesDir, "extensions.d.ts"), contents, "utf8");

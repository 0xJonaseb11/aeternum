#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const KEEP_COMMENTS_IN = new Set([
  "next.config.ts",
  "scaffold.config.ts",
  "hardhat.config.ts",
  "postcss.config.js",
  "ponder.config.ts",
  ".env.example",
  ".prettierrc.js",
  ".lintstagedrc.js",
  "eslint.config.mjs",
]);
const KEEP_EXT = /\.(sol|d\.ts|env\.example)$/;
const STRIP_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|scss)$/;
const SKIP_DIRS = new Set(["node_modules", ".git", "build", ".next", ".yarn", "dist", "typechain-types"]);

function shouldKeepComments(filePath) {
  const name = path.basename(filePath);
  if (KEEP_COMMENTS_IN.has(name)) return true;
  if (KEEP_EXT.test(filePath)) return true;
  if (filePath.includes("contracts/deployedContracts") || filePath.includes("contracts/externalContracts"))
    return true;
  return false;
}

function stripComments(content) {
  let out = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    const lines = match.split("\n").length;
    return lines > 1 ? "\n".repeat(lines - 1) : "";
  });
  out = out
    .split("\n")
    .map((line) => (line.trimStart().startsWith("//") ? "" : line))
    .join("\n");
  out = out.replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "\n");
  return out.replace(/^\s*\n/gm, "\n").replace(/\n{3,}/g, "\n\n");
}

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(full, cb);
    } else if (STRIP_EXT.test(e.name) && !shouldKeepComments(full)) cb(full);
  }
}

let count = 0;
walk(ROOT, (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const next = stripComments(content);
  if (next !== content) {
    fs.writeFileSync(filePath, next);
    count++;
    console.log(filePath.replace(ROOT + path.sep, ""));
  }
});
console.log("Stripped comments in", count, "files.");

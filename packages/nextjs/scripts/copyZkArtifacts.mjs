#!/usr/bin/env node

/**
 * Copy ZK circuit artifacts from hardhat build to nextjs public/zk
 * so the app can load commitment.wasm and commitment_final.zkey in the browser.
 *
 * Run from repo root after: cd packages/hardhat && npx ts-node scripts/zkSetup.ts setup
 * Or: yarn zk:copy (from repo root or packages/nextjs)
 */
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const hardhatCircuits = join(__dirname, "../../hardhat/build/circuits");
const dest = join(__dirname, "../public/zk");
const wasmSrc = join(hardhatCircuits, "commitment_js/commitment.wasm");
const zkeySrc = join(hardhatCircuits, "commitment_final.zkey");

mkdirSync(dest, { recursive: true });

if (!existsSync(wasmSrc) || !existsSync(zkeySrc)) {
  console.warn(
    "ZK artifacts not found. Run in packages/hardhat: npx ts-node scripts/zkSetup.ts setup\n" +
      "Then run yarn zk:copy again.",
  );
  process.exit(0);
}

copyFileSync(wasmSrc, join(dest, "commitment.wasm"));
copyFileSync(zkeySrc, join(dest, "commitment_final.zkey"));
console.log("ZK artifacts copied to public/zk/");

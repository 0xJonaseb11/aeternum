/**
 * EvidenceVault — Upgrade Script
 *
 * Safely upgrades the UUPS proxy to a new implementation.
 * Validates storage layout before broadcasting to prevent collisions.
 *
 * Usage:
 *   PROXY=0x... npx hardhat run scripts/upgrade.ts --network base
 */

import { ethers, upgrades } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [upgrader] = await ethers.getSigners();
  const PROXY = process.env.PROXY;

  if (!PROXY || !ethers.isAddress(PROXY)) {
    throw new Error("Set PROXY=0x... environment variable");
  }

  const network = await ethers.provider.getNetwork();

  console.log("═══════════════════════════════════════════════════");
  console.log("  EvidenceVault Upgrade");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network  : ${network.name}`);
  console.log(`  Upgrader : ${upgrader.address}`);
  console.log(`  Proxy    : ${PROXY}`);

  const oldImpl = await upgrades.erc1967.getImplementationAddress(PROXY);
  console.log(`  Old impl : ${oldImpl}`);

  // ── Validate storage layout BEFORE deploying ─────────────────────────────
  // This catches any storage collision or incompatible changes.
  console.log("\n[1/3] Validating storage layout compatibility...");
  const V2 = await ethers.getContractFactory("EvidenceVaultV2"); // change to your new contract name
  await upgrades.validateUpgrade(PROXY, V2, { kind: "uups" });
  console.log("      ✓ Storage layout is compatible");

  // ── Deploy new implementation + upgrade proxy ─────────────────────────────
  console.log("\n[2/3] Deploying new implementation + upgrading proxy...");
  const upgraded = await upgrades.upgradeProxy(PROXY, V2, { kind: "uups" });
  await upgraded.waitForDeployment();

  const newImpl = await upgrades.erc1967.getImplementationAddress(PROXY);
  console.log(`      ✓ New implementation: ${newImpl}`);

  // ── Update deployment manifest ────────────────────────────────────────────
  console.log("\n[3/3] Updating deployment manifest...");
  const manifestPath = path.join(__dirname, "../deployments", `${network.name}.json`);

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    manifest.contracts.implementation = newImpl;
    manifest.lastUpgrade = new Date().toISOString();
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`      ✓ Manifest updated: ${manifestPath}`);
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Upgrade Complete");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Proxy unchanged : ${PROXY}`);
  console.log(`  Old impl        : ${oldImpl}`);
  console.log(`  New impl        : ${newImpl}`);
  console.log("\n  Verify new implementation:");
  console.log(`  npx hardhat verify --network ${network.name} ${newImpl}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

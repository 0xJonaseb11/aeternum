import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * EvidenceVault — Full deployment (scaffold style).
 *
 * Deploys in order:
 *   1. CommitmentVerifier (SnarkJS-generated Groth16 verifier)
 *   2. Groth16VerifierWrapper (adapts to IZKVerifier)
 *   3. EvidenceVault UUPS proxy + initialize
 *   4. setZKVerifier(wrapper)
 *   5. transferOwnership(MULTISIG) if MULTISIG env is set
 *
 * Usage:
 *   Full deploy:  yarn deploy  (or yarn deploy --tags EvidenceVaultFull)
 *   With multisig: MULTISIG=0x... yarn deploy
 */
const deployEvidenceVaultFull: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, save } = hre.deployments;
  const { ethers } = hre;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upgrades = (hre as any).upgrades;

  if (!deployer) {
    throw new Error("Missing named account 'deployer'");
  }

  const network = await ethers.provider.getNetwork();
  console.log("═══════════════════════════════════════════════════");
  console.log("  EvidenceVault — Full Deployment");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network  : ${network.name} (chainId ${network.chainId})`);
  console.log(`  Deployer : ${deployer}`);
  console.log(`  Balance  : ${ethers.formatEther(await ethers.provider.getBalance(deployer))} ETH`);
  console.log("───────────────────────────────────────────────────");

  // ── 1. CommitmentVerifier ────────────────────────────────────────────────
  console.log("\n[1/4] Deploying CommitmentVerifier (Groth16)...");
  const verifierResult = await deploy("CommitmentVerifier", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  const verifierAddr = verifierResult.address;
  console.log(`      ✓ CommitmentVerifier: ${verifierAddr}`);

  // ── 2. Groth16VerifierWrapper ────────────────────────────────────────────
  console.log("\n[2/4] Deploying Groth16VerifierWrapper...");
  const wrapperResult = await deploy("Groth16VerifierWrapper", {
    from: deployer,
    args: [verifierAddr],
    log: true,
    autoMine: true,
  });
  const wrapperAddr = wrapperResult.address;
  console.log(`      ✓ Groth16VerifierWrapper: ${wrapperAddr}`);

  // ── 3. EvidenceVault proxy (UUPS) ──────────────────────────────────────
  console.log("\n[3/4] Deploying EvidenceVault (UUPS proxy)...");
  const VaultFactory = await ethers.getContractFactory("EvidenceVault");
  const vault = await upgrades.deployProxy(VaultFactory, [deployer], {
    initializer: "initialize",
    kind: "uups",
    unsafeAllow: ["constructor"], // OZ 5.5 ReentrancyGuard has constructor; we init slot in initialize()
  });
  await vault.waitForDeployment();
  const proxyAddr = await vault.getAddress();
  const implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr);
  const artifact = await hre.deployments.getArtifact("EvidenceVault");
  await save("EvidenceVault", {
    address: proxyAddr,
    abi: artifact.abi,
  });
  console.log(`      ✓ Proxy (use this address): ${proxyAddr}`);
  console.log(`      ✓ Implementation:           ${implAddr}`);

  // ── 4. Wire ZK verifier ─────────────────────────────────────────────────
  console.log("\n[4/4] Wiring ZK verifier into vault...");
  const setTx = await vault.setZKVerifier(wrapperAddr);
  await setTx.wait();
  console.log(`      ✓ zkVerifier set to: ${wrapperAddr}`);

  // ── 5. Transfer ownership to multisig ───────────────────────────────────
  const multisig = process.env.MULTISIG;
  if (multisig && ethers.isAddress(multisig)) {
    console.log(`\n[5/5] Transferring ownership to multisig ${multisig}...`);
    const transferTx = await vault.transferOwnership(multisig);
    await transferTx.wait();
    console.log(`      ✓ Ownership transferred`);
  } else {
    console.log("\n[5/5] ⚠️  MULTISIG env not set — ownership NOT transferred.");
    console.log("         Set MULTISIG=0x... and run vault.transferOwnership(multisig)");
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Deployment Complete");
  console.log("═══════════════════════════════════════════════════");
  console.log(
    JSON.stringify(
      {
        proxy: proxyAddr,
        implementation: implAddr,
        groth16Verifier: verifierAddr,
        groth16VerifierWrapper: wrapperAddr,
        multisig: multisig ?? "NOT_SET",
      },
      null,
      2,
    ),
  );
};

export default deployEvidenceVaultFull;
deployEvidenceVaultFull.tags = ["EvidenceVaultFull"];

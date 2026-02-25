import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys EvidenceVault as UUPS proxy, wires ZK verifier, and optionally
 * transfers ownership to MULTISIG.
 * Depends on Groth16VerifierWrapper being deployed.
 *
 * Deploy alone: yarn deploy --tags EvidenceVaultProxy
 * Set MULTISIG=0x... to transfer ownership after deploy.
 */
const deployEvidenceVaultProxy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { get, getOrNull, save } = hre.deployments;
  const { ethers } = hre;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upgrades = (hre as any).upgrades;

  const existing = await getOrNull("EvidenceVault");
  if (existing) {
    console.log("EvidenceVault already deployed at", existing.address);
    return;
  }

  const wrapperDeployment = await get("Groth16VerifierWrapper");
  const wrapperAddress = wrapperDeployment.address;

  const EvidenceVaultFactory = await ethers.getContractFactory("EvidenceVault");
  const vault = await upgrades.deployProxy(EvidenceVaultFactory, [deployer], {
    initializer: "initialize",
    kind: "uups",
    unsafeAllow: ["constructor"], // OZ 5.5 ReentrancyGuard has constructor; we init slot in initialize()
  });
  await vault.waitForDeployment();
  const proxyAddress = await vault.getAddress();
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  const artifact = await hre.deployments.getArtifact("EvidenceVault");
  await save("EvidenceVault", {
    address: proxyAddress,
    abi: artifact.abi,
  });

  const setTx = await vault.setZKVerifier(wrapperAddress);
  await setTx.wait();

  const multisig = process.env.MULTISIG;
  if (multisig && ethers.isAddress(multisig)) {
    const transferTx = await vault.transferOwnership(multisig);
    await transferTx.wait();
  }
};

export default deployEvidenceVaultProxy;
deployEvidenceVaultProxy.tags = ["EvidenceVaultProxy"];
deployEvidenceVaultProxy.dependencies = ["Groth16VerifierWrapper"];

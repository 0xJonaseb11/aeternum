import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployGroth16VerifierWrapper: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;
  const { ethers } = hre;

  const commitmentVerifier = await get("CommitmentVerifier");
  const verifierAddress = commitmentVerifier.address;

  const wrapperResult = await deploy("Groth16VerifierWrapper", {
    from: deployer,
    args: [verifierAddress],
    log: true,
    autoMine: true,
  });

  try {
    const vaultDeployment = await get("EvidenceVault");
    const vault = await ethers.getContractAt("EvidenceVault", vaultDeployment.address);
    const currentWrapper = await vault.zkVerifier();
    if (currentWrapper !== wrapperResult.address) {
      const tx = await vault.setZKVerifier(wrapperResult.address);
      await tx.wait();
      console.log(`      ✓ Vault zkVerifier updated to ${wrapperResult.address}`);
    }
  } catch {}
};

export default deployGroth16VerifierWrapper;
deployGroth16VerifierWrapper.tags = ["Groth16VerifierWrapper"];
deployGroth16VerifierWrapper.dependencies = ["CommitmentVerifier"];

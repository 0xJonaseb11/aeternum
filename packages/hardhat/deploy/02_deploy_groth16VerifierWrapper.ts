import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys Groth16VerifierWrapper (adapts SnarkJS verifier to IZKVerifier).
 * Depends on CommitmentVerifier being deployed.
 *
 * Deploy alone: yarn deploy --tags Groth16VerifierWrapper
 */
const deployGroth16VerifierWrapper: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const commitmentVerifier = await get("CommitmentVerifier");
  const verifierAddress = commitmentVerifier.address;

  await deploy("Groth16VerifierWrapper", {
    from: deployer,
    args: [verifierAddress],
    log: true,
    autoMine: true,
  });
};

export default deployGroth16VerifierWrapper;
deployGroth16VerifierWrapper.tags = ["Groth16VerifierWrapper"];
deployGroth16VerifierWrapper.dependencies = ["CommitmentVerifier"];

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys CommitmentVerifier (SnarkJS-generated Groth16 verifier).
 * Must be run after circuit trusted setup: npm run zk:setup
 *
 * Deploy alone: yarn deploy --tags CommitmentVerifier
 */
const deployCommitmentVerifier: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("CommitmentVerifier", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

export default deployCommitmentVerifier;
deployCommitmentVerifier.tags = ["CommitmentVerifier"];

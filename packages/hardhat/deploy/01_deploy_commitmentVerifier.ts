import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

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

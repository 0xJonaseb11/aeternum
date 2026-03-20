import * as dotenv from "dotenv";
dotenv.config();
import { Wallet } from "ethers";
import password from "@inquirer/password";
import { spawn } from "child_process";

async function main() {
  const networkIndex = process.argv.indexOf("--network");
  // config.defaultNetwork was removed from HardhatConfig in Hardhat 3.x; fall back to "localhost"
  const networkName = networkIndex !== -1 ? process.argv[networkIndex + 1] : "localhost";

  if (networkName === "localhost" || networkName === "hardhat") {
    const hardhat = spawn("hardhat", ["deploy", ...process.argv.slice(2)], {
      stdio: "inherit",
      env: process.env,
      shell: process.platform === "win32",
    });

    hardhat.on("exit", code => {
      process.exit(code || 0);
    });
    return;
  }

  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;

  if (!encryptedKey) {
    console.log("🚫️ You don't have a deployer account. Run `yarn generate` or `yarn account:import` first");
    return;
  }

  const pass = await password({ message: "Enter password to decrypt private key:" });

  try {
    const wallet = await Wallet.fromEncryptedJson(encryptedKey, pass);
    process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY = wallet.privateKey;

    const hardhat = spawn("hardhat", ["deploy", ...process.argv.slice(2)], {
      stdio: "inherit",
      env: process.env,
      shell: process.platform === "win32",
    });

    hardhat.on("exit", code => {
      process.exit(code || 0);
    });
  } catch {
    console.error("Failed to decrypt private key. Wrong password?");
    process.exit(1);
  }
}

main().catch(console.error);

import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";

const PRIVATE_KEY = process.env.IRYS_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("IRYS_PRIVATE_KEY is not set. Export it before running this script.");
  process.exit(1);
}

const amountEth = process.argv[2] ?? "0.02";

async function main() {
  try {
    const rpcUrl = process.env.IRYS_RPC_URL ?? "https://sepolia.base.org";

    const uploader = await Uploader(BaseEth)
      .withWallet(PRIVATE_KEY)
      .withRpc(rpcUrl)
      .devnet();

    const atomicAmount = uploader.utils.toAtomic(amountEth);

    console.log(`Funding Irys devnet with ${amountEth} Base Sepolia ETH (${atomicAmount} atomic units)...`);
    const fundTx = await uploader.fund(atomicAmount);
    console.log("Fund tx result:", fundTx);

    const balance = await uploader.getBalance();
    console.log("New Irys balance:", uploader.utils.fromAtomic(balance));
  } catch (e) {
    console.error("Funding failed:", e);
    process.exit(1);
  }
}

main();


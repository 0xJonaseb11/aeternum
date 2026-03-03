import { NextRequest, NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";

export async function POST(req: NextRequest) {
  try {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    if (!privateKey) {
      console.error("IRYS_PRIVATE_KEY is not set");
      return NextResponse.json({ error: "Arweave upload misconfigured: IRYS_PRIVATE_KEY is not set" }, { status: 500 });
    }

    const body = await req.arrayBuffer();
    if (!body || body.byteLength === 0) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }

    const rpcUrl = process.env.IRYS_RPC_URL ?? "https://sepolia.base.org";

    const uploader = await Uploader(BaseEth).withWallet(privateKey).withRpc(rpcUrl).devnet();

    const result = await uploader.upload(Buffer.from(body), {
      tags: [{ name: "Content-Type", value: "application/octet-stream" }],
    });

    if (!result?.id) {
      console.error("Irys upload returned no id", result);
      return NextResponse.json({ error: "Arweave upload failed" }, { status: 500 });
    }

    const rawId = String(result.id);
    const ARWEAVE_TX_LEN = 43;
    if (rawId.length < ARWEAVE_TX_LEN) {
      console.error("Irys returned short id", { length: rawId.length, id: rawId });
      return NextResponse.json(
        { error: `Arweave returned invalid transaction id (length ${rawId.length}, expected ${ARWEAVE_TX_LEN})` },
        { status: 500 },
      );
    }
    const txId = rawId.length > ARWEAVE_TX_LEN ? rawId.slice(0, ARWEAVE_TX_LEN) : rawId;

    return NextResponse.json({ txId });
  } catch (error) {
    console.error("Arweave upload error:", error);
    return NextResponse.json({ error: `Arweave upload failed: ${String(error)}` }, { status: 500 });
  }
}

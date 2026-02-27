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

    const uploader = await Uploader(BaseEth).withWallet(privateKey);

    const result = await uploader.upload(Buffer.from(body), {
      tags: [{ name: "Content-Type", value: "application/octet-stream" }],
    });

    if (!result?.id) {
      console.error("Irys upload returned no id", result);
      return NextResponse.json({ error: "Arweave upload failed" }, { status: 500 });
    }

    return NextResponse.json({ txId: result.id });
  } catch (error) {
    console.error("Arweave upload error:", error);
    return NextResponse.json({ error: `Arweave upload failed: ${String(error)}` }, { status: 500 });
  }
}

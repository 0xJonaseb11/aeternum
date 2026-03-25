import { NextRequest, NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";
import { logger } from "~~/lib/logger";
import { getClientIdentifier, rateLimit } from "~~/lib/rateLimit";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required. Include Authorization: Bearer <session_token>." },
      { status: 401 },
    );
  }

  const clientId = user.id ?? getClientIdentifier(req);
  if (!(await rateLimit(clientId, "upload"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    if (!privateKey) {
      logger.error("IRYS_PRIVATE_KEY is not set");
      return NextResponse.json({ error: "Arweave upload misconfigured: IRYS_PRIVATE_KEY is not set" }, { status: 500 });
    }

    const body = await req.arrayBuffer();
    if (!body || body.byteLength === 0) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }
    if (body.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.` },
        { status: 413 },
      );
    }

    const rpcUrl = process.env.IRYS_RPC_URL ?? "https://sepolia.base.org";

    const uploader = await Uploader(BaseEth).withWallet(privateKey).withRpc(rpcUrl).devnet();

    const result = await uploader.upload(Buffer.from(body), {
      tags: [{ name: "Content-Type", value: "application/octet-stream" }],
    });

    if (!result?.id) {
      logger.error("Irys upload returned no id", { result: String(result) });
      return NextResponse.json({ error: "Arweave upload failed" }, { status: 500 });
    }

    const rawId = String(result.id);
    const ARWEAVE_TX_LEN = 43;
    if (rawId.length < ARWEAVE_TX_LEN) {
      logger.error("Irys returned short id", { length: rawId.length, id: rawId });
      return NextResponse.json(
        { error: `Arweave returned invalid transaction id (length ${rawId.length}, expected ${ARWEAVE_TX_LEN})` },
        { status: 500 },
      );
    }
    const txId = rawId.length > ARWEAVE_TX_LEN ? rawId.slice(0, ARWEAVE_TX_LEN) : rawId;

    logger.info("Arweave upload success", { txId, userId: user.id, bytes: body.byteLength });
    return NextResponse.json({ txId });
  } catch (error) {
    logger.error("Arweave upload error", { error: String(error), userId: user.id });
    return NextResponse.json({ error: `Arweave upload failed: ${String(error)}` }, { status: 500 });
  }
}

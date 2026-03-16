import { NextRequest, NextResponse } from "next/server";
import { getClientIdentifier, rateLimit } from "~~/lib/rateLimit";

const PINATA_PIN_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const clientId = getClientIdentifier(req);
  if (!rateLimit(clientId, "upload")) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      console.error("PINATA_JWT is not set");
      return NextResponse.json({ error: "IPFS upload misconfigured: PINATA_JWT is not set" }, { status: 500 });
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

    const blob = new Blob([body], { type: "application/octet-stream" });
    const form = new FormData();
    form.append("file", blob, "evidence.enc");

    const res = await fetch(PINATA_PIN_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      return NextResponse.json({ error: `Pinata upload failed: ${res.status} ${err}` }, { status: 502 });
    }

    const json = (await res.json()) as { IpfsHash?: string };
    if (!json.IpfsHash) {
      return NextResponse.json({ error: "Pinata did not return IpfsHash" }, { status: 502 });
    }

    return NextResponse.json({ cid: json.IpfsHash });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return NextResponse.json({ error: `IPFS upload failed: ${String(error)}` }, { status: 500 });
  }
}

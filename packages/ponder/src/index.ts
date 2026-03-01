import { ponder } from "ponder:registry";
import { proof } from "ponder:schema";

ponder.on("EvidenceVault:ProofCreated", async ({ event, context }) => {
  const { chain, client, contracts } = context;
  const fileHash = event.args.fileHash;
  const full = await client.readContract({
    abi: contracts.EvidenceVault.abi,
    address: contracts.EvidenceVault.address!,
    functionName: "getProof",
    args: [fileHash],
  });

  const id = `${chain.id}-${fileHash}`;
  await context.db
    .insert(proof)
    .values({
      id,
      chainId: chain.id,
      owner: event.args.owner,
      fileHash,
      timestamp: Number(event.args.timestamp),
      blockNumber: Number(event.args.blockNumber),
      arweaveTxId: full.arweaveTxId,
      ipfsCid: full.ipfsCid && full.ipfsCid.length > 0 ? full.ipfsCid : null,
      revoked: false,
    })
    .onConflictDoNothing();
});

ponder.on("EvidenceVault:ProofRevoked", async ({ event, context }) => {
  const { chain, client, contracts } = context;
  const id = `${chain.id}-${event.args.fileHash}`;
  const existing = await context.db.find(proof, { id });
  if (existing) {
    await context.db.update(proof, { id }).set({ revoked: true });
  }
  // If no row (e.g. proof created before our startBlock), optionally backfill from chain
  else {
    const full = await client.readContract({
      abi: contracts.EvidenceVault.abi,
      address: contracts.EvidenceVault.address!,
      functionName: "getProof",
      args: [event.args.fileHash],
    });
    await context.db.insert(proof).values({
      id,
      chainId: chain.id,
      owner: full.owner,
      fileHash: event.args.fileHash,
      timestamp: Number(full.timestamp),
      blockNumber: Number(full.blockNumber),
      arweaveTxId: full.arweaveTxId,
      ipfsCid: full.ipfsCid && full.ipfsCid.length > 0 ? full.ipfsCid : null,
      revoked: true,
    });
  }
});

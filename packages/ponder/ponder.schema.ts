import { index, onchainTable } from "ponder";

/**
 * Indexed proof metadata for reliable list retrieval by owner.
 * Mirrors on-chain Proof (owner, fileHash, timestamp, arweaveTxId, ipfsCid, revoked).
 */
export const proof = onchainTable(
  "proof",
  (t) => ({
    id: t.text().primaryKey(), // `${chainId}-${fileHash}` for uniqueness across chains
    chainId: t.integer().notNull(),
    owner: t.hex().notNull(),
    fileHash: t.hex().notNull(),
    timestamp: t.integer().notNull(),
    blockNumber: t.integer().notNull(),
    arweaveTxId: t.text().notNull(),
    ipfsCid: t.text(),
    revoked: t.boolean().notNull(),
  }),
  (table) => ({
    ownerChainIdx: index().on(table.owner, table.chainId),
  }),
);

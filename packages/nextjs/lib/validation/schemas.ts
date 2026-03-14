import { z } from "zod";

const hex64 = z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Must be 0x-prefixed 64-char hex");
const hex40 = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Must be 0x-prefixed 40-char hex (address)");

export const proofsPostSchema = z.object({
  owner: hex40,
  userId: z.string().uuid().optional(),
  fileHash: hex64,
  timestamp: z.number().int().min(0),
  blockNumber: z.number().int().min(0).optional(),
  arweaveTxId: z.string().min(1).max(500),
  ipfsCid: z.string().max(200).optional(),
  chainId: z.number().int().min(1).optional(),
});

export const evidencePostSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  fileHash: hex64,
  title: z.string().max(500).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  caseId: z.string().max(200).optional().nullable(),
  tags: z.array(z.string().max(100)).max(50).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const eventsPostSchema = z.object({
  fileHash: hex64,
  eventType: z.string().min(1).max(100),
  data: z.unknown().optional(),
});

export type ProofsPostBody = z.infer<typeof proofsPostSchema>;
export type EvidencePostBody = z.infer<typeof evidencePostSchema>;
export type EventsPostBody = z.infer<typeof eventsPostSchema>;

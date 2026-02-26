# Aeternum Implementation Review vs AGENTS.md

Review of what we **intended** (AGENTS.md) vs what is **implemented** today. Goal: fully built evidence vault with ZK, Arweave, IPFS/Pinata, multi-sig readiness, industry-high standard.

---

## 1. Smart Contract Layer (Solidity)

| Requirement | Status | Notes |
|-------------|--------|--------|
| Upgradeable via **UUPS** | Done | EvidenceVault uses UUPSUpgradeable + EvidenceVaultStorage for layout |
| OpenZeppelin Upgradeable | Done | Initializable, Ownable, Pausable, UUPS |
| Store file proofs (owner, fileHash, commitment, timestamp, storageId) | Done | Proof struct: owner, revoked, timestamp, blockNumber, fileHash, commitment, arweaveTxId, ipfsCid |
| **createProof()** | Done | With arweaveTxId (43 chars) + optional ipfsCid |
| **proofExists()** | Done | View |
| **getProof()** (owner-only) | Done | Owner or granted address; reverts AccessDenied otherwise |
| **verifyOwnership(fileHash, zkProof, publicInputs)** | Done | Groth16 via IZKVerifier; on-chain verifier configurable |
| Gas optimization (custom errors, packing, calldata, unchecked) | Done | Custom errors, storage struct, calldata for strings, unchecked where safe |
| Security (access control, reentrancy, CEI, validation) | Done | ReentrancyGuard, Ownable, Pausable, input checks, CEI |
| Audit-ready, modular | Done | Interfaces (IEvidenceVault, IZKVerifier), separate storage contract |
| **Extra implemented** | | addBackup(fileHash, ipfsCid), revokeProof, grantAccess/revokeAccess, pause/unpause, setZKVerifier |

**Verdict:** Contract layer is **complete** and production-oriented. ZK is on-chain (verifyOwnership); full ZK flow needs frontend proof generation (see below).

---

## 2. Frontend Layer (Next.js + Scaffold-ETH)

| Requirement | Status | Notes |
|-------------|--------|--------|
| Scaffold-ETH structure | Done | packages/nextjs with scaffold config, deployedContracts |
| Wallet connection (MetaMask, Coinbase, etc.) | Done | RainbowKit + wagmi |
| Network detection (Base L2) | Done | Base Sepolia only in targetNetworks; wrong-network banner |
| Display user's proofs with real-time data | Done | EvidenceList: ProofCreated events + getProof per item |
| Secure tx handling with feedback | Done | useScaffoldWriteContract, notifications, getParsedError |
| Modular components + hooks | Done | UploadEvidence, EvidenceList, EvidenceCard, useVault, useRecover |
| Strict TypeScript | Done | Typed contracts, hooks, components |
| Tailwind CSS UI (modern, professional) | Done | DaisyUI, Aeternum theme, skeletons, responsive |

**Verdict:** Frontend layer **matches** AGENTS.md. Optional: explicit “no contract on this network” and “save secret offline” are in place.

---

## 3. File Upload & Zero-Knowledge Flow

| Step (AGENTS.md) | Status | Notes |
|------------------|--------|--------|
| 1. User selects file | Done | UploadEvidence: file picker + drag-drop |
| 2. Encrypt client-side AES-256-GCM | Done | crypto.ts: encryptFile, generateSecret |
| 3. Compute fileHash (SHA-256), commitment = hash(fileHash + secret) | Done | computeHash, computeCommitment (SHA-256; ZK-ready, not Poseidon) |
| 4. Upload to Arweave (primary) + IPFS/Pinata | Partial | **Arweave: mock only** (placeholder TxID). **IPFS: real** (Pinata when JWT set, else Infura); Pinata gateway default for retrieval |
| 5. Receive storage ID | Done | arweaveTxId + ipfsCid returned and stored on-chain |
| 6. Call createProof(fileHash, commitment, storageId) | Done | useVault → createProof with both IDs |
| 7. Display proof ID, storage ID, secret (save offline) | Done | Success card: secret, fileHash, Arweave ID, IPFS CID + “CRITICAL: SAVE OFFLINE” |

**Gaps:**
- **Arweave:** Replace mock in `storage.ts` with real upload (e.g. Irys/Bundlr SDK) for production permanence.
- **ZK commitment:** Current commitment is SHA-256(fileHash + secret). For full Groth16 compatibility, a Poseidon hash + snarkjs proof generation in the frontend (or backend) is needed so `verifyOwnership` can be called with a real ZK proof. On-chain verifier is ready; proof generation is not yet in the app.

**Verdict:** Upload flow is **implemented** end-to-end except **real Arweave** and **browser ZK proof generation**.

---

## 4. File Retrieval & Verification

| Requirement | Status | Notes |
|-------------|--------|--------|
| User provides proof ID / fileHash | Done | Evidence list shows user’s proofs by fileHash |
| Fetch storageId and encrypted file | Done | getProof gives arweaveTxId/ipfsCid; recovery fetches from Arweave URL or IPFS (Pinata gateway + ipfs.io fallback) |
| Decrypt locally with secret | Done | useRecover: decryptFile with user-entered secret |
| Verify proof exists on-chain | Done | Proof list is from chain; getProof confirms existence |
| Optional: PDF certificate (hash, timestamp, owner, storage link, tx) | Done | createCertificatePdf (jspdf), download from EvidenceCard |

**Verdict:** Retrieval and verification **implemented**. Certificate is PDF with hash, timestamp, storage IDs, “Verified” status.

---

## 5. Anonymous Backend (Optional)

| Requirement | Status | Notes |
|-------------|--------|--------|
| Supabase: anonymous logs, tx status, rate-limiting | Not implemented | No Supabase in codebase |
| Hash wallet addresses before storage | N/A | — |
| Do not store secrets or raw files | N/A | App never sends secrets to any backend |

**Verdict:** Optional Supabase backend **not implemented**. Can be added later without changing current architecture.

---

## 6. Security & Performance

| Requirement | Status | Notes |
|-------------|--------|--------|
| ZK-compliant: never upload raw files | Done | Only encrypted blob to Arweave/IPFS |
| Validate file size (max 50MB) | Done | useVault: MAX_FILE_SIZE_BYTES, reject before processing |
| Graceful error handling | Done | getParsedError, notifications, try/catch in vault and recovery |
| Prevent multiple submissions / reentrancy | Done | Contract: ReentrancyGuard, ProofAlreadyExists; UI: single submit |
| Stream large files efficiently | Partial | Single arrayBuffer in memory; 50MB cap limits impact |
| Cache proof data to reduce re-renders | Partial | React Query via scaffold hooks; no extra proof cache layer |
| Clear tx/upload feedback | Done | Step states (encrypting/uploading/confirming), notifications |

**Verdict:** Security and feedback **in place**. Optional: streaming for very large files and a dedicated proof cache.

---

## 7. Code Quality

| Requirement | Status | Notes |
|-------------|--------|--------|
| Modular, reusable components and hooks | Done | Vault components and hooks are split and reusable |
| Production- and audit-ready | Done | Contracts and frontend structured for production |
| Scaffold-ETH best practices | Done | targetNetworks, deployedContracts, scaffold hooks |
| Inline comments / architecture | Done | Key contract and flow comments; some trimmed for brevity |
| Future-proof for ZK module | Done | setZKVerifier, verifyOwnership, commitment in storage; frontend ZK proof gen can be added |

**Verdict:** **Met.**

---

## 8. Multi-Sig and “Industry-High” Aspects

| Item | Status | Notes |
|------|--------|--------|
| **Contract ownership as multisig** | Done | Deploy: `MULTISIG=0x... yarn deploy` transfers ownership to multisig; owner can upgrade (UUPS), pause, setZKVerifier. Use a Gnosis Safe (or similar) as `MULTISIG`. |
| **Per-proof multi-sig** | Not implemented | Proofs are single-owner; grantAccess gives one address read access. No multi-sig for creating or revoking a proof. |
| **Real Arweave** | Not implemented | Mock in storage.ts; need Irys (or similar) for production. |
| **Full ZK flow in UI** | Not implemented | On-chain verifyOwnership is ready; no UI to generate Groth16 proof and call verifyOwnership. |
| **IPFS/Pinata backup** | Done | Pinata gateway default; optional Pinata JWT for upload; Infura fallback; retrieval with gateway + ipfs.io fallback. |

---

## Summary: What We Wanted vs What We Have

- **Fully built evidence vault:** Yes, for the scope: create proof, store on-chain + IPFS (and Arweave ID), recover with secret, PDF certificate, access control (grant/revoke), revoke proof, backup IPFS CID.
- **ZK:** On-chain verifier and storage (commitment, verifyOwnership) are in place; **browser (or server) ZK proof generation** and a UI to call verifyOwnership are not.
- **Arweave:** **Mock only**; needs real integration (e.g. Irys) for production.
- **IPFS/Pinata:** **Integrated** (Pinata gateway, optional Pinata upload, Infura fallback, dual retrieval).
- **Multi-sig:** **Contract ownership** can be a multisig via deploy; no multi-sig for individual proof operations.
- **Industry-high standard:** Contracts and frontend are production-oriented (upgradeable, access control, no raw files, 50MB limit, errors, certificates). Remaining gaps: real Arweave, optional Supabase, and full ZK proof flow in the app.

---

## Recommended Next Steps (Priority)

1. **Arweave:** Replace mock in `utils/vault/storage.ts` with Irys (or Bundlr) SDK; keep env-driven so dev can still use mock.
2. **ZK in the app (optional):** Add a flow (e.g. snarkjs + Poseidon in a worker or backend) to generate a Groth16 proof from (fileHash, secret) and call `verifyOwnership` from the UI.
3. **Supabase (optional):** If desired, add anonymous logging / tx status / rate limits via Supabase with hashed wallet only.
4. **Docs:** Add a short README section on multi-sig deployment (`MULTISIG=0x...`) and Pinata/Arweave env vars.

This review reflects the codebase and AGENTS.md as of the last implementation pass.

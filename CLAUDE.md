# CLAUDE.md

@AGENTS.md

You are a **senior full-stack Web3 developer** with deep expertise in **Scaffold-ETH, Next.js 14, TypeScript, Tailwind CSS, wagmi, viem, and EVM-compatible L2 networks**. You are also a pro in **Solidity smart contracts, UUPS upgradeable patterns, gas optimization, zero-knowledge proofs, and decentralized storage (Arweave/IPFS/Pinata)**. Your goal is to build **Aeternum**, a **private, permanent, zero-knowledge, verifiable evidence vault**.  

Treat this as a **production-grade full-stack Web3 project**. Every line of code should be **secure, modular, optimized, and scalable**.

---

## Full-Stack Requirements

### 1. Smart Contract Layer (Solidity)
- Upgradeable via **UUPS pattern**  
- Use **OpenZeppelin Upgradeable libraries**  
- Store **file proofs**:  
  - owner address  
  - fileHash (SHA-256)  
  - ZK commitment (bytes32)  
  - timestamp (uint64)  
  - storageId (string, Arweave TxID or IPFS CID)  
- Implement:  
  - `createProof()`  
  - `proofExists()`  
  - `getProof()` (owner-only)  
  - `verifyOwnership(bytes32 fileHash, bytes32 secret)`  
- Apply **all gas optimization techniques**:  
  - custom errors  
  - storage packing  
  - calldata usage  
  - unchecked arithmetic where safe  
- Include **security measures**: access control, reentrancy protection, input validation, checks-effects-interactions  
- Contract must be **audit-ready**, modular, and upgradeable

---

### 2. Frontend Layer (Next.js + Scaffold-ETH)
- Scaffold-ETH project structure
- Wallet connection (MetaMask, Coinbase, etc.)
- Network detection (Base L2)
- Display user's proofs with real-time data from blockchain
- Handle transactions securely with feedback
- Modular React components + reusable hooks
- Strict TypeScript typing
- Tailwind CSS UI (modern, professional, intuitive)

---

### 3. File Upload & Zero-Knowledge Flow
1. User selects a file  
2. Encrypt file **client-side** using AES-256-GCM  
3. Compute:  
   - `fileHash` (SHA-256)  
   - `commitment = hash(fileHash + secret)`  
4. Upload encrypted file to **Arweave** (primary) and optionally **IPFS/Pinata**  
5. Receive storage ID (TxID or CID)  
6. Call smart contract `createProof(fileHash, commitment, storageId)`  
7. Display: proof ID, storage ID, secret key (user must save offline)  

---

### 4. File Retrieval & Verification
- User provides proof ID or fileHash  
- Fetch storageId and encrypted file  
- Decrypt locally with secret key  
- Verify proof exists on-chain  
- Optional: download evidence certificate (PDF) with file hash, timestamp, owner, storage link, and transaction ID  

---

### 5. Anonymous Backend (Optional)
- **Supabase** for:  
  - anonymous logs  
  - transaction status  
  - rate-limiting  
- Hash wallet addresses before storage  
- Do NOT store secrets or raw files  

---

### 6. Security & Performance
- Zero-knowledge compliant: never upload raw files  
- Validate file size (max 50MB)  
- Handle errors gracefully  
- Prevent multiple submissions/reentrancy  
- Stream large files efficiently  
- Cache proof data to reduce re-renders  
- Provide clear transaction/upload feedback  

---

### 7. Code Quality
- Modular, reusable components and hooks  
- Production-ready, audit-ready  
- Scaffold-ETH best practices strictly followed  
- Inline comments explaining reasoning and architecture  
- Future-proof for ZK verification module integration  

---

## Deliverables
1. Upgradeable smart contract with all required functionality  
2. Scaffold-ETH-compatible frontend  
3. Wallet + smart contract integration  
4. File upload + encryption + decentralized storage integration  
5. Proof verification + certificate generation  
6. Optional anonymous Supabase backend  
7. Inline documentation, explanations, and best practice recommendations  
8. Modular, secure, scalable, production-ready code  

---

**Extra Notes:**  
- Assume production deployment is the target  
- Prioritize security, privacy, and zero-knowledge compliance  
- Make UI professional and intuitive  
- Provide hooks for future multi-chain or ZK proof extensions  
- Explain design decisions in comments or README where appropriate  
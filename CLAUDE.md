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
- **Follow the UI Reference & Frontend Design rules below (Section 2.1).**

#### 2.1 UI Reference & Frontend Design

**Visual reference (screenshots):**  
The attached reference screenshots are from **vaultplatform.com** (“vault. a Diligent brand”). Use them **only as inspiration** for tone, structure, and component styling. Do not copy branding or layout literally.

**Documented from the reference:**

| Aspect | Description |
|--------|-------------|
| **Overall** | Corporate, clean, professional. Clear hierarchy, ample spacing, readable sans-serif typography. No playful or informal “vibecoding” visuals. |
| **Dark theme** | Deep teal/green background (e.g. `#1A3A3D`–`#1c3c3a`). White/light text. Subtle abstract patterns (e.g. concentric circles) for depth only. |
| **Light theme** | White or very light backgrounds; dark text. Header can stay light while main content uses theme (dark/light). |
| **Accents** | Bright lime green (e.g. `#90EE02` / `#8af700`) for secondary actions and highlights. Pink/magenta (e.g. `#E91E63` / `#e6007e`) for primary CTAs. High contrast, no emojis. |
| **Cards/forms** | White or theme-appropriate card backgrounds; rounded corners; clear separation between sections. |
| **Buttons** | Primary: solid accent (e.g. pink/magenta), white text, optional right-arrow icon. Secondary: darker or outlined. Use **real icons** (e.g. arrow `→`, chevrons, close `×`), never emojis. |
| **Form elements** | Inputs: rectangular fields, clear labels. Radio/check: selected state with checkmark or filled circle (e.g. green). Progress: step indicators (dots or steps) with one active. |
| **Banners/alerts** | Distinct background (e.g. lime for cookie banner), dark text on light or vice versa. Clear actions: e.g. “Accept” / “Reject” or “Cookie settings” link. |

**Mandatory frontend rules:**

1. **Loading states:** Use **skeleton loading only**. No spinner-only or generic “Loading…” text without skeletons. Skeletons must reflect the structure of the content being loaded (cards, lists, form blocks).
2. **Theming:** Support **dark** and **light** themes. Prefer **mirroring system theme** (e.g. `prefers-color-scheme`) with an optional manual override (toggle in UI).
3. **Consistency:** Use a single design system: one palette per theme, consistent spacing, typography scale, and component patterns across the app.
4. **Icons:** Use **real icons only** (e.g. Heroicons, Lucide, or similar). **No emojis anywhere** — not in UI copy, buttons, placeholders, or status labels.
5. **Tone:** Professional and minimal. **No obvious “vibecoding” materials** — no whimsical illustrations, meme-style graphics, or overly decorative patterns. Abstract, subtle patterns are acceptable for background depth only.

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
2. Scaffold-ETH-compatible frontend **with Section 2.1 UI rules** (skeletons, dark/light/system theme, real icons, no emojis)  
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
- Make UI professional and intuitive; **follow Section 2.1** (skeleton loading, dark/light/system theme, real icons, no emojis, no vibecoding)  
- Provide hooks for future multi-chain or ZK proof extensions  
- Explain design decisions in comments or README where appropriate  
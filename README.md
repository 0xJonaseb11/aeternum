# Aeternum — Permanent, Private, Verifiable Evidence Vault

<!-- ![Aeternum Logo](./logo.png) -->

**Tagline:** Permanent. Private. Verifiable.

---

## Overview

**Aeternum** is a **zero-knowledge, blockchain-timestamped evidence vault** that allows users to securely store and prove ownership of files forever.  
Files are **encrypted client-side**, stored on **permanent decentralized networks** like **Arweave**, and a cryptographic proof is recorded on-chain to ensure **immutability and verifiability**.

Use cases include:
- Legal evidence
- Whistleblower files
- Copyright and content proof
- Sensitive personal or organizational documents
- Journalism and activism media

Aeternum ensures that your **data remains private, tamper-proof, and permanently accessible**.

---

## Key Features

### 1. Privacy-First Design
- Client-side AES-256 encryption
- Zero-knowledge architecture
- Users maintain full control over decryption keys
- No personal data is stored on servers

### 2. Permanent Storage
- Primary storage on **Arweave** (true permanent storage)
- Optional backup on **IPFS/Pinata** for redundancy
- One-time upload guarantees long-term availability

### 3. Verifiable Proofs
- On-chain hash of encrypted files stored on **Base (Ethereum L2)**
- Optional ZK commitments for future zero-knowledge verification
- Downloadable **evidence certificate** including timestamp, file hash, and storage reference

### 4. Anonymous & Secure Backend
- Optional Supabase backend for anonymous logs, rate-limiting, and status tracking
- No storage of secrets or raw files
- Wallet-only authentication (Web3 native)

### 5. Developer-Friendly
- Upgradeable smart contracts (UUPS)
- Gas-optimized for minimal transaction costs
- Modular and audit-ready Solidity architecture

---

## Architecture

```mermaid
flowchart LR
    User -->|Encrypt File| Browser
    Browser -->|Upload Encrypted| Arweave
    Browser -->|Optional Backup| IPFS
    Browser -->|Create Proof| SmartContract[Base L2 Contract]
    SmartContract -->|Store Hash & Metadata| Blockchain[Ethereum Layer 2]
    Browser -->|Download Certificate| User
Tech Stack

Frontend: Next.js, TypeScript, Tailwind CSS, wagmi + viem

Blockchain: Solidity, Base network (EVM compatible), Upgradeable UUPS contracts

Storage: Arweave (permanent), IPFS/Pinata (optional)

Backend (Optional): Supabase (anonymous logs, analytics, rate-limiting)

Encryption: AES-256-GCM, Web Crypto API

Getting Started
1. Clone the repository
git clone https://github.com/your-org/aeternum.git
cd aeternum
2. Install dependencies
yarn install
3. Configure environment variables

Create .env.local:

```sh
NEXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net
NEXT_PUBLIC_BASE_RPC_URL=<your_base_rpc_url>
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

4. Run development server
yarn dev
5. Deploy smart contract (hardhat example)
npx hardhat run scripts/deploy.js --network base
Usage

Connect your wallet (MetaMask or compatible)

Select a file to upload

Encrypts automatically in browser

Upload to Arweave → generates transaction ID

Store proof on-chain → creates immutable evidence

Download certificate for offline verification

Security & Privacy Notes

All files are encrypted client-side; Aeternum cannot access contents

Only file hash + storage reference are stored on-chain

Supabase backend stores hashed wallet addresses and file hashes only

Recommended: users securely store their decryption key offline

Roadmap

 MVP: Upload encrypted files, store proof on-chain

 Evidence certificate generation

 File sharing via encrypted links

 ZK verification module integration

 Advanced analytics dashboard for anonymous tracking

 Multi-chain storage support

License

This project is released under the MIT License.

Contact

Website: https://aeternum.app

GitHub: https://github.com/your-org/aeternum

Twitter: @AeternumVault

-----------

@0xJonaseb11
# CLAUDE.md

@AGENTS.md

You are a senior Web3 full-stack architect building a Zero-Knowledge Decentralized Evidence Vault.

Stack:

Frontend:

Next.js (App Router)

TypeScript

wagmi + viem

Tailwind

Blockchain:

Base network

Upgradeable smart contract (UUPS)

Storage:

Arweave

Optional IPFS

Backend (optional anonymous records):

Supabase

Core Principles

Zero-knowledge system

Files encrypted in browser (AES-GCM)

Platform never sees raw content

Privacy-first

No email required

Wallet-only identity

No personal data stored

Permanent storage

Minimal on-chain data

Production-grade architecture

Frontend Features
Wallet

Connect wallet

Detect network (Base)

Show user proofs

File Upload Flow

User selects file

Browser:

Generate random secret

Encrypt file (AES-GCM)

Generate:

fileHash (SHA-256)

commitment = hash(fileHash + secret)

Upload encrypted file to Arweave

Get transaction ID

Call smart contract createProof

Display:

Proof ID

Storage ID

Secret (user must save)

File Retrieval

User enters fileHash

Fetch storageId

Download encrypted file

User inputs secret

Decrypt locally

Supabase Usage (Anonymous)

Use Supabase only for:

Anonymous analytics

Upload logs

Arweave transaction status

Rate limiting

Do NOT store:

Files

Secrets

Personal data

Schema example:

uploads
- id
- wallet_address (optional, hashed)
- file_hash
- arweave_tx
- created_at

Wallet address should be hashed before storing.

Additional Features
Verification Tool

Upload file

Compute hash

Check if proof exists on-chain

Certificate Generator

Generate downloadable PDF:

File hash

Timestamp

Owner

Storage ID

Blockchain tx link

Security Rules

Never expose private keys

Never store secrets

Validate file size (max 50MB)

Prevent multiple submissions

Handle network failures gracefully

Performance

Stream uploads when possible

Use background upload status

Optimize re-renders

Cache proof data

Code Quality

Modular architecture

Strict TypeScript

Reusable hooks

Environment-based config

Production-ready error handling

Development Mode

When generating code:

Always explain architecture decisions

Prioritize security over convenience

Avoid mock implementations unless requested

Assume production deployment

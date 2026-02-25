# Aeternum

**Permanent. Private. Verifiable.**

A zero-knowledge, blockchain-timestamped evidence vault. Store and prove ownership of files: client-side encrypted, permanently on Arweave (optional IPFS), with Groth16 ZK proofs and immutable records on Base.

---

## Features

- **Privacy-first** — Client-side AES-256 encryption; keys and secrets never leave your control.
- **Permanent storage** — Arweave primary, optional IPFS backup.
- **Verifiable proofs** — On-chain hash + ZK commitment on Base; evidence certificate for offline verification.
- **Developer-friendly** — UUPS upgradeable contracts, modular design.

---

## Quick start

```bash
git clone https://github.com/0xJonaseb11/aeternum.git
cd aeternum
yarn install
```

**Frontend**

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_* vars
yarn dev
```

**Contracts & ZK**

```bash
npm run zk:setup    # one-time: circuit + Groth16 setup
npm run compile
npm test
```

See `packages/hardhat/README.md` for deployment and `packages/nextjs/` for app config.

---

## Stack

| Layer      | Tech |
|-----------|------|
| Frontend  | Next.js, TypeScript, Tailwind, wagmi/viem |
| Chain     | Solidity, Base (EVM), UUPS |
| Storage   | Arweave, optional IPFS |
| ZK        | Circom, Groth16, Poseidon (BN254) |

---

## License

MIT

--------

@0xJonaseb11

# Aeternum

<div align="center">
  <br/>
  <img src="https://img.shields.io/github/stars/0xJonaseb11/aeternum?style=flat-square&logo=github&color=e91e63" alt="Stars" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity&logoColor=white" />
  <img src="https://img.shields.io/badge/Arweave-000000?style=flat-square&logo=arweave&logoColor=white" />
  <img src="https://img.shields.io/badge/Base-0052FF?style=flat-square&logo=base&logoColor=white" />
  <img src="https://img.shields.io/badge/ZK-6C5CE7?style=flat-square&logo=simple-analytics&logoColor=white" />
</div>

<br/>

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
yarn compile
yarn test
```

See `packages/hardhat/README.md` for deployment and `packages/nextjs/` for app config.

---

## License
[MIT LICENSE](./LICENCE)

--------------------

(c) 2026 Jonas Sebera


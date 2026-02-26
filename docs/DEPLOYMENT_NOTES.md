# Deployment Notes - EvidenceVault

This document records the technical fixes and setup requirements identified during the successful deployment of the EvidenceVault contracts on Feb 25, 2026.

## 1. Solidity Compilation Fixes
The `EvidenceVault.sol` contract failed to compile due to documentation parser errors.
- **Issue**: Trailing spaces in `@inheritdoc` tags.
- **Fix**: Removed trailing spaces from all `@inheritdoc` tags in `EvidenceVault.sol`.

## 2. ZK Infrastructure Requirements
The project uses Groth16 ZK-SNARKs. The verifier contract (`CommitmentVerifier.sol`) is generated from circuits and must be present before deployment.

### System Dependencies
- **circom**: Must be installed on the host system. Install via Cargo:
  ```bash
  cargo install --git https://github.com/iden3/circom.git
  ```
- **circomlib**: NPM library for ZK-native primitives (Poseidon).
  ```bash
  yarn workspace @se-2/hardhat add circomlib
  ```

### Trusted Setup Logic
The `scripts/zkSetup.ts` script handles the trusted setup. It was patched to:
1.  Use the correct include paths (`-l ROOT`) so `circom` can find `circomlib`.
2.  Support `snarkjs` v0.7+ API for Solidity verifier export (which now requires manual template reading from `node_modules`).

## 3. Local Deployment (Localhost/Hardhat)
The deployment of the UUPS proxy originally failed due to gas limit exhaustion.
- **Issue**: Deployment requested 60M gas, exceeding the default 16.7M block gas cap.
- **Fix**: Updated `packages/hardhat/hardhat.config.ts` to pin `gas` and `blockGasLimit` to **15,000,000** for the `hardhat` and `localhost` networks.

## 4. Deployed Contract Addresses (Localhost)
| Contract | Address |
| :--- | :--- |
| **EvidenceVault (Proxy)** | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |
| **CommitmentVerifier** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| **Groth16VerifierWrapper**| `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |

---
**Note**: To re-run the setup, use `npx ts-node scripts/zkSetup.ts setup` inside `packages/hardhat`.

➜  aeternum git:(temp) ✗ yarn deploy --network baseSepolia --reset
✔ Enter password to decrypt private key:
Nothing to compile
No need to generate any newer typings.
═══════════════════════════════════════════════════
  EvidenceVault — Full Deployment
═══════════════════════════════════════════════════
  Network  : baseSepolia (chainId 84532)
  Deployer : 0x0dfDb5bBaEeCE3871f826DF1C6Fe24a2772f5d38
  Balance  : 0.010210588555041184 ETH
───────────────────────────────────────────────────

[1/4] Deploying CommitmentVerifier (Groth16)...
deploying "CommitmentVerifier" (tx: 0x27ded726fdc5488a4f7dedfb2889d38cb0d2d6896a0a9fa475025afe147b1212)...: deployed at 0x2D322C9a3263191C979c3584173396456701464e with 368885 gas
      ✓ CommitmentVerifier: 0x2D322C9a3263191C979c3584173396456701464e

[2/4] Deploying Groth16VerifierWrapper...
deploying "Groth16VerifierWrapper" (tx: 0xd797c58a969356df147dc3842350f2072c15ffa5b72fe801346a8dfc137fdb68)...: deployed at 0x6b70354Fa89F08B56382d5b730EEb2835F19d815 with 359626 gas
      ✓ Groth16VerifierWrapper: 0x6b70354Fa89F08B56382d5b730EEb2835F19d815

[3/4] Deploying EvidenceVault (UUPS proxy)...
Warning: Potentially unsafe deployment of contracts/modules/EvidenceVault.sol:EvidenceVault

    You are using the `unsafeAllow.constructor` flag.

      ✓ Proxy (use this address): 0x5e9C84A4A38fe109F4aB4032c05882C6a49Cc654
      ✓ Implementation:           0x9a6B9E407cD918783089FCBE060278A44e4dB292

[4/4] Wiring ZK verifier into vault...
      ✓ zkVerifier set to: 0x6b70354Fa89F08B56382d5b730EEb2835F19d815

[5/5] ⚠️  MULTISIG env not set — ownership NOT transferred.
         Set MULTISIG=0x... and run vault.transferOwnership(multisig)

═══════════════════════════════════════════════════
  Deployment Complete
═══════════════════════════════════════════════════
{
  "proxy": "0x5e9C84A4A38fe109F4aB4032c05882C6a49Cc654",
  "implementation": "0x9a6B9E407cD918783089FCBE060278A44e4dB292",
  "groth16Verifier": "0x2D322C9a3263191C979c3584173396456701464e",
  "groth16VerifierWrapper": "0x6b70354Fa89F08B56382d5b730EEb2835F19d815",
  "multisig": "NOT_SET"
}
reusing "CommitmentVerifier" at 0x2D322C9a3263191C979c3584173396456701464e
reusing "Groth16VerifierWrapper" at 0x6b70354Fa89F08B56382d5b730EEb2835F19d815
EvidenceVault already deployed at 0x5e9C84A4A38fe109F4aB4032c05882C6a49Cc654
📝 Updated TypeScript contract definition file on ../nextjs/contracts/deployedContracts.ts
➜  aeternum git:(temp) ✗ 
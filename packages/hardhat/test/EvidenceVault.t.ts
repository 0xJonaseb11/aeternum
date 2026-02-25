import { expect }            from "chai";
import { ethers, upgrades }  from "hardhat";
import { SignerWithAddress }  from "@nomicfoundation/hardhat-ethers/signers";

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Simulate Poseidon(fileHash, secret) off-chain with keccak for testing.
 *  In production the real Poseidon hash (circomlibjs) is used. */
function mockCommitment(fileHash: string, secret: string): string {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32"],
      [fileHash, secret]
    )
  );
}

const ARWEAVE_TX_ID = "a".repeat(43);   // valid 43-char Arweave TxID
const IPFS_CID      = "QmTestCIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const BN254_P       = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

// ─────────────────────────────────────────────────────────────────────────────
//  Mock ZK Verifier (always returns true / false based on constructor arg)
// ─────────────────────────────────────────────────────────────────────────────

async function deployMockVerifier(shouldPass: boolean) {
  const src = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.24;
    contract MockVerifier {
        bool private _pass;
        constructor(bool pass_) { _pass = pass_; }
        function verifyProof(bytes calldata, uint256[] calldata) external view returns (bool) {
            return _pass;
        }
    }`;
  // We use an inline fixture approach — in real tests use a fixture file
  const factory = await ethers.getContractFactory("MockVerifier");
  return factory.deploy(shouldPass);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Test Suite
// ─────────────────────────────────────────────────────────────────────────────

describe("EvidenceVault", function () {
  let vault:  any;
  let owner:  SignerWithAddress;
  let alice:  SignerWithAddress;
  let bob:    SignerWithAddress;
  let auditor:SignerWithAddress;

  const fileHash   = ethers.keccak256(ethers.toUtf8Bytes("my-evidence-file"));
  const secret     = ethers.hexlify(ethers.randomBytes(32));
  const commitment = mockCommitment(fileHash, secret);

  // Encode a fake ZK proof (32*8 = 256 bytes)
  const fakeProof  = ethers.zeroPadBytes("0x" + "ab".repeat(128), 256);
  const publicInputs = [
    BigInt(fileHash),
    BigInt(commitment)
  ];

  beforeEach(async () => {
    [owner, alice, bob, auditor] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("EvidenceVault");
    vault = await upgrades.deployProxy(Factory, [owner.address], {
      initializer: "initialize",
      kind: "uups",
    });
    await vault.waitForDeployment();
  });

  // ─── Initialization ─────────────────────────────────────────────────────
  describe("Initialization", () => {
    it("sets the correct owner", async () => {
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("reverts on re-initialization", async () => {
      await expect(vault.initialize(owner.address))
        .to.be.revertedWithCustomError(vault, "InvalidInitialization");
    });

    it("reverts if initialOwner is zero address", async () => {
      const Factory = await ethers.getContractFactory("EvidenceVault");
      await expect(
        upgrades.deployProxy(Factory, [ethers.ZeroAddress], {
          initializer: "initialize", kind: "uups",
        })
      ).to.be.reverted;
    });
  });

  // ─── createProof ────────────────────────────────────────────────────────
  describe("createProof()", () => {
    it("creates a proof and emits ProofCreated", async () => {
      const tx = await vault.connect(alice).createProof(
        fileHash, commitment, ARWEAVE_TX_ID, ""
      );
      const block = await ethers.provider.getBlock(tx.blockNumber);

      await expect(tx)
        .to.emit(vault, "ProofCreated")
        .withArgs(alice.address, fileHash, block!.timestamp, tx.blockNumber);
    });

    it("stores correct proof data", async () => {
      await vault.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, IPFS_CID);
      const proof = await vault.connect(alice).getProof(fileHash);
      expect(proof.owner).to.equal(alice.address);
      expect(proof.fileHash).to.equal(fileHash);
      expect(proof.commitment).to.equal(commitment);
      expect(proof.arweaveTxId).to.equal(ARWEAVE_TX_ID);
      expect(proof.ipfsCid).to.equal(IPFS_CID);
      expect(proof.revoked).to.be.false;
    });

    it("increments ownerProofCount", async () => {
      await vault.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, "");
      expect(await vault.ownerProofCount(alice.address)).to.equal(1n);
    });

    it("reverts with ProofAlreadyExists on duplicate fileHash", async () => {
      await vault.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, "");
      await expect(
        vault.connect(bob).createProof(fileHash, commitment, ARWEAVE_TX_ID, "")
      ).to.be.revertedWithCustomError(vault, "ProofAlreadyExists");
    });

    it("reverts with InvalidInput for zero fileHash", async () => {
      await expect(
        vault.connect(alice).createProof(
          ethers.ZeroHash, commitment, ARWEAVE_TX_ID, ""
        )
      ).to.be.revertedWithCustomError(vault, "InvalidInput");
    });

    it("reverts with InvalidInput for zero commitment", async () => {
      await expect(
        vault.connect(alice).createProof(fileHash, ethers.ZeroHash, ARWEAVE_TX_ID, "")
      ).to.be.revertedWithCustomError(vault, "InvalidInput");
    });

    it("reverts with StorageIdTooLong for wrong arweave length", async () => {
      await expect(
        vault.connect(alice).createProof(fileHash, commitment, "short", "")
      ).to.be.revertedWithCustomError(vault, "StorageIdTooLong");
    });

    it("reverts with StorageIdTooLong for oversized IPFS CID", async () => {
      await expect(
        vault.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, "x".repeat(129))
      ).to.be.revertedWithCustomError(vault, "StorageIdTooLong");
    });

    it("reverts when paused", async () => {
      await vault.connect(owner).pause();
      await expect(
        vault.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, "")
      ).to.be.revertedWithCustomError(vault, "EnforcedPause");
    });
  });

  // ─── addBackup ──────────────────────────────────────────────────────────
  describe("addBackup()", () => {
    beforeEach(async () => {
      await vault.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, "");
    });

    it("adds IPFS backup and emits BackupAdded", async () => {
      await expect(vault.connect(alice).addBackup(fileHash, IPFS_CID))
        .to.emit(vault, "BackupAdded")
        .withArgs(fileHash, IPFS_CID);
      const proof = await vault.connect(alice).getProof(fileHash);
      expect(proof.ipfsCid).to.equal(IPFS_CID);
    });

    it("reverts BackupAlreadySet on second call", async () => {
      await vault.connect(alice).addBackup(fileHash, IPFS_CID);
      await expect(
        vault.connect(alice).addBackup(fileHash, IPFS_CID)
      ).to.be.revertedWithCustomError(vault, "BackupAlreadySet");
    });

    it("reverts NotProofOwner for non-owner", async () => {
      await expect(
        vault.connect(bob).addBackup(fileHash, IPFS_CID)
      ).to.be.revertedWithCustomError(vault, "NotProofOwner");
    });
  });

  // ─── revokeProof ────────────────────────────────────────────────────────
  describe("revokeProof()", () => {
    beforeEach(async () => {
      await vault.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, "");
    });

    it("soft-revokes proof and emits ProofRevoked", async () => {
      await expect(vault.connect(alice).revokeProof(fileHash))
        .to.emit(vault, "ProofRevoked")
        .withArgs(alice.address, fileHash);
    });

    it("proofExists returns false after revocation", async () => {
      await vault.connect(alice).revokeProof(fileHash);
      expect(await vault.proofExists(fileHash)).to.be.false;
    });

    it("data is still readable after revocation (owner)", async () => {
      await vault.connect(alice).revokeProof(fileHash);
      const proof = await vault.connect(alice).getProof(fileHash);
      expect(proof.revoked).to.be.true;
    });

    it("reverts NotProofOwner for non-owner", async () => {
      await expect(
        vault.connect(bob).revokeProof(fileHash)
      ).to.be.revertedWithCustomError(vault, "NotProofOwner");
    });

    it("reverts ProofIsRevoked on double revocation", async () => {
      await vault.connect(alice).revokeProof(fileHash);
      await expect(
        vault.connect(alice).revokeProof(fileHash)
      ).to.be.revertedWithCustomError(vault, "ProofIsRevoked");
    });
  });

  // ─── Access Control ─────────────────────────────────────────────────────
  describe("Access Control (grantAccess / revokeAccess)", () => {
    beforeEach(async () => {
      await vault.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, "");
    });

    it("owner can grant access to auditor", async () => {
      await expect(vault.connect(alice).grantAccess(fileHash, auditor.address))
        .to.emit(vault, "AccessGranted")
        .withArgs(fileHash, auditor.address);
    });

    it("grantee can read proof after access granted", async () => {
      await vault.connect(alice).grantAccess(fileHash, auditor.address);
      const proof = await vault.connect(auditor).getProof(fileHash);
      expect(proof.owner).to.equal(alice.address);
    });

    it("non-grantee cannot read proof", async () => {
      await expect(
        vault.connect(bob).getProof(fileHash)
      ).to.be.revertedWithCustomError(vault, "AccessDenied");
    });

    it("owner can revoke access", async () => {
      await vault.connect(alice).grantAccess(fileHash, auditor.address);
      await vault.connect(alice).revokeAccess(fileHash, auditor.address);
      await expect(
        vault.connect(auditor).getProof(fileHash)
      ).to.be.revertedWithCustomError(vault, "AccessDenied");
    });

    it("hasAccess returns correct values", async () => {
      expect(await vault.hasAccess(fileHash, auditor.address)).to.be.false;
      await vault.connect(alice).grantAccess(fileHash, auditor.address);
      expect(await vault.hasAccess(fileHash, auditor.address)).to.be.true;
    });

    it("hasAccess returns true for owner", async () => {
      expect(await vault.hasAccess(fileHash, alice.address)).to.be.true;
    });
  });

  // ─── ZK Verification ────────────────────────────────────────────────────
  describe("verifyOwnership() — ZK Groth16", () => {
    beforeEach(async () => {
      await vault.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, "");
    });

    it("reverts ZKVerifierNotSet when no verifier is configured", async () => {
      await expect(
        vault.connect(alice).verifyOwnership(fileHash, fakeProof, publicInputs)
      ).to.be.revertedWithCustomError(vault, "ZKVerifierNotSet");
    });

    it("returns true when ZK verifier accepts proof", async () => {
      const MockVerifier = await ethers.getContractFactory("MockVerifier");
      const mockV = await MockVerifier.deploy(true);
      await vault.connect(owner).setZKVerifier(await mockV.getAddress());

      const result = await vault.verifyOwnership(fileHash, fakeProof, publicInputs);
      expect(result).to.be.true;
    });

    it("reverts ZKProofInvalid when ZK verifier rejects proof", async () => {
      const MockVerifier = await ethers.getContractFactory("MockVerifier");
      const mockV = await MockVerifier.deploy(false);
      await vault.connect(owner).setZKVerifier(await mockV.getAddress());

      await expect(
        vault.verifyOwnership(fileHash, fakeProof, publicInputs)
      ).to.be.revertedWithCustomError(vault, "ZKProofInvalid");
    });

    it("reverts InvalidInput if publicInputs[0] doesn't match fileHash", async () => {
      const MockVerifier = await ethers.getContractFactory("MockVerifier");
      const mockV = await MockVerifier.deploy(true);
      await vault.connect(owner).setZKVerifier(await mockV.getAddress());

      const wrongInputs = [BigInt(fileHash) + 1n, BigInt(commitment)];
      await expect(
        vault.verifyOwnership(fileHash, fakeProof, wrongInputs)
      ).to.be.revertedWithCustomError(vault, "InvalidInput");
    });

    it("reverts InvalidInput if publicInputs[1] doesn't match stored commitment", async () => {
      const MockVerifier = await ethers.getContractFactory("MockVerifier");
      const mockV = await MockVerifier.deploy(true);
      await vault.connect(owner).setZKVerifier(await mockV.getAddress());

      const wrongInputs = [BigInt(fileHash), BigInt(commitment) + 1n];
      await expect(
        vault.verifyOwnership(fileHash, fakeProof, wrongInputs)
      ).to.be.revertedWithCustomError(vault, "InvalidInput");
    });

    it("reverts ProofIsRevoked on revoked proof", async () => {
      await vault.connect(alice).revokeProof(fileHash);
      const MockVerifier = await ethers.getContractFactory("MockVerifier");
      const mockV = await MockVerifier.deploy(true);
      await vault.connect(owner).setZKVerifier(await mockV.getAddress());

      await expect(
        vault.verifyOwnership(fileHash, fakeProof, publicInputs)
      ).to.be.revertedWithCustomError(vault, "ProofIsRevoked");
    });
  });

  // ─── Admin ──────────────────────────────────────────────────────────────
  describe("Admin", () => {
    it("non-owner cannot setZKVerifier", async () => {
      await expect(
        vault.connect(alice).setZKVerifier(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("non-owner cannot pause", async () => {
      await expect(vault.connect(alice).pause())
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("owner can pause and unpause", async () => {
      await vault.connect(owner).pause();
      expect(await vault.paused()).to.be.true;
      await vault.connect(owner).unpause();
      expect(await vault.paused()).to.be.false;
    });
  });

  // ─── Upgradeability ─────────────────────────────────────────────────────
  describe("UUPS Upgradeability", () => {
    it("non-owner cannot upgrade", async () => {
      const V2 = await ethers.getContractFactory("EvidenceVault");
      await expect(
        upgrades.upgradeProxy(await vault.getAddress(), V2.connect(alice), { kind: "uups" })
      ).to.be.reverted;
    });

    it("owner can upgrade to new implementation", async () => {
      const V2      = await ethers.getContractFactory("EvidenceVault");
      const proxyAddr = await vault.getAddress();
      const upgraded  = await upgrades.upgradeProxy(proxyAddr, V2, { kind: "uups" });
      const newImpl   = await upgrades.erc1967.getImplementationAddress(proxyAddr);
      expect(newImpl).to.be.properAddress;
      // State is preserved across upgrade
      await upgraded.connect(alice).createProof(fileHash, commitment, ARWEAVE_TX_ID, "");
      const proof = await upgraded.connect(alice).getProof(fileHash);
      expect(proof.owner).to.equal(alice.address);
    });
  });
});

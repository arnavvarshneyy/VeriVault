import { expect } from "chai";
import { ethers } from "hardhat";

describe("Certisure", function () {
  it("deploys and assigns roles to deployer", async function () {
    const [deployer, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("Certisure");
    const contract = await Factory.connect(deployer).deploy("Certisure", "CERT");
    await contract.waitForDeployment();

    // Deployer should be admin and issuer by default
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const ISSUER_ROLE = await contract.ISSUER_ROLE();

    expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.equal(true);
    expect(await contract.hasRole(ISSUER_ROLE, deployer.address)).to.equal(true);
    expect(await contract.hasRole(ISSUER_ROLE, other.address)).to.equal(false);
  });

  it("mints, verifies and revokes a certificate", async function () {
    const [issuer, recipient, attacker] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("Certisure");
    const contract = await Factory.deploy("Certisure", "CERT");
    await contract.waitForDeployment();

    const tokenUri = "ipfs://bafy...metadata";
    const fileHash = ethers.keccak256(ethers.toUtf8Bytes("dummy-pdf"));

    // Only issuer can mint
    await expect(
      contract.connect(recipient).mintCertificate(recipient.address, tokenUri, fileHash)
    ).to.be.reverted;

    const tx = await contract.connect(issuer).mintCertificate(recipient.address, tokenUri, fileHash);
    await tx.wait();
    // Since contract starts token IDs at 1 and increments by 1, first mint should be 1
    const tokenId = 1n;

    const verify = await contract.verify(tokenId);
    expect(verify.owner).to.equal(recipient.address);
    expect(verify.uri).to.equal(tokenUri);
    expect(verify.revoked).to.equal(false);
    expect(verify.fileHash).to.equal(fileHash);

    // Non-issuer cannot revoke
    await expect(contract.connect(attacker).revoke(tokenId)).to.be.reverted;

    // Issuer revokes
    await expect(contract.connect(issuer).revoke(tokenId)).to.emit(contract, "CertificateRevoked");

    expect(await contract.isRevoked(tokenId)).to.equal(true);
  });
});

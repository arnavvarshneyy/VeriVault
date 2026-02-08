import { ethers } from "hardhat";

async function main() {
  const name = process.env.CONTRACT_NAME || "VeriVault";
  const symbol = process.env.CONTRACT_SYMBOL || "CERT";

  const Factory = await ethers.getContractFactory("VeriVault");
  const contract = await Factory.deploy(name, symbol);
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log(`VeriVault deployed at: ${addr}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {},
  etherscan: {},
  mocha: {
    timeout: 120000
  }
};

// Add sepolia network only when env vars are provided
if (SEPOLIA_RPC_URL) {
  const networks: Record<string, any> = { ...(config.networks as any) };
  networks.sepolia = {
    url: SEPOLIA_RPC_URL,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  };
  (config as any).networks = networks;
}

if (ETHERSCAN_API_KEY) {
  (config as any).etherscan = { apiKey: ETHERSCAN_API_KEY };
}

export default config;

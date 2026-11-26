
import { ethers } from "ethers";
import contractArtifact from "./MedicineVerification.json";

const CONTRACT_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
const RPC_URL = "http://172.17.2.12:8545";

// Local Hardhat development account only.
// Never use this private key on a real blockchain.
const HARDHAT_TEST_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

// Register using the local Hardhat test account
export async function getContract() {
  const provider = getProvider();
  const wallet = new ethers.Wallet(HARDHAT_TEST_PRIVATE_KEY, provider);

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    wallet
  );
}

// Read-only connection for verification
export function getReadContract() {
  const provider = getProvider();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    provider
  );
}

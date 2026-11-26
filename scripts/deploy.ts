
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("Deploying Medicine Verification Contract...");

  const MedicineVerification = await ethers.getContractFactory(
    "MedicineVerification"
  );

  const medicineContract = await MedicineVerification.deploy();

  await medicineContract.waitForDeployment();

  console.log("Medicine Verification deployed successfully!");
  console.log("Contract Address:", await medicineContract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

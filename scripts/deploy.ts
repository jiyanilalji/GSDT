import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const GSDT = await ethers.getContractFactory("GSDT");
  const gsdt = await GSDT.deploy();
  await gsdt.deployed();

  console.log("DBDK deployed to:", gsdt.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
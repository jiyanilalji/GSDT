import { expect } from "chai";
import { ethers } from "hardhat";
import { DBDK } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("DBDK", function () {
  let dbdk: DBDK;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let priceUpdater: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  const BURNER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE"));
  const PRICE_UPDATER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PRICE_UPDATER_ROLE"));

  beforeEach(async function () {
    [owner, minter, burner, priceUpdater, user1, user2] = await ethers.getSigners();
    
    const DBDK = await ethers.getContractFactory("DBDK");
    dbdk = await DBDK.deploy();
    await dbdk.deployed();

    // Grant roles
    await dbdk.grantRole(MINTER_ROLE, minter.address);
    await dbdk.grantRole(BURNER_ROLE, burner.address);
    await dbdk.grantRole(PRICE_UPDATER_ROLE, priceUpdater.address);

    // Approve KYC for test users
    await dbdk.updateKYCStatus(user1.address, true);
    await dbdk.updateKYCStatus(user2.address, true);
  });

  describe("Basic Functionality", function () {
    it("Should set the correct initial state", async function () {
      expect(await dbdk.name()).to.equal("Da BRICS Digital Koin");
      expect(await dbdk.symbol()).to.equal("DBDK");
      expect(await dbdk.currentPrice()).to.equal(1000000); // 1 USDC
    });

    it("Should have correct role assignments", async function () {
      expect(await dbdk.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      expect(await dbdk.hasRole(BURNER_ROLE, burner.address)).to.be.true;
      expect(await dbdk.hasRole(PRICE_UPDATER_ROLE, priceUpdater.address)).to.be.true;
    });
  });

  describe("KYC Functionality", function () {
    it("Should correctly update KYC status", async function () {
      await dbdk.updateKYCStatus(user1.address, true);
      expect(await dbdk.kycApproved(user1.address)).to.be.true;
    });

    it("Should fail KYC update from non-admin", async function () {
      await expect(
        dbdk.connect(user1).updateKYCStatus(user2.address, true)
      ).to.be.revertedWith("AccessControl");
    });
  });

  describe("Minting", function () {
    it("Should allow minting within limits", async function () {
      const mintAmount = ethers.utils.parseEther("1000"); // 1000 DBDK
      await dbdk.connect(minter).mint(user1.address, mintAmount);
      expect(await dbdk.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should fail minting below minimum", async function () {
      const mintAmount = ethers.utils.parseEther("50"); // 50 DBDK
      await expect(
        dbdk.connect(minter).mint(user1.address, mintAmount)
      ).to.be.revertedWith("DBDK: amount below minimum");
    });

    it("Should fail minting to non-KYC user", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await dbdk.updateKYCStatus(user1.address, false);
      await expect(
        dbdk.connect(minter).mint(user1.address, mintAmount)
      ).to.be.revertedWith("DBDK: recipient not KYC approved");
    });
  });

  describe("Redemption", function () {
    const redeemAmount = ethers.utils.parseEther("1000");

    beforeEach(async function () {
      // Mint tokens for testing redemption
      await dbdk.connect(minter).mint(user1.address, redeemAmount);
    });

    it("Should allow redemption request", async function () {
      await dbdk.connect(user1).requestRedemption(redeemAmount);
      const request = await dbdk.redemptionRequests(0);
      expect(request.user).to.equal(user1.address);
      expect(request.amount).to.equal(redeemAmount);
    });

    it("Should process approved redemption", async function () {
      await dbdk.connect(user1).requestRedemption(redeemAmount);
      await dbdk.processRedemption(0, true);
      expect(await dbdk.balanceOf(user1.address)).to.equal(0);
    });

    it("Should handle rejected redemption", async function () {
      await dbdk.connect(user1).requestRedemption(redeemAmount);
      await dbdk.processRedemption(0, false);
      expect(await dbdk.balanceOf(user1.address)).to.equal(redeemAmount);
    });
  });

  describe("Price Updates", function () {
    it("Should update price correctly", async function () {
      const newPrice = 1100000; // 1.1 USDC
      await dbdk.connect(priceUpdater).updatePrice(newPrice);
      expect(await dbdk.currentPrice()).to.equal(newPrice);
    });

    it("Should fail price update from unauthorized account", async function () {
      await expect(
        dbdk.connect(user1).updatePrice(1100000)
      ).to.be.revertedWith("AccessControl");
    });
  });

  describe("Transfer Restrictions", function () {
    const amount = ethers.utils.parseEther("100");

    beforeEach(async function () {
      await dbdk.connect(minter).mint(user1.address, amount);
    });

    it("Should allow transfer between KYC approved users", async function () {
      await dbdk.connect(user1).transfer(user2.address, amount);
      expect(await dbdk.balanceOf(user2.address)).to.equal(amount);
    });

    it("Should block transfer to non-KYC user", async function () {
      await dbdk.updateKYCStatus(user2.address, false);
      await expect(
        dbdk.connect(user1).transfer(user2.address, amount)
      ).to.be.revertedWith("DBDK: KYC check failed");
    });
  });
});
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PurchaseNFT contract", () => {
  let Token, token, owner, addr1, addr2, addr3, zeroAddress;

  beforeEach(async () => {
    NFTTokenContract = await ethers.getContractFactory("ERC721");
    nftTokenContract = await NFTTokenContract.deploy("My Test NFT", "MTN");

    CurrencyToken = await ethers.getContractFactory("Token");
    currencyToken = await CurrencyToken.deploy("My Test Token", "MTT");

    PurchaseNFTContract = await ethers.getContractFactory("PurchaseNFT");
    purchaseNFTContract = await PurchaseNFTContract.deploy(
      10,
      "500000000000000000",
      currencyToken.address,
      nftTokenContract.address
    );
    [owner, addr1, addr2, addr3, _] = await ethers.getSigners();
  });

  describe("deployment", () => {
    it("should return right prices", async () => {
      const tokenPrice = await purchaseNFTContract.priceInTokens();
      expect(tokenPrice).to.equal(10);

      const ETHPrice = await purchaseNFTContract.priceInETH();
      expect(ETHPrice).to.equal("500000000000000000");
    });
  });

  describe("make purchase using Token", () => {
    it("should transfer NFT to buyer", async () => {
      await currencyToken.transfer(addr1.address, 10);
      let addr1TokenBalance = await currencyToken.balanceOf(addr1.address);
      expect(addr1TokenBalance).to.equal(10);

      await currencyToken
        .connect(addr1)
        .approve(purchaseNFTContract.address, 10);

      await purchaseNFTContract.connect(addr1).makePurchaseUsingTokens(1);

      addr1TokenBalance = await currencyToken.balanceOf(addr1.address);
      expect(addr1TokenBalance).to.equal(0);

      let addr1NftBalance = await nftTokenContract.balanceOf(addr1.address);
      expect(addr1NftBalance).to.equal(1);

      await expect(await nftTokenContract.ownerOf(1)).to.equal(addr1.address);
    });

    it("should not transfer NFT if not enough tokens approved", async () => {
      await currencyToken.transfer(addr1.address, 10);
      let addr1TokenBalance = await currencyToken.balanceOf(addr1.address);
      expect(addr1TokenBalance).to.equal(10);

      await currencyToken
        .connect(addr1)
        .approve(purchaseNFTContract.address, 9);

      await expect(
        purchaseNFTContract.connect(addr1).makePurchaseUsingTokens(1)
      ).to.be.revertedWith("PurchaseNFT: price amount not approved");
    });

    it("should not transfer NFT if not enough tokens owned", async () => {
      await currencyToken.transfer(addr1.address, 5);
      let addr1TokenBalance = await currencyToken.balanceOf(addr1.address);
      expect(addr1TokenBalance).to.equal(5);

      await currencyToken
        .connect(addr1)
        .approve(purchaseNFTContract.address, 10);

      await expect(
        purchaseNFTContract.connect(addr1).makePurchaseUsingTokens(1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("make purchase using Ether", () => {
    it("should transfer NFT to buyer", async () => {
      let initialAddr1Balance = await addr1.getBalance();

      await purchaseNFTContract.connect(addr1).makePurchaseUsingEther(1, {
        value: ethers.utils.parseEther("0.5"),
      });
      addr1Balance = await addr1.getBalance();
      expect(Number(ethers.utils.formatEther(addr1Balance))).to.be.lessThan(
        Number(ethers.utils.formatEther(initialAddr1Balance)) - 0.5
      );

      let addr1NftBalance = await nftTokenContract.balanceOf(addr1.address);
      expect(addr1NftBalance).to.equal(1);

      await expect(await nftTokenContract.ownerOf(1)).to.equal(addr1.address);
    });

    it("should not transfer NFT if not enough ether sent", async () => {
      await expect(
        purchaseNFTContract.connect(addr1).makePurchaseUsingEther(1, {
          value: ethers.utils.parseEther("0.4"),
        })
      ).to.be.revertedWith("PurchaseNFT: not enough Ether");
    });

    it("should refund extra ether sent", async () => {
      let initialAddr1Balance = await addr1.getBalance();

      await purchaseNFTContract.connect(addr1).makePurchaseUsingEther(1, {
        value: ethers.utils.parseEther("1"),
      });
      addr1Balance = await addr1.getBalance();
      expect(Number(ethers.utils.formatEther(addr1Balance))).to.be.greaterThan(
        Number(ethers.utils.formatEther(initialAddr1Balance)) - 1
      );

      let addr1NftBalance = await nftTokenContract.balanceOf(addr1.address);
      expect(addr1NftBalance).to.equal(1);

      await expect(await nftTokenContract.ownerOf(1)).to.equal(addr1.address);
    });
  });

  describe("change prices", () => {
    it("prices are changed", async () => {
      await purchaseNFTContract.setPriceInTokens(15);

      const tokenPrice = await purchaseNFTContract.priceInTokens();
      expect(tokenPrice).to.equal(15);

      await purchaseNFTContract.setPriceInETH("600000000000000000");
      const ETHPrice = await purchaseNFTContract.priceInETH();
      expect(ETHPrice).to.equal("600000000000000000");
    });

    it("only owner can change prices - token", async () => {
      await expect(
        purchaseNFTContract.connect(addr1).setPriceInTokens(15)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("only owner can change prices - token", async () => {
      await expect(
        purchaseNFTContract.connect(addr1).setPriceInETH("600000000000000000")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});

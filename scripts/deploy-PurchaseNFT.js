async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance: ", balance.toString());
  const currencyTokenAddress = process.env.CURRENCY_TOKEN_ADDRESS;
  const NFTTokenAddress = process.env.NFT_TOKEN_ADDRESS;

  console.log("CURRENCY_TOKEN_ADDRESS :", currencyTokenAddress);
  console.log("NFT_TOKEN_ADDRESS :", NFTTokenAddress);
  const PurchaseNFTcontract = await ethers.getContractFactory("PurchaseNFT");
  const purchaseNFTcontract = await PurchaseNFTcontract.deploy(
    10,
    "500000000000000000",
    currencyTokenAddress,
    NFTTokenAddress
  );

  console.log("contract address :", purchaseNFTcontract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

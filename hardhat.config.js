/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// require('@nomiclabs/hardhat-ethers')
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const ROPSTEN_URL = process.env.ROPSTEN_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const YOUR_ETHERSCAN_API_KEY = process.env.YOUR_ETHERSCAN_API_KEY;
module.exports = {
  solidity: "0.8.9",
  networks: {
    ropsten: {
      url: ROPSTEN_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    apiKey: YOUR_ETHERSCAN_API_KEY,
  },
};

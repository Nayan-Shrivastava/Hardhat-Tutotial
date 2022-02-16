/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// require('@nomiclabs/hardhat-ethers')
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const ROPSTEN_URL = process.env.ROPSTEN_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: ROPSTEN_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};

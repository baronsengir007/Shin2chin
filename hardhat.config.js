require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");
require("solidity-coverage");

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // Optional: Suppress warnings from external libraries
      // Uncomment the following lines if you want to suppress warnings from OpenZeppelin contracts
      // outputSelection: {
      //   "*": {
      //     "*": ["metadata", "evm.bytecode", "evm.deployedBytecode", "abi"],
      //     "": ["ast"],
      //   },
      // },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      gasPrice: "auto",
      // Comment this out for standard behavior, uncomment to auto-mine instantly
      // mining: {
      //   auto: true,
      //   interval: 0
      // },
    },
    // Only add Base testnet config if PRIVATE_KEY is set
    ...(process.env.PRIVATE_KEY
      ? {
          baseTestnet: {
            url: "https://sepolia.base.org",
            chainId: 84532,
            accounts: [process.env.PRIVATE_KEY],
            gasPrice: "auto",
          },
        }
      : {}),
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    excludeContracts: [],
    src: "./contracts",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  mocha: {
    timeout: 20000,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
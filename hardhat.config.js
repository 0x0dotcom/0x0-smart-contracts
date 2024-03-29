require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 127001,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      blockGasLimit: 199022552,
      gas: 1500000,
      gasPrice: 100,
      allowUnlimitedContractSize: false,
      throwOnTransactionFailures: false,
      throwOnCallFailures: true,
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      blockGasLimit: 10000000,
    },
    mainnet: {
      url: process.env.MAINNET_RPC,
      timeout: 99000,
      accounts: [process.env.PRIVATE_KEY],
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC,
      network_id: 4,
      timeout: 15000,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon: {
      url: process.env.MATIC_RPC,
      network_id: 137,
      timeout: 25000,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon_test: {
      url: process.env.MATIC_RPC_TEST,
      network_id: 80001,
      timeout: 25000,
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrum_test: {
      url: process.env.ARBITRUM_TEST,
      network_id: 421611,
      timeout: 25000,
      accounts: [process.env.PRIVATE_KEY],
    },
    avax_test: {
      url: process.env.AVAX_TEST,
      network_id: 43114,
      accounts: [process.env.PRIVATE_KEY],
    },
  },

  gasReporter: {
    enabled: !!process.env.REPORT_GAS === true,
    currency: "USD",
    gasPrice: 30,
    showTimeSpent: true,
    coinmarketcap: process.env.COINMARKETCAP_API,
  },
  mocha: {
    timeout: 25000,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
};

const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
//

module.exports = {
  contracts_directory: './contracts',
  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: '5', // Any network (default: none)
    },

    goerli: {
      provider: () =>
        new HDWalletProvider(
          process.env.mnemonic,
          `wss://goerli.infura.io/ws/v3/${process.env.INFURA_API_KEY}`
        ),
      network_id: 5, // Ropsten's id
      gas: 5500000, // Ropsten has a lower block limit than mainnet
      confirmations: 2, // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200, //  # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.8.15', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: 'london',
      },
    },
  },
  plugins: ['truffle-plugin-verify'],
  api_keys: {
    etherscan: `${process.env.ETHERSCAN_API_KEY}`,
  },
};

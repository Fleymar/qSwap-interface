import type { NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-typechain'
import 'hardhat-watcher'
import 'dotenv/config'
require('dotenv').config({ path: require('find-config')('.env') })

const planqMainnet: NetworkUserConfig = {
  url: 'https://evm-rpc.planq.network',
  chainId: 7070,
  accounts: [process.env.KEY_MAINNET!],
}

const planqTestnet: NetworkUserConfig = {
  url: 'https://test.rpc.evm.physica.finance',
  chainId: 700707,
  accounts: [process.env.KEY_TESTNET!],      
}


const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    ...(process.env.KEY_TESTNET && { planqTestnet }),
    ...(process.env.KEY_MAINNET && { planqMainnet }),
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
}

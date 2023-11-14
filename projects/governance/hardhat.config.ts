import type { NetworkUserConfig } from 'hardhat/types'
import 'hardhat-typechain'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
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
    version: '0.5.16',
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
}

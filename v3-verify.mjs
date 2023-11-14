#!/usr/bin/env zx
// import 'zx/globals'

const networks = {
  planqMainnet: 'planqMainnet',
  planqTestnet: 'planqTestnet',
  hardhat: 'hardhat',
}

let network = process.env.NETWORK
console.log(network, 'network')
if (!network || !networks[network]) {
  throw new Error(`env NETWORK: ${network}`)
}

await $`yarn workspace @uniswap/governance run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @uniswap/v3-core run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @uniswap/v3-periphery run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @uniswap/swap-router run hardhat run scripts/verify.ts --network ${network}`

console.log(chalk.blue('Done!'))

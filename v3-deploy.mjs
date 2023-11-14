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

await $`yarn workspace @uniswap/governance run hardhat run scripts/deploy.ts --network ${network}`

await $`yarn workspace @uniswap/v3-core run hardhat run scripts/deploy.ts --network ${network}`

await $`yarn workspace @uniswap/v3-periphery run hardhat run scripts/deploy.ts --network ${network}`

await $`yarn workspace @uniswap/swap-router run hardhat run scripts/deploy.ts --network ${network}`

console.log(chalk.blue('Done!'))

const g = await fs.readJson(`./projects/governance/deployments/${network}.json`)
const r = await fs.readJson(`./projects/router/deployments/${network}.json`)
const c = await fs.readJson(`./projects/v3-core/deployments/${network}.json`)
const p = await fs.readJson(`./projects/v3-periphery/deployments/${network}.json`)

const addresses = {
  ...g,
  ...r,
  ...c,
  ...p,
}

console.log(chalk.blue('Writing to file...'))
console.log(chalk.yellow(JSON.stringify(addresses, null, 2)))

fs.writeJson(`./deployments/${network}.json`, addresses, { spaces: 2 })

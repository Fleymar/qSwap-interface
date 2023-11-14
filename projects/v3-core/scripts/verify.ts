import { verifyContract } from '@uniswap/common/verify'
import { sleep } from '@uniswap/common/sleep'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@uniswap/v3-core/deployments/${networkName}.json`)

  // Verify UniswapV3PoolDeployer
  console.log('Verify UniswapV3PoolDeployer')
  await verifyContract(deployedContracts.UniswapV3PoolDeployer)
  await sleep(10000)

  // Verify uniswapV3Factory
  console.log('Verify uniswapV3Factory')
  await verifyContract(deployedContracts.UniswapV3Factory, [deployedContracts.UniswapV3PoolDeployer])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

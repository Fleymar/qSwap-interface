import { ethers, network } from 'hardhat'
import { configs } from '@uniswap/common/config'
import { tryVerify } from '@uniswap/common/verify'
import { writeFileSync } from 'fs'

async function main() {
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]
  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const v3DeployedContracts = await import(`@uniswap/v3-core/deployments/${networkName}.json`)
  const v3PeripheryDeployedContracts = await import(`@uniswap/v3-periphery/deployments/${networkName}.json`)

  const uniswapV3Factory_address = v3DeployedContracts.UniswapV3Factory
  const positionManager_address = v3PeripheryDeployedContracts.NonfungiblePositionManager

  /** SmartRouter */
  console.log('Deploying SmartRouter...')
  const SmartRouter = await ethers.getContractFactory('SwapRouter02')
  const smartRouter = await SmartRouter.deploy(
    config.v2Factory,
    uniswapV3Factory_address,
    positionManager_address,
    config.WNATIVE
  )
  console.log('SmartRouter deployed to:', smartRouter.address)

  // await tryVerify(smartRouter, [
  //   config.v2Factory,
  //   uniswapV3Factory_address,
  //   positionManager_address,
  //   config.WNATIVE,
  // ])

  /** QuoterV2 */
  const QuoterV2 = await ethers.getContractFactory('QuoterV2')
  const quoterV2 = await QuoterV2.deploy(uniswapV3Factory_address, config.WNATIVE)
  console.log('QuoterV2 deployed to:', quoterV2.address)

  // await tryVerify(quoterV2, [uniswapV3Factory_address, config.WNATIVE])

  const contracts = {
    SmartRouter: smartRouter.address,
    QuoterV2: quoterV2.address,
  }

  writeFileSync(`./deployments/${network.name}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

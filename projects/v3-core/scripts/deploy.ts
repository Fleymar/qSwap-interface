import { tryVerify } from '@uniswap/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  UniswapV3PoolDeployer: require('../artifacts/contracts/UniswapV3PoolDeployer.sol/UniswapV3PoolDeployer.json'),
  // eslint-disable-next-line global-require
  UniswapV3Factory: require('../artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  let uniswapV3Factory_address = ''
  let uniswapV3Factory
  if (!uniswapV3Factory_address) {
    const UniswapV3Factory = new ContractFactory(
      artifacts.UniswapV3Factory.abi,
      artifacts.UniswapV3Factory.bytecode,
      owner
    )
    uniswapV3Factory = await UniswapV3Factory.deploy()

    uniswapV3Factory_address = uniswapV3Factory.address
    console.log('uniswapV3Factory', uniswapV3Factory_address)
  } else {
    uniswapV3Factory = new ethers.Contract(uniswapV3Factory_address, artifacts.UniswapV3Factory.abi, owner)
  }


  const contracts = {
    UniswapV3Factory: uniswapV3Factory_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

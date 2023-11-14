import bn from 'bignumber.js'
import { Contract, ContractFactory, utils, BigNumber } from 'ethers'
import { ethers, upgrades, network } from 'hardhat'
import { tryVerify } from '@uniswap/common/verify'
import { configs } from '@uniswap/common/config'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  Quoter: require('../artifacts/contracts/lens/Quoter.sol/Quoter.json'),
  TickLens: require('../artifacts/contracts/lens/TickLens.sol/TickLens.json'),
  V3Migrator: require('../artifacts/contracts/V3Migrator.sol/V3Migrator.json'),
  UniswapInterfaceMulticall: require('../artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'),
  // eslint-disable-next-line global-require
  SwapRouter: require('../artifacts/contracts/SwapRouter.sol/SwapRouter.json'),
  // eslint-disable-next-line global-require
  NFTDescriptor: require('../artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json'),
  // eslint-disable-next-line global-require
  NonfungibleTokenPositionDescriptor: require('../artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json'),
  // eslint-disable-next-line global-require
  NonfungiblePositionManager: require('../artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
}

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
function encodePriceSqrt(reserve1: any, reserve0: any) {
  return BigNumber.from(
    // eslint-disable-next-line new-cap
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      // eslint-disable-next-line new-cap
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

function isAscii(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str)
}
function asciiStringToBytes32(str: string): string {
  if (str.length > 32 || !isAscii(str)) {
    throw new Error('Invalid label, must be less than 32 characters')
  }

  return '0x' + Buffer.from(str, 'ascii').toString('hex').padEnd(64, '0')
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const deployedContracts = await import(`@uniswap/v3-core/deployments/${networkName}.json`)

  const uniswapV3Factory_address = deployedContracts.UniswapV3Factory

  const SwapRouter = new ContractFactory(artifacts.SwapRouter.abi, artifacts.SwapRouter.bytecode, owner)
  const swapRouter = await SwapRouter.deploy(uniswapV3Factory_address, config.WNATIVE)

  // await tryVerify(swapRouter, [uniswapV3Factory_address, config.WNATIVE])
  console.log('swapRouter', swapRouter.address)

  const NFTDescriptor = new ContractFactory(artifacts.NFTDescriptor.abi, artifacts.NFTDescriptor.bytecode, owner)
  const nftDescriptor = await NFTDescriptor.deploy()
  // await tryVerify(nftDescriptor)
  console.log('nftDescriptor', nftDescriptor.address)

  const NonfungibleTokenPositionDescriptor = await ethers.getContractFactory('NonfungibleTokenPositionDescriptor', {
    libraries: {
      NFTDescriptor: nftDescriptor.address,
    },
  })
  const nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(
    config.WNATIVE,
    asciiStringToBytes32(config.nativeCurrencyLabel),
  )

  // await tryVerify(nonfungibleTokenPositionDescriptor, [
  //   config.WNATIVE,
  //   asciiStringToBytes32(config.nativeCurrencyLabel),
  // ])
  console.log('nonfungibleTokenPositionDescriptor', nonfungibleTokenPositionDescriptor.address)

  const NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner
  )
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    uniswapV3Factory_address,
    config.WNATIVE,
    nonfungibleTokenPositionDescriptor.address
  )

  // await tryVerify(nonfungiblePositionManager, [
  //   uniswapV3Factory_address,
  //   config.WNATIVE,
  //   nonfungibleTokenPositionDescriptor.address,
  // ])
  console.log('nonfungiblePositionManager', nonfungiblePositionManager.address)

  const UniswapInterfaceMulticall = new ContractFactory(
    artifacts.UniswapInterfaceMulticall.abi,
    artifacts.UniswapInterfaceMulticall.bytecode,
    owner
  )

  const uniswapInterfaceMulticall = await UniswapInterfaceMulticall.deploy()
  console.log('UniswapInterfaceMulticall', uniswapInterfaceMulticall.address)

  // await tryVerify(uniswapInterfaceMulticall)

  const V3Migrator = new ContractFactory(artifacts.V3Migrator.abi, artifacts.V3Migrator.bytecode, owner)
  const v3Migrator = await V3Migrator.deploy(
    uniswapV3Factory_address,
    config.WNATIVE,
    nonfungiblePositionManager.address
  )
  console.log('V3Migrator', v3Migrator.address)

  // await tryVerify(v3Migrator, [
  //   uniswapV3Factory_address,
  //   config.WNATIVE,
  //   nonfungiblePositionManager.address,
  // ])

  const TickLens = new ContractFactory(artifacts.TickLens.abi, artifacts.TickLens.bytecode, owner)
  const tickLens = await TickLens.deploy()
  console.log('TickLens', tickLens.address)

  // await tryVerify(tickLens)

  const Quoter = new ContractFactory(artifacts.Quoter.abi, artifacts.Quoter.bytecode, owner)
  const quoter = await Quoter.deploy(uniswapV3Factory_address, config.WNATIVE)
  console.log('Quoter', quoter.address)

  // await tryVerify(quoter, [uniswapV3Factory_address, config.WNATIVE])

  const contracts = {
    SwapRouter: swapRouter.address,
    V3Migrator: v3Migrator.address,
    Quoter: quoter.address,
    TickLens: tickLens.address,
    NFTDescriptor: nftDescriptor.address,
    NonfungibleTokenPositionDescriptor: nonfungibleTokenPositionDescriptor.address,
    NonfungiblePositionManager: nonfungiblePositionManager.address,
    UniswapInterfaceMulticall: uniswapInterfaceMulticall.address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

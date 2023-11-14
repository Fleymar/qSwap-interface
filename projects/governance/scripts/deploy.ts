import { ethers, network } from 'hardhat'
import { configs } from '@uniswap/common/config'
import { tryVerify } from '@uniswap/common/verify'
import { writeFileSync } from 'fs'

async function main() {
  if (network.name === 'planqMainnet') return

  const [owner] = await ethers.getSigners()
  console.log('owner', owner.address)

  /** WPLQ */
  console.log('Deploying WPLQ...')
  const WPLQ = await ethers.getContractFactory('WPLQ')
  const wPLQ = await WPLQ.deploy()
  console.log('WPLQ deployed to:', wPLQ.address)

  // await tryVerify(wPLQ, [])

  // Remember to update the init code hash in SC for different chains before deploying
  const blockTimestamp = (await ethers.provider.getBlock('latest')).timestamp + 100000000;

  /** Qswap */
  console.log('Deploying Qswap...')
  const Qswap = await ethers.getContractFactory('Qswap')
  const qswap = await Qswap.deploy(owner.address, owner.address, blockTimestamp)
  console.log('Qswap deployed to:', qswap.address)

  // await tryVerify(qswap, [])

  const contracts = {
    WPLQ: wPLQ.address,
    Qswap: qswap.address,
  }

  writeFileSync(`./deployments/${network.name}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

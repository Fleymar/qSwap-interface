import { ethers, network } from 'hardhat'
import { verifyContract } from '@uniswap/common/verify'
import { sleep } from '@uniswap/common/sleep'

async function main() {
  if (network.name === 'planqMainnet') return

  const networkName = network.name

  const deployedContracts_governance = await import(`@uniswap/governance/deployments/${networkName}.json`)

  // Verify WPLQ
  console.log('Verify WPLQ')
  await verifyContract(deployedContracts_governance.WPLQ)
  await sleep(10000)

  // Verify Qswap
  console.log('Verify Qswap')
  await verifyContract(deployedContracts_governance.Qswap)
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

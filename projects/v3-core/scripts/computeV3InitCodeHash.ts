import { ethers } from 'hardhat'
import UniswapV3PoolArtifact from '../artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'

const hash = ethers.utils.keccak256(UniswapV3PoolArtifact.bytecode)
console.log(hash)

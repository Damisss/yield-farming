const fs = require('fs-extra')
const path = require('path')
import { ethers, artifacts } from "hardhat";

async function main() {
 
  const [deployer, ...otherAccounts] = await ethers.getSigners()
  const YieldFarm = await ethers.getContractFactory('YieldFarm')
  const yieldFarm = await YieldFarm.deploy()
  await yieldFarm.deployed()
 
  console.log(`deployment:Yield Farm Contact contract address is :   ${yieldFarm.address}`)
  
  contractsBuild('YieldFarm', yieldFarm.address)
}

const contractsBuild = (contractName: string, address:string): void => {
  const contractsBuildDirectory = path.join(__dirname, '..', 'contracts-build-directory/yield-farm-contract')
  
  fs.removeSync(contractsBuildDirectory + `/abi.json`)
  fs.removeSync(contractsBuildDirectory + `/address.json`)
 
  fs.outputJsonSync(
    path.join(contractsBuildDirectory + `/address.json`),
    { address }
  )
  
  const artifact = artifacts.readArtifactSync(contractName)
  fs.outputJsonSync(
    path.join(contractsBuildDirectory + `/abi.json`),
    artifact
  )

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
  process.exit(1)
})

import { BigNumberish, Contract, utils } from "ethers";
import { ethers, network } from "hardhat";
import {mine} from '@nomicfoundation/hardhat-network-helpers'
require("dotenv").config();

const ERC20_ABI = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi
const DAI_WHALE = '0xBCb742AAdb031dE5de937108799e89A392f07df1'
const CDAI =  '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
const COMP = '0xc00e94Cb662C3520282E6f5717214004A7f26888';
const COMP_CONTROLLER = '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B';

const wait = (seconds:number) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const toWei = (value:string)=>utils.parseUnits(value, 18)
const toEther = (value:BigNumberish)=>utils.formatEther(value)

const main = async ()=>{
    // await ethers.provider.send(
    //     'hardhat_reset',
    //     [
    //         {
    //             forking:{
    //                 jsonRpcUrl:`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    //                 //blockNumber: 16257255
    //             }
    //         }
    //     ]
    // )

    

    const YieldFarm = await ethers.getContractFactory('YieldFarm')
    const yieldFarm = await YieldFarm.deploy()
    await yieldFarm.deployed()


    await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [DAI_WHALE]
    })
    
    const accounts = await ethers.getSigners()
    const whale = await ethers.getSigner(DAI_WHALE)
    const daiContract = new Contract(process.env.DAI as string, ERC20_ABI, accounts[0])
    const compContract = new Contract(COMP, ERC20_ABI, accounts[0])
    //const cdaiContract = new Contract(DAI, ERC20ABI, accounts[0])

    // transfer some dai to  contracts deployer(owner of contracts)
    await daiContract.connect(whale).transfer(accounts[0].address, toWei('100'))
    const daiBalanceBeforeDeposit = await daiContract.balanceOf(accounts[0].address)
    const compBalanceBeforeDeposit = await compContract.balanceOf(accounts[0].address)
    // approve leverage contract
    await daiContract.connect(accounts[0]).approve(yieldFarm.address, toWei('100'))
    //deposit fund
    await yieldFarm.connect(accounts[0]).deposit(
        process.env.DAI as string, 
        CDAI, 
        toWei('100')
    )
    // mine 10 block
    mine(10)
    
    //withdraw and then claim rewards (comp token)
    await yieldFarm.connect(accounts[0]).withdraw(process.env.DAI as string, CDAI)
    await yieldFarm.connect(accounts[0]).claimComp(COMP, COMP_CONTROLLER)
    // grab balances after withdrawing.
    const daiBalanceAfter = await daiContract.balanceOf(accounts[0].address)
    const compBalanceAfter = await compContract.balanceOf(accounts[0].address)

    const data = {
        'dai balance before': toEther(daiBalanceBeforeDeposit),
        'dai balance after': toEther(daiBalanceAfter),
        'comp balance before': toEther(compBalanceBeforeDeposit),
        'comp balance after': toEther(compBalanceAfter)
    }

    console.table(data)    
}

main().then(()=>{
    process.exitCode = 0
    process.exit(0)
}).catch((error) => {
    console.error(error)
    process.exitCode = 1
    process.exit(1)
})
  
import { ethers, network } from 'hardhat'
import { utils, Contract, constants } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {time, mine} from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
require("dotenv").config();

const ERC20_ABI = require('./IERC20.json').abi

const toWei = (value:string)=> utils.parseUnits(value, 18)

describe('staking',()=>{
    const DAI_WHALE = '0xBCb742AAdb031dE5de937108799e89A392f07df1'
    const CDAI =  '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
    const COMP = '0xc00e94Cb662C3520282E6f5717214004A7f26888';
    const COMP_CONTROLLER = '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B';
    let yieldFarm: Contract
    let dai: Contract
    let deployer: SignerWithAddress
    let OtherAccount: SignerWithAddress[]
    let daiWhale: SignerWithAddress
  
    beforeEach(async() => {
        // And get signers here
        [deployer, ...OtherAccount] = await ethers.getSigners()
        // Deploy contracts 
        const YieldFarm = await ethers.getContractFactory('YieldFarm')
        yieldFarm = await YieldFarm.deploy()
        await yieldFarm.deployed()
        
        dai = new ethers.Contract(process.env.DAI as string, ERC20_ABI)
        
        await network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [DAI_WHALE]
        })
    
        daiWhale = await ethers.getSigner(DAI_WHALE)
        await dai.connect(daiWhale).transfer(deployer.address, toWei('100'))
        await dai.connect(deployer).approve(yieldFarm.address, toWei('100'))
        
    })

    describe('deposit', ()=>{
        it('should fail if wrong token address is used', async()=>{
            await expect(
                yieldFarm.connect(deployer).deposit(constants.AddressZero, CDAI, toWei('100'), {
                    gasLimit:5000000
                })
            ).to.revertedWith('wrong token provided')
        })

        it('should fail if wrong ctoken address is used', async()=>{
            await expect(
                yieldFarm.connect(deployer).deposit(process.env.DAI, constants.AddressZero, toWei('100'), {
                    gasLimit:5000000
                })
            ).to.revertedWith('wrong token provided')
        })

        it('should fail if amount is equal to zero', async()=>{
            await expect(
                yieldFarm.connect(deployer).deposit(process.env.DAI, CDAI, toWei('0'), {
                    gasLimit:5000000
                })
            ).to.revertedWith('amount should be greater than zero')
        })
        
        it('should deposit', async()=>{
            
            const tx = await yieldFarm.connect(deployer).deposit(process.env.DAI, CDAI, toWei('100'), {
                gasLimit:5000000
            })
            const result = await tx.wait()
            expect(process.env.DAI).to.eql(result.events[19].args[0])
            expect(CDAI).to.eql(result.events[19].args[1])
            expect(toWei('100')).to.eql(result.events[19].args[2])
        })
    })
    
    describe('withdraw', ()=>{
        it('should fail if wrong token address is used', async()=>{
            await expect(
                yieldFarm.connect(deployer).withdraw(constants.AddressZero, CDAI, {
                    gasLimit:5000000
                })
            ).to.revertedWith('wrong token provided')
        })

        it('should fail if wrong ctoken address is used', async()=>{
            await expect(
                yieldFarm.connect(deployer).withdraw(process.env.DAI, constants.AddressZero, {
                    gasLimit:5000000
                })
            ).to.revertedWith('wrong token provided')
        })

        it('should withdraw', async()=>{
            const tx = await yieldFarm.connect(deployer).deposit(process.env.DAI, CDAI, toWei('100'), {
                gasLimit:5000000
            })
            await tx.wait()
            mine(5, {interval:15})
            const withdrawTx = await yieldFarm.connect(deployer).withdraw(process.env.DAI, CDAI, {
                gasLimit:5000000
            })
            const result = await withdrawTx.wait()
            expect(process.env.DAI).to.eql(result.events[17].args[0])
            expect(CDAI).to.eql(result.events[17].args[1])
        })
    })

    describe('claim comp', ()=>{
        it('should fail if wrong comp token address is used', async()=>{
            await expect(
                yieldFarm.connect(deployer).claimComp(constants.AddressZero, CDAI, {
                    gasLimit:5000000
                })
            ).to.revertedWith('wrong token provided')
        })

        it('should fail if wrong comp controller address is used', async()=>{
            await expect(
                yieldFarm.connect(deployer).claimComp(process.env.DAI, constants.AddressZero, {
                    gasLimit:5000000
                })
            ).to.revertedWith('wrong token provided')
        })

        it('should claim comp', async()=>{
            const compContract = new ethers.Contract(COMP, ['function balanceOf(address) external view returns (uint256)'])
            const compTokenBalanceBefore = await compContract.connect(deployer).balanceOf(deployer.address)
            await yieldFarm.connect(deployer).deposit(process.env.DAI, CDAI, toWei('100'), {
                gasLimit:5000000
            })
            mine(10, {interval:15})
            await yieldFarm.connect(deployer).withdraw(process.env.DAI, CDAI, {
                gasLimit:5000000
            })

            const claimTx = await yieldFarm.connect(deployer).claimComp(COMP, COMP_CONTROLLER);
            await claimTx.wait()
            const compTokenBalanceAfter = await compContract.connect(deployer).balanceOf(deployer.address)
            expect(compTokenBalanceAfter).to.be.greaterThan(compTokenBalanceBefore)
            
        }).timeout(80000)
    })

})
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {DyDxFlashLoan} from './DyDxFlashLoan.sol';
import {ICToken} from './ICToken.sol';
import {ICompController} from './ICompController.sol';
import {LoanManager,ICToken} from './LoanManager.sol';
import {ICompToken} from './ICompToken.sol';

import 'hardhat/console.sol';

contract YieldFarm is DyDxFlashLoan, Ownable, LoanManager {
    bool private isDeposit;
    event Deposit(address token, address cToken, uint256 amount);
    event Withdraw(address token, address cToken, uint256 amount);
    event ClaimRewards(address token, uint256 amount);
    
    modifier wrongToken(address token_){
       require(token_ != address(0), 'wrong token provided');
       _;
    } 

    function deposit(
        address token_, 
        address cToken_, 
        uint256 amount_
    ) external wrongToken(token_) wrongToken(cToken_) onlyOwner{
        require(amount_ > 0, 'amount should be greater than zero');
        
        uint256 total =((amount_ * 10)/3); //amount is 30% of total 
        uint256 flasLoanAmount = total - amount_;
        
        IERC20(token_).transferFrom(msg.sender, address(this), amount_);
        uint256 balanceBefore = IERC20(token_).balanceOf(address(this));

        bytes memory data = abi.encode(token_, cToken_, total, flasLoanAmount, balanceBefore);
        //flashloan
        isDeposit=true;
        
        flashloan(token_, flasLoanAmount, data);
        // withdraw
        emit Deposit(token_, cToken_, amount_);
    }

    function withdraw(
        address token_, 
        address cToken_
    ) external wrongToken(token_) wrongToken(cToken_) onlyOwner{
        uint256 borrowedAmount = ICToken(cToken_).borrowBalanceCurrent(address(this));
        uint256 balanceBefore = IERC20(token_).balanceOf(address(this));
        bytes memory data = abi.encode(token_, cToken_, borrowedAmount, balanceBefore);
        isDeposit=false;
        flashloan(token_, borrowedAmount, data);
        emit Withdraw(token_, cToken_, borrowedAmount);
        bool result = IERC20(token_).transfer(msg.sender, IERC20(token_).balanceOf(address(this)));
        if(!result){
            revert('transfer error');
        }
        
    }

    function callFunction(
        address, /* sender */
        Info memory, /* accountInfo */
        bytes memory data
    ) public onlyPool {
     
        if(isDeposit){
            (
                address token,
                address cToken,
                uint256 totalAmount,
                uint256 flasLoanAmount,
                uint256 balanceBefore
            ) = abi.decode(data, (address, address, uint256, uint256, uint256));
            uint256 balanceAfter = IERC20(token).balanceOf(address(this));
            require(balanceAfter-balanceBefore == flasLoanAmount);
            depositHandler(token, cToken, totalAmount, flasLoanAmount);

        }else{
            (
                address token,
                address cToken,
                uint256 flasLoanAmount,
                uint256 balanceBefore
            ) = abi.decode(data, (address, address, uint256, uint256));
            uint256 balanceAfter = IERC20(token).balanceOf(address(this));
            require(balanceAfter-balanceBefore == flasLoanAmount);
            withdrawHandler(token, cToken, flasLoanAmount);
        }
        
    }

    function claimComp(
        address comp_, 
        address compController_
    ) external wrongToken(comp_) wrongToken(compController_) onlyOwner {
        ICompController(compController_).claimComp(address(this));
        ICompToken(comp_).transfer(msg.sender, ICompToken(comp_).balanceOf(address(this)));
    }
    
} 
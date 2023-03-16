// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {ICToken} from './ICToken.sol';
import 'hardhat/console.sol';

abstract contract LoanManager {
   function depositHandler (
      address token_,
      address cToken_,
      uint256 amount_,
      uint256 flasLoanAmount_
   ) internal{
    require(IERC20(token_).approve(cToken_, amount_), 'ERC20: approved');
    // supply total amount into compound protocol
    require(ICToken(cToken_).mint(amount_ - 1) == 0, 'fail to mint cToken');
    // borrow flash loan amount from compound protocol so that flash loan can be repaid in the same transaction
    require(ICToken(cToken_).borrow(flasLoanAmount_) == 0, 'fail to borrow cToken');
   }

   function withdrawHandler(
      address token_,
      address cToken_,
      uint256 flasLoanAmount_
   ) internal{
      require( flasLoanAmount_ > 0);
      IERC20(token_).approve(cToken_, flasLoanAmount_);
      require(ICToken(cToken_).repayBorrow(type(uint).max) == 0, 'fail to repay borrow');

      uint balance = ICToken(cToken_).balanceOf(address(this));
      require(ICToken(cToken_).redeem(balance) == 0, 'fail to redeem token');  
   }

}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface ICToken {
    function mint(uint256) external returns (uint256);

    function borrow(uint256) external returns (uint);

    function repayBorrow(uint256) external returns (uint);

    function redeem(uint256) external returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function borrowBalanceCurrent(address) external returns (uint);
    function exchangeRateCurrent() external returns (uint);
    function borrowRatePerBlock() external returns (uint);
    function allowance(address owner, address spender)  external view returns (uint256);
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface ICompToken{
    function balanceOf(address) external view returns (uint256);
    function transfer(address dst, uint rawAmount) external returns (bool);
}
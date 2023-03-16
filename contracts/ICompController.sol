// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ICompController {
    function markets(address cTokenAddress) external view returns (bool, uint, bool);
    function claimComp(address holder) external ;
    function getAssetsIn(address account) external view returns (address[] memory);
    function closeFactorMantissa() external view  returns (uint);
}

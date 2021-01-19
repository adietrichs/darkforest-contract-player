// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract PlayerV1 {
  function onERC721Received(
    address,
    address,
    uint256,
    bytes calldata
  ) external pure returns (bytes4) {
    return 0x150b7a02;
  }

  receive() external payable {} 
}
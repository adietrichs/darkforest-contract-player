// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract PlayerV2 {
  address payable private _owner;
  mapping(address => bool) allowedAccounts;

  function onERC721Received(
    address,
    address,
    uint256,
    bytes calldata
  ) external pure returns (bytes4) {
    return 0x150b7a02;
  }

  receive() external payable {}

  function owner() public view returns (address) {
    return _owner;
  }

  function isAllowed(address account) public view returns (bool) {
    return _owner == account || allowedAccounts[account];
  }

  modifier onlyOwner() {
    require(_owner == msg.sender, "Ownable: caller is not the owner");
    _;
  }

  modifier onlyAllowed() {
    require(_owner == msg.sender || allowedAccounts[msg.sender], "Caller is not in Allowed");
    _;
  }

  function initV2(address payable newOwner) external {
    require(_owner == address(0), "Already initialized");
    _owner = newOwner;
  }

  function transferOwnership(address payable newOwner) external onlyOwner {
    require(newOwner != address(0), "Ownable: new owner is the zero address");
    _owner = newOwner;
  }

  function addAccount(address account) external onlyOwner {
    allowedAccounts[account] = true;
  }

  function removeAccount(address account) external onlyOwner {
    allowedAccounts[account] = false;
  }

  function forward(address payable target, bytes calldata payload) external payable onlyAllowed returns (bool, bytes memory) {
    return target.call{value: msg.value}(payload);
  }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "./DarkForest.sol";

contract PlayerV4 {
  address payable private _owner;
  mapping(address => bool) allowedAccounts;

  DarkForestCore core;
  DarkForestTokens tokens;
  uint256 artifactRemovalLocationId;
  uint256 artifactRemovalIterationsLeft;

  function onERC721Received(
    address,
    address from,
    uint256 tokenId,
    bytes calldata
  ) external returns (bytes4) {
    if (msg.sender == address(tokens) && from == address(core) && artifactRemovalIterationsLeft > 0) {
      artifactRemovalIterationsLeft--;
      tokens.transferFrom(address(this), address(core), tokenId);
      core.withdrawArtifact(artifactRemovalLocationId);
    }
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
    require(_owner == msg.sender || allowedAccounts[msg.sender] || address(this) == msg.sender, "Caller is not in Allowed");
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

  function forward(address payable target, bytes calldata payload) public payable onlyAllowed returns (bool, bytes memory) {
    return target.call{value: msg.value}(payload);
  }

  function forwardOrThrow(address payable target, bytes calldata payload) public payable onlyAllowed returns (bytes memory) {
    (bool success, bytes memory result) = target.call{value: msg.value}(payload);
    require(success, string(result));
    return result;
  }

  function setContracts(address _core, address _tokens) external onlyOwner {
    core = DarkForestCore(_core);
    tokens = DarkForestTokens(_tokens);
  }

  function removeArtifactRepeatedly(uint256 locationId, uint256 iterations) external onlyOwner {
    require(iterations >= 1, "Invalid number of iterations");
    require(address(core) != address(0) && address(tokens) != address(0), "contract addresses not set");
    require(artifactRemovalLocationId == 0 && artifactRemovalIterationsLeft == 0, "auxiliary variables not cleared");
    artifactRemovalLocationId = locationId;
    artifactRemovalIterationsLeft = iterations - 1;
    core.withdrawArtifact(locationId);
    require(artifactRemovalIterationsLeft == 0, "unexpected end state");
    artifactRemovalLocationId = 0;
  }
}
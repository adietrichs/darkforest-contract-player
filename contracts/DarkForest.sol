// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface DarkForestCore {
  function withdrawArtifact(uint256 locationId) external;
  function move(uint256[2] memory _a, uint256[2][2] memory _b, uint256[2] memory _c, uint256[7] memory _input) external returns (uint256);
  function planetEventsCount() external view returns (uint256);
  function findArtifact(uint256[2] memory _a, uint256[2][2] memory _b, uint256[2] memory _c, uint256[2] memory _input) external;
}

interface DarkForestTokens {
  function ownerOf(uint256 tokenId) external view returns (address);
  function transferFrom(address from, address to, uint256 tokenId) external;
  function safeTransferFrom(address from, address to, uint256 tokenId) external;
  function transferToCoreContract(uint256 tokenId) external;
}

contract DarkForestCoreDummy {
  DarkForestTokens tokens;
  mapping(uint256 => uint256) artifacts;
  mapping(uint256 => int256) buffs;

  uint256[2] public latestA;
  uint256[2][2] public latestB;
  uint256[2] public latestC;
  uint256[7] public latestInput;

  uint256 public planetEventsCount = 0;

  function depositArtifact(uint256 locationId, uint256 artifactId) public {
    require(artifacts[locationId] == 0, "planet already has artifact");
    require(tokens.ownerOf(artifactId) == msg.sender, "you can only deposit artifacts you own");
    tokens.transferToCoreContract(artifactId);
    artifacts[locationId] = artifactId;
    buffs[locationId]++;
  }

  function withdrawArtifact(uint256 locationId) public {
    uint256 artifactId = artifacts[locationId];
    require(artifactId != 0, "planet has no artifact to withdraw");
    tokens.safeTransferFrom(address(this), msg.sender, artifactId);
    buffs[locationId]--;
  }

  function getBuff(uint256 locationId) public view returns (int256) {
    return buffs[locationId];
  }

  constructor(address _tokens) {
    tokens = DarkForestTokens(_tokens);
  }

  function addToPlanetEventsCount(uint256 _additionalCount) public returns (uint256) {
    planetEventsCount += _additionalCount;
    return planetEventsCount;
  }

  function move(uint256[2] memory _a, uint256[2][2] memory _b, uint256[2] memory _c, uint256[7] memory _input) public returns (uint256) {
    latestA = _a;
    latestB = _b;
    latestC = _c;
    latestInput = _input;
    return planetEventsCount++;
  }
}

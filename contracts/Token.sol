// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC721, Ownable {
  constructor() ERC721("Test", "TST") {}

  function mint(uint256 tokenId) external onlyOwner {
    _safeMint(msg.sender, tokenId, "");
  }

  function transferToCoreContract(uint256 tokenId) public {
    _transfer(ownerOf(tokenId), msg.sender, tokenId);
  }
}

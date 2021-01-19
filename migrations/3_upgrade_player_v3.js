const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
 
const PlayerV2 = artifacts.require('PlayerV2');
const PlayerV3 = artifacts.require('PlayerV3');

module.exports = async deployer => {
  let player = await PlayerV2.deployed();
  await upgradeProxy(player.address, PlayerV3, { deployer });
};

const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
 
const PlayerV3 = artifacts.require('PlayerV3');
const PlayerV4 = artifacts.require('PlayerV4');

module.exports = async deployer => {
  let player = await PlayerV3.deployed();
  await upgradeProxy(player.address, PlayerV4, { deployer });
};

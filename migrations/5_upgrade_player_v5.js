const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
 
const PlayerV4 = artifacts.require('PlayerV4');
const PlayerV5 = artifacts.require('PlayerV5');

module.exports = async deployer => {
  let player = await PlayerV4.deployed();
  await upgradeProxy(player.address, PlayerV5, { deployer, unsafeAllowCustomTypes: true });
};

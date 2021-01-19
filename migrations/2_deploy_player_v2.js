const { deployProxy } = require('@openzeppelin/truffle-upgrades');
 
const PlayerV2 = artifacts.require('PlayerV2');

module.exports = async (deployer, _, accounts) => {
  const player = await deployProxy(PlayerV2, { deployer });
  await player.initV2(accounts[0]);
};

const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');

const PlayerV4 = artifacts.require('PlayerV4');
const PlayerV5 = artifacts.require('PlayerV5');
 
contract('PlayerV5 (proxy)', async accounts => {
  beforeEach(async function () {
    this.playerV4 = await deployProxy(PlayerV4);
    await this.playerV4.initV2(accounts[0]);
  });

  it('owner still set after upgrade', async function () {
    const player = await upgradeProxy(this.playerV4.address, PlayerV5, {unsafeAllowCustomTypes: true});
    assert.equal(await player.owner(), accounts[0]);
  });
});
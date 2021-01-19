const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { getError } = require('./helpers');

const PlayerV2 = artifacts.require('PlayerV2');
const PlayerV3 = artifacts.require('PlayerV3');
const Token = artifacts.require('Token');
 
contract('PlayerV3 (proxy)', async accounts => {
  beforeEach(async function () {
    this.playerV2 = await deployProxy(PlayerV2);
    await this.playerV2.initV2(accounts[0]);
  });

  it('owner still set after upgrade', async function () {
    const player = await upgradeProxy(this.playerV2.address, PlayerV3);
    assert.equal(await player.owner(), accounts[0]);
  });

  it('allowed still set after upgrade', async function () {
    await this.playerV2.addAccount(accounts[1]);
    assert.equal(await this.playerV2.isAllowed(accounts[1]), true);
    const player = await upgradeProxy(this.playerV2.address, PlayerV3);
    assert.equal(await player.isAllowed(accounts[1]), true);
  });

  it('initV2 not callable after upgrade', async function () {
    const player = await upgradeProxy(this.playerV2.address, PlayerV3);
    assert.notStrictEqual(await getError(async () => {
      await player.initV2(accounts[1]);
    }), null, 'unexpected success');
  });
});
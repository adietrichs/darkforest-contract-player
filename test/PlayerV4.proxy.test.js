const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
const { getError } = require('./helpers');

const PlayerV3 = artifacts.require('PlayerV3');
const PlayerV4 = artifacts.require('PlayerV4');
const Token = artifacts.require('Token');
const DarkForestCoreDummy = artifacts.require('DarkForestCoreDummy');
 
contract('PlayerV4 (proxy)', async accounts => {
  beforeEach(async function () {
    this.playerV3 = await deployProxy(PlayerV3);
    await this.playerV3.initV2(accounts[0]);
  });

  it('withdraw thrice', async function () {
    const player = await upgradeProxy(this.playerV3.address, PlayerV4);
    const token = await Token.new();
    const core = await DarkForestCoreDummy.new(token.address);
    await player.setContracts(core.address, token.address);

    const locationId = 0;
    const artifactId = 1;
    await token.mint(artifactId);
    await token.safeTransferFrom(accounts[0], player.address, artifactId);
    assert.equal(await token.ownerOf(artifactId), player.address);

    const request = await core.depositArtifact.request(locationId, artifactId);
    await player.forward(core.address, request.data);
    assert.equal(await token.ownerOf(artifactId), core.address);
    assert.equal(await core.getBuff(locationId), 1);

    await player.removeArtifactRepeatedly(locationId, 3);
    assert.equal(await token.ownerOf(artifactId), player.address);
    assert.equal(await core.getBuff(locationId), -2);
  });
});
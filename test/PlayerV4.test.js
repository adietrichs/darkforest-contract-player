const { assert } = require('chai');
const { getError } = require('./helpers');

const PlayerV4 = artifacts.require('PlayerV4');
const Token = artifacts.require('Token');
const DarkForestCoreDummy = artifacts.require('DarkForestCoreDummy');
 
contract('PlayerV4', async accounts => {
  beforeEach(async function () {
    this.player = await PlayerV4.new();
    await this.player.initV2(accounts[0]);
  });

  it('withdraw once', async function () {
    const token = await Token.new();
    const core = await DarkForestCoreDummy.new(token.address);
    await this.player.setContracts(core.address, token.address);

    const locationId = 0;
    const artifactId = 1;
    await token.mint(artifactId);
    await token.safeTransferFrom(accounts[0], this.player.address, artifactId);
    assert.equal(await token.ownerOf(artifactId), this.player.address);

    const request = await core.depositArtifact.request(locationId, artifactId);
    await this.player.forward(core.address, request.data);
    assert.equal(await token.ownerOf(artifactId), core.address);
    assert.equal(await core.getBuff(locationId), 1);

    await this.player.removeArtifactRepeatedly(locationId, 1);
    assert.equal(await token.ownerOf(artifactId), this.player.address);
    assert.equal(await core.getBuff(locationId), 0);
  });

  it('withdraw thrice', async function () {
    const token = await Token.new();
    const core = await DarkForestCoreDummy.new(token.address);
    await this.player.setContracts(core.address, token.address);

    const locationId = 0;
    const artifactId = 1;
    await token.mint(artifactId);
    await token.safeTransferFrom(accounts[0], this.player.address, artifactId);
    assert.equal(await token.ownerOf(artifactId), this.player.address);

    const request = await core.depositArtifact.request(locationId, artifactId);
    await this.player.forward(core.address, request.data);
    assert.equal(await token.ownerOf(artifactId), core.address);
    assert.equal(await core.getBuff(locationId), 1);

    await this.player.removeArtifactRepeatedly(locationId, 3);
    assert.equal(await token.ownerOf(artifactId), this.player.address);
    assert.equal(await core.getBuff(locationId), -2);
  });
});
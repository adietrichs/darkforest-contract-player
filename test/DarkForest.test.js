const { assert } = require('chai');
const { getError } = require('./helpers');

const Token = artifacts.require('Token');
const DarkForestCoreDummy = artifacts.require('DarkForestCoreDummy');
 
contract('DarkForestCoreDummy', async accounts => {
  beforeEach(async function () {
    this.token = await Token.new();
    this.core = await DarkForestCoreDummy.new(this.token.address);
  });

  it('deposit and withdraw', async function () {
    const locationId = 0;
    const artifactId = 1;
    await this.token.mint(artifactId);
    await this.core.depositArtifact(locationId, artifactId);
    assert.equal(await this.token.ownerOf(artifactId), this.core.address);
    assert.equal(await this.core.getBuff(locationId), 1);

    await this.core.withdrawArtifact(locationId);
    assert.equal(await this.token.ownerOf(artifactId), accounts[0]);
    assert.equal(await this.core.getBuff(locationId), 0);
  });
});
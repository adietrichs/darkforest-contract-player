const { assert } = require('chai');
const { getError } = require('./helpers');

const PlayerV3 = artifacts.require('PlayerV3');
const Token = artifacts.require('Token');
 
contract('PlayerV3', async accounts => {
  beforeEach(async function () {
    this.player = await PlayerV3.new();
    await this.player.initV2(accounts[0]);
  });

  it('invalid forward returns', async function () {
    const token = await Token.new();
    const tokenId = 0;
    await token.mint(tokenId);
    assert.equal(await token.ownerOf(tokenId), accounts[0]);

    const request = await token.safeTransferFrom.request(this.player.address, accounts[0], tokenId);
    await this.player.forward(token.address, request.data);
    assert.equal(await token.ownerOf(tokenId), accounts[0]);
  });

  it('invalid forwardOrThrow throws', async function () {
    const token = await Token.new();
    const tokenId = 0;
    await token.mint(tokenId);
    assert.equal(await token.ownerOf(tokenId), accounts[0]);
    
    const request = await token.safeTransferFrom.request(this.player.address, accounts[0], tokenId);
    assert.notStrictEqual(await getError(async () => {
      await this.player.forwardOrThrow(token.address, request.data);
    }), null, 'unexpected success');
  });

  it('valid forwardOrThrow succeeds', async function () {
    const token = await Token.new();
    const tokenId = 0;
    await token.mint(tokenId);
    await token.safeTransferFrom(accounts[0], this.player.address, tokenId);
    assert.equal(await token.ownerOf(tokenId), this.player.address);

    const request = await token.safeTransferFrom.request(this.player.address, accounts[0], tokenId);
    await this.player.forward(token.address, request.data);
    assert.equal(await token.ownerOf(tokenId), accounts[0]);
  });
});
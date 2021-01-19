const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { getError } = require('./helpers');

const PlayerV1 = artifacts.require('PlayerV1');
const PlayerV2 = artifacts.require('PlayerV2');
const Token = artifacts.require('Token');
 
contract('PlayerV2 (proxy)', async accounts => {
  beforeEach(async function () {
    this.playerV1 = await deployProxy(PlayerV1);
    this.player = await deployProxy(PlayerV2);
  });

  it('forward from owner and allowed (upgraded V1)', async function () {
    assert.strictEqual(await getError(async () => {
      this.player = await upgradeProxy(this.playerV1.address, PlayerV2);

      const token = await Token.new();
      await this.player.initV2(accounts[0]);
      const tokenId = 0;
      await token.mint(tokenId);
      await token.safeTransferFrom(accounts[0], this.player.address, tokenId);
      assert.equal(await token.ownerOf(tokenId), this.player.address);
      
      const request = await token.safeTransferFrom.request(this.player.address, accounts[0], tokenId);
      await this.player.forward(token.address, request.data);
      assert.equal(await token.ownerOf(tokenId), accounts[0]);

      await token.safeTransferFrom(accounts[0], this.player.address, tokenId);
      await this.player.addAccount(accounts[1]);
      await this.player.forward(token.address, request.data, {from: accounts[1]});
      assert.equal(await token.ownerOf(tokenId), accounts[0]);
    }), null, 'unexpected error');
  });
});
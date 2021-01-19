const { getError } = require('./helpers');

const PlayerV2 = artifacts.require('PlayerV2');
const Token = artifacts.require('Token');
 
contract('PlayerV2', async accounts => {
  beforeEach(async function () {
    this.player = await PlayerV2.new();
  });
 
  it('receive token via safeTransferFrom', async function () {
    assert.strictEqual(await getError(async () => {
      const token = await Token.new();
      const tokenId = 0;
      await token.mint(tokenId);
      await token.safeTransferFrom(accounts[0], this.player.address, tokenId);
    }), null, 'unexpected error during safeTransferFrom');
  });

  it('receive payment', async function () {
    assert.strictEqual(await getError(async () => {
      await web3.eth.sendTransaction({from: accounts[0], to: this.player.address, value: web3.utils.toWei('0.05', 'ether')});
    }), null, 'unexpected error during payment');
  });

  it('initV2 callable once', async function () {
    assert.strictEqual(await getError(async () => {
      await this.player.initV2(accounts[0]);
    }), null, 'unexpected error during first init');
    assert.notStrictEqual(await getError(async () => {
      await this.player.initV2(accounts[0]);
    }), null, 'unexpected success during second init');
  });

  it('change owner', async function () {
    assert.strictEqual(await getError(async () => {
      await this.player.initV2(accounts[0]);
    }), null, 'unexpected error during init');
    assert.equal(await this.player.owner(), accounts[0]);
    assert.notStrictEqual(await getError(async () => {
      await this.player.transferOwnership(accounts[1], {from: accounts[1]});
    }), null, 'unexpected success during unauthorized ownership transfer');
    assert.strictEqual(await getError(async () => {
      await this.player.transferOwnership(accounts[1], {from: accounts[0]});
    }), null, 'unexpected error during authorized ownership transfer');
    assert.equal(await this.player.owner(), accounts[1]);
    assert.notStrictEqual(await getError(async () => {
      await this.player.transferOwnership(accounts[0], {from: accounts[0]});
    }), null, 'unexpected success during unauthorized ownership transfer');
    assert.strictEqual(await getError(async () => {
      await this.player.transferOwnership(accounts[0], {from: accounts[1]});
    }), null, 'unexpected error during authorized ownership transfer');
    assert.equal(await this.player.owner(), accounts[0]);
  });

  it('add and remove allowed', async function () {
    assert.strictEqual(await getError(async () => {
      await this.player.initV2(accounts[0]);
      assert.equal(await this.player.isAllowed(accounts[0]), true);
      assert.equal(await this.player.isAllowed(accounts[1]), false);
      await this.player.addAccount(accounts[1]);
      assert.equal(await this.player.isAllowed(accounts[1]), true);
      await this.player.removeAccount(accounts[1]);
      assert.equal(await this.player.isAllowed(accounts[1]), false);
    }), null, 'unexpected error');
  });

  it('forward from owner and allowed', async function () {
    assert.strictEqual(await getError(async () => {
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
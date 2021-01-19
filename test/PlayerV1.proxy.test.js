const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { getError } = require('./helpers');

const PlayerV0 = artifacts.require('PlayerV0');
const PlayerV1 = artifacts.require('PlayerV1');
const Token = artifacts.require('Token');
 
contract('PlayerV1 (proxy)', async accounts => {
  beforeEach(async function () {
    this.playerDummy = await deployProxy(PlayerV0);
    this.player = await deployProxy(PlayerV1);
  });
 
  it('revert on receive token via safeTransferFrom (dummy)', async function () {
    assert.notStrictEqual(await getError(async () => {
      const token = await Token.new();
      const tokenId = 0;
      await token.mint(tokenId);
      await token.safeTransferFrom(accounts[0], this.playerDummy.address, tokenId);
    }), null, 'unexpected success during safeTransferFrom');
  });

  it('revert on receive payment (dummy)', async function () {
    assert.notStrictEqual(await getError(async () => {
      await web3.eth.sendTransaction({from: accounts[0], to: this.playerDummy.address, value: web3.utils.toWei('0.05', 'ether')});
    }), null, 'unexpected success during payment');
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

  it('receive token via safeTransferFrom (upgraded dummy)', async function () {
    assert.strictEqual(await getError(async () => {
      await upgradeProxy(this.playerDummy.address, PlayerV1);
      const token = await Token.new();
      const tokenId = 0;
      await token.mint(tokenId);
      await token.safeTransferFrom(accounts[0], this.playerDummy.address, tokenId);
    }), null, 'unexpected error during safeTransferFrom');
  });

  it('receive payment (upgraded dummy)', async function () {
    assert.strictEqual(await getError(async () => {
      await upgradeProxy(this.playerDummy.address, PlayerV1);
      await web3.eth.sendTransaction({from: accounts[0], to: this.playerDummy.address, value: web3.utils.toWei('0.05', 'ether')});
    }), null, 'unexpected error during payment');
  });
});
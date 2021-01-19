const { getError } = require('./helpers');

const PlayerV1 = artifacts.require('PlayerV1');
const Token = artifacts.require('Token');
 
contract('PlayerV1', async accounts => {
  beforeEach(async function () {
    this.player = await PlayerV1.new();
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
});
const { assert } = require('chai');
const { getError } = require('./helpers');

const PlayerV5 = artifacts.require('PlayerV5');
const Token = artifacts.require('Token');
const DarkForestCoreDummy = artifacts.require('DarkForestCoreDummy');
 
contract('PlayerV5', async accounts => {
  beforeEach(async function () {
    this.player = await PlayerV5.new();
    await this.player.initV2(accounts[0]);
    const token = await Token.new();
    this.core = await DarkForestCoreDummy.new(token.address);
    await this.player.setContracts(this.core.address, token.address);
  });

  it('should be able to cache and submit move', async function () {
    const proof = [["0x2089f0a71fda478bc73331122a34b9e85ab80bcfbc386c639a42af7b141558d2","0x3011b2055b6cf94be38278f693ecc94c7773e1b975564bf5e97196eebab67787"],[["0x1fd5bbfcc5750c22afea208e955a9f3d25edd250b5a74d81027f479bf554c93d","0x2f8a542d654a3dd2c0d29846ebea51aac0cf5d1082bffadceb3fd76218aad156"],["0x1d90a945fbc8674cb1e26310ae38295a86ed9ccd725f84dd8a2793529a0f4c7","0x24c2f95df49408571ce2d56aad4fb237e04a2b5ee88f3dbc23a2f24ed7fe5b6f"]],["0x18df241a2ba541d923242eeb9e100632916823840665f644ae0be8f7ad7dc3a0","0x1629bd284aeccbb246cf1e6e8d2e0c5bcdb8aaa2ff2739f51b70795498cee3ea"],["0x46d81e174880ad194196496b0c3317f3787cb631f027693c55dd8adbc1f6","0x18b961f8d9a1e98cebac25a06f00a2ce7cfedd8f7295bb242ceff24b0888","0x10","0x1f747","0x1f"]];
    const [_oldLoc, _newLoc] = proof[3].slice(0, 2);
    const [_popMoved, _silverMoved] = [33000, 0];
    assert.equal(await this.player.hasCachedMoveProof(_oldLoc, _newLoc), false, "move proof unexpectedly cached");
    await this.player.addCachedMoveProof(...proof);
    assert.equal(await this.player.hasCachedMoveProof(_oldLoc, _newLoc), true, "move proof not cached");
    const planetEventsCount = (await this.core.planetEventsCount()).toNumber();
    await this.player.sendCachedMove(_oldLoc, _newLoc, _popMoved, _silverMoved);
    for (let i = 0; i < 2; i++) { assert.equal((await this.core.latestA(i)).toString(), web3.utils.hexToNumberString(proof[0][i])); }
    for (let i = 0; i < 2; i++) { for (let j = 0; j < 2; j++) { assert.equal((await this.core.latestB(i, j)).toString(), web3.utils.hexToNumberString(proof[1][i][j])); } }
    for (let i = 0; i < 2; i++) { assert.equal((await this.core.latestC(i)).toString(), web3.utils.hexToNumberString(proof[2][i])); }
    for (let i = 0; i < 5; i++) { assert.equal((await this.core.latestInput(i)).toString(), web3.utils.hexToNumberString(proof[3][i])); }
    assert.equal((await this.core.latestInput(5)).toNumber(), _popMoved);
    assert.equal((await this.core.latestInput(6)).toNumber(), _silverMoved);
    assert.equal((await this.core.planetEventsCount()).toNumber(), planetEventsCount + 1, "unexpected planetEventsCount");
  });

  it('should be able to reach reachable _targetPlanetEventsCount', async function () {
    const proof = [["0x2089f0a71fda478bc73331122a34b9e85ab80bcfbc386c639a42af7b141558d2","0x3011b2055b6cf94be38278f693ecc94c7773e1b975564bf5e97196eebab67787"],[["0x1fd5bbfcc5750c22afea208e955a9f3d25edd250b5a74d81027f479bf554c93d","0x2f8a542d654a3dd2c0d29846ebea51aac0cf5d1082bffadceb3fd76218aad156"],["0x1d90a945fbc8674cb1e26310ae38295a86ed9ccd725f84dd8a2793529a0f4c7","0x24c2f95df49408571ce2d56aad4fb237e04a2b5ee88f3dbc23a2f24ed7fe5b6f"]],["0x18df241a2ba541d923242eeb9e100632916823840665f644ae0be8f7ad7dc3a0","0x1629bd284aeccbb246cf1e6e8d2e0c5bcdb8aaa2ff2739f51b70795498cee3ea"],["0x46d81e174880ad194196496b0c3317f3787cb631f027693c55dd8adbc1f6","0x18b961f8d9a1e98cebac25a06f00a2ce7cfedd8f7295bb242ceff24b0888","0x10","0x1f747","0x1f"]];
    const [_oldLoc, _newLoc] = proof[3].slice(0, 2);
    const [_popMoved, _silverMoved] = [33000, 0];
    await this.player.addCachedMoveProof(...proof);
    let planetEventsCount = (await this.core.planetEventsCount()).toNumber();
    const offset = 100000;
    await this.core.addToPlanetEventsCount(offset);
    planetEventsCount += offset;
    let _targetPlanetEventsCount = planetEventsCount;
    assert.equal((await this.core.planetEventsCount()).toNumber(), planetEventsCount, "failed to apply offset");
    await this.player.forwardToTargetPlanetEventsCount(_targetPlanetEventsCount, _oldLoc, _newLoc, _popMoved, _silverMoved);
    assert.equal((await this.core.planetEventsCount()).toNumber(), _targetPlanetEventsCount, "incorrect number of applied moves");
    _targetPlanetEventsCount += 5;
    await this.player.forwardToTargetPlanetEventsCount(_targetPlanetEventsCount, _oldLoc, _newLoc, _popMoved, _silverMoved);
    assert.equal((await this.core.planetEventsCount()).toNumber(), _targetPlanetEventsCount, "incorrect number of applied moves");
    _targetPlanetEventsCount += 6;
    assert.notStrictEqual(await getError(async () => {
      await this.player.forwardToTargetPlanetEventsCount(_targetPlanetEventsCount, _oldLoc, _newLoc, _popMoved, _silverMoved);
    }), null, 'unexpected success');
  });
});
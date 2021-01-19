let web3, player, core, oldLoc, newLoc, popMoved, silverMoved;

exports.setGlobals = (_web3, _player, _core, _oldLoc="0x000046d81e174880ad194196496b0c3317f3787cb631f027693c55dd8adbc1f6", _newLoc="0x000018b961f8d9a1e98cebac25a06f00a2ce7cfedd8f7295bb242ceff24b0888", _popMoved=33000, _silverMoved=0) => {
  [oldLoc, newLoc, popMoved, silverMoved, web3, player, core] = [_oldLoc, _newLoc, _popMoved, _silverMoved, _web3, _player, _core];
}

exports.findArtifactWithTargetPlanetEventsCount = async (snarkArgs, targetPlanetEventsCount) => {
  let _remaining = 0;
  const tick = () => setTimeout(async () => {
    const remaining = targetPlanetEventsCount - (await core.planetEventsCount()).toNumber();
    if (remaining < 0) {
      return console.log("missed window. exit.");
    }
    if (remaining > 5) {
      if (remaining != _remaining) {
        _remaining = remaining;
        console.log("waiting for window. remaining:", remaining);
      }
      return tick();
    }
    console.log("reached window. remaining:", remaining);
    console.log("sending transaction...");
    await player.findArtifactWithTargetPlanetEventsCount(...snarkArgs, targetPlanetEventsCount, oldLoc, newLoc, popMoved, silverMoved);
    console.log("successfully found artifact. planetEventsCount:", targetPlanetEventsCount);
    console.log("transfering back to main account...");
    const data = web3.eth.abi.encodeFunctionCall({name: "transferOwnership", inputs: [{type: "uint256", name: ""}, {type: "address", name: ""}]}, [snarkArgs[3][0], "0x5d07904bb86cbf524b42d4e7d292a867f05d3b31"]);
    await player.forwardOrThrow(core.address, data);
    console.log("artifact transfered to main account. exit.");
  }, 500);
  tick();
}

exports.typeAndLevel = (planetId, eventCount) => {
  const seed = web3.utils.toBN(web3.utils.soliditySha3(planetId, planetId, eventCount));
  const lastByte = seed.mod(web3.utils.toBN("0xff")).toNumber();
  const secondLastByte = seed.div(web3.utils.toBN(256)).mod(web3.utils.toBN("0xff")).toNumber()

  let type = 3;
  if (lastByte < 64) {type = 0}
  else if (lastByte < 128) {type = 1}
  else if (lastByte < 192) {type = 2}
  
  let bonus = 0;
  if (secondLastByte < 4) {bonus = 3}
  else if (secondLastByte < 16) {bonus = 2}
  else if (secondLastByte < 64) {bonus = 1}
  
  return [type, bonus]
}

exports.findNextMatch = (planetId, minEventCount, targetType, targetMinBonus) => {
  let eventCount = minEventCount;
  while (true) {
    const [type, bonus] = exports.typeAndLevel(planetId, eventCount);
    if (type == targetType && bonus >= targetMinBonus) { return [eventCount, bonus] }
    eventCount++;
  }
}

exports.findArtifactWithTargetTypeAndMinBonus = async (snarkArgs, targetType, targetMinBonus) => {
  const eventCount = (await core.planetEventsCount()).toNumber();
  console.log("finding next opportunity. current planetEventsCount:", eventCount);
  const [targetEventCount, bonus] = exports.findNextMatch(snarkArgs[3][0], eventCount, targetType, targetMinBonus);
  console.log("next suitable planetEventsCount:", targetEventCount);
  console.log("waiting for opportunity...");
  await exports.findArtifactWithTargetPlanetEventsCount(snarkArgs, targetEventCount);
}

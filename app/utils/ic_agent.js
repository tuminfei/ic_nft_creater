const { fetch } = require('isomorphic-fetch');
const { Actor, HttpAgent } = require("@dfinity/agent");
const { getAccountCredentials } = require("./crypto");

const icAgent = {
  factoryActor: null,
  nftActor: null,
};

icAgent.getIdentity = (mnemonic) => {
  return getAccountCredentials(mnemonic);
};

icAgent.getActorWithIdentity = (host, identity, canisterId, idlFactory) => {
  const defaultAgent = new HttpAgent({ host, fetch });

  const agent = new HttpAgent({
    source: defaultAgent,
    identity,
    verifyQuerySignatures: false,
  });
  const actor = Actor.createActor(idlFactory, {
    canisterId: canisterId,
    agent,
  });
  return actor;
};

module.exports = icAgent;

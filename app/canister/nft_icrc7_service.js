const icAgent = require("../utils/ic_agent");
const { idlFactory: nftIdl } = require("./did/nft_factory_backend.did");
const { getAccountCredentials } = require("../utils/crypto");
const constants = require("../utils/constants");

let system_identity = getAccountCredentials(process.env.SYSTEM_ACCOUNT_SEED, 0);
let ic_host =
  process.env.NODE_ENV == "production"
    ? constants.IC_HOST
    : constants.IC_LOCAL_HOST;

class nftService {
  constructor(canister_id) {
    this.canister_id = canister_id;
    this.actor = icAgent.getActorWithIdentity(
      ic_host,
      system_identity,
      canister_id,
      nftIdl
    );
  }

  mint() {
    null;
  }
}

module.exports = {
  nftService,
};

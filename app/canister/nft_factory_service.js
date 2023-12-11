const icAgent = require("../utils/ic_agent");
const { idlFactory: factoryIdl } = require("./did/nft_factory_backend.did");
const { getAccountCredentials } = require("../utils/crypto");
const constants = require("../utils/constants");

let factory_canister_id = process.env.NODE_ENV == 'production' ? process.env.SYSTEM_FACTORY_CANISTER_ID : process.env.SYSTEM_LOCAL_FACTORY_CANISTER_ID;
let system_identity = getAccountCredentials(process.env.SYSTEM_ACCOUNT_SEED, 0);
let ic_host = process.env.NODE_ENV == 'production' ? constants.IC_HOST : constants.IC_LOCAL_HOST;
let factoryActor = icAgent.getActorWithIdentity(
  ic_host,
  system_identity,
  factory_canister_id,
  factoryIdl
);
icAgent.factoryActor = factoryActor;

const factoryService = {
  async create_icrc7_collection() { },

  async factory_canister_list() {
    let canister_infos = await factoryActor.factory_canister_list();
    return canister_infos;
  }
};

module.exports = {
  factory_canister_id,
  factoryService,
};

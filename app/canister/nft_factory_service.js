const icAgent = require("../utils/ic_agent");
const { idlFactory: factoryIdl } = require("./did/icrc7_with_assets.did");
const { getAccountCredentials } = require("../utils/crypto");
const constants = require("../utils/constants");
const { Principal } = require("@dfinity/principal");

let system_identity = getAccountCredentials(process.env.SYSTEM_ACCOUNT_SEED, 0);
let ic_host =
  process.env.NODE_ENV == "production"
    ? constants.IC_HOST
    : constants.IC_LOCAL_HOST;
let factoryActor = icAgent.getActorWithIdentity(
  ic_host,
  system_identity,
  factory_canister_id,
  factoryIdl
);
icAgent.factoryActor = factoryActor;

const factoryService = {
  async create_icrc7_collection(
    name,
    symbol,
    owner,
    tx_window,
    permitted_drift
  ) {
    const p_owner = Principal.fromText(owner);
    const create_arg = {
      tx_window: tx_window || 24,
      owner: p_owner,
      permitted_drift: permitted_drift || 2,
      name: name,
      symbol: symbol,
    };

    let canister_info = await factoryActor.create_icrc7_collection(create_arg);
    return canister_info;
  },

  async factory_canister_list() {
    let canister_infos = await factoryActor.factory_canister_list();
    return canister_infos;
  },
};

module.exports = {
  factory_canister_id,
  factoryService,
};

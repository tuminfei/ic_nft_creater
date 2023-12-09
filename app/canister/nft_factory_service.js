const icAgent = require("../utils/ic_agent");
const { idlFactory: factoryIdl } = require("./did/nft_factory_backend.did");
const { getAccountCredentials } = require("../utils/crypto");
const constants = require("../utils/constants");

let factory_canister_id = process.env.SYSTEM_FACTORY_CANISTER_ID;
let system_identity = getAccountCredentials(process.env.SYSTEM_ACCOUNT_SEED, 0);
let factoryActor = icAgent.getActorWithIdentity(
  constants.IC_HOST,
  system_identity,
  factory_canister_id,
  factoryIdl
);
icAgent.factoryActor = factoryActor;

const factoryService = {
  async create_icrc7_collection() {},
};

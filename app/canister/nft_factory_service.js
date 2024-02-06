import ICAgentUtils from "../utils/ic_agent";
import CryptoUtils from "../utils/crypto";
import { idlFactory } from "./did/nft_factory_backend.did";
import {
  IC_HOST,
  IC_LOCAL_HOST,
  SYSTEM_FACTORY_CANISTER_ID,
  SYSTEM_LOCAL_FACTORY_CANISTER_ID,
} from "../utils/constants";
import { Principal } from "@dfinity/principal";

class FactoryCanisterService {
  constructor() {
    this.system_identity = CryptoUtils.getAccountCredentials(
      process.env.SYSTEM_ACCOUNT_SEED,
      0
    );
    this.ic_host =
      process.env.NODE_ENV == "production" ? IC_HOST : IC_LOCAL_HOST;
    this.factory_canister_id =
      process.env.NODE_ENV == "production"
        ? SYSTEM_FACTORY_CANISTER_ID
        : SYSTEM_LOCAL_FACTORY_CANISTER_ID;
    this.actor = ICAgentUtils.getActorWithIdentity(
      this.ic_host,
      this.system_identity,
      this.factory_canister_id,
      idlFactory
    );
  }

  async create_icrc7_collection(
    name,
    symbol,
    description,
    owner,
    tx_window,
    permitted_drift
  ) {
    const p_owner = Principal.fromText(owner);
    const p_description = description ? [description] : [];

    const create_arg = {
      tx_window: tx_window || 24,
      owner: p_owner,
      permitted_drift: permitted_drift || 2,
      name: name,
      symbol: symbol,
      description: p_description,
      image: [],
      royalties: [],
      royalties_recipient: [],
      supply_cap: [],
    };

    let canister_info = await this.actor.create_icrc7_collection(create_arg);
    return canister_info;
  }

  async factory_canister_list() {
    let canister_infos = await this.actor.factory_canister_list();
    return canister_infos;
  }
}

export default FactoryCanisterService;

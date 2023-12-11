import ICAgentUtils from "../utils/ic_agent";
import CryptoUtils from "../utils/crypto";
import { idlFactory } from "./did/nft_factory_backend.did";
import { IC_HOST, IC_LOCAL_HOST } from "../utils/constants";

class NFTCanisterService {
  constructor(canister_id) {
    this.system_identity = CryptoUtils.getAccountCredentials(
      process.env.SYSTEM_ACCOUNT_SEED,
      0
    );
    this.ic_host =
      process.env.NODE_ENV == "production" ? IC_HOST : IC_LOCAL_HOST;
    this.actor = ICAgentUtils.getActorWithIdentity(
      this.ic_host,
      this.system_identity,
      canister_id,
      idlFactory
    );
  }

  async mint() {
    return null;
  }
}

export default NFTCanisterService;

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

  async mint(token_id, name, description, image, owner) {
    const p_owner = Principal.fromText(owner);
    const p_description = description
      ? CryptoUtils.fromHexString(description)
      : [];
    const p_image = image ? CryptoUtils.fromHexString(image) : [];
    const p_to = {
      owner: p_owner,
      subaccount: [],
    };

    const create_arg = {
      id: BigInt(token_id) || 24,
      name: name,
      description: p_description,
      image: p_image,
      to: p_to,
    };

    let nft_info = await this.actor.icrc7_mint(create_arg);
    return nft_info;
  }
}

export default NFTCanisterService;

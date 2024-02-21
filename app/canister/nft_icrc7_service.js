import ICAgentUtils from "../utils/ic_agent";
import CryptoUtils from "../utils/crypto";
import { idlFactory } from "./did/icrc7_with_assets.did";
import { IC_HOST, IC_LOCAL_HOST } from "../utils/constants";
import { Principal } from "@dfinity/principal";

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
    const p_description =
      description && description !== "" ? [description] : [];

    const p_image =
      image && image !== "undefined"
        ? CryptoUtils.asciiStringToByteArray(image)
        : [];
    const p_to = {
      owner: p_owner,
      subaccount: [],
    };

    const create_arg = {
      id: BigInt(token_id) || 24,
      name: name,
      description: p_description,
      image: [p_image],
      to: p_to,
    };
    let nft_info = await this.actor.icrc7_mint(create_arg);
    return nft_info;
  }

  async assets_upload(chunk, path, size, headers, chunk_size) {
    const upload_arg = {
      chunk: chunk,
      path: path,
      size: size,
      headers: headers,
      index: 0,
      chunk_size: chunk_size,
    };
    let image_rst = await this.actor.assets_upload([upload_arg]);
    return image_rst;
  }

  async transfer(token_id, from, to, memo) {
    const p_from = Principal.fromText(from);
    const from_account = {
      owner: p_from,
      subaccount: [],
    };
    const p_to = Principal.fromText(to);
    const to_account = {
      owner: p_to,
      subaccount: [],
    };
    const spender_subaccount = [];
    const p_memo = [CryptoUtils.asciiStringToByteArray(memo)];
    const token_ids = [token_id];
    const created_at_time = [];

    const transfer_arg = {
      to: to_account,
      spender_subaccount,
      from: from_account,
      memo: p_memo,
      is_atomic: [true],
      token_ids,
      created_at_time,
    };
    let nft_info = await this.actor.icrc7_transfer(transfer_arg);
    return nft_info;
  }
}

export default NFTCanisterService;

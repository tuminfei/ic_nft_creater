import { fetch } from "isomorphic-fetch";
import { Actor, HttpAgent } from "@dfinity/agent";
import CryptoUtils from "./crypto";

class ICAgentUtils {
  static getIdentity(mnemonic) {
    return CryptoUtils.getAccountCredentials(mnemonic);
  }

  static getActorWithIdentity(host, identity, canisterId, idlFactory) {
    const defaultAgent = new HttpAgent({ host, fetch });

    const agent = new HttpAgent({
      source: defaultAgent,
      identity,
      verifyQuerySignatures: false,
    });

    const actor = Actor.createActor(idlFactory, {
      canisterId,
      agent,
    });

    return actor;
  }
}

export default ICAgentUtils;

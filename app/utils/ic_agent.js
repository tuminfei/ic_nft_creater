import { fetch } from "isomorphic-fetch";
import { Actor, HttpAgent } from "@dfinity/agent";
import CryptoUtils from "./crypto";

class ICAgentUtils {
  static getIdentity(mnemonic) {
    return CryptoUtils.getAccountCredentials(mnemonic);
  }

  static getActorWithIdentity(host, identity, canisterId, idlFactory) {
    const defaultAgent = new HttpAgent({ host, fetch });
    const is_verify = process.env.NODE_ENV !== "production" ? false : true;

    const agent = new HttpAgent({
      source: defaultAgent,
      identity,
      verifyQuerySignatures: is_verify,
    });

    if (process.env.NODE_ENV !== "production") {
      agent.fetchRootKey().catch((err) => {
        console.warn(
          "Unable to fetch root key. Check to ensure that your local replica is running"
        );
        console.error(err);
      });
    }

    const actor = Actor.createActor(idlFactory, {
      canisterId,
      agent,
    });

    return actor;
  }
}

export default ICAgentUtils;

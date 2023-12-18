const bip39 = require("bip39");
import HDKey from "hdkey";
import Secp256k1 from "secp256k1";
import CryptoJS from "crypto-js";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { Principal } from "@dfinity/principal";
import BinaryClass from "./binary";

const DERIVATION_PATH = "m/44'/223'/0'/0";

// Dfinity Account separator
const ACCOUNT_DOMAIN_SEPERATOR = "\x0Aaccount-id";

// Subaccounts are arbitrary 32-byte values.
const SUB_ACCOUNT_ZERO = Buffer.alloc(32);

class CryptoUtils {
  static createSecp256K1KeyPair(mnemonic, index) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const masterKey = HDKey.fromMasterSeed(seed);
    const { privateKey } = masterKey.derive(`${DERIVATION_PATH}/${index}`);
    const publicKey = Secp256k1.publicKeyCreate(privateKey, false);
    return { privateKey, publicKey };
  }

  static getAccountCredentials(mnemonic, subAccount) {
    const keyPair = this.createSecp256K1KeyPair(mnemonic, subAccount || 0);
    return Secp256k1KeyIdentity.fromKeyPair(
      keyPair.publicKey,
      keyPair.privateKey
    );
  }

  static getAccountId(principal, subAccount) {
    const sha = CryptoJS.algo.SHA224.create();
    sha.update(ACCOUNT_DOMAIN_SEPERATOR);
    sha.update(BinaryClass.byteArrayToWordArray(principal.toUint8Array()));
    const subBuffer = Buffer.from(SUB_ACCOUNT_ZERO);
    if (subAccount) {
      subBuffer.writeUInt32BE(subAccount);
    }
    sha.update(BinaryClass.byteArrayToWordArray(subBuffer));
    const hash = sha.finalize();

    const byteArray = BinaryClass.wordArrayToByteArray(hash, 28);
    const checksum = BinaryClass.generateChecksum(byteArray);
    const val = checksum + hash.toString();

    return val;
  }

  static dq(a, b) {
    return a !== undefined && a !== null ? a : b;
  }

  static fromHexString(hexString) {
    return Uint8Array.from(Buffer.from(hexString, "hex"));
  }

  static toHexString(bytes) {
    return bytes.reduce(
      (str, byte) => str + byte.toString(16).padStart(2, "0"),
      ""
    );
  }

  static to32bits(num) {
    let b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
  }

  static from32bits(ba) {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      value = (value << 8) | ba[i];
    }
    return value;
  }

  static asciiStringToByteArray = (text) => {
    return Array.from(text).map((c) => c.charCodeAt(0));
  };

  static tokenIdentifier(principal, index) {
    const array = new Uint8Array([
      ...SUB_ACCOUNT_ZERO,
      ...Principal.fromText(principal).toUint8Array(),
      ...this.to32bits(index),
    ]);
    return Principal.fromUint8Array(array).toText();
  }

  static decodeTokenId(tid) {
    const p = [...Principal.fromText(tid).toUint8Array()];
    const _padding = p.splice(0, 4);
    if (
      this.toHexString(new Uint8Array(_padding)) !==
      this.toHexString(SUB_ACCOUNT_ZERO)
    ) {
      return {
        tokenIndex: 0,
        canisterId: tid,
        token: this.tokenIdentifier(tid, 0),
      };
    } else {
      return {
        tokenIndex: this.from32bits(p.splice(-4)),
        canisterId: Principal.fromUint8Array(new Uint8Array(p)).toText(),
        token: tid,
      };
    }
  }

  static mockPrincipal(id) {
    const t = id % 255;
    const arr = new Uint8Array([t, 0]);
    return Principal.fromUint8Array(arr);
  }
}

export default CryptoUtils;

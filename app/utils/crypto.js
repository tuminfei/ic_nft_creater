const bip39 = require("bip39");
const HDKey = require("hdkey");
const Secp256k1 = require("secp256k1");
const CryptoJS = require("crypto-js");
const { Secp256k1KeyIdentity } = require("@dfinity/identity");
const { Principal } = require("@dfinity/principal");

const {
  byteArrayToWordArray,
  wordArrayToByteArray,
  generateChecksum,
} = require("./binary.js");

const DERIVATION_PATH = "m/44'/223'/0'/0";

// Dfinity Account separator
const ACCOUNT_DOMAIN_SEPERATOR = "\x0Aaccount-id";

// Subaccounts are arbitrary 32-byte values.
const SUB_ACCOUNT_ZERO = Buffer.alloc(32);

function createSecp256K1KeyPair(mnemonic, index) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const masterKey = HDKey.fromMasterSeed(seed);
  const { privateKey } = masterKey.derive(`${DERIVATION_PATH}/${index}`);
  const publicKey = Secp256k1.publicKeyCreate(privateKey, false);
  return { privateKey, publicKey };
}

function getAccountCredentials(mnemonic, subAccount) {
  const keyPair = createSecp256K1KeyPair(mnemonic, subAccount || 0);
  return Secp256k1KeyIdentity.fromKeyPair(
    keyPair.publicKey,
    keyPair.privateKey
  );
}

function getAccountId(principal, subAccount) {
  const sha = CryptoJS.algo.SHA224.create();
  sha.update(ACCOUNT_DOMAIN_SEPERATOR); // Internally parsed with UTF-8, like go does
  sha.update(byteArrayToWordArray(principal.toUint8Array()));
  const subBuffer = Buffer.from(SUB_ACCOUNT_ZERO);
  if (subAccount) {
    subBuffer.writeUInt32BE(subAccount);
  }
  sha.update(byteArrayToWordArray(subBuffer));
  const hash = sha.finalize();

  /// While this is backed by an array of length 28, it's canonical representation
  /// is a hex string of length 64. The first 8 characters are the CRC-32 encoded
  /// hash of the following 56 characters of hex. Both, upper and lower case
  /// characters are valid in the input string and can even be mixed.
  /// [ic/rs/rosetta-api/ledger_canister/src/account_identifier.rs]
  const byteArray = wordArrayToByteArray(hash, 28);
  const checksum = generateChecksum(byteArray);
  const val = checksum + hash.toString();

  return val;
}

function dq(a, b) {
  return a !== undefined && a !== null ? a : b;
}

function fromHexString(hexString) {
  return Uint8Array.from(Buffer.from(hexString, "hex"));
}

function toHexString(bytes) {
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
}

function to32bits(num) {
  let b = new ArrayBuffer(4);
  new DataView(b).setUint32(0, num);
  return Array.from(new Uint8Array(b));
}

function from32bits(ba) {
  let value = 0;
  for (let i = 0; i < 4; i++) {
    value = (value << 8) | ba[i];
  }
  return value;
}

const padding = new Buffer.from("\x0Atid");

function tokenIdentifier(principal, index) {
  const array = new Uint8Array([
    ...padding,
    ...Principal.fromText(principal).toUint8Array(),
    ...to32bits(index),
  ]);
  return Principal.fromUint8Array(array).toText();
}

function decodeTokenId(tid) {
  var p = [...Principal.fromText(tid).toUint8Array()];
  var _padding = p.splice(0, 4);
  if (toHexString(new Uint8Array(_padding)) !== toHexString(padding)) {
    return {
      tokenIndex: 0,
      canisterId: tid,
      token: tokenIdentifier(tid, 0),
    };
  } else {
    return {
      tokenIndex: from32bits(p.splice(-4)),
      canisterId: Principal.fromUint8Array(new Uint8Array(p)).toText(),
      token: tid,
    };
  }
}

function mockPrincipal(id) {
  let t = id % 255;
  const arr = new Uint8Array([t, 0]);
  return Principal.fromUint8Array(arr);
}

module.exports = {
  createSecp256K1KeyPair,
  getAccountCredentials,
  getAccountId,
  fromHexString,
  toHexString,
  to32bits,
  from32bits,
  tokenIdentifier,
  decodeTokenId,
  mockPrincipal,
};

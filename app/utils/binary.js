/* from plug-controller project */

/* eslint-disable no-prototype-builtins */
/* eslint-disable no-bitwise */
const crc32 = require("buffer-crc32");
const CryptoJS = require("crypto-js");

function byteArrayToWordArray(byteArray) {
  const wordArray = [];
  let i;
  for (i = 0; i < byteArray.length; i += 1) {
    wordArray[(i / 4) | 0] |= byteArray[i] << (24 - 8 * i);
  }
  // eslint-disable-next-line
  const result = CryptoJS.lib.WordArray.create(wordArray, byteArray.length);
  return result;
}

function wordToByteArray(word, length) {
  const byteArray = [];
  const xFF = 0xff;
  if (length > 0) byteArray.push(word >>> 24);
  if (length > 1) byteArray.push((word >>> 16) & xFF);
  if (length > 2) byteArray.push((word >>> 8) & xFF);
  if (length > 3) byteArray.push(word & xFF);

  return byteArray;
}

function wordArrayToByteArray(wordArray, length) {
  if (
    wordArray.hasOwnProperty("sigBytes") &&
    wordArray.hasOwnProperty("words")
  ) {
    length = wordArray.sigBytes;
    wordArray = wordArray.words;
  }

  let result = [];
  let bytes;
  let i = 0;
  while (length > 0) {
    bytes = wordToByteArray(wordArray[i], Math.min(4, length));
    length -= bytes.length;
    result = [...result, bytes];
    i++;
  }
  return [].concat.apply([], result);
}

function intToHex(val) {
  return val < 0 ? (Number(val) >>> 0).toString(16) : Number(val).toString(16);
}

// We generate a CRC32 checksum, and trnasform it into a hexString
function generateChecksum(hash) {
  const crc = crc32.unsigned(Buffer.from(hash));
  const hex = intToHex(crc);
  return hex.padStart(8, "0");
}

module.exports = {
  byteArrayToWordArray,
  wordArrayToByteArray,
  generateChecksum,
};

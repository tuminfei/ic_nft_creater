export function generateGiftCardCode(length) {
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset.charAt(randomIndex);
  }

  return code;
}

export function generateRandomGiftCardCode() {
  const minLength = 8;
  const maxLength = 20;
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  return generateGiftCardCode(length).toUpperCase();
}

export function hideString(inputString) {
  const visiblePart = inputString.slice(-4);
  const hiddenPart = "•".repeat(Math.max(0, inputString.length - 4));
  const result = hiddenPart + visiblePart;
  return result;
}

export function maskAddress(inputAddress) {
  const maskAddress = inputAddress.replace(/^(.{6}).+(.{4})$/, "$1*****$2");
  return maskAddress;
}

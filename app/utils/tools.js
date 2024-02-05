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
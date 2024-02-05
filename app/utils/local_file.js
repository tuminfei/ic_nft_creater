// uploadImage.js
import fs from "fs";
import path from "path";

export const readAndSaveImage = async (base64String, fileName) => {
  // decode base64 image
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const publicDir = path.join(__dirname, "../public/nft");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  const filePath = path.join(publicDir, fileName);
  fs.writeFileSync(filePath, buffer);

  return {
    success: true,
    file_path: `/nft/${fileName}`,
  };
};

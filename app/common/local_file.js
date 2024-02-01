// uploadImage.js
import fs from 'fs';
import path from 'path';

export const readAndSaveImage = async (base64String, fileName) => {
  // 解码 base64 格式的图片数据
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // 定义 public 目录路径
  const publicDir = path.join(__dirname, 'public');

  // 确保目录存在，如果不存在则创建
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // 构建图片文件路径
  const filePath = path.join(publicDir, fileName);

  // 将图片数据写入文件
  fs.writeFileSync(filePath, buffer);

  return {
    success: true,
    filePath: `/public/nft/${fileName}`, // 返回文件路径供客户端使用
  };
};

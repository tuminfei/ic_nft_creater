import invariant from "tiny-invariant";
import db from "../db.server";
const fs = require("fs");

export async function getNFTGifts(shop) {
  const nft_gifts = await db.nFTGift.findMany({
    where: { shop },
    orderBy: { id: "desc" },
    include: { nft_info: true },
  });

  if (nft_gifts.length === 0) return [];

  return nft_gifts;
}

export async function createNFTGift(shop, nft_info_id, card_code, expires_at) {
  const nft_gift = await db.nFTGift.create({
    data: {
      shop,
      nft_info_id,
      card_code,
      expires_at,
    },
  });

  return nft_gift;
}

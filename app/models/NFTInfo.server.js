import invariant from "tiny-invariant";
import db from "../db.server";

export async function getNFTInfo(id, graphql) {
  const nft_info = await db.nFTInfo.findFirst({ where: { id } });

  if (!nft_info) {
    return null;
  }

  return { nft_info };
}

export async function getNFTInfos(shop, graphql) {
  const nft_infos = await db.nFTInfo.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (nft_infos.length === 0) return [];

  return nft_infos;
}

export function validateInfo(data) {
  const errors = {};

  if (!data.name) {
    errors.name = "Name is required";
  }

  if (!data.owner) {
    errors.owner = "Owner is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}

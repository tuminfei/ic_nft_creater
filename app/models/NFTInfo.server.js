import invariant from "tiny-invariant";
import db from "../db.server";
import NFTCanisterService from "../canister/nft_icrc7_service";

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

  if (!data.nft_collection_id) {
    errors.owner = "NFT Collection is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}

export async function canisterMintNFT(nft_info) {
  const service = new NFTCanisterService(nft_info.nft_collection().canister_id);
  const rest = await service.create_icrc7_collection(
    nft_info.token_id,
    nft_info.name,
    nft_info.description,
    nft_info.image,
    nft_info.owner
  );
  return rest;
}

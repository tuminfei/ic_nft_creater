import invariant from "tiny-invariant";
import db from "../db.server";
import FactoryCanisterService from "../canister/nft_factory_service";

export async function getNFTCollection(id, graphql) {
  const nft_collection = await db.nFTCollection.findFirst({ where: { id } });

  if (!nft_collection) {
    return null;
  }

  return { nft_collection };
}

export async function getNFTCollections(shop, graphql) {
  const nft_collections = await db.nFTCollection.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (nft_collections.length === 0) return [];

  return nft_collections;
}

export async function getStatistics(shop) {
  const collection_count = await db.nFTCollection.count({
    where: { shop },
  });
  const nft_count = await db.nFTInfo.count({
    where: { shop },
  });

  return { collection_count, nft_count };
}

export function validateCollection(data) {
  const errors = {};

  if (!data.name) {
    errors.name = "Name is required";
  }

  if (!data.symbol) {
    errors.symbol = "Symbol is required";
  }

  if (!data.owner) {
    errors.owner = "Owner is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}

export function converCollection(data) {
  if (data.tx_window) {
    data.tx_window = parseInt(data.tx_window);
  }
  if (data.permitted_drift) {
    data.permitted_drift = parseInt(data.permitted_drift);
  }
  if (data.royalties) {
    if (data.royalties == "null") {
      data.royalties = null;
    } else {
      data.royalties = parseInt(data.royalties);
    }
  }
  if (data.royalties_recipient && data.royalties_recipient == "null") {
    data.royalties_recipient = null;
  }
  if (data.supply_cap && data.supply_cap == "null") {
    data.supply_cap = null;
  }
  return data;
}

export async function canisterCreateCollection(nft_collection) {
  const service = new FactoryCanisterService();
  const rest = await service.create_icrc7_collection(
    nft_collection.name,
    nft_collection.symbol,
    nft_collection.description,
    nft_collection.owner,
    nft_collection.tx_window,
    nft_collection.permitted_drift
  );
  return rest;
}

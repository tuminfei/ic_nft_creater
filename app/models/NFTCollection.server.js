import invariant from "tiny-invariant";
import db from "../db.server";

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
    if (data.royalties == 'null') {
      data.royalties = null;
    } else {
      data.royalties = parseInt(data.royalties);
    }
  }
  if (data.royalties_recipient && data.royalties_recipient == 'null') {
    data.royalties_recipient = null;
  }
  if (data.supply_cap && data.supply_cap == 'null') {
    data.supply_cap = null;
  }
  return data;
}

import invariant from "tiny-invariant";
import db from "../db.server";

export const SETTING_KEYS = [
  "merchant_principal",
  "app_description",
  "royalties_recipient_principal",
  "nft_product_description",
];

export async function getSettings(shop, graphql) {
  const settings = await db.appSetting.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (settings.length === 0)
    return {
      merchant_principal: "",
      app_description: "",
      royalties_recipient_principal: "",
      nft_product_description: "",
    };

  const result = settings.reduce((accumulator, current) => {
    accumulator[current.info_key] = current.info_value;
    return accumulator;
  }, {});
  return result;
}

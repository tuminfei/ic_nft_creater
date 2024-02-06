/*
  Warnings:

  - You are about to drop the column `gift_card_id` on the `NFTInfo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NFTInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "nft_collection_id" INTEGER NOT NULL,
    "token_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "subaccount" TEXT,
    "canister_id" TEXT,
    "image" TEXT,
    "image_data" TEXT,
    "local_image" TEXT,
    "shop_image" TEXT,
    "product_id" TEXT,
    "product_handle" TEXT,
    "product_variant_id" TEXT,
    "nft_gift_id" INTEGER,
    "onchain" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "is_sale" BOOLEAN,
    "gift_is_used" BOOLEAN,
    CONSTRAINT "NFTInfo_nft_collection_id_fkey" FOREIGN KEY ("nft_collection_id") REFERENCES "NFTCollection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NFTInfo" ("canister_id", "createdAt", "description", "gift_is_used", "id", "image", "image_data", "is_sale", "local_image", "name", "nft_collection_id", "onchain", "owner", "product_handle", "product_id", "product_variant_id", "shop", "shop_image", "subaccount", "token_id", "updatedAt") SELECT "canister_id", "createdAt", "description", "gift_is_used", "id", "image", "image_data", "is_sale", "local_image", "name", "nft_collection_id", "onchain", "owner", "product_handle", "product_id", "product_variant_id", "shop", "shop_image", "subaccount", "token_id", "updatedAt" FROM "NFTInfo";
DROP TABLE "NFTInfo";
ALTER TABLE "new_NFTInfo" RENAME TO "NFTInfo";
CREATE INDEX "NFTInfo_shop_idx" ON "NFTInfo"("shop");
CREATE INDEX "NFTInfo_shop_nft_collection_id_idx" ON "NFTInfo"("shop", "nft_collection_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

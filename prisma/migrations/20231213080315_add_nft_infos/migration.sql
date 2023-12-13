-- CreateTable
CREATE TABLE "NFTInfo" (
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
    "product_id" TEXT,
    "product_handle" TEXT,
    "product_variant_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "NFTInfo_nft_collection_id_fkey" FOREIGN KEY ("nft_collection_id") REFERENCES "NFTCollection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

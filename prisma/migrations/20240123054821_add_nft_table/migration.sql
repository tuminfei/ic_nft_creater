-- CreateTable
CREATE TABLE "QRCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "scans" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NFTCollection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT NOT NULL,
    "canister_id" TEXT,
    "image" TEXT,
    "symbol" TEXT NOT NULL,
    "tx_window" INTEGER NOT NULL,
    "permitted_drift" INTEGER NOT NULL,
    "royalties" INTEGER,
    "royalties_recipient" TEXT,
    "supply_cap" INTEGER,
    "status_memory_size" BIGINT,
    "status_heap_memory_size" BIGINT,
    "status_cycles" BIGINT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "info_key" TEXT NOT NULL,
    "info_value" TEXT NOT NULL,
    "description" TEXT,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

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
    "onchain" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "is_sale" BOOLEAN,
    CONSTRAINT "NFTInfo_nft_collection_id_fkey" FOREIGN KEY ("nft_collection_id") REFERENCES "NFTCollection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "NFTCollection_shop_idx" ON "NFTCollection"("shop");

-- CreateIndex
CREATE INDEX "NFTInfo_shop_idx" ON "NFTInfo"("shop");

-- CreateIndex
CREATE INDEX "NFTInfo_shop_nft_collection_id_idx" ON "NFTInfo"("shop", "nft_collection_id");

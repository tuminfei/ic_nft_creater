/*
  Warnings:

  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Settings";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "info_key" TEXT NOT NULL,
    "info_value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "NFTCollection_shop_idx" ON "NFTCollection"("shop");

-- CreateIndex
CREATE INDEX "NFTInfo_shop_idx" ON "NFTInfo"("shop");

-- CreateIndex
CREATE INDEX "NFTInfo_shop_nft_collection_id_idx" ON "NFTInfo"("shop", "nft_collection_id");

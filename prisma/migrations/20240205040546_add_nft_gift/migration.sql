-- CreateTable
CREATE TABLE "NFTGift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "nft_info_id" INTEGER NOT NULL,
    "card_code" TEXT NOT NULL,
    "expires_at" DATETIME,
    "used_at" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "NFTGift_nft_info_id_fkey" FOREIGN KEY ("nft_info_id") REFERENCES "NFTInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "NFTGift_nft_info_id_key" ON "NFTGift"("nft_info_id");

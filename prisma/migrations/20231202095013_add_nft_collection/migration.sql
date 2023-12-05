-- CreateTable
CREATE TABLE "NFTCollection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "canister_id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "tx_window" INTEGER NOT NULL,
    "permitted_drift" INTEGER NOT NULL,
    "royalties" INTEGER NOT NULL,
    "royalties_recipient" TEXT NOT NULL,
    "supply_cap" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

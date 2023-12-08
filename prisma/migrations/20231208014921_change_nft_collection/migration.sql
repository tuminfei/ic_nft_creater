-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NFTCollection" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_NFTCollection" ("canister_id", "createdAt", "description", "id", "image", "name", "owner", "permitted_drift", "royalties", "royalties_recipient", "shop", "supply_cap", "symbol", "tx_window", "updatedAt") SELECT "canister_id", "createdAt", "description", "id", "image", "name", "owner", "permitted_drift", "royalties", "royalties_recipient", "shop", "supply_cap", "symbol", "tx_window", "updatedAt" FROM "NFTCollection";
DROP TABLE "NFTCollection";
ALTER TABLE "new_NFTCollection" RENAME TO "NFTCollection";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

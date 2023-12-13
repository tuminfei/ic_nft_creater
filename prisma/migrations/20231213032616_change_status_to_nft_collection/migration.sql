/*
  Warnings:

  - You are about to alter the column `status_cycles` on the `NFTCollection` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `status_heap_memory_size` on the `NFTCollection` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `status_memory_size` on the `NFTCollection` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
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
    "status_memory_size" BIGINT,
    "status_heap_memory_size" BIGINT,
    "status_cycles" BIGINT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_NFTCollection" ("canister_id", "createdAt", "description", "id", "image", "name", "owner", "permitted_drift", "royalties", "royalties_recipient", "shop", "status_cycles", "status_heap_memory_size", "status_memory_size", "supply_cap", "symbol", "tx_window", "updatedAt") SELECT "canister_id", "createdAt", "description", "id", "image", "name", "owner", "permitted_drift", "royalties", "royalties_recipient", "shop", "status_cycles", "status_heap_memory_size", "status_memory_size", "supply_cap", "symbol", "tx_window", "updatedAt" FROM "NFTCollection";
DROP TABLE "NFTCollection";
ALTER TABLE "new_NFTCollection" RENAME TO "NFTCollection";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- AlterTable
ALTER TABLE "NFTCollection" ADD COLUMN "status_cycles" INTEGER;
ALTER TABLE "NFTCollection" ADD COLUMN "status_heap_memory_size" INTEGER;
ALTER TABLE "NFTCollection" ADD COLUMN "status_memory_size" INTEGER;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "info_key" TEXT NOT NULL,
    "info_value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_Settings" ("createdAt", "description", "id", "info_key", "info_value", "updatedAt") SELECT "createdAt", "description", "id", "info_key", "info_value", "updatedAt" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

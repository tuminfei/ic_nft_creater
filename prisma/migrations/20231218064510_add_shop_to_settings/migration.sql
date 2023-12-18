/*
  Warnings:

  - Added the required column `shop` to the `AppSetting` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "info_key" TEXT NOT NULL,
    "info_value" TEXT NOT NULL,
    "description" TEXT,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_AppSetting" ("createdAt", "description", "id", "info_key", "info_value", "updatedAt") SELECT "createdAt", "description", "id", "info_key", "info_value", "updatedAt" FROM "AppSetting";
DROP TABLE "AppSetting";
ALTER TABLE "new_AppSetting" RENAME TO "AppSetting";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

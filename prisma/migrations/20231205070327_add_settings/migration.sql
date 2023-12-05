/*
  Warnings:

  - Added the required column `canister_id` to the `NFTCollection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "info_key" TEXT NOT NULL,
    "info_value" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

/*
  Warnings:

  - A unique constraint covering the columns `[shop,info_key]` on the table `AppSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_shop_info_key_key" ON "AppSetting"("shop", "info_key");

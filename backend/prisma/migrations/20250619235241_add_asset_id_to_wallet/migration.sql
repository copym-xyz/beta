/*
  Warnings:

  - Added the required column `assetId` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `wallet` ADD COLUMN `assetId` VARCHAR(191) NOT NULL,
    ADD COLUMN `balance` DOUBLE NOT NULL;

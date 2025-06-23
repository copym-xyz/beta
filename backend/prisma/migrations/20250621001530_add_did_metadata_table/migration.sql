/*
  Warnings:

  - You are about to drop the column `ipfsCid` on the `wallet` table. All the data in the column will be lost.
  - You are about to drop the column `ipfsUrl` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `wallet` DROP COLUMN `ipfsCid`,
    DROP COLUMN `ipfsUrl`;

-- CreateTable
CREATE TABLE `DIDMetadata` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` VARCHAR(191) NOT NULL,
    `ipfsUrl` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NULL,
    `chains` VARCHAR(191) NULL,
    `walletCount` INTEGER NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DIDMetadata` ADD CONSTRAINT `DIDMetadata_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

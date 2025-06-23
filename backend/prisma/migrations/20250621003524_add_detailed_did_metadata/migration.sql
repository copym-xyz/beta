/*
  Warnings:

  - You are about to drop the column `uploadedAt` on the `didmetadata` table. All the data in the column will be lost.
  - Added the required column `did` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyType` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verificationMethod` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `didmetadata` DROP COLUMN `uploadedAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `did` VARCHAR(191) NOT NULL,
    ADD COLUMN `keyType` VARCHAR(191) NOT NULL,
    ADD COLUMN `verificationMethod` VARCHAR(191) NOT NULL,
    ADD COLUMN `version` VARCHAR(191) NULL;

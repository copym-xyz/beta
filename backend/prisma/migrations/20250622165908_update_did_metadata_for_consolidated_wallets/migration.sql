/*
  Warnings:

  - You are about to drop the column `cid` on the `didmetadata` table. All the data in the column will be lost.
  - You are about to drop the column `ipfsUrl` on the `didmetadata` table. All the data in the column will be lost.
  - Added the required column `allWalletsCid` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `allWalletsUrl` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `combinedHash` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `didDocumentCid` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `didDocumentUrl` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `investorId` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DIDMetadata` table without a default value. This is not possible if the table is not empty.
  - Made the column `purpose` on table `didmetadata` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chains` on table `didmetadata` required. This step will fail if there are existing NULL values in that column.
  - Made the column `walletCount` on table `didmetadata` required. This step will fail if there are existing NULL values in that column.
  - Made the column `version` on table `didmetadata` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `didmetadata` DROP COLUMN `cid`,
    DROP COLUMN `ipfsUrl`,
    ADD COLUMN `allWalletsCid` VARCHAR(191) NOT NULL,
    ADD COLUMN `allWalletsUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `combinedHash` VARCHAR(191) NOT NULL,
    ADD COLUMN `didDocumentCid` VARCHAR(191) NOT NULL,
    ADD COLUMN `didDocumentUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `investorId` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `purpose` VARCHAR(191) NOT NULL DEFAULT 'multi-chain-wallet-verification',
    MODIFY `chains` VARCHAR(191) NOT NULL,
    MODIFY `walletCount` INTEGER NOT NULL,
    MODIFY `version` VARCHAR(191) NOT NULL DEFAULT '2.0.0';

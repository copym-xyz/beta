-- CreateTable
CREATE TABLE `SBTCredential` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageCid` VARCHAR(191) NOT NULL,
    `vcCid` VARCHAR(191) NOT NULL DEFAULT '',
    `vcHash` VARCHAR(191) NOT NULL DEFAULT '',
    `selectedImage` VARCHAR(191) NULL,
    `vcSigned` TEXT NULL,
    `minted` BOOLEAN NOT NULL DEFAULT false,
    `txHash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SBTCredential` ADD CONSTRAINT `SBTCredential_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

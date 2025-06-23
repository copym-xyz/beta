-- CreateTable
CREATE TABLE `KycData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicantId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `reviewResult` VARCHAR(191) NULL,
    `personalInfo` TEXT NOT NULL,
    `documentsInfo` TEXT NOT NULL,
    `rawApplicantData` TEXT NOT NULL,
    `rawStatusData` TEXT NOT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `KycData_applicantId_key`(`applicantId`),
    UNIQUE INDEX `KycData_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KycData` ADD CONSTRAINT `KycData_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

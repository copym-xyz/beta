-- AlterTable
ALTER TABLE `users` ADD COLUMN `provider` VARCHAR(191) NOT NULL DEFAULT 'local';

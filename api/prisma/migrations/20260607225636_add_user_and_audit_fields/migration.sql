/*
  Warnings:

  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `operations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `fixed_income_positions` DROP FOREIGN KEY `fixed_income_positions_asset_id_fkey`;

-- DropForeignKey
ALTER TABLE `operations` DROP FOREIGN KEY `operations_asset_id_fkey`;

-- DropForeignKey
ALTER TABLE `portfolio_positions` DROP FOREIGN KEY `portfolio_positions_asset_id_fkey`;

-- AlterTable
ALTER TABLE `fixed_income_history` ADD COLUMN `created_by` INTEGER NULL;

-- AlterTable
ALTER TABLE `fixed_income_positions` ADD COLUMN `created_by` INTEGER NULL,
    ADD COLUMN `nota_nome` VARCHAR(255) NULL,
    ADD COLUMN `nota_path` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `operations` ADD COLUMN `created_by` INTEGER NULL,
    ADD COLUMN `nota_nome` VARCHAR(255) NULL,
    ADD COLUMN `nota_path` VARCHAR(500) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `repositionings` ADD COLUMN `created_by` INTEGER NULL;

-- DropTable
DROP TABLE `Asset`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticker` VARCHAR(20) NOT NULL,
    `tipo` ENUM('ACOES', 'FII', 'BDR', 'ETF', 'CRIPTO') NOT NULL,
    `nome` VARCHAR(200) NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assets_ticker_key`(`ticker`),
    INDEX `assets_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revoked_at` DATETIME(3) NULL,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `fixed_income_history_created_by_idx` ON `fixed_income_history`(`created_by`);

-- CreateIndex
CREATE INDEX `fixed_income_positions_created_by_idx` ON `fixed_income_positions`(`created_by`);

-- CreateIndex
CREATE INDEX `operations_created_by_idx` ON `operations`(`created_by`);

-- CreateIndex
CREATE INDEX `operations_data_idx` ON `operations`(`data`);

-- CreateIndex
CREATE INDEX `repositionings_created_by_idx` ON `repositionings`(`created_by`);

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolio_positions` ADD CONSTRAINT `portfolio_positions_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operations` ADD CONSTRAINT `operations_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operations` ADD CONSTRAINT `operations_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repositionings` ADD CONSTRAINT `repositionings_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fixed_income_positions` ADD CONSTRAINT `fixed_income_positions_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fixed_income_positions` ADD CONSTRAINT `fixed_income_positions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fixed_income_history` ADD CONSTRAINT `fixed_income_history_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `fixed_income_positions` RENAME INDEX `fixed_income_positions_asset_id_fkey` TO `fixed_income_positions_asset_id_idx`;

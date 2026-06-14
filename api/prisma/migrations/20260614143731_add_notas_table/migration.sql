/*
  Warnings:

  - You are about to drop the column `nota_nome` on the `fixed_income_positions` table. All the data in the column will be lost.
  - You are about to drop the column `nota_path` on the `fixed_income_positions` table. All the data in the column will be lost.
  - You are about to drop the column `nota_nome` on the `operations` table. All the data in the column will be lost.
  - You are about to drop the column `nota_path` on the `operations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `fixed_income_positions` DROP COLUMN `nota_nome`,
    DROP COLUMN `nota_path`,
    ADD COLUMN `file_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `operations` DROP COLUMN `nota_nome`,
    DROP COLUMN `nota_path`,
    ADD COLUMN `file_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `notas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `tipo` ENUM('C_RF', 'V_RV', 'RF', 'PATH') NOT NULL,
    `path` VARCHAR(1000) NOT NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notas_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `fixed_income_positions_file_id_idx` ON `fixed_income_positions`(`file_id`);

-- CreateIndex
CREATE INDEX `operations_file_id_idx` ON `operations`(`file_id`);

-- AddForeignKey
ALTER TABLE `operations` ADD CONSTRAINT `operations_file_id_fkey` FOREIGN KEY (`file_id`) REFERENCES `notas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fixed_income_positions` ADD CONSTRAINT `fixed_income_positions_file_id_fkey` FOREIGN KEY (`file_id`) REFERENCES `notas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notas` ADD CONSTRAINT `notas_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

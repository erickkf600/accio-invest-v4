-- CreateTable
CREATE TABLE `fixed_income_yields` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fixed_income_id` INTEGER NOT NULL,
    `emissor` VARCHAR(200) NOT NULL,
    `data_operacao` DATETIME(3) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `observacoes` VARCHAR(150) NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fixed_income_yields_fixed_income_id_idx`(`fixed_income_id`),
    INDEX `fixed_income_yields_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fixed_income_yields` ADD CONSTRAINT `fixed_income_yields_fixed_income_id_fkey` FOREIGN KEY (`fixed_income_id`) REFERENCES `fixed_income_positions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fixed_income_yields` ADD CONSTRAINT `fixed_income_yields_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

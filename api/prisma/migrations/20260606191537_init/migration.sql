-- CreateTable
CREATE TABLE `Asset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticker` VARCHAR(20) NOT NULL,
    `tipo` ENUM('ACOES', 'FII', 'BDR', 'ETF', 'CRIPTO') NOT NULL,
    `nome` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Asset_ticker_key`(`ticker`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolio_positions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_id` INTEGER NOT NULL,
    `ticker` VARCHAR(20) NOT NULL,
    `qtd` INTEGER NOT NULL,
    `preco_medio` DOUBLE NOT NULL,
    `custo_total` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `portfolio_positions_asset_id_key`(`asset_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_id` INTEGER NOT NULL,
    `ticker` VARCHAR(20) NOT NULL,
    `tipo` ENUM('Compra', 'Venda', 'Proventos') NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `qtd` INTEGER NULL,
    `preco_unitario` DOUBLE NOT NULL,
    `taxas` DOUBLE NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,
    `lucro_realizado` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `operations_asset_id_idx`(`asset_id`),
    INDEX `operations_ticker_idx`(`ticker`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `repositionings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_id` INTEGER NOT NULL,
    `ticker` VARCHAR(20) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `tipo` ENUM('ACOES', 'FII', 'BDR', 'ETF', 'CRIPTO') NOT NULL,
    `fator` VARCHAR(20) NOT NULL,
    `proporcao_de` INTEGER NOT NULL,
    `proporcao_para` INTEGER NOT NULL,
    `qtd_antes` INTEGER NOT NULL,
    `qtd_depois` INTEGER NOT NULL,
    `pm_antes` DOUBLE NOT NULL,
    `pm_depois` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fixed_income_positions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `emissor` VARCHAR(200) NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `indexador` VARCHAR(10) NOT NULL,
    `taxa_juros` DOUBLE NOT NULL,
    `liquidez_diaria` BOOLEAN NOT NULL,
    `possui_imposto` BOOLEAN NOT NULL,
    `valor_aplicado` DOUBLE NOT NULL,
    `data_compra` DATETIME(3) NOT NULL,
    `vencimento` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `asset_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fixed_income_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `emissor` VARCHAR(200) NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `indexador` VARCHAR(10) NOT NULL,
    `taxa_juros` DOUBLE NOT NULL,
    `valor_aplicado` DOUBLE NOT NULL,
    `valor_resgate` DOUBLE NOT NULL,
    `rendimento_bruto` DOUBLE NOT NULL,
    `imposto_retido` DOUBLE NULL,
    `data_vencimento` DATETIME(3) NOT NULL,
    `data_resgate` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `portfolio_positions` ADD CONSTRAINT `portfolio_positions_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `Asset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operations` ADD CONSTRAINT `operations_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `Asset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repositionings` ADD CONSTRAINT `repositionings_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `Asset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fixed_income_positions` ADD CONSTRAINT `fixed_income_positions_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `Asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

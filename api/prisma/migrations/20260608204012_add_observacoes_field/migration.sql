-- AlterTable
ALTER TABLE `fixed_income_positions` ADD COLUMN `observacoes` VARCHAR(150) NULL;

-- AlterTable
ALTER TABLE `operations` ADD COLUMN `observacoes` VARCHAR(150) NULL;

-- AlterTable
ALTER TABLE `repositionings` MODIFY `observacoes` VARCHAR(150) NULL;

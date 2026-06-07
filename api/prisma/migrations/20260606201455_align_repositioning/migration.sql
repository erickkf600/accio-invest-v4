/*
  Warnings:

  - You are about to drop the column `asset_id` on the `repositionings` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `repositionings` table. All the data in the column will be lost.
  - You are about to drop the column `pm_antes` on the `repositionings` table. All the data in the column will be lost.
  - You are about to drop the column `pm_depois` on the `repositionings` table. All the data in the column will be lost.
  - You are about to drop the column `proporcao_de` on the `repositionings` table. All the data in the column will be lost.
  - You are about to drop the column `proporcao_para` on the `repositionings` table. All the data in the column will be lost.
  - You are about to drop the column `qtd_antes` on the `repositionings` table. All the data in the column will be lost.
  - You are about to drop the column `qtd_depois` on the `repositionings` table. All the data in the column will be lost.
  - You are about to alter the column `tipo` on the `repositionings` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(20)`.
  - Added the required column `data_operacao` to the `repositionings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ratio_de` to the `repositionings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ratio_para` to the `repositionings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `repositionings` DROP FOREIGN KEY `repositionings_asset_id_fkey`;

-- DropIndex
DROP INDEX `repositionings_asset_id_fkey` ON `repositionings`;

-- AlterTable
ALTER TABLE `repositionings` DROP COLUMN `asset_id`,
    DROP COLUMN `data`,
    DROP COLUMN `pm_antes`,
    DROP COLUMN `pm_depois`,
    DROP COLUMN `proporcao_de`,
    DROP COLUMN `proporcao_para`,
    DROP COLUMN `qtd_antes`,
    DROP COLUMN `qtd_depois`,
    ADD COLUMN `data_operacao` DATETIME(3) NOT NULL,
    ADD COLUMN `observacoes` TEXT NULL,
    ADD COLUMN `ratio_de` VARCHAR(10) NOT NULL,
    ADD COLUMN `ratio_para` VARCHAR(10) NOT NULL,
    MODIFY `tipo` VARCHAR(20) NOT NULL;

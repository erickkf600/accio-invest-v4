/*
  Warnings:

  - The column `tipo` on the `operations` table is renamed to `tipo_operacao` preserving enum values.
  - The column `lucro_realizado` on the `operations` table is dropped.
  - A new nullable `tipo` column with TipoValor enum is added.

  Migration steps performed:
  1. Rename `tipo` (OperationType enum) to `tipo_operacao`
  2. Add new `tipo` column with TipoValor enum (nullable)
  3. Drop `lucro_realizado` column
*/

-- Rename `tipo` to `tipo_operacao` (preserves data and NOT NULL constraint)
ALTER TABLE `operations` RENAME COLUMN `tipo` TO `tipo_operacao`;

-- Add new `tipo` column with TipoValor enum (nullable)
ALTER TABLE `operations` ADD COLUMN `tipo` ENUM('ACOES', 'FII', 'BDR', 'ETF', 'CRIPTO') NULL AFTER `tipo_operacao`;

-- Drop unused column
ALTER TABLE `operations` DROP COLUMN `lucro_realizado`;

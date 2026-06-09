/*
  Warnings:

  - You are about to drop the column `nome` on the `assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `assets` DROP COLUMN `nome`,
    ADD COLUMN `quantidade` INTEGER NULL;

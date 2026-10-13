-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "NotaTipo" AS ENUM ('C_RF', 'V_RV', 'RF', 'PATH');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('ACOES', 'FII', 'BDR', 'ETF', 'CRIPTO');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('Compra', 'Venda', 'Proventos');

-- CreateEnum
CREATE TYPE "TipoValor" AS ENUM ('ACOES', 'FII', 'BDR', 'ETF', 'CRIPTO');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "ticker" VARCHAR(20) NOT NULL,
    "tipo" "AssetType" NOT NULL,
    "quantidade" INTEGER,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_positions" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "ticker" VARCHAR(20) NOT NULL,
    "qtd" INTEGER NOT NULL,
    "preco_medio" DOUBLE PRECISION NOT NULL,
    "custo_total" DOUBLE PRECISION NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "ticker" VARCHAR(20) NOT NULL,
    "tipo_operacao" "OperationType" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "qtd" INTEGER,
    "preco_unitario" DOUBLE PRECISION NOT NULL,
    "taxas" DOUBLE PRECISION DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "tipo" "TipoValor",
    "file_id" INTEGER,
    "observacoes" VARCHAR(150),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositionings" (
    "id" SERIAL NOT NULL,
    "ticker" VARCHAR(20) NOT NULL,
    "data_operacao" TIMESTAMP(3) NOT NULL,
    "ratio_de" VARCHAR(10) NOT NULL,
    "ratio_para" VARCHAR(10) NOT NULL,
    "qtd_original" INTEGER NOT NULL,
    "preco_medio_original" DOUBLE PRECISION NOT NULL,
    "custo_total_original" DOUBLE PRECISION NOT NULL,
    "observacoes" VARCHAR(150),
    "created_by" INTEGER,
    "portfolio_position_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repositionings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixed_income_positions" (
    "id" SERIAL NOT NULL,
    "emissor" VARCHAR(200) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "indexador" VARCHAR(10) NOT NULL,
    "taxa_juros" DOUBLE PRECISION NOT NULL,
    "liquidez_diaria" BOOLEAN NOT NULL,
    "possui_imposto" BOOLEAN NOT NULL,
    "valor_aplicado" DOUBLE PRECISION NOT NULL,
    "data_compra" TIMESTAMP(3) NOT NULL,
    "vencimento" TIMESTAMP(3),
    "file_id" INTEGER,
    "observacoes" VARCHAR(150),
    "asset_id" INTEGER,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixed_income_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixed_income_history" (
    "id" SERIAL NOT NULL,
    "emissor" VARCHAR(200) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "indexador" VARCHAR(10) NOT NULL,
    "taxa_juros" DOUBLE PRECISION NOT NULL,
    "valor_aplicado" DOUBLE PRECISION NOT NULL,
    "valor_resgate" DOUBLE PRECISION NOT NULL,
    "rendimento_bruto" DOUBLE PRECISION NOT NULL,
    "imposto_retido" DOUBLE PRECISION,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_resgate" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fixed_income_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixed_income_yields" (
    "id" SERIAL NOT NULL,
    "fixed_income_id" INTEGER NOT NULL,
    "emissor" VARCHAR(200) NOT NULL,
    "data_operacao" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "observacoes" VARCHAR(150),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixed_income_yields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" "NotaTipo" NOT NULL,
    "path" VARCHAR(1000) NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "assets_created_by_idx" ON "assets"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "assets_ticker_created_by_key" ON "assets"("ticker", "created_by");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_positions_asset_id_key" ON "portfolio_positions"("asset_id");

-- CreateIndex
CREATE INDEX "portfolio_positions_user_id_idx" ON "portfolio_positions"("user_id");

-- CreateIndex
CREATE INDEX "operations_asset_id_idx" ON "operations"("asset_id");

-- CreateIndex
CREATE INDEX "operations_ticker_idx" ON "operations"("ticker");

-- CreateIndex
CREATE INDEX "operations_created_by_idx" ON "operations"("created_by");

-- CreateIndex
CREATE INDEX "operations_data_idx" ON "operations"("data");

-- CreateIndex
CREATE INDEX "operations_file_id_idx" ON "operations"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "repositionings_portfolio_position_id_key" ON "repositionings"("portfolio_position_id");

-- CreateIndex
CREATE INDEX "repositionings_created_by_idx" ON "repositionings"("created_by");

-- CreateIndex
CREATE INDEX "fixed_income_positions_asset_id_idx" ON "fixed_income_positions"("asset_id");

-- CreateIndex
CREATE INDEX "fixed_income_positions_created_by_idx" ON "fixed_income_positions"("created_by");

-- CreateIndex
CREATE INDEX "fixed_income_positions_file_id_idx" ON "fixed_income_positions"("file_id");

-- CreateIndex
CREATE INDEX "fixed_income_history_created_by_idx" ON "fixed_income_history"("created_by");

-- CreateIndex
CREATE INDEX "fixed_income_yields_fixed_income_id_idx" ON "fixed_income_yields"("fixed_income_id");

-- CreateIndex
CREATE INDEX "fixed_income_yields_created_by_idx" ON "fixed_income_yields"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "notas_created_by_idx" ON "notas"("created_by");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_positions" ADD CONSTRAINT "portfolio_positions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_positions" ADD CONSTRAINT "portfolio_positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "notas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositionings" ADD CONSTRAINT "repositionings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositionings" ADD CONSTRAINT "repositionings_portfolio_position_id_fkey" FOREIGN KEY ("portfolio_position_id") REFERENCES "portfolio_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_income_positions" ADD CONSTRAINT "fixed_income_positions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_income_positions" ADD CONSTRAINT "fixed_income_positions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_income_positions" ADD CONSTRAINT "fixed_income_positions_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "notas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_income_history" ADD CONSTRAINT "fixed_income_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_income_yields" ADD CONSTRAINT "fixed_income_yields_fixed_income_id_fkey" FOREIGN KEY ("fixed_income_id") REFERENCES "fixed_income_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_income_yields" ADD CONSTRAINT "fixed_income_yields_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


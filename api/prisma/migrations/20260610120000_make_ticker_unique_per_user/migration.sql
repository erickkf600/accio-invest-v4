-- Drop the global unique constraint on ticker
DROP INDEX `assets_ticker_key` ON `assets`;

-- Add composite unique constraint on (ticker, created_by)
CREATE UNIQUE INDEX `assets_ticker_created_by_key` ON `assets`(`ticker`, `created_by`);

import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PositionSyncService } from './position-sync.service';

@Module({
  controllers: [PortfolioController],
  providers: [PortfolioService, PositionSyncService],
  exports: [PortfolioService, PositionSyncService],
})
export class PortfolioModule {}

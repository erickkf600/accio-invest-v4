import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PositionSyncService } from './position-sync.service';
import { PythonApiModule } from '../integrations/python-api/python-api.module';

@Module({
  imports: [PythonApiModule],
  controllers: [PortfolioController],
  providers: [PortfolioService, PositionSyncService],
  exports: [PortfolioService, PositionSyncService],
})
export class PortfolioModule {}

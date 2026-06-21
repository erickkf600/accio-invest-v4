import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { PythonApiModule } from '../integrations/python-api/python-api.module';

@Module({
  imports: [
    PortfolioModule,
    PythonApiModule,
  ],
  controllers: [OperationsController],
  providers: [OperationsService],
  exports: [OperationsService],
})
export class OperationsModule {}

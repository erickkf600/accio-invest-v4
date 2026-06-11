import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { FILE_CONSTANTS } from '../config/constants';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: FILE_CONSTANTS.maxFileSize },
    }),
    PortfolioModule,
  ],
  controllers: [OperationsController],
  providers: [OperationsService],
  exports: [OperationsService],
})
export class OperationsModule {}

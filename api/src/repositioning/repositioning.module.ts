import { Module } from '@nestjs/common';
import { RepositioningController } from './repositioning.controller';
import { RepositioningService } from './repositioning.service';

@Module({
  controllers: [RepositioningController],
  providers: [RepositioningService],
})
export class RepositioningModule {}

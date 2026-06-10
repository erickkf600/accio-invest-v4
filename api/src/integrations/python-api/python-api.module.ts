import { Module } from '@nestjs/common';
import { PythonApiService } from './python-api.service';
import { PythonApiController } from './python-api.controller';

@Module({
  controllers: [PythonApiController],
  providers: [PythonApiService],
  exports: [PythonApiService],
})
export class PythonApiModule {}

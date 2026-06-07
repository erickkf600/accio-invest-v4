import { Module } from '@nestjs/common';
import { PythonApiService } from './python-api.service';

@Module({
  providers: [PythonApiService],
  exports: [PythonApiService],
})
export class PythonApiModule {}

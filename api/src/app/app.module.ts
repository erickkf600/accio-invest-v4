import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AssetsModule } from '../assets/assets.module';
import { OperationsModule } from '../operations/operations.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { ReportsModule } from '../reports/reports.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { RepositioningModule } from '../repositioning/repositioning.module';
import { PythonApiModule } from '../integrations/python-api/python-api.module';
import { MinioModule } from '../integrations/minio/minio.module';
import { FILE_CONSTANTS } from '../config/constants';
import { AllExceptionsFilter } from '../common/filters/http-exception.filter';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: FILE_CONSTANTS.maxFileSize },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AssetsModule,
    OperationsModule,
    PortfolioModule,
    ReportsModule,
    DashboardModule,
    RepositioningModule,
    PythonApiModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}

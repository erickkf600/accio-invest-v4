import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortfolioService } from './portfolio.service';
import { PortfolioFilterDto } from './dto/portfolio-filter.dto';
import { CreateFixedIncomeDto } from './dto/create-fixed-income.dto';
import { UpdateFixedIncomeDto } from './dto/update-fixed-income.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { DividendResponseDto } from './dto/dividend-response.dto';
import { YieldResponseDto } from './dto/yield-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@ApiTags('Portfolio')
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('positions')
  @ApiOperation({ summary: 'Obter posições do portfolio (paginado)' })
  async getPositions(
    @Query() filter: PortfolioFilterDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<PositionResponseDto>> {
    return this.portfolioService.getPositions(user.sub, filter);
  }

  @Get('dividends')
  @ApiOperation({ summary: 'Obter histórico de proventos (paginado)' })
  async getDividends(
    @Query() filter: PortfolioFilterDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<DividendResponseDto>> {
    return this.portfolioService.getDividends(user.sub, filter);
  }

  @Get('yields')
  @ApiOperation({ summary: 'Obter rendimentos de renda fixa (paginado)' })
  async getYields(
    @Query() filter: PortfolioFilterDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<YieldResponseDto>> {
    return this.portfolioService.getYields(user.sub, filter);
  }

  @Post('fixed-income')
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        emissor: { type: 'string', example: 'Tesouro Selic' },
        tipo: { type: 'string', example: 'Pós-fixado' },
        indexador: { type: 'string', example: 'SELIC' },
        taxaJuros: { type: 'number', example: 0.5 },
        liquidezDiaria: { type: 'boolean', example: true },
        possuiImposto: { type: 'boolean', example: false },
        valorAplicado: { type: 'number', example: 10000.0 },
        dataCompra: { type: 'string', example: '2026-06-07' },
        vencimento: { type: 'string', example: '2030-06-07' },
        nota: { type: 'string' },
        arquivo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Criar posição de renda fixa' })
  async createFixedIncome(
    @Body() dto: CreateFixedIncomeDto,
    @UploadedFile() arquivo: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ): Promise<YieldResponseDto> {
    return this.portfolioService.createFixedIncome(dto, user.sub, arquivo);
  }

  @Patch('fixed-income/:id')
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        emissor: { type: 'string' },
        tipo: { type: 'string' },
        indexador: { type: 'string' },
        taxaJuros: { type: 'number' },
        liquidezDiaria: { type: 'boolean' },
        possuiImposto: { type: 'boolean' },
        valorAplicado: { type: 'number' },
        dataCompra: { type: 'string' },
        vencimento: { type: 'string' },
        nota: { type: 'string' },
        arquivo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Atualizar posição de renda fixa' })
  async updateFixedIncome(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFixedIncomeDto,
    @UploadedFile() arquivo: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ): Promise<YieldResponseDto> {
    return this.portfolioService.updateFixedIncome(id, dto, user.sub, arquivo);
  }
}

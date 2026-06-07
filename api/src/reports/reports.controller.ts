import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { RelatorioAporteDto } from './dto/report-aporte.dto';
import { RelatorioVendaDto } from './dto/report-venda.dto';
import { RelatorioAluguelDto } from './dto/report-aluguel.dto';
import { RelatorioProventoDto } from './dto/report-proventos.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('aportes')
  @ApiOperation({ summary: 'Relatório de aportes (paginado)' })
  async getAportes(
    @Query() filter: ReportFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<RelatorioAporteDto>> {
    return this.reportsService.getAportes(user.sub, filter);
  }

  @Get('vendas')
  @ApiOperation({ summary: 'Relatório de vendas (paginado)' })
  async getVendas(
    @Query() filter: ReportFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<RelatorioVendaDto>> {
    return this.reportsService.getVendas(user.sub, filter);
  }

  @Get('alugueis')
  @ApiOperation({ summary: 'Relatório de aluguéis (paginado)' })
  async getAlugueis(
    @Query() filter: ReportFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<RelatorioAluguelDto>> {
    return this.reportsService.getAlugueis(user.sub, filter);
  }

  @Get('proventos')
  @ApiOperation({ summary: 'Relatório de proventos (paginado)' })
  async getProventos(
    @Query() filter: ReportFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<RelatorioProventoDto>> {
    return this.reportsService.getProventos(user.sub, filter);
  }

  @Get('preco-medio')
  @ApiOperation({ summary: 'Relatório de preço médio (paginado)' })
  async getPrecoMedio(
    @Query() filter: ReportFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<unknown>> {
    return this.reportsService.getPrecoMedio(user.sub, filter);
  }

  @Get('renda-fixa')
  @ApiOperation({ summary: 'Relatório de renda fixa (paginado)' })
  async getRendaFixa(
    @Query() filter: ReportFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<unknown>> {
    return this.reportsService.getRendaFixa(user.sub, filter);
  }
}

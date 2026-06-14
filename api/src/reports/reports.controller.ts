import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
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
import { ReportsService } from './reports.service';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { NotaListDto } from './dto/nota-list.dto';
import { RelatorioAporteDto } from './dto/report-aporte.dto';
import { RelatorioVendaDto } from './dto/report-venda.dto';
import { RelatorioAluguelDto } from './dto/report-aluguel.dto';
import { RelatorioProventoDto } from './dto/report-proventos.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { FILE_CONSTANTS } from '../config/constants';
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

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nota: { type: 'string', description: 'Nome opcional para o arquivo' },
        arquivo: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload de arquivo genérico (PDF)' })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/pdf' }),
          new MaxFileSizeValidator({ maxSize: FILE_CONSTANTS.maxFileSize }),
        ],
        fileIsRequired: true,
      }),
    ) arquivo: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
    @Body('nota') nota?: string,
  ): Promise<{ fileId: number; nome: string; path: string }> {
    return this.reportsService.uploadFile(arquivo, user.sub, nota);
  }

  @Get('notas')
  @ApiOperation({ summary: 'Listar todas as notas (PDFs) do usuário' })
  async getNotas(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ data: NotaListDto[] }> {
    return this.reportsService.getNotas(user.sub);
  }

  @Get('notas/:id/links')
  @ApiOperation({ summary: 'Verificar se nota possui vínculos com operações' })
  async getNotaLinks(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ hasLinks: boolean }> {
    return this.reportsService.getNotaLinks(id, user.sub);
  }

  @Delete('notas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover nota de corretagem' })
  async removeNota(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Query('mode') mode: 'unlink' | 'cascade' = 'unlink',
  ): Promise<void> {
    return this.reportsService.removeNota(id, user.sub, mode);
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

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
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
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { ListOperationsDto } from './dto/list-operations.dto';
import { OperationResponseDto } from './dto/operation-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@ApiTags('Operations')
@Controller('operations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar operações (paginado com filtros)' })
  async list(
    @Query() dto: ListOperationsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResult<OperationResponseDto>> {
    return this.operationsService.list(dto, user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', example: 'PETR4' },
        tipo: { type: 'string', enum: ['Compra', 'Venda', 'Proventos'] },
        data: { type: 'string', example: '2026-06-07T10:00:00Z' },
        qtd: { type: 'integer', example: 100 },
        precoUn: { type: 'number', example: 25.5 },
        taxas: { type: 'number', example: 10.0 },
        total: { type: 'number', example: 2550.0 },
        nota: { type: 'string', description: 'Observação opcional' },
        arquivo: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF opcional',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Criar operação (suporta upload PDF)' })
  async create(
    @Body() dto: CreateOperationDto,
    @UploadedFile() arquivo: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ): Promise<OperationResponseDto> {
    return this.operationsService.create(dto, user.sub, arquivo, dto.nota);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes da operação' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<OperationResponseDto> {
    return this.operationsService.findById(id, user.sub);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ticker: { type: 'string' },
        tipo: { type: 'string', enum: ['Compra', 'Venda', 'Proventos'] },
        data: { type: 'string' },
        qtd: { type: 'integer' },
        precoUn: { type: 'number' },
        taxas: { type: 'number' },
        total: { type: 'number' },
        nota: { type: 'string' },
        arquivo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Atualizar operação (suporta upload PDF)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOperationDto,
    @UploadedFile() arquivo: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ): Promise<OperationResponseDto> {
    return this.operationsService.update(id, dto, user.sub, arquivo, dto.nota);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover operação' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.operationsService.remove(id, user.sub);
  }
}

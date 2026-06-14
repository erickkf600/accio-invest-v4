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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ListAssetsDto } from './dto/list-assets.dto';
import { AssetResponseDto } from './dto/asset-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@ApiTags('Assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar ativos (paginado)' })
  async list(@Query() dto: ListAssetsDto, @CurrentUser() user: JwtPayload,
): Promise<PaginatedResult<AssetResponseDto>> {
    return this.assetsService.list(dto, user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo ativo' })
  async create(
    @Body() dto: CreateAssetDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AssetResponseDto> {
    return this.assetsService.create(dto, user.sub);
  }

  @Get(':ticker')
  @ApiOperation({ summary: 'Obter ativo por ticker' })
  async findByTicker(
    @Param('ticker') ticker: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AssetResponseDto> {
    return this.assetsService.findByTicker(ticker, user.sub);
  }

  @Patch(':ticker')
  @ApiOperation({ summary: 'Atualizar ativo' })
  async update(
    @Param('ticker') ticker: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AssetResponseDto> {
    return this.assetsService.update(ticker, dto, user.sub);
  }

  @Delete(':ticker')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover ativo' })
  async remove(
    @Param('ticker') ticker: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.assetsService.remove(ticker, user.sub);
  }
}

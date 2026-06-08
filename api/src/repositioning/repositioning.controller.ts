import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RepositioningService } from './repositioning.service';
import { CreateRepositioningDto } from './dto/create-repositioning.dto';
import { UpdateRepositioningDto } from './dto/update-repositioning.dto';
import { RepositioningResponseDto } from './dto/repositioning-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@ApiTags('Repositioning')
@Controller('repositioning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RepositioningController {
  constructor(private readonly repositioningService: RepositioningService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar reposicionamento (desdobramento/grupamento)' })
  async create(
    @Body() dto: CreateRepositioningDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<RepositioningResponseDto> {
    return this.repositioningService.create(dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar reposicionamento' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRepositioningDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<RepositioningResponseDto> {
    return this.repositioningService.update(id, dto, user.sub);
  }
}

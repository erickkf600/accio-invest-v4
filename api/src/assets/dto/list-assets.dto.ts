import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AssetType } from '../../generated/prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListAssetsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AssetType })
  @IsOptional()
  @IsEnum(AssetType)
  tipo?: AssetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

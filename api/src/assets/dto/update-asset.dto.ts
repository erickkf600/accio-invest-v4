import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { AssetType } from '../../generated/prisma/client';

export class UpdateAssetDto {
  @ApiPropertyOptional({ enum: AssetType })
  @IsOptional()
  @IsEnum(AssetType)
  tipo?: AssetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  quantidade?: number;
}

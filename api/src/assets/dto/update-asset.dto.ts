import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { AssetType } from '../../generated/prisma/client';

export class UpdateAssetDto {
  @ApiPropertyOptional({ enum: AssetType })
  @IsOptional()
  @IsEnum(AssetType)
  tipo?: AssetType;

  @ApiPropertyOptional({ example: 'Petrobras PN' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nome?: string;
}

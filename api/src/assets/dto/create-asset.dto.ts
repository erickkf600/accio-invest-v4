import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { AssetType } from '../../generated/prisma/client';

export class CreateAssetDto {
  @ApiProperty({ example: 'PETR4' })
  @IsString()
  @MaxLength(20)
  ticker: string;

  @ApiProperty({ enum: AssetType, example: AssetType.ACOES })
  @IsEnum(AssetType)
  tipo: AssetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  quantidade?: number;
}

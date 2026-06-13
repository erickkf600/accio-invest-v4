import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetType } from '../../generated/prisma/client';

export class AssetResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty({ enum: AssetType })
  tipo: AssetType;

  @ApiPropertyOptional()
  quantidade?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

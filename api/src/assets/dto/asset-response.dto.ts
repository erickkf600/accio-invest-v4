import { ApiProperty } from '@nestjs/swagger';
import { AssetType } from '../../generated/prisma/client';

export class AssetResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty({ enum: AssetType })
  tipo: AssetType;

  @ApiProperty({ required: false })
  nome?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

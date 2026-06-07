import { ApiProperty } from '@nestjs/swagger';
import { AssetType } from '../../generated/prisma/client';

export class PositionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty({ enum: AssetType })
  tipo: AssetType;

  @ApiProperty()
  qtd: number;

  @ApiProperty()
  precoMedio: number;

  @ApiProperty()
  custoTotal: number;

  @ApiProperty()
  precoAtual: number;

  @ApiProperty()
  valorAtual: number;

  @ApiProperty()
  lucroPrejuizo: number;

  @ApiProperty()
  lucroPrejuizoPct: number;

  @ApiProperty()
  participacao: number;
}

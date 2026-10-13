import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RepositioningResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticker: string;

  @ApiPropertyOptional({ description: 'Tipo do ativo (FII, ACOES, ...)' })
  tipo?: string;

  @ApiProperty()
  dataOperacao: Date;

  @ApiProperty()
  ratioDe: string;

  @ApiProperty()
  ratioPara: string;

  @ApiProperty()
  qtdOriginal: number;

  @ApiProperty()
  precoMedioOriginal: number;

  @ApiProperty()
  custoTotalOriginal: number;

  @ApiPropertyOptional()
  observacoes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  portfolioPositionId?: number;
}

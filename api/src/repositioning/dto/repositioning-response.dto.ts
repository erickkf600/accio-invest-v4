import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RepositioningResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty()
  dataOperacao: Date;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  fator: string;

  @ApiProperty()
  ratioDe: string;

  @ApiProperty()
  ratioPara: string;

  @ApiPropertyOptional()
  observacoes?: string;

  @ApiProperty()
  createdAt: Date;
}

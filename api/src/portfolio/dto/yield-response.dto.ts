import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class YieldResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  emissor: string;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  indexador: string;

  @ApiProperty()
  taxaJuros: number;

  @ApiProperty()
  valorAplicado: number;

  @ApiProperty()
  dataCompra: Date;

  @ApiPropertyOptional()
  vencimento?: Date;

  @ApiProperty()
  liquidezDiaria: boolean;

  @ApiProperty()
  possuiImposto: boolean;

  @ApiProperty({ required: false })
  fileId?: number;
}

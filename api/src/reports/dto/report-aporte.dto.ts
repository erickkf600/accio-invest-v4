import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AporteAtivoDto {
  @ApiProperty()
  ticker: string;

  @ApiProperty()
  qtd: number;

  @ApiProperty()
  precoUn: number;

  @ApiProperty()
  total: number;
}

export class RelatorioAporteDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  data: Date;

  @ApiProperty()
  mes: number;

  @ApiProperty()
  ano: number;

  @ApiProperty()
  valor: number;

  @ApiPropertyOptional()
  taxas?: number;

  @ApiProperty({ type: [AporteAtivoDto] })
  ativos: AporteAtivoDto[];
}

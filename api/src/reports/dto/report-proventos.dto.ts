import { ApiProperty } from '@nestjs/swagger';

export class RelatorioProventoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty()
  data: Date;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  qtd: number;

  @ApiProperty()
  valorUn: number;

  @ApiProperty()
  total: number;
}

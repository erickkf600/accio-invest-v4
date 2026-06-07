import { ApiProperty } from '@nestjs/swagger';

export class RelatorioAluguelDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty()
  data: Date;

  @ApiProperty()
  qtd: number;

  @ApiProperty()
  precoUn: number;

  @ApiProperty()
  total: number;
}

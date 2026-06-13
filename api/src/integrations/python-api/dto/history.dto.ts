import { ApiProperty } from '@nestjs/swagger';

export class HistoryValueDto {
  @ApiProperty({ description: 'Data (YYYY-MM-DD)' })
  data: string;

  @ApiProperty({ description: 'Valor de fechamento' })
  valor: string;
}

export class TickerHistoryDto {
  @ApiProperty({ description: 'Código do ticker' })
  ticker: string;

  @ApiProperty({ type: [HistoryValueDto], description: 'Valores históricos' })
  valores: HistoryValueDto[];
}

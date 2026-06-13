import { ApiProperty } from '@nestjs/swagger';

export class QuoteTickerDto {
  @ApiProperty({ description: 'Código do ticker' })
  ticker: string;

  @ApiProperty({ description: 'Preço atual' })
  curPrc: number;
}

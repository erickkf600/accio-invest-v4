import { ApiProperty } from '@nestjs/swagger';

export class QuoteDto {
  @ApiProperty()
  ticker: string;

  @ApiProperty()
  precoAtual: number;

  @ApiProperty()
  change: number;

  @ApiProperty()
  changeValue: number;

  @ApiProperty()
  high: number;

  @ApiProperty()
  low: number;

  @ApiProperty()
  timestamp: Date;
}

import { ApiProperty } from '@nestjs/swagger';

export class DividendResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  data: Date;

  @ApiProperty()
  ticker: string;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  qtd: number;

  @ApiProperty()
  valorUn: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  status: string;
}

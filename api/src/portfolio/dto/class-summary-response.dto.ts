import { ApiProperty } from '@nestjs/swagger';

export class ClassSummaryItemDto {
  @ApiProperty()
  tipo: string;

  @ApiProperty()
  qtd: number;

  @ApiProperty()
  saldoPM: number;

  @ApiProperty()
  saldoCotacao: number;

  @ApiProperty()
  rent30d: number;

  @ApiProperty()
  rent12m: number;

  @ApiProperty()
  rentHistorica: number;
}

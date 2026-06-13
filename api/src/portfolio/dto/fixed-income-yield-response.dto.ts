import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FixedIncomeYieldResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fixedIncomeId: number;

  @ApiProperty()
  emissor: string;

  @ApiProperty()
  dataOperacao: Date;

  @ApiProperty()
  valor: number;

  @ApiPropertyOptional()
  observacoes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';

export class FixedIncomePerformanceDto {
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
  valorInvestido: number;

  @ApiProperty()
  valorAtual: number;

  @ApiProperty()
  rendimento: number;

  @ApiProperty()
  dataCompra: Date;

  @ApiProperty({ required: false })
  vencimento?: Date;

  @ApiProperty()
  liquidezDiaria: boolean;
}

export class MonthlyProfitabilityDto {
  @ApiProperty({ example: '2026-06' })
  mes: string;

  @ApiProperty()
  patrimonio: number;

  @ApiProperty()
  patrimonioMedio: number;

  @ApiProperty()
  proventos: number;

  @ApiProperty()
  rentabilidade: number;
}

export class AnnualDividendDto {
  @ApiProperty()
  ano: string;

  @ApiProperty({ type: [Number] })
  valores: number[];
}

export class IncomeDashboardResponseDto {
  @ApiProperty({ type: [FixedIncomePerformanceDto] })
  rendaFixa: FixedIncomePerformanceDto[];

  @ApiProperty({ type: [MonthlyProfitabilityDto] })
  rentabilidadeMensal: MonthlyProfitabilityDto[];

  @ApiProperty({ type: [AnnualDividendDto] })
  dividendosPorAno: AnnualDividendDto[];
}

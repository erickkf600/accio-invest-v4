import { ApiProperty } from '@nestjs/swagger';

export class AporteInfoDto {
  @ApiProperty()
  mes: number;

  @ApiProperty()
  ano: number;

  @ApiProperty()
  valor: number;

  @ApiProperty()
  taxa: number;
}

export class DistribuicaoItemDto {
  @ApiProperty()
  tipo: string;

  @ApiProperty()
  percentual: number;

  @ApiProperty()
  valor: number;

  @ApiProperty()
  cor: string;
}

export class RendimentoMensalDto {
  @ApiProperty()
  mes: number;

  @ApiProperty({ nullable: true })
  carteira: number | null;

  @ApiProperty({ nullable: true })
  cdi: number | null;

  @ApiProperty({ nullable: true })
  precoMedio: number | null;
}

export class AvailableYearsDto {
  @ApiProperty({ type: [Number] })
  years: number[];
}

export class DashboardDataDto {
  @ApiProperty()
  patrimonioTotal: number;

  @ApiProperty()
  totalInvestido: number;

  @ApiProperty()
  totalProventos: number;

  @ApiProperty({ type: [AporteInfoDto] })
  aportes: AporteInfoDto[];

  @ApiProperty({ type: [DistribuicaoItemDto] })
  distribuicao: DistribuicaoItemDto[];

  @ApiProperty({ type: [RendimentoMensalDto] })
  rendimentos: RendimentoMensalDto[];

  @ApiProperty({ type: [Number] })
  availableYears: number[];
}

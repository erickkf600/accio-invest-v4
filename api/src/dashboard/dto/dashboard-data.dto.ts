import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AporteInfoDto {
  @ApiProperty()
  mes: number;

  @ApiProperty()
  ano: number;

  @ApiProperty()
  valor: number;
}

export class DashboardDataDto {
  @ApiProperty()
  temDados: boolean;

  @ApiProperty()
  patrimonioTotal: number;

  @ApiProperty()
  rentabilidadeMes: number;

  @ApiProperty()
  saldoDisponivel: number;

  @ApiProperty({ type: [AporteInfoDto] })
  aportes: AporteInfoDto[];

  @ApiProperty()
  totalInvestido: number;

  @ApiProperty()
  totalOperacoes: number;

  @ApiProperty()
  totalProventos: number;
}

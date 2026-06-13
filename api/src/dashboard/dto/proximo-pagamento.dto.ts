import { ApiProperty } from '@nestjs/swagger';

export class ProximoPagamentoDto {
  @ApiProperty({ description: 'Código do ticker' })
  ticker: string;

  @ApiProperty({ description: 'Tipo de provento (Dividendo/JCP)' })
  tipo: string;

  @ApiProperty({ description: 'Valor do provento' })
  valor: number;

  @ApiProperty({ description: 'Data de pagamento (DD/MM/YYYY)' })
  dataPagamento: string;

  @ApiProperty({ description: 'Data COM (DD/MM/YYYY)' })
  dataCom: string;

  @ApiProperty({ description: 'Percentual sobre o preço base' })
  percentual: string;
}

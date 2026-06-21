import { ApiProperty } from '@nestjs/swagger';

export class DividendStatusResponseDto {
  @ApiProperty({ description: 'Código do ativo', example: 'MXRF11' })
  ticker: string;

  @ApiProperty({ description: 'Data COM', example: '15/01/2024' })
  dataCom: string;

  @ApiProperty({ description: 'Data de pagamento', example: '10/02/2024' })
  dataPagamento: string;

  @ApiProperty({ description: 'Valor do provento', example: 0.9 })
  valor: number;

  @ApiProperty({ description: 'Tipo do ativo (FII ou ACOES)', example: 'FII' })
  tipo: string;

  @ApiProperty({ description: 'Quantidade em carteira na data-com', example: 50 })
  quantidadeCarteira: number;

  @ApiProperty({
    description: 'Status do registro',
    enum: ['registered', 'no_registered'],
    example: 'no_registered',
  })
  status: 'registered' | 'no_registered';
}

import { ApiProperty } from '@nestjs/swagger';
import { TipoValor } from '../../generated/prisma/client';

export class OperationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  assetId: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty()
  tipoOperacao: string;

  @ApiProperty()
  data: Date;

  @ApiProperty({ required: false })
  qtd?: number;

  @ApiProperty()
  precoUn: number;

  @ApiProperty({ required: false })
  taxas?: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ required: false, enum: TipoValor })
  tipo?: TipoValor;

  @ApiProperty({ required: false })
  fileId?: number;

  @ApiProperty({ required: false })
  observacoes?: string;

  @ApiProperty({ required: false })
  vencimento?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

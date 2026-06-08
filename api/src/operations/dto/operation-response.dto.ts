import { ApiProperty } from '@nestjs/swagger';
import { OperationType } from '../../generated/prisma/client';

export class OperationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  assetId: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty({ enum: OperationType })
  tipo: OperationType;

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

  @ApiProperty({ required: false })
  lucroRealizado?: number;

  @ApiProperty({ required: false })
  notaPath?: string;

  @ApiProperty({ required: false })
  notaNome?: string;

  @ApiProperty({ required: false })
  observacoes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

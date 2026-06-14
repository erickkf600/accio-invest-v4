import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OperationType, TipoValor } from '../../generated/prisma/client';

export class UpdateOperationDto {
  @ApiPropertyOptional({ example: 'PETR4' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  ticker?: string;

  @ApiPropertyOptional({ enum: OperationType })
  @IsOptional()
  @IsEnum(OperationType)
  tipoOperacao?: OperationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  qtd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  precoUn?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxas?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  total?: number;

  @ApiPropertyOptional({ enum: TipoValor })
  @IsOptional()
  @IsEnum(TipoValor)
  tipo?: TipoValor;

  @ApiPropertyOptional({ description: 'Observação opcional' })
  @IsOptional()
  @IsString()
  nota?: string;

  @ApiPropertyOptional({ description: 'Observações (até 150 caracteres)' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  observacoes?: string;
}

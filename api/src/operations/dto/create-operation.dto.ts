import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OperationType } from '../../generated/prisma/client';

export class CreateOperationDto {
  @ApiProperty({ example: 'PETR4' })
  @IsString()
  @MaxLength(20)
  ticker: string;

  @ApiProperty({ enum: OperationType, example: OperationType.Compra })
  @IsEnum(OperationType)
  tipo: OperationType;

  @ApiProperty({ example: '2026-06-07T10:00:00Z' })
  @IsDateString()
  data: string;

  @ApiProperty({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  qtd?: number;

  @ApiProperty({ example: 25.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  precoUn: number;

  @ApiPropertyOptional({ example: 10.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxas?: number;

  @ApiProperty({ example: 2550.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  total: number;

  @ApiPropertyOptional({ example: 150.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lucroRealizado?: number;

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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFixedIncomeDto {
  @ApiProperty({ example: 'Tesouro Selic' })
  @IsString()
  @MaxLength(200)
  emissor: string;

  @ApiProperty({ example: 'Pós-fixado' })
  @IsString()
  @MaxLength(20)
  tipo: string;

  @ApiProperty({ example: 'SELIC' })
  @IsString()
  @MaxLength(10)
  indexador: string;

  @ApiProperty({ example: 0.5 })
  @Type(() => Number)
  @IsNumber()
  taxaJuros: number;

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  liquidezDiaria: boolean;

  @ApiProperty({ example: false })
  @Type(() => Boolean)
  @IsBoolean()
  possuiImposto: boolean;

  @ApiProperty({ example: 10000.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  valorAplicado: number;

  @ApiProperty({ example: '2026-06-07' })
  @IsDateString()
  dataCompra: string;

  @ApiPropertyOptional({ example: '2030-06-07' })
  @IsOptional()
  @IsDateString()
  vencimento?: string;

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

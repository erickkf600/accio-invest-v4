import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateFixedIncomeYieldDto {
  @ApiProperty({ example: 'CDB Banco Itaú 115% CDI' })
  @IsString()
  @MaxLength(200)
  emissor: string;

  @ApiProperty({ example: '2026-06-07' })
  @IsDateString()
  dataOperacao: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  valor: number;

  @ApiPropertyOptional({ description: 'Observações (até 150 caracteres)' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  observacoes?: string;
}

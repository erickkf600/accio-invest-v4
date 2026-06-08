import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateRepositioningDto {
  @ApiProperty({ example: 'PETR4' })
  @IsString()
  @MaxLength(20)
  ticker: string;

  @ApiProperty({ example: '2026-06-07T10:00:00Z' })
  @IsDateString()
  dataOperacao: string;

  @ApiProperty({ example: 'Desdobramento' })
  @IsString()
  @MaxLength(20)
  tipo: string;

  @ApiProperty({ example: '2:1' })
  @IsString()
  @MaxLength(20)
  fator: string;

  @ApiProperty({ example: '1' })
  @IsString()
  @MaxLength(10)
  ratioDe: string;

  @ApiProperty({ example: '2' })
  @IsString()
  @MaxLength(10)
  ratioPara: string;

  @ApiPropertyOptional({ description: 'Observações (até 150 caracteres)' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  observacoes?: string;
}

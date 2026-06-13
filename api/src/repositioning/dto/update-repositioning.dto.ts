import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

export class UpdateRepositioningDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  ticker?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataOperacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  fator?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ratioDe?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ratioPara?: string;

  @ApiPropertyOptional({ description: 'Observações (até 150 caracteres)' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  observacoes?: string;
}

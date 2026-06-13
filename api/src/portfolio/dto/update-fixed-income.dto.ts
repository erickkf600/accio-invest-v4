import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

const toBoolean = Transform(({ value }: { value: unknown }) => {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  return Boolean(value);
});

export class UpdateFixedIncomeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  emissor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  indexador?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  taxaJuros?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @toBoolean
  @IsBoolean()
  liquidezDiaria?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @toBoolean
  @IsBoolean()
  possuiImposto?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  valorAplicado?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataCompra?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  vencimento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nota?: string;

  @ApiPropertyOptional({ description: 'Observações (até 150 caracteres)' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  observacoes?: string;
}

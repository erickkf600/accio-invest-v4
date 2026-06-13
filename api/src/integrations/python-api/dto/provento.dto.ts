import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class ProventoItemDto {
  @ApiProperty({ description: 'Valor do provento' })
  value: number;

  @ApiProperty({ description: 'Data de pagamento (DD/MM/YYYY)' })
  payment_date: string;

  @ApiProperty({ description: 'Data COM (DD/MM/YYYY)' })
  date_com: string;

  @ApiProperty({ description: 'Percentual sobre o preço base' })
  percent: string;
}

export class ProventoResponseDto {
  @ApiProperty({ description: 'Código do ticker' })
  ticker: string;

  @ApiProperty({ type: [ProventoItemDto], description: 'Lista de proventos' })
  proventos: ProventoItemDto[];
}

export class PapeisTiposDto {
  @ApiProperty({ description: 'Código do papel', example: 'MXRF11' })
  @IsString()
  @IsNotEmpty()
  papel: string;

  @ApiProperty({ description: 'Tipo (1=FII, 2=Ação)', example: 1 })
  @IsInt()
  tipo: number;
}

export class ProventoRequestDto {
  @ApiProperty({
    description: 'Lista de papéis com tipo (1=FII, 2=Ação)',
    example: [{ papel: 'MXRF11', tipo: 1 }, { papel: 'PETR4', tipo: 2 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PapeisTiposDto)
  papeis_tipos: PapeisTiposDto[];

  @ApiProperty({ description: 'Data início (YYYY-MM-DD)', required: true, example: '2024-01-01' })
  @IsOptional()
  @IsString()
  dataInicio?: string;

  @ApiProperty({ description: 'Data fim (YYYY-MM-DD)', required: true, example: '2024-12-31' })
  @IsOptional()
  @IsString()
  dataFim?: string;
}

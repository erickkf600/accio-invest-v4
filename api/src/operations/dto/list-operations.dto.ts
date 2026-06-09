import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListOperationsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ticker?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

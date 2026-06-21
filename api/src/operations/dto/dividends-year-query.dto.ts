import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DividendsYearQueryDto {
  @ApiProperty({ description: 'Ano (YYYY)', example: '2024' })
  @IsString()
  @IsNotEmpty()
  year: string;
}

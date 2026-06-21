import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DividendsListQueryDto {
  @ApiProperty({ description: 'Data início (MM-YYYY)', example: '01-2024' })
  @IsString()
  @IsNotEmpty()
  start: string;

  @ApiProperty({ description: 'Data fim (MM-YYYY)', example: '12-2024' })
  @IsString()
  @IsNotEmpty()
  end: string;
}

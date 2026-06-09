import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetType } from '../../generated/prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListAssetsDto extends PaginationDto {
  @ApiProperty({ default: 9999, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 9999;

  @ApiPropertyOptional({ enum: AssetType })
  @IsOptional()
  @IsEnum(AssetType)
  tipo?: AssetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class NotaListDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  data: Date;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  createdAt: Date;
}

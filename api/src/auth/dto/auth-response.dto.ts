import { ApiProperty } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;
}

export class AuthResponseDto {
  @ApiProperty()
  user: UserResponse;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;
}

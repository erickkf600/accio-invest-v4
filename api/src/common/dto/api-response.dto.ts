import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = unknown> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  data?: T;

  @ApiProperty({ required: false })
  timestamp?: string;

  static ok<T>(data?: T, message = 'Success'): ApiResponseDto<T> {
    return { success: true, message, data, timestamp: new Date().toISOString() };
  }

  static error<T>(message: string, data?: T): ApiResponseDto<T> {
    return { success: false, message, data, timestamp: new Date().toISOString() };
  }
}

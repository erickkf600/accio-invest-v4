import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { AppService } from './app.service';

class MessageResponse {
  @ApiProperty({ example: 'Hello API' })
  message: string;
}

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar status da API' })
  @ApiOkResponse({ description: 'Retorna uma mensagem de saudação', type: MessageResponse })
  getData(): MessageResponse {
    return this.appService.getData();
  }
}

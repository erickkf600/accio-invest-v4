import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PythonApiService } from './python-api.service';
import { QuoteTickerDto } from './dto/quote-ticker.dto';
import { TickerHistoryDto } from './dto/history.dto';
import { ProventoResponseDto, ProventoRequestDto } from './dto/provento.dto';

@ApiTags('Ticker API')
@Controller('ticker')
export class PythonApiController {
  constructor(private readonly pythonApi: PythonApiService) {}

  @Public()
  @Get('quotes')
  @ApiOperation({ summary: 'Busca cotações atuais de tickers' })
  @ApiQuery({ name: 'ticker', description: 'Ticker separado por vírgula (ex: PETR4,VALE3)' })
  async getQuotes(@Query('ticker') ticker: string): Promise<QuoteTickerDto[]> {
    const tickers = ticker.split(',').map((t) => t.trim()).filter(Boolean);
    return this.pythonApi.fetchTickers(tickers);
  }

  @Public()
  @Get('history')
  @ApiOperation({ summary: 'Busca histórico de preços' })
  @ApiQuery({ name: 'ticker', description: 'Ticker' })
  @ApiQuery({ name: 'start', description: 'Data início (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', description: 'Data fim (YYYY-MM-DD)' })
  async getHistory(
    @Query('ticker') ticker: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<TickerHistoryDto[]> {
    const tickers = ticker.split(',').map((t) => t.trim()).filter(Boolean);
    return this.pythonApi.fetchHistory(tickers, start, end);
  }

  @Public()
  @Post('proventos')
  @ApiOperation({ summary: 'Busca proventos (dividendos/JCP) de tickers' })
  @ApiBody({ type: ProventoRequestDto })
  async getProventos(@Body() dto: ProventoRequestDto): Promise<ProventoResponseDto[]> {
    return this.pythonApi.fetchProventos(dto);
  }
}

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { TICKER_API_CONSTANTS } from '../../config/constants';
import { QuoteDto } from './dto/quote-response.dto';
import { QuoteTickerDto } from './dto/quote-ticker.dto';
import { TickerHistoryDto } from './dto/history.dto';
import { ProventoResponseDto, ProventoRequestDto } from './dto/provento.dto';

@Injectable()
export class PythonApiService {
  private readonly logger = new Logger(PythonApiService.name);
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = TICKER_API_CONSTANTS.baseUrl;
    this.timeout = TICKER_API_CONSTANTS.timeout;
  }

  async getQuotes(tickers: string[]): Promise<QuoteDto[]> {
    const raw = await this.fetchTickers(tickers);
    return raw.map((item) => ({
      ticker: item.ticker,
      precoAtual: item.curPrc,
      change: 0,
      changeValue: 0,
      high: 0,
      low: 0,
      timestamp: new Date(),
    }));
  }

  async getQuote(ticker: string): Promise<QuoteDto | null> {
    const quotes = await this.getQuotes([ticker]);
    return quotes[0] || null;
  }

  async fetchTickers(tickers: string[]): Promise<QuoteTickerDto[]> {
    try {
      const url = `${this.baseUrl}/tickers?ticker=${tickers.join('-')}`;
      const res = await this.request(url);
      return res as QuoteTickerDto[];
    } catch (err) {
      this.logger.error(`fetchTickers failed: ${(err as Error).message}`);
      throw new HttpException('Falha ao buscar cotações', HttpStatus.BAD_GATEWAY);
    }
  }

  async fetchHistory(tickers: string[], start: string, end: string): Promise<TickerHistoryDto[]> {
    try {
      const url = `${this.baseUrl}/tickers/history?ticker=${tickers.join('-')}&start=${start}&end=${end}`;
      const res = await this.request(url);
      return res as TickerHistoryDto[];
    } catch (err) {
      this.logger.error(`fetchHistory failed: ${(err as Error).message}`);
      throw new HttpException('Falha ao buscar histórico', HttpStatus.BAD_GATEWAY);
    }
  }

  async fetchProventos(dto: ProventoRequestDto): Promise<ProventoResponseDto[]> {
    try {
      const url = `${this.baseUrl}/proventos`;
      const res = await this.request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      return res as ProventoResponseDto[];
    } catch (err) {
      this.logger.error(`fetchProventos failed: ${(err as Error).message}`);
      throw new HttpException('Falha ao buscar proventos', HttpStatus.BAD_GATEWAY);
    }
  }

  private async request(url: string, options?: RequestInit): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }
}

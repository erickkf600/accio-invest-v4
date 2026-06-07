import { Injectable, Logger } from '@nestjs/common';
import { QuoteDto } from './dto/quote-response.dto';

const MOCK_QUOTES: Record<string, Partial<QuoteDto>> = {
  PETR4: { precoAtual: 38.50, change: 1.2, changeValue: 0.46, high: 38.80, low: 38.10 },
  VALE3: { precoAtual: 65.30, change: -0.8, changeValue: -0.52, high: 66.00, low: 65.00 },
  BBAS3: { precoAtual: 28.45, change: 0.5, changeValue: 0.14, high: 28.60, low: 28.20 },
  HGLG11: { precoAtual: 142.50, change: 1.1, changeValue: 1.56, high: 143.00, low: 141.50 },
  MXRF11: { precoAtual: 10.20, change: 0.3, changeValue: 0.03, high: 10.25, low: 10.15 },
  B3SA3: { precoAtual: 12.80, change: -0.4, changeValue: -0.05, high: 12.90, low: 12.70 },
  ITUB4: { precoAtual: 35.20, change: 0.7, changeValue: 0.25, high: 35.40, low: 34.90 },
  WEGE3: { precoAtual: 46.90, change: 1.5, changeValue: 0.69, high: 47.20, low: 46.50 },
};

@Injectable()
export class PythonApiService {
  private readonly logger = new Logger(PythonApiService.name);

  async getQuotes(tickers: string[]): Promise<QuoteDto[]> {
    this.logger.log(`Fetching quotes for: ${tickers.join(', ')}`);

    // v1: Mocks - futuramente: chamada HTTP para API Python
    return tickers.map((ticker) => {
      const mock = MOCK_QUOTES[ticker.toUpperCase()];
      if (mock) {
        return {
          ticker: ticker.toUpperCase(),
          precoAtual: mock.precoAtual || 0,
          change: mock.change || 0,
          changeValue: mock.changeValue || 0,
          high: mock.high || 0,
          low: mock.low || 0,
          timestamp: new Date(),
        };
      }

      return {
        ticker: ticker.toUpperCase(),
        precoAtual: Math.random() * 200,
        change: (Math.random() - 0.5) * 5,
        changeValue: (Math.random() - 0.5) * 10,
        high: 100,
        low: 50,
        timestamp: new Date(),
      };
    });
  }

  async getQuote(ticker: string): Promise<QuoteDto | null> {
    const quotes = await this.getQuotes([ticker]);
    return quotes[0] || null;
  }
}

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseJsonPipe implements PipeTransform {
  transform(value: string): Record<string, unknown>[] {
    if (typeof value !== 'string') {
      throw new BadRequestException('Expected a JSON string');
    }
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new BadRequestException('Expected a JSON array');
      }
      return parsed;
    } catch {
      throw new BadRequestException('Invalid JSON');
    }
  }
}

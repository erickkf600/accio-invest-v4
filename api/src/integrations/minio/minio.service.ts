import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private bucket: string;

  onModuleInit() {
    const baseUrl = process.env['MINIO_BASE_URL'] || 'http://localhost:9000';
    const url = new URL(baseUrl);
    const accessKey = process.env['MINIO_ACCESS_KEY'] || '';
    const secretKey = process.env['MINIO_SECRET_KEY'] || '';

    this.bucket = process.env['MINIO_UPLOAD_BUCKET'] || 'notas';

    this.client = new Minio.Client({
      endPoint: url.hostname,
      port: Number(url.port) || 9000,
      useSSL: url.protocol === 'https:',
      accessKey,
      secretKey,
    });
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
    }
  }

  async uploadFile(
    objectName: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    await this.ensureBucket();
    await this.client.putObject(this.bucket, objectName, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
    return `/${this.bucket}/${objectName}`;
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, objectName);
    } catch {
      // File may not exist
    }
  }

  extractObjectName(path: string): string {
    const prefix = `/${this.bucket}/`;
    if (path.startsWith(prefix)) {
      return path.slice(prefix.length);
    }
    return path;
  }
}

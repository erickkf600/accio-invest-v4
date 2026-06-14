import { randomBytes } from 'crypto';

export function generateRandomString(length: number = 32): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function toSnakeCase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/_+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();
}

export function buildFileName(originalName: string, customName?: string): string {
  const parts = originalName.split('.');
  const ext = parts.length > 1 ? parts.pop()! : '';
  const keepExt = ext ? `.${ext}` : '';

  if (!customName || !customName.trim()) {
    return originalName;
  }

  return `${toSnakeCase(customName)}${keepExt}`;
}

export function generateObjectKey(
  userId: number,
  originalName: string,
  customName?: string,
): string {
  const fileName = buildFileName(originalName, customName);
  if (customName && customName.trim()) {
    return `${userId}/${Date.now()}-${fileName}`;
  }
  return `${userId}/${Date.now()}-${generateRandomString(8)}.${originalName.split('.').pop() || 'pdf'}`;
}

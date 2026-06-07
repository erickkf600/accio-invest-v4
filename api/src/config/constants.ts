export const JWT_CONSTANTS = {
  secret: process.env['JWT_SECRET'] || 'accio-invest-jwt-secret-key-change-in-production',
  expiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
  refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
};

export const BCRYPT_CONSTANTS = {
  saltRounds: 10,
};

export const FILE_CONSTANTS = {
  maxFileSize: 5 * 1024 * 1024,
  allowedMimeTypes: ['application/pdf'],
};

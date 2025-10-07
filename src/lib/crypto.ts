import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateIV(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function encryptBuffer(buffer: Buffer, key: string, iv: string): Buffer {
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
}

export function decryptBuffer(encryptedBuffer: Buffer, key: string, iv: string): Buffer {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}

export function generateOTP(): string {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}
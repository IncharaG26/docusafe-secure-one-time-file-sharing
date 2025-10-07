import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileId: text('file_id').notNull().unique(),
  fileName: text('file_name').notNull(),
  encryptedFileName: text('encrypted_file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  encryptionKey: text('encryption_key').notNull(),
  encryptionIv: text('encryption_iv').notNull(),
  otpHash: text('otp_hash'),
  requiresOtp: integer('requires_otp', { mode: 'boolean' }).notNull().default(false),
  expiresAt: text('expires_at').notNull(),
  maxPrints: integer('max_prints').notNull().default(1),
  printCount: integer('print_count').notNull().default(0),
  accessed: integer('accessed', { mode: 'boolean' }).notNull().default(false),
  accessedAt: text('accessed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Indexes are created via unique() constraint on fileId
// Additional indexes for maxPrints and printCount will be handled by Drizzle queries
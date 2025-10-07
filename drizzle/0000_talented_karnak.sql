CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_id` text NOT NULL,
	`file_name` text NOT NULL,
	`encrypted_file_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`encryption_key` text NOT NULL,
	`encryption_iv` text NOT NULL,
	`otp_hash` text,
	`requires_otp` integer DEFAULT false NOT NULL,
	`expires_at` text NOT NULL,
	`accessed` integer DEFAULT false NOT NULL,
	`accessed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_file_id_unique` ON `files` (`file_id`);
ALTER TABLE `files` ADD `max_prints` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `files` ADD `print_count` integer DEFAULT 0 NOT NULL;
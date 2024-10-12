ALTER TABLE `transactions` MODIFY COLUMN `invoiceId` text;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `invoiceUrl` text;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `status` enum('PENDING','SETTLED','FAILED') DEFAULT 'PENDING';
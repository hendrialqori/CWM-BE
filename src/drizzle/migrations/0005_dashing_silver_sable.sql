ALTER TABLE `products` MODIFY COLUMN `updateAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `updateAt` timestamp DEFAULT (now());
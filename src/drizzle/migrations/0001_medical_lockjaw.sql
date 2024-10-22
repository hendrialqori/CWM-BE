ALTER TABLE `products` MODIFY COLUMN `title` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `image` text NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `zipPath` text NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `zipMd5` text NOT NULL;
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`originalPrice` int NOT NULL,
	`strikeoutPrice` int NOT NULL,
	`description` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(100) NOT NULL,
	`phone` int NOT NULL,
	`productId` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(225) NOT NULL,
	`email` varchar(100) NOT NULL,
	`password` varchar(225) NOT NULL,
	`salt` varchar(225),
	`sessionToken` varchar(225),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;
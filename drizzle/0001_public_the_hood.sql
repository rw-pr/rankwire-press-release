CREATE TABLE `entities` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`companyAddress` text,
	`googleBusinessProfileUrl` varchar(500),
	`websiteUrl` varchar(255),
	`industry` varchar(100),
	`prContactFirstName` varchar(100),
	`prContactLastName` varchar(100),
	`prEmail` varchar(255),
	`facebookUrl` varchar(255),
	`twitterUrl` varchar(255),
	`redditUrl` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mediaFiles` (
	`id` varchar(64) NOT NULL,
	`pressReleaseId` varchar(64) NOT NULL,
	`fileType` enum('logo','image','video','other') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`s3Key` varchar(500) NOT NULL,
	`altText` text,
	`fileSize` varchar(20),
	`mimeType` varchar(100),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `mediaFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pressReleases` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`entityId` varchar(64),
	`status` enum('draft','published','reporting') NOT NULL DEFAULT 'draft',
	`headline` varchar(70) NOT NULL,
	`subheadline` varchar(120),
	`datelineCity` varchar(100),
	`datelineState` varchar(100),
	`datelineDate` timestamp,
	`leadParagraph` text,
	`bodyContent` text,
	`boilerplate` text,
	`callToAction` text,
	`wordCount` varchar(10),
	`mediaContactName` varchar(255),
	`mediaContactTitle` varchar(255),
	`mediaContactEmail` varchar(255),
	`mediaContactPhone` varchar(50),
	`mediaContactWebsite` varchar(255),
	`authorName` varchar(255),
	`authorTitle` varchar(255),
	`authorCompany` varchar(255),
	`authorEmail` varchar(255),
	`authorSocialHandle` varchar(100),
	`metaTitle` varchar(255),
	`metaDescription` text,
	`keywords` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `pressReleases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `entities` ADD CONSTRAINT `entities_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFiles` ADD CONSTRAINT `mediaFiles_pressReleaseId_pressReleases_id_fk` FOREIGN KEY (`pressReleaseId`) REFERENCES `pressReleases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pressReleases` ADD CONSTRAINT `pressReleases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pressReleases` ADD CONSTRAINT `pressReleases_entityId_entities_id_fk` FOREIGN KEY (`entityId`) REFERENCES `entities`(`id`) ON DELETE set null ON UPDATE no action;
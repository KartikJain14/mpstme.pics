ALTER TABLE "clubs" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "instagram" varchar(255);--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "linkedin" varchar(255);--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "other_links" text[] DEFAULT '{}';
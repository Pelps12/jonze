DO $$ BEGIN
 CREATE TYPE "orgPlan" AS ENUM('standard', 'plus');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Organization" ADD COLUMN "plan" "orgPlan" DEFAULT 'standard' NOT NULL;
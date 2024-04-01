CREATE TABLE IF NOT EXISTS "Membership" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"memId" varchar(191) NOT NULL,
	"planId" varchar(191) NOT NULL,
	"decimal" numeric,
	"provider" "provider" DEFAULT 'None' NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);

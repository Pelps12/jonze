CREATE TABLE IF NOT EXISTS "OrganizationSubaccount" (
	"orgId" varchar(191) PRIMARY KEY NOT NULL,
	"subAccountId" varchar(191) NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Customer" ADD COLUMN "orgId" varchar(128);